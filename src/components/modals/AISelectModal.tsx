"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface AISelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariantGroupData {
  groupId: string;
  groupName: string;
  variants: {
    blockId: string;
    blockName: string;
    latexContent: string;
  }[];
}

interface AISelectionResult {
  groupId: string;
  selectedBlockId: string;
}

export function AISelectModal({ open, onOpenChange }: AISelectModalProps) {
  const { blocks, variantGroups, structure, swapVariant, settings } = useBuilderStore();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AISelectionResult[] | null>(null);

  // Get variant groups that have multiple variants (more than 1 block)
  const eligibleVariantGroups = useMemo((): VariantGroupData[] => {
    const groups: VariantGroupData[] = [];

    for (const group of variantGroups) {
      const groupBlocks = blocks.filter((b) => b.variantGroupId === group.id);
      if (groupBlocks.length > 1) {
        groups.push({
          groupId: group.id,
          groupName: group.name,
          variants: groupBlocks.map((b) => ({
            blockId: b.id,
            blockName: b.name,
            latexContent: b.latexContent,
          })),
        });
      }
    }

    return groups;
  }, [blocks, variantGroups]);

  const isAIConfigured = settings.aiConfig.provider && settings.aiConfig.apiKey && settings.aiConfig.model;

  const handlePerform = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please enter a job description to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (eligibleVariantGroups.length === 0) {
      toast({
        title: "No Variant Groups",
        description: "You need variant groups with multiple blocks to use AI selection.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const response = await fetch("/api/ai-select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          variantGroups: eligibleVariantGroups,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI selection failed");
      }

      setResults(data.selections);

      // Apply the selections
      for (const selection of data.selections) {
        // Find if there's a block from this group currently in the structure
        const groupBlocks = blocks.filter((b) => b.variantGroupId === selection.groupId);
        const allBlockIds = Object.values(structure.sections).flat();
        const currentBlockInStructure = groupBlocks.find((b) => allBlockIds.includes(b.id));

        if (currentBlockInStructure && currentBlockInStructure.id !== selection.selectedBlockId) {
          // Swap the variant
          await swapVariant(currentBlockInStructure.id, selection.selectedBlockId);
        } else if (!currentBlockInStructure) {
          // No block from this group is in the structure yet
          // Find the section type and add it
          const selectedBlock = blocks.find((b) => b.id === selection.selectedBlockId);
          if (selectedBlock) {
            const sectionType = selectedBlock.sectionType;
            const store = useBuilderStore.getState();
            // Add to section if it exists
            if (store.structure.sectionOrder.includes(sectionType)) {
              await store.addBlockToSection(selection.selectedBlockId, sectionType);
            }
          }
        }
      }

      toast({
        title: "AI Selection Complete",
        description: `Applied ${data.selections.length} variant selections based on the job description.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "AI selection failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setJobDescription("");
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Variant Selector
          </DialogTitle>
          <DialogDescription>
            Let AI choose the best resume variants based on the job description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* AI Config Warning */}
          {!isAIConfigured && (
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    AI Not Configured
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please configure your AI provider in Settings first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Eligible Groups Info */}
          {eligibleVariantGroups.length === 0 ? (
            <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">No Variant Groups Available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create variant groups with multiple blocks to use AI selection.
                    Single blocks don&apos;t need AI evaluation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-border/40 bg-muted/30">
              <p className="text-sm">
                <span className="font-medium">{eligibleVariantGroups.length}</span> variant group(s) will be evaluated:
              </p>
              <ul className="mt-2 space-y-1">
                {eligibleVariantGroups.map((g) => (
                  <li key={g.groupId} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {g.groupName} ({g.variants.length} variants)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Job Description Input */}
          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] text-sm"
              disabled={isProcessing || !isAIConfigured || eligibleVariantGroups.length === 0}
            />
            <p className="text-xs text-muted-foreground">
              Include key requirements, skills, and qualifications from the job posting.
            </p>
          </div>

          {/* Results Display */}
          {results && results.length > 0 && (
            <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Selection Applied
                  </p>
                  <ul className="mt-2 space-y-1">
                    {results.map((r) => {
                      const group = eligibleVariantGroups.find((g) => g.groupId === r.groupId);
                      const selected = group?.variants.find((v) => v.blockId === r.selectedBlockId);
                      return (
                        <li key={r.groupId} className="text-xs text-muted-foreground">
                          {group?.groupName}: <span className="text-foreground">{selected?.blockName}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handlePerform}
            disabled={
              isProcessing ||
              !isAIConfigured ||
              eligibleVariantGroups.length === 0 ||
              !jobDescription.trim()
            }
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Perform AI Selection
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
