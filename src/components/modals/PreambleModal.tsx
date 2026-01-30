"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileCode, RotateCcw, AlertCircle } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_PREAMBLE } from "@/lib/latex/preamble";

interface PreambleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreambleModal({ open, onOpenChange }: PreambleModalProps) {
  const { preamble, setPreamble, resetPreamble } = useBuilderStore();
  const { toast } = useToast();
  const [localPreamble, setLocalPreamble] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state when modal opens
  useEffect(() => {
    if (open) {
      // Show the actual preamble being used (stored or default)
      setLocalPreamble(preamble || DEFAULT_PREAMBLE);
      setHasChanges(false);
    }
  }, [open, preamble]);

  const handleChange = (value: string) => {
    setLocalPreamble(value);
    // Check if it differs from stored preamble (considering default)
    const storedOrDefault = preamble || DEFAULT_PREAMBLE;
    setHasChanges(value !== storedOrDefault);
  };

  const handleSave = () => {
    // If the preamble is the same as default, store empty string
    if (localPreamble.trim() === DEFAULT_PREAMBLE.trim()) {
      setPreamble("");
    } else {
      setPreamble(localPreamble);
    }
    toast({
      title: "Preamble Saved",
      description: "Your LaTeX preamble has been updated.",
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    if (confirm("Reset preamble to default? Your custom preamble will be discarded.")) {
      setLocalPreamble(DEFAULT_PREAMBLE);
      resetPreamble();
      setHasChanges(false);
      toast({
        title: "Preamble Reset",
        description: "Preamble has been reset to default.",
      });
    }
  };

  const isUsingDefault = !preamble || preamble.trim() === "";
  const isCurrentlyDefault = localPreamble.trim() === DEFAULT_PREAMBLE.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileCode className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">LaTeX Preamble</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Customize the document setup, packages, and custom commands
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium">Preamble Code</Label>
              {isUsingDefault && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Using Default
                </span>
              )}
              {!isUsingDefault && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  Custom
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              disabled={isCurrentlyDefault && isUsingDefault}
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Default
            </Button>
          </div>

          <div className="flex-1 min-h-0">
            <Textarea
              value={localPreamble}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter LaTeX preamble code..."
              className="font-mono text-xs h-full min-h-[400px] bg-muted/30 border-border/40 focus:bg-background leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border border-border/40">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The preamble includes <code className="text-primary/80">\documentclass</code>, packages, 
              page setup, and custom commands. Changes here affect the entire resume. 
              Be careful with package conflicts.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs border-border/40"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="h-8 text-xs min-w-[110px]"
            disabled={!hasChanges && isUsingDefault === isCurrentlyDefault}
          >
            Save Preamble
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
