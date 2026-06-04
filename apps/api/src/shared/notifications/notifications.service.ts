import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { PrismaService } from '../prisma/prisma.service'
import type { NotificationType } from '@prisma/client'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: { filename: string; content: Buffer | string }[]
}

export interface SendSmsOptions {
  to: string
  body: string
}

export interface CreateNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  sendEmail?: boolean
  emailOptions?: Omit<SendEmailOptions, 'to'>
  sendSms?: boolean
  smsBody?: string
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private transporter: Transporter | null = null

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {
    this.initEmailTransport()
  }

  private initEmailTransport(): void {
    const region = this.config.get<string>('SES_REGION', 'ap-south-1')
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID')
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY')

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('AWS credentials not configured — emails will be logged only')
      return
    }

    this.transporter = nodemailer.createTransport({
      host: `email-smtp.${region}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: { user: accessKeyId, pass: secretAccessKey },
    })
  }

  // ─── In-App Notification ──────────────────────────────────────────────────

  async create(options: CreateNotificationOptions): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: options.userId,
        type: options.type,
        title: options.title,
        body: options.body,
        data: options.data as object | undefined,
      },
    })

    if (options.sendEmail && options.emailOptions) {
      const user = await this.prisma.user.findUnique({
        where: { id: options.userId },
        select: { email: true },
      })
      if (user) {
        await this.queueEmail({ ...options.emailOptions, to: user.email })
      }
    }

    if (options.sendSms && options.smsBody) {
      const user = await this.prisma.user.findUnique({
        where: { id: options.userId },
        select: { phone: true },
      })
      if (user) {
        await this.queueSms({ to: user.phone, body: options.smsBody })
      }
    }
  }

  async createBulk(
    userIds: string[],
    notification: Omit<CreateNotificationOptions, 'userId'>,
  ): Promise<void> {
    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data as object | undefined,
      })),
    })
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    })
  }

  // ─── Email ────────────────────────────────────────────────────────────────

  async queueEmail(options: SendEmailOptions): Promise<void> {
    await this.notificationQueue.add('send-email', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    })
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`)
      return
    }
    try {
      await this.transporter.sendMail({
        from: `"${this.config.get('EMAIL_FROM_NAME', 'BuildEstate')}" <${this.config.get('EMAIL_FROM')}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      })
    } catch (err) {
      this.logger.error('Failed to send email', err)
      throw err
    }
  }

  // ─── SMS ─────────────────────────────────────────────────────────────────

  async queueSms(options: SendSmsOptions): Promise<void> {
    await this.notificationQueue.add('send-sms', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
    })
  }

  async sendSms(options: SendSmsOptions): Promise<void> {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID')
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN')
    const from = this.config.get<string>('TWILIO_PHONE_NUMBER')

    if (!sid || !token || !from) {
      this.logger.debug(`[SMS] To: ${options.to} | Body: ${options.body}`)
      return
    }

    try {
      const twilio = (await import('twilio')).default
      const client = twilio(sid, token)
      await client.messages.create({ body: options.body, from, to: options.to })
    } catch (err) {
      this.logger.error('Failed to send SMS', err)
      throw err
    }
  }
}
