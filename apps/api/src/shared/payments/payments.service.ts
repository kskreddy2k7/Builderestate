import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Razorpay from 'razorpay'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationType, PaymentStatus, PaymentMethod } from '@prisma/client'

export interface CreateOrderOptions {
  bookingId: string
  scheduleItemId: string
  amount: number // in paise
  currency?: string
  notes?: Record<string, string>
}

export interface VerifyPaymentOptions {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)
  private readonly razorpay: Razorpay

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get<string>('RAZORPAY_KEY_ID', ''),
      key_secret: this.config.get<string>('RAZORPAY_KEY_SECRET', ''),
    })
  }

  async createOrder(options: CreateOrderOptions): Promise<{
    orderId: string
    amount: number
    currency: string
    keyId: string
  }> {
    const scheduleItem = await this.prisma.paymentScheduleItem.findUnique({
      where: { id: options.scheduleItemId },
      include: { booking: { include: { buyer: true } } },
    })

    if (!scheduleItem) throw new BadRequestException('Payment schedule item not found')
    if (scheduleItem.status === 'PAID') throw new BadRequestException('This instalment is already paid')

    const order = await this.razorpay.orders.create({
      amount: Math.round(options.amount * 100), // paise
      currency: options.currency ?? 'INR',
      notes: {
        bookingId: options.bookingId,
        scheduleItemId: options.scheduleItemId,
        ...options.notes,
      },
    })

    // Create pending payment record
    await this.prisma.payment.create({
      data: {
        paymentNumber: `PAY${Date.now().toString(36).toUpperCase()}`,
        bookingId: options.bookingId,
        scheduleItemId: options.scheduleItemId,
        amount: scheduleItem.amount,
        gstAmount: Number(scheduleItem.amount) * 0.18,
        totalAmount: options.amount,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.ONLINE,
        gatewayOrderId: order.id,
      },
    })

    return {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      keyId: this.config.get<string>('RAZORPAY_KEY_ID', ''),
    }
  }

  async verifyAndCapture(options: VerifyPaymentOptions): Promise<void> {
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.config.get<string>('RAZORPAY_KEY_SECRET', ''))
      .update(`${options.razorpayOrderId}|${options.razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== options.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature')
    }

    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: options.razorpayOrderId },
      include: { booking: { include: { buyer: true } }, scheduleItem: true },
    })

    if (!payment) throw new BadRequestException('Payment record not found')

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        gatewayPaymentId: options.razorpayPaymentId,
        gatewaySignature: options.razorpaySignature,
        paidAt: new Date(),
      },
    })

    // Update schedule item
    await this.prisma.paymentScheduleItem.update({
      where: { id: payment.scheduleItemId! },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paidAmount: payment.totalAmount,
      },
    })

    // Notify buyer
    await this.notifications.create({
      userId: payment.booking.buyerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment confirmed',
      body: `Your payment of ₹${Number(payment.totalAmount).toLocaleString('en-IN')} has been received.`,
      data: { paymentId: payment.id, bookingId: payment.bookingId },
      sendEmail: true,
      emailOptions: {
        subject: 'Payment confirmation — BuildEstate',
        html: `<p>Dear ${payment.booking.buyer.name},</p>
               <p>We have received your payment of <strong>₹${Number(payment.totalAmount).toLocaleString('en-IN')}</strong>.</p>
               <p>Payment Reference: ${options.razorpayPaymentId}</p>`,
      },
    })
  }

  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    const webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET', '')
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      this.logger.warn('Invalid webhook signature')
      return
    }

    const payload = JSON.parse(rawBody) as { event: string; payload: { payment?: { entity?: { order_id: string; id: string } } } }
    this.logger.log(`Razorpay webhook: ${payload.event}`)

    if (payload.event === 'payment.failed') {
      const orderId = payload.payload.payment?.entity?.order_id
      if (orderId) {
        await this.prisma.payment.updateMany({
          where: { gatewayOrderId: orderId },
          data: { status: PaymentStatus.FAILED },
        })
      }
    }
  }

  async getPublicKey(): Promise<string> {
    return this.config.get<string>('RAZORPAY_KEY_ID', '')
  }
}
