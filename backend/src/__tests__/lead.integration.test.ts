import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { queryResolvers } from "../resolvers/query.js";
import { leadFieldResolvers } from "../resolvers/lead.js";
import { createContext } from "../context.js";
import { prisma } from "../prisma.js";

const authContext = { ...createContext(), userId: 1 };

beforeEach(async () => {
  await prisma.leadService.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.service.upsert({
    where: { slug: "delivery" },
    update: {},
    create: { slug: "delivery", label: "Delivery" },
  });
  await prisma.service.upsert({
    where: { slug: "payment" },
    update: {},
    create: { slug: "payment", label: "Payment" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("lead query", () => {
  it("returns a lead with correct fields by id", async () => {
    const created = await prisma.lead.create({
      data: {
        name: "Alice",
        email: "alice@test.com",
        mobile: "0411111111",
        postcode: "2000",
        services: {
          create: [{ serviceSlug: "delivery" }, { serviceSlug: "payment" }],
        },
      },
    });

    const lead = await queryResolvers.lead(null, { id: created.id }, authContext);

    expect(lead).not.toBeNull();
    expect(lead!.id).toBe(created.id);
    expect(lead!.name).toBe("Alice");
    expect(lead!.email).toBe("alice@test.com");

    const services = await leadFieldResolvers.services(lead!, null, createContext());
    expect(services).toEqual(expect.arrayContaining(["delivery", "payment"]));
  });

  it("returns null for a non-existent id", async () => {
    const lead = await queryResolvers.lead(null, { id: 999999 }, authContext);
    expect(lead).toBeNull();
  });

  it("rejects unauthenticated requests", async () => {
    const anonContext = { ...createContext(), userId: null };
    await expect(
      queryResolvers.lead(null, { id: 1 }, anonContext),
    ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
  });
});
