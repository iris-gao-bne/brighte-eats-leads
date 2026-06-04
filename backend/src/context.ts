import type DataLoader from "dataloader";
import { createServicesLoader } from "./loaders/services.loader.js";
import { verifyToken } from "./auth.js";

export type Context = {
  userId: number | null;
  loaders: {
    services: DataLoader<number, string[]>;
  };
};

export function createContext(authHeader?: string): Context {
  let userId: number | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    userId = payload?.userId ?? null;
  }

  return {
    userId,
    loaders: {
      services: createServicesLoader(),
    },
  };
}
