import { registerAs } from '@nestjs/config'

export const AppConfig = registerAs('app', () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['APP_PORT'] ?? '4000', 10),
  appUrl: process.env['APP_URL'] ?? 'http://localhost:4000',
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  apiPrefix: process.env['API_PREFIX'] ?? 'api/v1',

  database: {
    url: process.env['DATABASE_URL'] ?? '',
    poolMin: parseInt(process.env['DATABASE_POOL_MIN'] ?? '2', 10),
    poolMax: parseInt(process.env['DATABASE_POOL_MAX'] ?? '10', 10),
  },

  redis: {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'],
    db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
  },

  jwt: {
    secret: process.env['JWT_SECRET'] ?? '',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? '',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  },

  oauth: {
    google: {
      clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
      callbackUrl: process.env['GOOGLE_CALLBACK_URL'] ?? '',
    },
  },

  aws: {
    region: process.env['AWS_REGION'] ?? 'ap-south-1',
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
    s3Bucket: process.env['AWS_S3_BUCKET'] ?? '',
    cloudfrontUrl: process.env['AWS_CLOUDFRONT_URL'] ?? '',
  },

  email: {
    from: process.env['EMAIL_FROM'] ?? 'noreply@buildestate.in',
    fromName: process.env['EMAIL_FROM_NAME'] ?? 'BuildEstate',
    sesRegion: process.env['SES_REGION'] ?? 'ap-south-1',
  },

  sms: {
    twilioAccountSid: process.env['TWILIO_ACCOUNT_SID'] ?? '',
    twilioAuthToken: process.env['TWILIO_AUTH_TOKEN'] ?? '',
    twilioPhoneNumber: process.env['TWILIO_PHONE_NUMBER'] ?? '',
  },

  payments: {
    razorpayKeyId: process.env['RAZORPAY_KEY_ID'] ?? '',
    razorpayKeySecret: process.env['RAZORPAY_KEY_SECRET'] ?? '',
    razorpayWebhookSecret: process.env['RAZORPAY_WEBHOOK_SECRET'] ?? '',
  },

  openai: {
    apiKey: process.env['OPENAI_API_KEY'] ?? '',
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o',
  },

  throttle: {
    ttl: parseInt(process.env['THROTTLE_TTL'] ?? '60', 10),
    limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
  },
}))
