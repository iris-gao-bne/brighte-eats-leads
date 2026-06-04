import type DataLoader from "dataloader";
import { createServicesLoader } from "./loaders/services.loader.js";

export type Context = {
  loaders: {
    services: DataLoader<number, string[]>;
  };
};

export function createContext(): Context {
  return {
    loaders: {
      services: createServicesLoader(),
    },
  };
}
