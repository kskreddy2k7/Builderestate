export * from './client'
export * from './auth.api'

export { default as marketplaceApi } from './marketplace.api'
export { default as crmApi } from './crm.api'
export { default as buyerApi } from './buyer.api'

export const aiApi = {
  estimateCost: (data: unknown) => import('./client').then(m => m.post<any>('/ai/cost-estimate', data)),
  valuate: (data: unknown) => import('./client').then(m => m.post<any>('/ai/valuation', data)),
  analyzeRisks: (projectId: string) => import('./client').then(m => m.post<any>('/ai/risk-analysis', { projectId })),
  chat: (data: unknown) => import('./client').then(m => m.post<any>('/ai/chat', data)),
  getRiskFlags: (projectId: string) => import('./client').then(m => m.get<any>(`/ai/risk-flags/${projectId}`)),
}
