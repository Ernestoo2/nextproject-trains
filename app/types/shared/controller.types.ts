import { Session } from "next-auth";
import { NextRequest } from "next/server";
import { ApiResponse, QueryParams, ValidationError } from "./api.types";

//app/types/shared/controller.types.ts

export interface ControllerContext {
  req: NextRequest;
  session: Session | null;
  params?: Record<string, string>;
  searchParams?: URLSearchParams;
}

export interface BaseController {
  handleRequest(context: ControllerContext): Promise<ApiResponse<any>>;
  validateInput?(data: any): Promise<ValidationError[]>;
  handleError(error: Error): ApiResponse<any>;
}

export interface QueryController extends BaseController {
  parseQueryParams(searchParams: URLSearchParams): QueryParams;
  validateQueryParams?(params: QueryParams): Promise<ValidationError[]>;
}

export interface ResourceController extends BaseController {
  create(data: any, context: ControllerContext): Promise<ApiResponse<any>>;
  read(id: string, context: ControllerContext): Promise<ApiResponse<any>>;
  update(id: string, data: any, context: ControllerContext): Promise<ApiResponse<any>>;
  delete(id: string, context: ControllerContext): Promise<ApiResponse<any>>;
  list(params: QueryParams, context: ControllerContext): Promise<ApiResponse<any>>;
}

export interface AuthorizedController extends BaseController {
  checkPermissions(context: ControllerContext): Promise<boolean>;
  handleUnauthorized(): ApiResponse<any>;
}

export interface ValidationController extends BaseController {
  validationRules: Record<string, (value: any) => ValidationError | null>;
  validateData(data: any): ValidationError[];
}

export type ControllerMethod = (context: ControllerContext) => Promise<ApiResponse<any>>;

export type ControllerMiddleware = (
  handler: ControllerMethod,
  context: ControllerContext
) => Promise<ApiResponse<any>>;