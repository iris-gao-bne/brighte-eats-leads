import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Services
  const services = [
    { slug: "delivery", label: "Delivery" },
    { slug: "pick-up", label: "Pick-up" },
    { slug: "payment", label: "Payment" },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log("Seeded services:", services.map((s) => s.slug).join(", "));

  // Sample leads
  const leads = [
    {
      name: "Alice Nguyen",
      email: "alice.nguyen@example.com",
      mobile: "0412345678",
      postcode: "2000",
      services: ["delivery", "payment"],
    },
    {
      name: "Ben Trott",
      email: "ben.trott@example.com",
      mobile: "0423456789",
      postcode: "3000",
      services: ["pick-up"],
    },
    {
      name: "Chloe Park",
      email: "chloe.park@example.com",
      mobile: "0434567890",
      postcode: "4000",
      services: ["delivery", "pick-up", "payment"],
    },
    {
      name: "David Obi",
      email: "david.obi@example.com",
      mobile: "0445678901",
      postcode: "5000",
      services: ["payment"],
    },
    {
      name: "Emma Walsh",
      email: "emma.walsh@example.com",
      mobile: "0456789012",
      postcode: "6000",
      services: ["delivery"],
    },
    {
      name: "Frank Liu",
      email: "frank.liu@example.com",
      mobile: "0467890123",
      postcode: "2060",
      services: ["delivery", "pick-up"],
    },
    {
      name: "Grace Kim",
      email: "grace.kim@example.com",
      mobile: "0478901234",
      postcode: "3121",
      services: ["pick-up", "payment"],
    },
    {
      name: "Henry Russo",
      email: "henry.russo@example.com",
      mobile: "0489012345",
      postcode: "4101",
      services: ["delivery", "payment"],
    },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {},
      create: {
        name: lead.name,
        email: lead.email,
        mobile: lead.mobile,
        postcode: lead.postcode,
        services: {
          create: lead.services.map((slug) => ({ serviceSlug: slug })),
        },
      },
    });
  }

  console.log(`Seeded ${leads.length} sample leads`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
