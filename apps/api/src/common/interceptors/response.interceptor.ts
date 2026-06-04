import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  success: true
  data: T
  message?: string
  timestamp: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has success flag, pass through (e.g. from pagination)
        if (data !== null && typeof data === 'object' && 'success' in (data as object)) {
          return data as unknown as ApiResponse<T>
        }
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        }
      }),
    )
  }
}
