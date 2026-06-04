'use client'
import { useMyDocuments, useDemandLetters } from '@/hooks/use-buyer'
import { PageHeader, Section, Skeleton, EmptyState } from '@/components/shared/data-display'
import { FileText, Download, Receipt } from 'lucide-react'
import { formatDate } from '@buildestate/utils'

const DOC_ICONS: Record<string, string> = {
  BOOKING_FORM: '📋', ALLOTMENT_LETTER: '📄', AGREEMENT_COPY: '📑',
  DEMAND_LETTER: '💳', RECEIPT: '🧾', NOC: '✅', OTHER: '📎',
}

export default function BuyerDocumentsPage() {
  const { data: docs, isLoading: docsLoading } = useMyDocuments()
  const { data: letters, isLoading: lettersLoading } = useDemandLetters()

  return (
    <>
      <PageHeader title="Documents" description="All your booking documents and demand letters" />
      <div className="space-y-6">
        <Section title="Booking documents" actions={<span className="text-xs text-muted-foreground">{(docs ?? []).length} documents</span>}>
          {docsLoading ? <Skeleton className="h-32 w-full" /> : !docs?.length ? (
            <EmptyState icon={<FileText />} title="No documents yet" description="Documents will appear here as your booking progresses." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <span className="text-2xl">{DOC_ICONS[doc.type] ?? '📎'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type?.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Demand letters">
          {lettersLoading ? <Skeleton className="h-32 w-full" /> : !letters?.length ? (
            <EmptyState icon={<Receipt />} title="No demand letters issued" description="Demand letters appear here when payment milestones are reached." />
          ) : (
            <div className="space-y-3">
              {letters.map((letter: any) => (
                <div key={letter.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">{letter.letterNumber}</p>
                    <p className="text-xs text-muted-foreground">{letter.scheduleItem?.milestone}</p>
                    <p className="text-xs text-muted-foreground">Issued {formatDate(letter.issuedAt)} · Due {formatDate(letter.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{Number(letter.totalAmount).toLocaleString('en-IN')}</p>
                    <span className={`text-xs font-medium ${ letter.status === 'PAID' ? 'text-success-600' : letter.status === 'OVERDUE' ? 'text-danger-500' : 'text-warning-600'}`}>
                      {letter.status}
                    </span>
                  </div>
                  {letter.pdfUrl && (
                    <a href={letter.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-accent">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  )
}
