'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Loader2 } from 'lucide-react'
import { useMyComplaints, useCreateComplaint } from '@/hooks/use-buyer'
import { useMyBookings } from '@/hooks/use-buyer'
import { PageHeader, Badge, EmptyState, Section } from '@/components/shared/data-display'
import { formatTimeAgo, cn } from '@buildestate/utils'

const PRIORITY_VARIANT: Record<string, any> = {
  LOW: 'default', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger',
}
const STATUS_VARIANT: Record<string, any> = {
  OPEN: 'danger', ASSIGNED: 'warning', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'default',
}
const CATEGORIES = ['Structural', 'Electrical', 'Plumbing', 'Finishing', 'Common areas', 'Documentation', 'Other']

export default function ComplaintsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ bookingId: '', category: '', subject: '', description: '', priority: 'MEDIUM' })
  const { data: complaintsData, isLoading } = useMyComplaints()
  const { data: bookingsData } = useMyBookings()
  const { mutate: createComplaint, isPending } = useCreateComplaint()

  const complaints = complaintsData?.items ?? []
  const bookings = bookingsData?.items ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createComplaint(form as any, { onSuccess: () => { setShowForm(false); setForm({ bookingId: '', category: '', subject: '', description: '', priority: 'MEDIUM' }) } })
  }

  return (
    <>
      <PageHeader
        title="Complaints"
        description="Raise and track issues with your property"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Raise complaint
          </button>
        }
      />

      {/* Complaint form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-elevated">
            <h2 className="mb-4 text-lg font-semibold">Raise a complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Booking</label>
                <select
                  required value={form.bookingId}
                  onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select booking</option>
                  {bookings.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} — Unit {b.unit?.unitNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <select
                    required value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Subject</label>
                <input
                  required minLength={5}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief summary of the issue"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  required minLength={20} rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue in detail…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {isPending ? <><Loader2 className="inline h-4 w-4 animate-spin mr-2" />Submitting…</> : 'Submit complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaints list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<MessageSquare />}
          title="No complaints raised"
          description="Use the button above to report any issues with your property."
        />
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint: any) => (
            <div key={complaint.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{complaint.subject}</p>
                  <p className="text-xs text-muted-foreground">{complaint.complaintNumber} · {complaint.category}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={PRIORITY_VARIANT[complaint.priority]}>{complaint.priority}</Badge>
                  <Badge variant={STATUS_VARIANT[complaint.status]}>{complaint.status.replace('_', ' ')}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
              {complaint.updates?.[0] && (
                <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Latest: {complaint.updates[0].message}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Raised {formatTimeAgo(complaint.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
