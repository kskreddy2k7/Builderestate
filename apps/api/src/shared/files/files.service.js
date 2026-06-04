"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const sharp = __importStar(require("sharp"));
const path = __importStar(require("path"));
const DEFAULT_ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DEFAULT_ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const DEFAULT_MAX_SIZE_MB = 20;
let FilesService = FilesService_1 = class FilesService {
    config;
    logger = new common_1.Logger(FilesService_1.name);
    s3;
    bucket;
    cdnUrl;
    constructor(config) {
        this.config = config;
        this.s3 = new client_s3_1.S3Client({
            region: this.config.get('AWS_REGION', 'ap-south-1'),
            credentials: {
                accessKeyId: this.config.get('AWS_ACCESS_KEY_ID', ''),
                secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY', ''),
            },
        });
        this.bucket = this.config.get('AWS_S3_BUCKET', '');
        this.cdnUrl = this.config.get('AWS_CLOUDFRONT_URL', '');
    }
    async uploadFile(file, options) {
        const { folder, allowedTypes, maxSizeMB = DEFAULT_MAX_SIZE_MB, resize, generateThumbnail } = options;
        // Validate type
        const allowed = allowedTypes ?? [...DEFAULT_ALLOWED_IMAGE_TYPES, ...DEFAULT_ALLOWED_DOC_TYPES];
        if (!allowed.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} not allowed`);
        }
        // Validate size
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new common_1.BadRequestException(`File exceeds ${maxSizeMB}MB limit`);
        }
        let buffer = file.buffer;
        let mimeType = file.mimetype;
        // Image processing
        if (file.mimetype.startsWith('image/') && resize) {
            buffer = await sharp(buffer)
                .resize(resize.width, resize.height, { fit: resize.fit ?? 'cover' })
                .webp({ quality: 85 })
                .toBuffer();
            mimeType = 'image/webp';
        }
        const ext = mimeType === 'image/webp' ? '.webp' : path.extname(file.originalname);
        const key = `${folder}/${(0, uuid_1.v4)()}${ext}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            CacheControl: 'public, max-age=31536000',
            Metadata: { originalName: file.originalname },
        }));
        // Generate thumbnail for images
        if (generateThumbnail && file.mimetype.startsWith('image/')) {
            const thumbBuffer = await sharp(file.buffer)
                .resize(400, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toBuffer();
            const thumbKey = `${folder}/thumbs/${(0, uuid_1.v4)()}.webp`;
            await this.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket, Key: thumbKey, Body: thumbBuffer,
                ContentType: 'image/webp', CacheControl: 'public, max-age=31536000',
            }));
        }
        return {
            key,
            url: this.getPublicUrl(key),
            originalName: file.originalname,
            mimeType,
            size: buffer.length,
        };
    }
    async uploadMultiple(files, options) {
        return Promise.all(files.map((f) => this.uploadFile(f, options)));
    }
    async deleteFile(key) {
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        }
        catch (err) {
            this.logger.error(`Failed to delete file: ${key}`, err);
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
    }
    getPublicUrl(key) {
        if (this.cdnUrl)
            return `${this.cdnUrl}/${key}`;
        return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }
    extractKeyFromUrl(url) {
        if (this.cdnUrl && url.startsWith(this.cdnUrl)) {
            return url.replace(`${this.cdnUrl}/`, '');
        }
        const s3Base = `https://${this.bucket}.s3.amazonaws.com/`;
        return url.replace(s3Base, '');
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map