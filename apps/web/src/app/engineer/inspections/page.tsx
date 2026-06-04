'use client'
import { useQuery } from "@tanstack/react-query"
import { get } from "@/lib/api/client"
import { PageHeader, Badge, Skeleton, EmptyState } from "@/components/shared/data-display"
import { CheckSquare } from "lucide-react"
import { formatDate } from "@buildestate/utils"

export default function InspectionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["engineer", "all-inspections"],
    queryFn: () => get<any>("/engineer/dashboard"),
    staleTime: 60 * 1000,
  })
  const inspections = data?.todayInspections ?? []

  return (
    <>
      <PageHeader title="Inspections" />
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : inspections.length === 0 ? (
        <EmptyState icon={<CheckSquare />} title="No inspections today" description="Scheduled inspections will appear here." />
      ) : (
        <div className="space-y-3">
          {inspections.map((ins: any) => (
            <div key={ins.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{ins.activity}</p>
                  <p className="text-xs text-muted-foreground">{ins.location}</p>
                  <p className="text-xs text-muted-foreground">{ins.project?.name} · {formatDate(ins.scheduledDate)}</p>
                </div>
                <Badge variant={ins.status === "PASS" ? "success" : ins.status === "FAIL" ? "danger" : "warning"}>
                  {ins.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
