import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { queryResolvers } from "../resolvers/query.js";
import { createContext } from "../context.js";
import { prisma } from "../prisma.js";

const authContext = { ...createContext(), userId: 1 };

// Fixed timestamps so createdAt DESC order is deterministic
const T1 = new Date("2024-01-01T00:00:00Z");
const T2 = new Date("2024-01-02T00:00:00Z");
const T3 = new Date("2024-01-03T00:00:00Z");
const T4 = new Date("2024-01-04T00:00:00Z");

beforeEach(async () => {
  await prisma.leadService.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.service.upsert({
    where: { slug: "delivery" },
    update: {},
    create: { slug: "delivery", label: "Delivery" },
  });
  await prisma.service.upsert({
    where: { slug: "pick-up" },
    update: {},
    create: { slug: "pick-up", label: "Pick-up" },
  });
  await prisma.service.upsert({
    where: { slug: "payment" },
    update: {},
    create: { slug: "payment", label: "Payment" },
  });
  // Lead A (oldest): delivery only
  await prisma.lead.create({
    data: {
      name: "Lead A",
      email: "a@test.com",
      mobile: "0411111111",
      postcode: "2000",
      createdAt: T1,
      services: { create: [{ serviceSlug: "delivery" }] },
    },
  });
  // Lead B: pick-up only
  await prisma.lead.create({
    data: {
      name: "Lead B",
      email: "b@test.com",
      mobile: "0422222222",
      postcode: "2000",
      createdAt: T2,
      services: { create: [{ serviceSlug: "pick-up" }] },
    },
  });
  // Lead C: delivery + payment
  await prisma.lead.create({
    data: {
      name: "Lead C",
      email: "c@test.com",
      mobile: "0433333333",
      postcode: "2000",
      createdAt: T3,
      services: {
        create: [{ serviceSlug: "delivery" }, { serviceSlug: "payment" }],
      },
    },
  });
  // Lead D (newest): payment only
  await prisma.lead.create({
    data: {
      name: "Lead D",
      email: "d@test.com",
      mobile: "0444444444",
      postcode: "2000",
      createdAt: T4,
      services: { create: [{ serviceSlug: "payment" }] },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("leads query", () => {
  it("returns all leads with correct total when no filter applied", async () => {
    const result = await queryResolvers.leads(null, {}, authContext);
    expect(result.total).toBe(4);
    expect(result.items).toHaveLength(4);
  });

  it("returns leads sorted by createdAt DESC", async () => {
    const result = await queryResolvers.leads(null, {}, authContext);
    const emails = result.items.map((l) => l.email);
    expect(emails).toEqual([
      "d@test.com",
      "c@test.com",
      "b@test.com",
      "a@test.com",
    ]);
  });

  it("filters by multiple services using OR logic", async () => {
    const result = await queryResolvers.leads(
      null,
      { services: ["delivery", "pick-up"] },
      authContext,
    );
    expect(result.total).toBe(3);
  });

  it("returns empty list when filter matches no leads", async () => {
    await prisma.service.upsert({
      where: { slug: "catering" },
      update: {},
      create: { slug: "catering", label: "Catering" },
    });
    const result = await queryResolvers.leads(
      null,
      { services: ["catering"] },
      authContext,
    );
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
    await prisma.service.delete({ where: { slug: "catering" } });
  });

  it("respects limit", async () => {
    const result = await queryResolvers.leads(null, { limit: 2 }, authContext);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(4);
  });

  it("respects offset", async () => {
    const first = await queryResolvers.leads(
      null,
      { limit: 2, offset: 0 },
      authContext,
    );
    const second = await queryResolvers.leads(
      null,
      { limit: 2, offset: 2 },
      authContext,
    );

    expect(first.items.map((l) => l.email)).toEqual([
      "d@test.com",
      "c@test.com",
    ]);
    expect(second.items.map((l) => l.email)).toEqual([
      "b@test.com",
      "a@test.com",
    ]);
  });

  it("rejects limit below 1", async () => {
    await expect(
      queryResolvers.leads(null, { limit: 0 }, authContext),
    ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
  });

  it("rejects limit above 100", async () => {
    await expect(
      queryResolvers.leads(null, { limit: 101 }, authContext),
    ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
  });

  it("rejects unauthenticated requests", async () => {
    const anonContext = { ...createContext(), userId: null };
    await expect(
      queryResolvers.leads(null, {}, anonContext),
    ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
  });
});
