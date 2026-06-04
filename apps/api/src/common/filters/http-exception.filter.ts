import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
  timestamp: string
  path: string
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const reply = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let code = 'INTERNAL_SERVER_ERROR'
    let details: Record<string, string[]> | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>
        message = typeof resp['message'] === 'string'
          ? resp['message']
          : Array.isArray(resp['message'])
            ? (resp['message'] as string[]).join(', ')
            : exception.message

        if (Array.isArray(resp['message'])) {
          details = { validation: resp['message'] as string[] }
        }

        code = typeof resp['error'] === 'string'
          ? resp['error'].toUpperCase().replace(/\s+/g, '_')
          : HttpStatus[status] ?? 'UNKNOWN'
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack)
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    void reply.status(status).send(errorResponse)
  }
}
