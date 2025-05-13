export type Environment = 'development' | 'testing' | 'staging' | 'production';

export interface DatabaseConfig {
  uri: string;
  name: string;
  poolSize?: number;
  replicaSet?: string;
  authSource?: string;
  options?: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    retryWrites?: boolean;
    retryReads?: boolean;
  };
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  sessionSecret: string;
  passwordMinLength: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  providers: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    facebook?: {
      appId: string;
      appSecret: string;
    };
  };
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'ses';
  from: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  ses?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
}

export interface PaymentConfig {
  providers: {
    stripe?: {
      secretKey: string;
      publishableKey: string;
      webhookSecret: string;
    };
    razorpay?: {
      keyId: string;
      keySecret: string;
    };
    paypal?: {
      clientId: string;
      clientSecret: string;
      environment: 'sandbox' | 'live';
    };
  };
  currency: string;
  minimumAmount: number;
}

export interface CacheConfig {
  provider: 'redis' | 'memory';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  ttl: {
    short: number;
    medium: number;
    long: number;
  };
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destination: 'console' | 'file' | 'external';
  file?: {
    path: string;
    maxSize: string;
    maxFiles: number;
  };
  external?: {
    url: string;
    apiKey: string;
  };
}

export interface APIConfig {
  baseUrl: string;
  version: string;
  timeout: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
}

export interface AppConfig {
  env: Environment;
  port: number;
  host: string;
  apiPrefix: string;
  database: DatabaseConfig;
  auth: AuthConfig;
  email: EmailConfig;
  payment: PaymentConfig;
  cache: CacheConfig;
  logging: LoggingConfig;
  api: APIConfig;
  features: {
    maintenance: boolean;
    registration: boolean;
    emailVerification: boolean;
    socialLogin: boolean;
    twoFactorAuth: boolean;
  };
}