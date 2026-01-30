"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Repeat, Check } from "lucide-react";
import { useBuilderStore, type ContentBlock } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface SwapVariantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBlock: ContentBlock | null;
  onSuccess?: () => void;
}

export function SwapVariantModal({
  open,
  onOpenChange,
  currentBlock,
  onSuccess,
}: SwapVariantModalProps) {
  const { blocks, swapVariant } = useBuilderStore();
  const { toast } = useToast();
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Get other variants in the same group
  const variantBlocks = blocks.filter(
    (b) =>
      b.variantGroupId &&
      b.variantGroupId === currentBlock?.variantGroupId &&
      b.id !== currentBlock?.id
  );

  useEffect(() => {
    if (open && variantBlocks.length > 0) {
      setSelectedBlockId(variantBlocks[0].id);
    }
  }, [open, variantBlocks.length]);

  const handleSwap = async () => {
    if (!currentBlock || !selectedBlockId) return;

    setIsSwapping(true);

    try {
      await swapVariant(currentBlock.id, selectedBlockId);

      const newBlock = blocks.find((b) => b.id === selectedBlockId);

      toast({
        title: "Variant Swapped",
        description: `Replaced with "${newBlock?.name}"`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error swapping variant:", error);
      toast({
        title: "Swap Failed",
        description: "Failed to swap variant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  if (!currentBlock) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Repeat className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Swap Variant</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Replace "{currentBlock.name}" with another variant
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          {variantBlocks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                <Repeat className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground/60">No other variants</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is the only block in the variant group
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Select a replacement variant from{" "}
                <span className="font-medium text-foreground">
                  {currentBlock.variantGroup?.name}
                </span>
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {variantBlocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedBlockId === block.id
                        ? "border-primary bg-primary/5"
                        : "border-border/40 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className="w-1 h-full rounded-full flex-shrink-0 self-stretch"
                      style={{
                        backgroundColor: currentBlock.variantGroup?.color || "#3B82F6",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{block.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-mono">
                        {block.latexContent.substring(0, 80)}...
                      </p>
                    </div>
                    {selectedBlockId === block.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs border-border/40"
          >
            Cancel
          </Button>
          {variantBlocks.length > 0 && (
            <Button
              onClick={handleSwap}
              disabled={isSwapping || !selectedBlockId}
              className="h-8 text-xs min-w-[100px]"
            >
              {isSwapping ? "Swapping..." : "Swap Variant"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
