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

const BLOCK_TYPES = [
  { value: "experience-item", label: "Experience Item" },
  { value: "education-item", label: "Education Item" },
  { value: "project-item", label: "Project Item" },
  { value: "skill-category", label: "Skill Category" },
  { value: "achievement-item", label: "Achievement Item" },
  { value: "certification-item", label: "Certification Item" },
  { value: "summary-text", label: "Summary Text" },
  { value: "custom", label: "Custom" },
];

export function EditBlockModal({
  open,
  onOpenChange,
  block,
  onSave,
}: EditBlockModalProps) {
  const [name, setName] = useState("");
  const [sectionType, setSectionType] = useState("EXPERIENCE");
  const [blockType, setBlockType] = useState("experience-item");
  const [latexContent, setLatexContent] = useState("");

  useEffect(() => {
    if (block) {
      setName(block.name);
      setSectionType(block.sectionType);
      setBlockType(block.blockType);
      setLatexContent(block.latexContent);
    }
  }, [block]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      sectionType,
      blockType,
      latexContent,
    });
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Block</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Block Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Google SWE Internship"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sectionType">Section Type</Label>
              <Select value={sectionType} onValueChange={setSectionType}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="blockType">Block Type</Label>
              <Select value={blockType} onValueChange={setBlockType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="latexContent">LaTeX Content</Label>
            <Textarea
              id="latexContent"
              value={latexContent}
              onChange={(e) => setLatexContent(e.target.value)}
              placeholder="Enter LaTeX code..."
              className="font-mono min-h-[300px]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
