import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { mutationResolvers } from "../resolvers/mutation.js";
import { leadFieldResolvers } from "../resolvers/lead.js";
import { createContext } from "../context.js";
import { prisma } from "../prisma.js";

beforeEach(async () => {
  await prisma.leadService.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.service.deleteMany({
    where: { slug: { notIn: ["delivery", "pick-up", "payment"] } },
  });
  await prisma.service.upsert({ where: { slug: "delivery" }, update: {}, create: { slug: "delivery", label: "Delivery" } });
  await prisma.service.upsert({ where: { slug: "pick-up" }, update: {}, create: { slug: "pick-up", label: "Pick-up" } });
  await prisma.service.upsert({ where: { slug: "payment" }, update: {}, create: { slug: "payment", label: "Payment" } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

const validArgs = {
  name: "Test User",
  email: "test@example.com",
  mobile: "0412345678",
  postcode: "2000",
  services: ["delivery"],
};

describe("register mutation", () => {
  // Assessment: "the register mutation returning a lead on the happy path"
  it("creates and returns a lead on the happy path", async () => {
    const lead = await mutationResolvers.register(null, validArgs);

    expect(lead.id).toBeDefined();
    expect(lead.name).toBe(validArgs.name);
    expect(lead.email).toBe(validArgs.email);
    expect(lead.mobile).toBe(validArgs.mobile);
    expect(lead.postcode).toBe(validArgs.postcode);

    const context = createContext();
    const services = await leadFieldResolvers.services(lead, null, context);
    expect(services).toEqual(["delivery"]);
    expect(leadFieldResolvers.createdAt(lead)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns BAD_USER_INPUT on duplicate email", async () => {
    await mutationResolvers.register(null, validArgs);

    await expect(
      mutationResolvers.register(null, validArgs)
    ).rejects.toMatchObject({
      extensions: { code: "BAD_USER_INPUT" },
    });
  });

  // Assessment: "a new service type being added without the validation knowing about it"
  it("accepts a new service type added to the DB without any code changes", async () => {
    await prisma.service.create({ data: { slug: "catering", label: "Catering" } });

    const lead = await mutationResolvers.register(null, {
      ...validArgs,
      services: ["catering"],
    });

    const context = createContext();
    const services = await leadFieldResolvers.services(lead, null, context);
    expect(services).toContain("catering");
  });

  it("rejects an unknown service slug with BAD_USER_INPUT", async () => {
    await expect(
      mutationResolvers.register(null, { ...validArgs, services: ["unknown-slug"] })
    ).rejects.toMatchObject({
      extensions: { code: "BAD_USER_INPUT" },
    });
  });

  it("deduplicates repeated service slugs", async () => {
    const lead = await mutationResolvers.register(null, {
      ...validArgs,
      services: ["delivery", "delivery", "delivery"],
    });

    const context = createContext();
    const services = await leadFieldResolvers.services(lead, null, context);
    expect(services).toEqual(["delivery"]);
  });
});
