-- CreateTable
CREATE TABLE "variant_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "latexContent" TEXT NOT NULL,
    "templateData" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "variantGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_blocks_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "variant_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "structure" TEXT NOT NULL DEFAULT '{"sectionOrder":[],"sections":{}}',
    "preamble" TEXT NOT NULL DEFAULT '',
    "headerData" TEXT NOT NULL DEFAULT '{}',
    "spacing" TEXT NOT NULL DEFAULT '{"section":-8,"block":-6,"line":1.0}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "content_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "content_usages_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "resume_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_usages_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "content_blocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "variant_groups_name_key" ON "variant_groups"("name");

-- CreateIndex
CREATE INDEX "content_blocks_variantGroupId_idx" ON "content_blocks"("variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "resume_documents_name_key" ON "resume_documents"("name");

-- CreateIndex
CREATE INDEX "content_usages_documentId_sectionType_order_idx" ON "content_usages"("documentId", "sectionType", "order");

-- CreateIndex
CREATE UNIQUE INDEX "content_usages_documentId_blockId_key" ON "content_usages"("documentId", "blockId");
