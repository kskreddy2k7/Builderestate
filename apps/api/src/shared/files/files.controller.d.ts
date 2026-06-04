import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    getSignedUrl(key: string): Promise<{
        url: string;
    }>;
}
//# sourceMappingURL=files.controller.d.ts.map