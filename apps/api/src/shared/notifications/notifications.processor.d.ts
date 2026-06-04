import type { Job } from 'bull';
import { NotificationsService, type SendEmailOptions, type SendSmsOptions } from './notifications.service';
export declare class NotificationsProcessor {
    private readonly notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    handleEmail(job: Job<SendEmailOptions>): Promise<void>;
    handleSms(job: Job<SendSmsOptions>): Promise<void>;
}
//# sourceMappingURL=notifications.processor.d.ts.map