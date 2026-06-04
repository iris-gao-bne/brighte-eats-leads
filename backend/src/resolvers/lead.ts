import type { Context } from "../context.js";

type LeadParent = { id: number; createdAt: Date };

export const leadFieldResolvers = {
  services: (parent: LeadParent, _: unknown, context: Context) =>
    context.loaders.services.load(parent.id),

  createdAt: (parent: LeadParent) => parent.createdAt.toISOString(),
};
