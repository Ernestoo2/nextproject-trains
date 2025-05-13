import { Types } from "mongoose";
import { ApiResponse, MongoQueryFilters, QueryParams } from "./api.types";

//app/types/shared/service.types.ts

export interface BaseService<T> {
  create(data: Partial<T>): Promise<ApiResponse<T>>;
  findById(id: Types.ObjectId | string): Promise<ApiResponse<T>>;
  update(id: Types.ObjectId | string, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(id: Types.ObjectId | string): Promise<ApiResponse<void>>;
  list(params: QueryParams): Promise<ApiResponse<T[]>>;
}

export interface QueryOptions {
  filters?: MongoQueryFilters;
  sort?: { [key: string]: 1 | -1 };
  populate?: string | string[];
  select?: string;
  skip?: number;
  limit?: number;
}

export interface ServiceOptions {
  session?: any;
  user?: Types.ObjectId;
  populate?: string[];
}

export interface CacheOptions {
  ttl?: number;
  key?: string;
  bypass?: boolean;
}

export interface ServiceResult<T> {
  data?: T;
  error?: Error;
  meta?: Record<string, any>;
}

export interface TransactionContext {
  session: any;
  user?: Types.ObjectId;
  options?: ServiceOptions;
}

export type ServiceMethod<T, R> = (data: T, options?: ServiceOptions) => Promise<ServiceResult<R>>;

export interface ServiceHooks<T> {
  beforeCreate?: (data: Partial<T>, options?: ServiceOptions) => Promise<void>;
  afterCreate?: (data: T, options?: ServiceOptions) => Promise<void>;
  beforeUpdate?: (id: Types.ObjectId | string, data: Partial<T>, options?: ServiceOptions) => Promise<void>;
  afterUpdate?: (data: T, options?: ServiceOptions) => Promise<void>;
  beforeDelete?: (id: Types.ObjectId | string, options?: ServiceOptions) => Promise<void>;
  afterDelete?: (id: Types.ObjectId | string, options?: ServiceOptions) => Promise<void>;
}

export interface CrudServiceConfig<T> {
  hooks?: ServiceHooks<T>;
  cacheOptions?: CacheOptions;
  defaultQueryOptions?: QueryOptions;
}