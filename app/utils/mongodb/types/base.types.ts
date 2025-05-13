import { EntityStatus } from '@/types/shared/api.types';
import { Document, Types } from "mongoose";

//app/utils/mongodb/types/base.types.ts

export interface BaseModel {
  _id: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseDocument extends Document, BaseModel {
  _id: Types.ObjectId;
}

export interface BaseModelInput {
  isActive?: boolean;
}

export interface BaseModelMethods {
  softDelete(): Promise<void>;
  restore(): Promise<void>;
  updateStatus(status: EntityStatus): Promise<void>;
}

export interface BaseQueryHelpers {
  active(): Promise<this>;
  inactive(): Promise<this>;
  byStatus(status: EntityStatus): Promise<this>;
  withDateRange(startDate: Date, endDate: Date): Promise<this>;
}

export interface TimestampedModel extends BaseModel {
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}