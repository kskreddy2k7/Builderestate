'use client'

import { useState } from 'react'
import { CreditCard, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { usePaymentSummary, useInitiatePayment, useVerifyPayment } from '@/hooks/use-buyer'
import { PageHeader, Section, Badge, ProgressBar, Skeleton } from '@/components/shared/data-display'
import { formatCurrency, formatDate, cn } from '@buildestate/utils'

declare global {
  interface Window { Razorpay: any }
}

export default function BuyerPaymentsPage() {
  const { data: paymentData, isLoading } = usePaymentSummary()
  const { mutateAsync: initiatePayment, isPending: isInitiating } = useInitiatePayment()
  const { mutateAsync: verifyPayment } = useVerifyPayment()
  const [payingItemId, setPayingItemId] = useState<string | null>(null)

  const handlePay = async (bookingId: string, scheduleItemId: string) => {
    setPayingItemId(scheduleItemId)
    try {
      const order = await initiatePayment({ bookingId, scheduleItemId })

      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'BuildEstate',
        description: 'Property payment',
        theme: { color: '#0c93ea' },
        handler: async (response: any) => {
          await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
        modal: { ondismiss: () => setPayingItemId(null) },
      })
      rzp.open()
    } catch {
      setPayingItemId(null)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Payments" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </>
    )
  }

  const bookings = paymentData ?? []

  return (
    <>
      <PageHeader title="Payments" description="Your payment schedule and history" />

      {bookings.map((booking: any) => (
        <Section
          key={booking.bookingId}
          title={`${booking.unit?.unitNumber} — ${booking.unit?.bhkType}`}
          className="mb-6"
        >
          {/* Summary bar */}
          <div className="mb-5 grid grid-cols-3 gap-4 rounded-xl bg-muted/30 p-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Total amount</p>
              <p className="font-bold text-base">{formatCurrency(booking.totalAmount, { compact: true })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Paid</p>
              <p className="font-bold text-base text-success-600">{formatCurrency(booking.paid, { compact: true })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Balance</p>
              <p className="font-bold text-base text-primary">{formatCurrency(booking.balance, { compact: true })}</p>
            </div>
          </div>

          <ProgressBar value={booking.collectionPercentage} showValue label="Collection progress" className="mb-5" />

          {/* Schedule table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Milestone</th>
                  <th className="pb-2 text-right text-xs font-medium text-muted-foreground">%</th>
                  <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="pb-2 text-center text-xs font-medium text-muted-foreground">Due date</th>
                  <th className="pb-2 text-center text-xs font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {booking.schedule?.map((item: any) => {
                  const overdue = item.status !== 'PAID' && new Date(item.dueDate) < new Date()
                  const isLoading = payingItemId === item.id

                  return (
                    <tr key={item.id} className={cn(overdue && 'bg-danger-50/50 dark:bg-danger-950/20')}>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{item.milestone}</p>
                        {item.demandLetters?.[0] && (
                          <p className="text-xs text-muted-foreground">DL issued</p>
                        )}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{item.percentage}%</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(Number(item.amount))}</td>
                      <td className="py-3 text-center text-xs">
                        <span className={cn(overdue && 'text-danger-500 font-medium')}>
                          {formatDate(item.dueDate, 'dd MMM yyyy')}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {item.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-success-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                          </span>
                        ) : item.status === 'DEMAND_RAISED' ? (
                          <Badge variant="warning">Demand raised</Badge>
                        ) : overdue ? (
                          <span className="inline-flex items-center gap-1 text-xs text-danger-500">
                            <AlertCircle className="h-3.5 w-3.5" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {item.status !== 'PAID' && (
                          <button
                            onClick={() => handlePay(booking.bookingId, item.id)}
                            disabled={isLoading}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CreditCard className="h-3.5 w-3.5" />
                            )}
                            {isLoading ? 'Processing…' : 'Pay online'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
    </>
  )
}
