import DataLoader from "dataloader";
import { prisma } from "../prisma.js";

export function createServicesLoader() {
  return new DataLoader<number, string[]>(async (leadIds) => {
    const rows = await prisma.leadService.findMany({
      where: { leadId: { in: [...leadIds] } },
      select: { leadId: true, serviceSlug: true },
    });
    return leadIds.map((id) =>
      rows.filter((r) => r.leadId === id).map((r) => r.serviceSlug),
    );
  });
}
