import { Types } from "mongoose";

//app/types/shared/caching.ts

export interface CacheConfig {
  ttl: number;
  prefix?: string;
  namespace?: string;
}

export interface CacheOptions extends CacheConfig {
  key?: string;
  tags?: string[];
  condition?: () => boolean | Promise<boolean>;
}

export interface CacheKey {
  prefix?: string;
  namespace?: string;
  identifier: string;
}

export interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  size: number;
  lastCleaned?: Date;
}

export interface EntityCache<T> {
  get(id: Types.ObjectId | string): Promise<T | null>;
  set(id: Types.ObjectId | string, data: T, options?: CacheOptions): Promise<void>;
  delete(id: Types.ObjectId | string): Promise<void>;
  clear(): Promise<void>;
  stats(): Promise<CacheStats>;
}

export interface QueryCache {
  get(key: CacheKey): Promise<any>;
  set(key: CacheKey, data: any, options?: CacheOptions): Promise<void>;
  invalidate(tags: string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface ResponseFormatter<T = any> {
  format(data: T): any;
  transform?: (data: T) => any;
  include?: string[];
  exclude?: string[];
  version?: string;
}

export interface ResponseMetadata {
  timestamp: string;
  version?: string;
  requestId?: string;
  processingTime?: number;
  cached?: boolean;
  params?: Record<string, any>;
}

export interface EnhancedResponse<T = any> {
  data: T;
  metadata: ResponseMetadata;
  links?: {
    self?: string;
    next?: string;
    prev?: string;
    [key: string]: string | undefined;
  };
}