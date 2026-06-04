import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
}
export interface UploadOptions {
    folder: string;
    allowedTypes?: string[];
    maxSizeMB?: number;
    resize?: {
        width: number;
        height: number;
        fit?: 'cover' | 'contain' | 'fill';
    };
    generateThumbnail?: boolean;
}
export declare class FilesService {
    private readonly config;
    private readonly logger;
    private readonly s3;
    private readonly bucket;
    private readonly cdnUrl;
    constructor(config: ConfigService);
    uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<UploadResult>;
    uploadMultiple(files: Express.Multer.File[], options: UploadOptions): Promise<UploadResult[]>;
    deleteFile(key: string): Promise<void>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    getPublicUrl(key: string): string;
    extractKeyFromUrl(url: string): string;
}
//# sourceMappingURL=files.service.d.ts.map