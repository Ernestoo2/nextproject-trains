import { ReadonlyURLSearchParams } from "next/navigation";

export const searchParams = {
  get: (params: ReadonlyURLSearchParams | null, key: string): string | null => {
    if (!params) return null;
    return params.get(key);
  },
};
