"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, FileText, Plus, Trash2, Check, Pencil, Upload, Download } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";
import { ImportExportModal } from "@/components/modals/ImportExportModal";

export function DocumentSelector() {
  const {
    documents,
    documentId,
    documentName,
    switchDocument,
    createDocument,
    deleteDocument,
    renameDocument,
  } = useBuilderStore();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [importExportTab, setImportExportTab] = useState<"export" | "import">("export");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const newId = await createDocument(newName.trim());
      await switchDocument(newId);
      toast({
        title: "Document Created",
        description: `Created "${newName.trim()}"`,
      });
      setIsCreateOpen(false);
      setNewName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await renameDocument(newName.trim());
      toast({
        title: "Document Renamed",
        description: `Renamed to "${newName.trim()}"`,
      });
      setIsRenameOpen(false);
      setNewName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;
    setIsSubmitting(true);
    try {
      await deleteDocument(documentId);
      toast({
        title: "Document Deleted",
        description: "Document has been deleted",
      });
      setIsDeleteOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitch = async (docId: string) => {
    if (docId === documentId) return;
    try {
      await switchDocument(docId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch document",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-3 text-sm font-medium gap-2 hover:bg-muted/50"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span className="max-w-[150px] truncate">{documentName}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Resume Documents
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {documents.map((doc) => (
                <DropdownMenuItem
                  key={doc.id}
                  onClick={() => handleSwitch(doc.id)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{doc.name}</span>
                  {doc.id === documentId && (
                    <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setNewName("");
              setIsCreateOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setNewName(documentName);
              setIsRenameOpen(true);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename Current
            </DropdownMenuItem>
            {documents.length > 1 && (
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Current
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setImportExportTab("import");
                  setImportExportOpen(true);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import from another document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setImportExportTab("export");
                  setImportExportOpen(true);
                }}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export to another document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Import/Export Modal */}
      <ImportExportModal
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        defaultTab={importExportTab}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Create a new resume document to start fresh.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Document name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>
              Enter a new name for this document.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Document name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || isSubmitting}>
              {isSubmitting ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{documentName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
