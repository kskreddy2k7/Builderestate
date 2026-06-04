import { type NestInterceptor, type ExecutionContext, type CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
export interface ApiResponse<T> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>>;
}
//# sourceMappingURL=response.interceptor.d.ts.map