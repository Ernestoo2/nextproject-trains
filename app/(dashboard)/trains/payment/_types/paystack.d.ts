import {
  IPaystackInstance,
} from "./paystack.types";

declare global {
  interface Window {
    PaystackPop: IPaystackInstance;
  }
}
