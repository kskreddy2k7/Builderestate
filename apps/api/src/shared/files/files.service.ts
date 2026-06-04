import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import * as path from 'path'

export interface UploadResult {
  key: string
  url: string
  originalName: string
  mimeType: string
  size: number
}

export interface UploadOptions {
  folder: string
  allowedTypes?: string[]
  maxSizeMB?: number
  resize?: { width: number; height: number; fit?: 'cover' | 'contain' | 'fill' }
  generateThumbnail?: boolean
}

const DEFAULT_ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DEFAULT_ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const DEFAULT_MAX_SIZE_MB = 20

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name)
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly cdnUrl: string

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'ap-south-1'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    })
    this.bucket = this.config.get<string>('AWS_S3_BUCKET', '')
    this.cdnUrl = this.config.get<string>('AWS_CLOUDFRONT_URL', '')
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const { folder, allowedTypes, maxSizeMB = DEFAULT_MAX_SIZE_MB, resize, generateThumbnail } = options

    // Validate type
    const allowed = allowedTypes ?? [...DEFAULT_ALLOWED_IMAGE_TYPES, ...DEFAULT_ALLOWED_DOC_TYPES]
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`)
    }

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      throw new BadRequestException(`File exceeds ${maxSizeMB}MB limit`)
    }

    let buffer = file.buffer
    let mimeType = file.mimetype

    // Image processing
    if (file.mimetype.startsWith('image/') && resize) {
      buffer = await sharp(buffer)
        .resize(resize.width, resize.height, { fit: resize.fit ?? 'cover' })
        .webp({ quality: 85 })
        .toBuffer()
      mimeType = 'image/webp'
    }

    const ext = mimeType === 'image/webp' ? '.webp' : path.extname(file.originalname)
    const key = `${folder}/${uuidv4()}${ext}`

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
      Metadata: { originalName: file.originalname },
    }))

    // Generate thumbnail for images
    if (generateThumbnail && file.mimetype.startsWith('image/')) {
      const thumbBuffer = await sharp(file.buffer)
        .resize(400, 300, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer()
      const thumbKey = `${folder}/thumbs/${uuidv4()}.webp`
      await this.s3.send(new PutObjectCommand({
        Bucket: this.bucket, Key: thumbKey, Body: thumbBuffer,
        ContentType: 'image/webp', CacheControl: 'public, max-age=31536000',
      }))
    }

    return {
      key,
      url: this.getPublicUrl(key),
      originalName: file.originalname,
      mimeType,
      size: buffer.length,
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    options: UploadOptions,
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((f) => this.uploadFile(f, options)))
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    } catch (err) {
      this.logger.error(`Failed to delete file: ${key}`, err)
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    return getSignedUrl(this.s3, command, { expiresIn })
  }

  getPublicUrl(key: string): string {
    if (this.cdnUrl) return `${this.cdnUrl}/${key}`
    return `https://${this.bucket}.s3.amazonaws.com/${key}`
  }

  extractKeyFromUrl(url: string): string {
    if (this.cdnUrl && url.startsWith(this.cdnUrl)) {
      return url.replace(`${this.cdnUrl}/`, '')
    }
    const s3Base = `https://${this.bucket}.s3.amazonaws.com/`
    return url.replace(s3Base, '')
  }
}
