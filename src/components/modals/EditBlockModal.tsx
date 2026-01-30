"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { ContentBlock } from "@/lib/store/builder-store";

interface EditBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: ContentBlock | null;
  onSave: (block: Partial<ContentBlock>) => void;
}

const SECTION_TYPES = [
  { value: "SUMMARY", label: "Summary" },
  { value: "EDUCATION", label: "Education" },
  { value: "EXPERIENCE", label: "Experience" },
  { value: "PROJECTS", label: "Projects" },
  { value: "SKILLS", label: "Skills" },
  { value: "ACHIEVEMENTS", label: "Achievements" },
  { value: "CERTIFICATIONS", label: "Certifications" },
];

export function EditBlockModal({
  open,
  onOpenChange,
  block,
  onSave,
}: EditBlockModalProps) {
  const [name, setName] = useState("");
  const [sectionType, setSectionType] = useState("EXPERIENCE");
  const [latexContent, setLatexContent] = useState("");

  useEffect(() => {
    if (block) {
      setName(block.name);
      setSectionType(block.sectionType);
      setLatexContent(block.latexContent);
    }
  }, [block]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      sectionType,
      latexContent,
    });
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base">Edit Block</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">Block Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Google SWE Internship"
              className="h-9 text-sm bg-muted/30 border-border/40 focus:bg-background"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sectionType" className="text-xs font-medium">Section Type</Label>
            <Select value={sectionType} onValueChange={setSectionType}>
              <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="latexContent" className="text-xs font-medium">LaTeX Content</Label>
            <Textarea
              id="latexContent"
              value={latexContent}
              onChange={(e) => setLatexContent(e.target.value)}
              placeholder="Enter LaTeX code..."
              className="font-mono text-xs min-h-[280px] bg-muted/30 border-border/40 focus:bg-background leading-relaxed resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs border-border/40"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-xs min-w-[110px]">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
