import { GraphQLError } from "graphql";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { RegisterInputSchema } from "../validation.js";
import { ErrorCode, PrismaErrorCode } from "../constants.js";
import { signToken } from "../auth.js";

export const mutationResolvers = {
  register: async (_: unknown, args: unknown) => {
    const parsedInput = RegisterInputSchema.safeParse(args);
    if (!parsedInput.success) {
      throw new GraphQLError(parsedInput.error.issues[0].message, {
        extensions: {
          code: ErrorCode.BAD_USER_INPUT,
          issues: parsedInput.error.issues,
        },
      });
    }

    const { name, email, mobile, postcode, services } = parsedInput.data;
    const uniqueSlugs = [...new Set(services)];

    // Validate slugs exist in DB — not hardcoded, so new service types work automatically
    const existing = await prisma.service.findMany({
      where: { slug: { in: uniqueSlugs } },
      select: { slug: true },
    });

    if (existing.length !== uniqueSlugs.length) {
      const found = new Set(existing.map((s) => s.slug));
      const unknownServices = uniqueSlugs.filter((s) => !found.has(s));
      throw new GraphQLError(
        `Unknown service type(s): ${unknownServices.join(", ")}`,
        { extensions: { code: ErrorCode.BAD_USER_INPUT } },
      );
    }

    try {
      return await prisma.lead.create({
        data: {
          name,
          email,
          mobile,
          postcode,
          services: {
            create: uniqueSlugs.map((slug) => ({ serviceSlug: slug })),
          },
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new GraphQLError("Email already registered", {
          extensions: { code: ErrorCode.BAD_USER_INPUT },
        });
      }
      throw err;
    }
  },

  login: async (_: unknown, args: { email: string; password: string }) => {
    const user = await prisma.user.findUnique({ where: { email: args.email } });

    const invalid = () =>
      new GraphQLError("Invalid email or password", {
        extensions: { code: ErrorCode.BAD_USER_INPUT },
      });

    if (!user) throw invalid();

    const valid = await bcrypt.compare(args.password, user.passwordHash);
    if (!valid) throw invalid();

    return signToken({ userId: user.id, email: user.email });
  },
};
