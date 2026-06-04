import { UsersService } from './users.service';
import type { RequestUser } from '@/common/decorators';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: RequestUser): Promise<any>;
    updateMe(user: RequestUser, body: {
        name?: string;
        phone?: string;
    }): Promise<any>;
    uploadAvatar(user: RequestUser, file: Express.Multer.File): Promise<any>;
    getOrg(user: RequestUser): Promise<any>;
    getNotifications(user: RequestUser, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
        unreadCount: any;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map