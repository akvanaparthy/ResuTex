"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Palette, Check } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";

const VARIANT_COLORS = [
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Red", hex: "#EF4444" },
  { name: "Yellow", hex: "#F59E0B" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Orange", hex: "#F97316" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Cyan", hex: "#06B6D4" },
];

interface VariantGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockId: string | null;
  onSuccess?: () => void;
}

export function VariantGroupModal({
  open,
  onOpenChange,
  blockId,
  onSuccess,
}: VariantGroupModalProps) {
  const { variantGroups, addBlockToVariantGroup, loadVariantGroups } = useBuilderStore();
  const { toast } = useToast();

  const [mode, setMode] = useState<"select" | "create">("select");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(VARIANT_COLORS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadVariantGroups();
      // Reset to select mode if groups exist
      setMode(variantGroups.length > 0 ? "select" : "create");
      setNewGroupName("");
      setSelectedColor(VARIANT_COLORS[0].hex);
      setSelectedGroupId(variantGroups[0]?.id || "");
    }
  }, [open, loadVariantGroups, variantGroups.length]);

  const handleSubmit = async () => {
    if (!blockId) return;

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // Create new group first
        if (!newGroupName.trim()) {
          toast({
            title: "Name Required",
            description: "Please enter a name for the variant group.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const response = await fetch("/api/variant-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newGroupName.trim(),
            color: selectedColor,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create variant group");
        }

        const newGroup = await response.json();
        await addBlockToVariantGroup(blockId, newGroup.id);

        toast({
          title: "Variant Group Created",
          description: `Block added to "${newGroup.name}"`,
        });
      } else {
        // Add to existing group
        if (!selectedGroupId) {
          toast({
            title: "Selection Required",
            description: "Please select a variant group.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        await addBlockToVariantGroup(blockId, selectedGroupId);
        const group = variantGroups.find((g) => g.id === selectedGroupId);

        toast({
          title: "Added to Variant Group",
          description: `Block added to "${group?.name}"`,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error managing variant group:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update variant group",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Add to Variant Group</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Group related block variants together for easy swapping.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode Tabs */}
          {variantGroups.length > 0 && (
            <div className="flex gap-2 p-1 bg-muted/40 rounded-lg">
              <button
                type="button"
                onClick={() => setMode("select")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === "select"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setMode("create")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === "create"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create New
              </button>
            </div>
          )}

          {/* Select Existing Mode */}
          {mode === "select" && variantGroups.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Select Variant Group</Label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {variantGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                      selectedGroupId === group.id
                        ? "border-primary bg-primary/5"
                        : "border-border/40 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background"
                      style={{ backgroundColor: group.color, borderColor: group.color }}
                    />
                    <span className="text-sm font-medium flex-1 text-left">{group.name}</span>
                    {selectedGroupId === group.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New Mode */}
          {mode === "create" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="group-name" className="text-xs font-medium">
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  placeholder="e.g., Mavenwit Experience Variants"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-9 text-sm bg-muted/30 border-border/40 focus:bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {VARIANT_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      className={`aspect-square rounded-lg transition-all relative ${
                        selectedColor === color.hex
                          ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: color.hex,
                      }}
                      title={color.name}
                    >
                      {selectedColor === color.hex && (
                        <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
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
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (mode === "select" && !selectedGroupId) ||
              (mode === "create" && !newGroupName.trim())
            }
            className="h-8 text-xs min-w-[100px]"
          >
            {isSubmitting ? "Adding..." : mode === "create" ? "Create & Add" : "Add to Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
