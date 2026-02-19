import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let code = 'INTERNAL_ERROR'
    let details: unknown = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>
        message = (resp['message'] as string) || message
        code = (resp['code'] as string) || code
        details = resp['details']
      }
    } else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack)
    }

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status] ?? 'Unknown',
      message,
      code,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
