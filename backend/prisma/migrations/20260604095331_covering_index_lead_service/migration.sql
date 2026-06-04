-- DropIndex
DROP INDEX "LeadService_serviceSlug_idx";

-- CreateIndex
CREATE INDEX "LeadService_serviceSlug_leadId_idx" ON "LeadService"("serviceSlug", "leadId");
