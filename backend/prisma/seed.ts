import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
