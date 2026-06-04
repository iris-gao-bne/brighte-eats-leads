import { GraphQLError } from "graphql";
import { prisma } from "../prisma.js";
import { LeadsArgsSchema } from "../validation.js";
import { ErrorCode } from "../constants.js";
import type { Context } from "../context.js";

function requireAuth(context: Context) {
  if (!context.userId) {
    throw new GraphQLError("You must be logged in to access this resource", {
      extensions: { code: ErrorCode.UNAUTHENTICATED },
    });
  }
}

export const queryResolvers = {
  leads: async (_: unknown, args: unknown, context: Context) => {
    requireAuth(context);

    const result = LeadsArgsSchema.safeParse(args);
    if (!result.success) {
      throw new GraphQLError(result.error.issues[0].message, {
        extensions: { code: ErrorCode.BAD_USER_INPUT },
      });
    }

    const { limit, offset, services } = result.data;

    const where =
      services && services.length > 0
        ? { services: { some: { serviceSlug: { in: services } } } }
        : {};

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({ where }),
    ]);

    return { items, total };
  },

  lead: async (_: unknown, args: { id: number }, context: Context) => {
    requireAuth(context);
    return prisma.lead.findUnique({ where: { id: args.id } });
  },

  services: async () => {
    return prisma.service.findMany({ orderBy: { slug: "asc" } });
  },
};
