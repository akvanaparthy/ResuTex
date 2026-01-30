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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, RotateCcw, AlertCircle } from "lucide-react";
import { useBuilderStore, type SpacingSettings } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

interface SpacingSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_SPACING: SpacingSettings = {
  section: -8,
  block: -6,
  line: 1.0,
};

export function SpacingSettingsModal({ open, onOpenChange }: SpacingSettingsModalProps) {
  const { spacing, setSpacing, resetSpacing } = useBuilderStore();
  const { toast } = useToast();
  const [localSpacing, setLocalSpacing] = useState<SpacingSettings>(DEFAULT_SPACING);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state when modal opens
  useEffect(() => {
    if (open) {
      setLocalSpacing(spacing);
      setHasChanges(false);
    }
  }, [open, spacing]);

  const handleChange = (key: keyof SpacingSettings, value: number) => {
    const newSpacing = { ...localSpacing, [key]: value };
    setLocalSpacing(newSpacing);
    setHasChanges(
      newSpacing.section !== spacing.section ||
      newSpacing.block !== spacing.block ||
      newSpacing.line !== spacing.line
    );
  };

  const handleSave = () => {
    setSpacing(localSpacing);
    toast({
      title: "Spacing Updated",
      description: "Your spacing settings have been saved.",
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSpacing(DEFAULT_SPACING);
    resetSpacing();
    setHasChanges(false);
    toast({
      title: "Spacing Reset",
      description: "Spacing has been reset to defaults.",
    });
  };

  const isDefault =
    localSpacing.section === DEFAULT_SPACING.section &&
    localSpacing.block === DEFAULT_SPACING.block &&
    localSpacing.line === DEFAULT_SPACING.line;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Spacing Settings</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Adjust vertical spacing between resume elements
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Section Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Section Spacing</Label>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {localSpacing.section}pt
              </span>
            </div>
            <Slider
              value={[localSpacing.section]}
              onValueChange={([value]) => handleChange("section", value)}
              min={-20}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              Space after each section (negative values reduce space)
            </p>
          </div>

          {/* Block Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Block Spacing</Label>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {localSpacing.block}pt
              </span>
            </div>
            <Slider
              value={[localSpacing.block]}
              onValueChange={([value]) => handleChange("block", value)}
              min={-15}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              Space between blocks within a section
            </p>
          </div>

          {/* Line Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Line Spacing</Label>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {localSpacing.line.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[localSpacing.line * 10]}
              onValueChange={([value]) => handleChange("line", value / 10)}
              min={8}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              Line height multiplier (1.0 = single spacing)
            </p>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border border-border/40">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              These settings map to LaTeX <code className="text-primary/80">\vspace</code> commands.
              Negative values help fit more content on the page.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            disabled={isDefault}
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
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
              className="h-8 text-xs min-w-[90px]"
              disabled={!hasChanges}
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
