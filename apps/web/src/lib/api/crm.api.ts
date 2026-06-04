import { get, post, patch } from './client'

const crmApi = {
  // Leads
  createLead: (data: Record<string, unknown>) => post<any>('/crm/leads', data),
  getLeads: (params?: Record<string, unknown>) => get<any>('/crm/leads', params),
  getPipeline: () => get<any>('/crm/leads/pipeline'),
  getLead: (id: string) => get<any>(`/crm/leads/${id}`),
  updateLead: (id: string, data: Record<string, unknown>) => patch<any>(`/crm/leads/${id}`, data),
  transferLead: (id: string, data: { toUserId: string; note?: string }) => post<any>(`/crm/leads/${id}/transfer`, data),

  // Activities
  addActivity: (leadId: string, data: Record<string, unknown>) => post<any>(`/crm/leads/${leadId}/activities`, data),
  getActivities: (leadId: string, page?: number) => get<any>(`/crm/leads/${leadId}/activities`, { page }),

  // Site visits
  scheduleSiteVisit: (leadId: string, data: Record<string, unknown>) => post<any>(`/crm/leads/${leadId}/site-visits`, data),
  completeSiteVisit: (visitId: string, data: Record<string, unknown>) => patch<any>(`/crm/site-visits/${visitId}/complete`, data),
  getSiteVisits: (params?: Record<string, unknown>) => get<any>('/crm/site-visits', params),

  // Commissions
  createCommission: (data: Record<string, unknown>) => post<any>('/crm/commissions', data),
  getCommissions: (params?: Record<string, unknown>) => get<any>('/crm/commissions', params),
  updateCommissionStatus: (id: string, data: Record<string, unknown>) => patch<any>(`/crm/commissions/${id}/status`, data),
  recordCommissionPayment: (data: Record<string, unknown>) => post<any>('/crm/commissions/pay', data),

  // Customers
  createCustomer: (data: Record<string, unknown>) => post<any>('/crm/customers', data),
  getCustomers: (params?: Record<string, unknown>) => get<any>('/crm/customers', params),
  getCustomer: (id: string) => get<any>(`/crm/customers/${id}`),
  updateCustomer: (id: string, data: Record<string, unknown>) => patch<any>(`/crm/customers/${id}`, data),
}

export default crmApi
