"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Database, FileText, AlertTriangle } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, setSharedBlocks, blocks, documentId } = useBuilderStore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingChange, setPendingChange] = useState<boolean | null>(null);

  // Count blocks specific to current document vs shared
  const documentBlocks = blocks.filter((b) => b.documentId === documentId);
  const sharedBlocks = blocks.filter((b) => !b.documentId);

  useEffect(() => {
    if (open) {
      setPendingChange(null);
    }
  }, [open]);

  const handleToggleSharedBlocks = async (shared: boolean) => {
    // If toggling from shared to isolated and there are blocks, show warning
    if (!shared && sharedBlocks.length > 0) {
      setPendingChange(shared);
      return;
    }

    await applyChange(shared);
  };

  const applyChange = async (shared: boolean) => {
    setIsUpdating(true);
    try {
      await setSharedBlocks(shared);
      toast({
        title: "Settings Updated",
        description: shared
          ? "Blocks are now shared across all resumes."
          : "Blocks are now isolated per resume.",
      });
      setPendingChange(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure how ResuTex manages your content blocks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Block Storage Mode */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Shared Block Library
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, all blocks are shared across resumes.
                </p>
              </div>
              <Switch
                checked={settings.sharedBlocks}
                onCheckedChange={handleToggleSharedBlocks}
                disabled={isUpdating}
              />
            </div>

            {/* Status indicator */}
            <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
              <div className="flex items-start gap-3">
                {settings.sharedBlocks ? (
                  <>
                    <div className="p-1.5 rounded bg-primary/10">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Global Library Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        All {sharedBlocks.length} blocks are available in every resume.
                        Use Import/Export to copy section structures between documents.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded bg-orange-500/10">
                      <FileText className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Isolated Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Each resume has its own block library.
                        {documentBlocks.length > 0 && (
                          <span> Current document has {documentBlocks.length} blocks.</span>
                        )}
                        {sharedBlocks.length > 0 && (
                          <span> {sharedBlocks.length} shared blocks still accessible.</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Warning dialog for mode change */}
          {pendingChange === false && sharedBlocks.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Switching to Isolated Mode
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have {sharedBlocks.length} shared blocks. After switching:
                    </p>
                    <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4 space-y-0.5">
                      <li>Existing shared blocks will remain accessible to all documents</li>
                      <li>New blocks you create will only belong to the current document</li>
                      <li>Use Import/Export to copy blocks between documents</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingChange(null)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => applyChange(false)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Switching..." : "Switch Anyway"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info about Import/Export */}
          <div className="text-xs text-muted-foreground border-t border-border/40 pt-4">
            <p className="font-medium mb-1">Tip: Import & Export</p>
            <p>
              Use the Import/Export buttons next to the document selector to transfer
              section structures {!settings.sharedBlocks && "and blocks"} between resumes.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
