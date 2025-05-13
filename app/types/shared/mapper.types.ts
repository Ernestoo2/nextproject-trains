import { Types } from "mongoose";
import { BaseModel } from "@/utils/mongodb/types/base.types";

//app/types/shared/mapper.types.ts

export type OmitTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;
export type OmitMongo<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>;

export type CreateDTO<T> = OmitMongo<T>;
export type UpdateDTO<T> = Partial<OmitMongo<T>>;

export type PopulatedField<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends Types.ObjectId ? any : T[P];
};

export interface MapperConfig {
  includeTimestamps?: boolean;
  includeMeta?: boolean;
  populate?: string[];
}

export interface BaseDTO {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export type ModelToDTO<T extends BaseModel> = Omit<T, '_id' | 'createdAt' | 'updatedAt'> & BaseDTO;

export interface MapperOptions<T extends BaseModel, D extends BaseDTO> {
  toDTO: (model: T) => D;
  toModel: (dto: CreateDTO<D>) => Partial<T>;
  config?: MapperConfig;
}

// Utility types for handling nested documents
export type NestedDocument<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId 
    ? string 
    : T[K] extends Types.ObjectId[] 
    ? string[] 
    : T[K] extends object 
    ? NestedDocument<T[K]> 
    : T[K];
};

export type DeepPopulated<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId
    ? any
    : T[K] extends Types.ObjectId[]
    ? any[]
    : T[K] extends object
    ? DeepPopulated<T[K]>
    : T[K];
};

// Type-safe document reference handling
export interface DocumentRef<T extends BaseModel> {
  _id: Types.ObjectId;
  ref: string;
  populated?: T;
}

export type RefId<T extends BaseModel> = Types.ObjectId | T;
export type RefArray<T extends BaseModel> = Types.ObjectId[] | T[];