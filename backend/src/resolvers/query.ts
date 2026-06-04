import { GraphQLError } from "graphql";
import { prisma } from "../prisma.js";
import { LeadsArgsSchema } from "../validation.js";
import { ErrorCode } from "../constants.js";

export const queryResolvers = {
  leads: async (_: unknown, args: unknown) => {
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
};
