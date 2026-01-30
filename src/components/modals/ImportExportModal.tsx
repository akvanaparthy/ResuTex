"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileText, Layers, Plus, Check } from "lucide-react";
import { useBuilderStore, type ResumeDocument, type ContentBlock } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface ImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "export" | "import";
}

export function ImportExportModal({ open, onOpenChange, defaultTab = "export" }: ImportExportModalProps) {
  const {
    documents,
    documentId,
    documentName,
    structure,
    blocks,
    createDocument,
    switchDocument,
    loadDocument,
  } = useBuilderStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"export" | "import">(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Export state
  const [exportDestination, setExportDestination] = useState<"existing" | "new">("existing");
  const [exportTargetDocId, setExportTargetDocId] = useState<string>("");
  const [exportNewDocName, setExportNewDocName] = useState("");
  const [exportStructure, setExportStructure] = useState(true);
  const [exportBlocks, setExportBlocks] = useState(true);

  // Import state
  const [importSourceDocId, setImportSourceDocId] = useState<string>("");
  const [importStructure, setImportStructure] = useState(true);
  const [importBlocks, setImportBlocks] = useState(true);
  const [sourceDocData, setSourceDocData] = useState<{
    structure: { sectionOrder: string[] };
    blocks: ContentBlock[];
  } | null>(null);

  // Other documents (excluding current)
  const otherDocuments = documents.filter((d) => d.id !== documentId);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      setExportDestination("existing");
      setExportTargetDocId(otherDocuments[0]?.id || "");
      setExportNewDocName("");
      setExportStructure(true);
      setExportBlocks(true);
      setImportSourceDocId(otherDocuments[0]?.id || "");
      setImportStructure(true);
      setImportBlocks(true);
      setSourceDocData(null);
    }
  }, [open, defaultTab, otherDocuments]);

  // Load source document data for import preview
  useEffect(() => {
    const loadSourceData = async () => {
      if (!importSourceDocId || activeTab !== "import") {
        setSourceDocData(null);
        return;
      }

      try {
        const response = await fetch(`/api/documents/${importSourceDocId}`);
        if (response.ok) {
          const doc = await response.json();
          const parsedStructure = JSON.parse(doc.structure);
          setSourceDocData({
            structure: { sectionOrder: parsedStructure.sectionOrder || [] },
            blocks: [], // We'll use the global blocks since they're shared
          });
        }
      } catch (error) {
        console.error("Failed to load source document:", error);
      }
    };

    loadSourceData();
  }, [importSourceDocId, activeTab]);

  const handleExport = async () => {
    if (!exportStructure && !exportBlocks) {
      toast({
        title: "Nothing to Export",
        description: "Please select at least one item to export.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let targetDocId = exportTargetDocId;

      // Create new document if needed
      if (exportDestination === "new") {
        if (!exportNewDocName.trim()) {
          toast({
            title: "Name Required",
            description: "Please enter a name for the new document.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        targetDocId = await createDocument(exportNewDocName.trim());
      }

      if (!targetDocId) {
        toast({
          title: "No Destination",
          description: "Please select or create a destination document.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get target document current state
      const targetDocRes = await fetch(`/api/documents/${targetDocId}`);
      if (!targetDocRes.ok) throw new Error("Failed to load target document");
      const targetDoc = await targetDocRes.json();
      const targetStructure = JSON.parse(targetDoc.structure);

      // Prepare updated structure
      let updatedStructure = targetStructure;

      if (exportStructure) {
        // Export section order (without the block assignments)
        const newSectionOrder = [...new Set([...targetStructure.sectionOrder, ...structure.sectionOrder])];
        const newSections = { ...targetStructure.sections };
        
        // Add empty sections for new section types
        for (const sectionType of structure.sectionOrder) {
          if (!newSections[sectionType]) {
            newSections[sectionType] = [];
          }
        }

        updatedStructure = {
          sectionOrder: newSectionOrder,
          sections: newSections,
        };
      }

      // Save updated structure to target document
      await fetch(`/api/documents/${targetDocId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: targetDoc.name,
          structure: JSON.stringify(updatedStructure),
          preamble: targetDoc.preamble,
          spacing: targetDoc.spacing,
        }),
      });

      // Note: Blocks are already shared across all documents in the library

      toast({
        title: "Export Successful",
        description: `${exportStructure ? "Structure" : ""}${exportStructure && exportBlocks ? " and " : ""}${exportBlocks ? "Blocks" : ""} exported successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!importStructure && !importBlocks) {
      toast({
        title: "Nothing to Import",
        description: "Please select at least one item to import.",
        variant: "destructive",
      });
      return;
    }

    if (!importSourceDocId) {
      toast({
        title: "No Source",
        description: "Please select a source document.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get source document
      const sourceDocRes = await fetch(`/api/documents/${importSourceDocId}`);
      if (!sourceDocRes.ok) throw new Error("Failed to load source document");
      const sourceDoc = await sourceDocRes.json();
      const sourceStructure = JSON.parse(sourceDoc.structure);

      // Get current document
      const currentDocRes = await fetch(`/api/documents/${documentId}`);
      if (!currentDocRes.ok) throw new Error("Failed to load current document");
      const currentDoc = await currentDocRes.json();
      const currentStructure = JSON.parse(currentDoc.structure);

      let updatedStructure = currentStructure;

      if (importStructure) {
        // Import section order (without the block assignments)
        const newSectionOrder = [...new Set([...currentStructure.sectionOrder, ...sourceStructure.sectionOrder])];
        const newSections = { ...currentStructure.sections };
        
        // Add empty sections for new section types from source
        for (const sectionType of sourceStructure.sectionOrder) {
          if (!newSections[sectionType]) {
            newSections[sectionType] = [];
          }
        }

        updatedStructure = {
          sectionOrder: newSectionOrder,
          sections: newSections,
        };
      }

      // Save updated structure
      await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentDoc.name,
          structure: JSON.stringify(updatedStructure),
          preamble: currentDoc.preamble,
          spacing: currentDoc.spacing,
        }),
      });

      // Reload the current document to reflect changes
      await loadDocument(documentId!);

      toast({
        title: "Import Successful",
        description: `${importStructure ? "Structure" : ""}${importStructure && importBlocks ? " and " : ""}${importBlocks ? "Blocks" : ""} imported successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "An error occurred while importing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export</DialogTitle>
          <DialogDescription>
            Transfer structure and blocks between resume documents.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "export" | "import")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="gap-2">
              <Upload className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Download className="h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <FileText className="h-4 w-4 text-primary" />
                Source: {documentName}
              </div>
              <p className="text-xs text-muted-foreground">
                Exporting from the current document
              </p>
            </div>

            {/* What to export */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What to export</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-structure"
                    checked={exportStructure}
                    onCheckedChange={(checked) => setExportStructure(checked as boolean)}
                  />
                  <label htmlFor="export-structure" className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Section Structure ({structure.sectionOrder.length} sections)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-blocks"
                    checked={exportBlocks}
                    onCheckedChange={(checked) => setExportBlocks(checked as boolean)}
                  />
                  <label htmlFor="export-blocks" className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Block Library ({blocks.length} blocks)
                    <span className="text-xs text-muted-foreground">(shared across all documents)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export to</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="export-existing"
                    name="export-dest"
                    checked={exportDestination === "existing"}
                    onChange={() => setExportDestination("existing")}
                    className="h-4 w-4"
                  />
                  <label htmlFor="export-existing" className="text-sm">Existing document</label>
                </div>
                {exportDestination === "existing" && (
                  <Select value={exportTargetDocId} onValueChange={setExportTargetDocId}>
                    <SelectTrigger className="ml-6">
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherDocuments.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name}
                        </SelectItem>
                      ))}
                      {otherDocuments.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No other documents
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="export-new"
                    name="export-dest"
                    checked={exportDestination === "new"}
                    onChange={() => setExportDestination("new")}
                    className="h-4 w-4"
                  />
                  <label htmlFor="export-new" className="text-sm">Create new document</label>
                </div>
                {exportDestination === "new" && (
                  <Input
                    placeholder="New document name"
                    value={exportNewDocName}
                    onChange={(e) => setExportNewDocName(e.target.value)}
                    className="ml-6"
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isSubmitting || (!exportStructure && !exportBlocks) || (exportDestination === "existing" && !exportTargetDocId) || (exportDestination === "new" && !exportNewDocName.trim())}
              >
                {isSubmitting ? "Exporting..." : "Export"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/40">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <FileText className="h-4 w-4 text-primary" />
                Destination: {documentName}
              </div>
              <p className="text-xs text-muted-foreground">
                Importing into the current document
              </p>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Import from</Label>
              <Select value={importSourceDocId} onValueChange={setImportSourceDocId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source document" />
                </SelectTrigger>
                <SelectContent>
                  {otherDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                  {otherDocuments.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No other documents
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* What to import */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What to import</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="import-structure"
                    checked={importStructure}
                    onCheckedChange={(checked) => setImportStructure(checked as boolean)}
                  />
                  <label htmlFor="import-structure" className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Section Structure
                    {sourceDocData && (
                      <span className="text-xs text-muted-foreground">
                        ({sourceDocData.structure.sectionOrder.length} sections)
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="import-blocks"
                    checked={importBlocks}
                    onCheckedChange={(checked) => setImportBlocks(checked as boolean)}
                  />
                  <label htmlFor="import-blocks" className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Block Library
                    <span className="text-xs text-muted-foreground">(already shared across all documents)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview */}
            {sourceDocData && importStructure && sourceDocData.structure.sectionOrder.length > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                <div className="text-xs font-medium mb-2">Sections to import:</div>
                <div className="flex flex-wrap gap-1">
                  {sourceDocData.structure.sectionOrder.map((section) => (
                    <span
                      key={section}
                      className={`text-xs px-2 py-0.5 rounded ${
                        structure.sectionOrder.includes(section)
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {section}
                      {structure.sectionOrder.includes(section) && (
                        <Check className="h-3 w-3 inline ml-1" />
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Sections with ✓ already exist and will be skipped.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isSubmitting || !importSourceDocId || (!importStructure && !importBlocks)}
              >
                {isSubmitting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
