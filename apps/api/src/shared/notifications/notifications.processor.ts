import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import type { Job } from 'bull'
import { NotificationsService, type SendEmailOptions, type SendSmsOptions } from './notifications.service'

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name)

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('send-email')
  async handleEmail(job: Job<SendEmailOptions>): Promise<void> {
    this.logger.debug(`Processing email job ${job.id}`)
    await this.notificationsService.sendEmail(job.data)
  }

  @Process('send-sms')
  async handleSms(job: Job<SendSmsOptions>): Promise<void> {
    this.logger.debug(`Processing SMS job ${job.id}`)
    await this.notificationsService.sendSms(job.data)
  }
}
