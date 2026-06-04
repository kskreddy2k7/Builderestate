// ─── Query Key Factory ────────────────────────────────────────────────────────
// Centralised, type-safe query keys for React Query cache management.
// Pattern: ['scope', 'entity', identifier?, filters?]

export const queryKeys = {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // ─── Users ────────────────────────────────────────────────────────────────
  users: {
    all: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    notifications: (userId: string) => ['users', userId, 'notifications'] as const,
    notificationCount: (userId: string) => ['users', userId, 'notification-count'] as const,
  },

  // ─── Marketplace ──────────────────────────────────────────────────────────
  properties: {
    all: (filters?: Record<string, unknown>) => ['properties', 'list', filters] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
    bySlug: (slug: string) => ['properties', 'slug', slug] as const,
    saved: (userId: string) => ['properties', 'saved', userId] as const,
    enquiries: (propertyId: string) => ['properties', propertyId, 'enquiries'] as const,
    search: (query: Record<string, unknown>) => ['properties', 'search', query] as const,
  },

  // ─── Projects ─────────────────────────────────────────────────────────────
  projects: {
    all: (orgId?: string, filters?: Record<string, unknown>) => ['projects', 'list', orgId, filters] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    towers: (projectId: string) => ['projects', projectId, 'towers'] as const,
    units: (projectId: string, filters?: Record<string, unknown>) => ['projects', projectId, 'units', filters] as const,
    milestones: (projectId: string) => ['projects', projectId, 'milestones'] as const,
    progress: (projectId: string) => ['projects', projectId, 'progress'] as const,
    reports: (projectId: string, filters?: Record<string, unknown>) => ['projects', projectId, 'reports', filters] as const,
    budget: (projectId: string) => ['projects', projectId, 'budget'] as const,
    inspections: (projectId: string) => ['projects', projectId, 'inspections'] as const,
  },

  // ─── Bookings ─────────────────────────────────────────────────────────────
  bookings: {
    all: (filters?: Record<string, unknown>) => ['bookings', 'list', filters] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    byBuyer: (buyerId: string) => ['bookings', 'buyer', buyerId] as const,
    payments: (bookingId: string) => ['bookings', bookingId, 'payments'] as const,
    schedule: (bookingId: string) => ['bookings', bookingId, 'schedule'] as const,
    documents: (bookingId: string) => ['bookings', bookingId, 'documents'] as const,
  },

  // ─── CRM ──────────────────────────────────────────────────────────────────
  leads: {
    all: (filters?: Record<string, unknown>) => ['leads', 'list', filters] as const,
    detail: (id: string) => ['leads', 'detail', id] as const,
    pipeline: (orgId: string) => ['leads', 'pipeline', orgId] as const,
    activities: (leadId: string) => ['leads', leadId, 'activities'] as const,
    siteVisits: (leadId: string) => ['leads', leadId, 'site-visits'] as const,
  },

  customers: {
    all: (orgId: string, filters?: Record<string, unknown>) => ['customers', 'list', orgId, filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },

  commissions: {
    all: (filters?: Record<string, unknown>) => ['commissions', 'list', filters] as const,
    detail: (id: string) => ['commissions', 'detail', id] as const,
    byBroker: (brokerId: string) => ['commissions', 'broker', brokerId] as const,
  },

  // ─── Contractor ───────────────────────────────────────────────────────────
  workOrders: {
    all: (filters?: Record<string, unknown>) => ['work-orders', 'list', filters] as const,
    detail: (id: string) => ['work-orders', 'detail', id] as const,
    bills: (woId: string) => ['work-orders', woId, 'bills'] as const,
  },

  // ─── Materials ────────────────────────────────────────────────────────────
  products: {
    all: (filters?: Record<string, unknown>) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    bySupplier: (supplierId: string) => ['products', 'supplier', supplierId] as const,
  },

  purchaseOrders: {
    all: (filters?: Record<string, unknown>) => ['purchase-orders', 'list', filters] as const,
    detail: (id: string) => ['purchase-orders', 'detail', id] as const,
  },

  // ─── Inspections & NCR ────────────────────────────────────────────────────
  inspections: {
    all: (filters?: Record<string, unknown>) => ['inspections', 'list', filters] as const,
    detail: (id: string) => ['inspections', 'detail', id] as const,
  },

  ncr: {
    all: (filters?: Record<string, unknown>) => ['ncr', 'list', filters] as const,
    detail: (id: string) => ['ncr', 'detail', id] as const,
    byProject: (projectId: string) => ['ncr', 'project', projectId] as const,
  },

  // ─── Admin & Analytics ────────────────────────────────────────────────────
  analytics: {
    platform: (period?: string) => ['analytics', 'platform', period] as const,
    project: (projectId: string) => ['analytics', 'project', projectId] as const,
  },

  // ─── AI ───────────────────────────────────────────────────────────────────
  ai: {
    costEstimate: (params: Record<string, unknown>) => ['ai', 'cost-estimate', params] as const,
    valuation: (params: Record<string, unknown>) => ['ai', 'valuation', params] as const,
    riskFlags: (projectId: string) => ['ai', 'risk-flags', projectId] as const,
  },
} as const
