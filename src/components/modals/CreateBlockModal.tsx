"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";

const SUGGESTED_SECTION_TYPES = [
  "PLAIN",
  "SUMMARY",
  "EDUCATION",
  "EXPERIENCE",
  "PROJECTS",
  "SKILLS",
  "ACHIEVEMENTS",
  "CERTIFICATIONS",
  "AWARDS",
  "PUBLICATIONS",
  "LANGUAGES",
];

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBlockModal({ open, onOpenChange }: CreateBlockModalProps) {
  const { addBlock, structure } = useBuilderStore();
  const [name, setName] = useState("");
  const [sectionType, setSectionType] = useState<string>("EXPERIENCE");
  const [latexContent, setLatexContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);

  // Combine existing sections from resume with suggested ones
  const existingSections = structure.sectionOrder;
  const allSectionTypes = Array.from(
    new Set([...existingSections, ...SUGGESTED_SECTION_TYPES])
  ).sort();

  const handleSubmit = async () => {
    if (!name.trim() || !latexContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addBlock({
        name: name.trim(),
        sectionType,
        blockType: "PLAIN",
        latexContent: latexContent.trim(),
      });

      setName("");
      setLatexContent("");
      setSectionType("EXPERIENCE");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create block:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Create New Block</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Create a reusable LaTeX content block for your resume.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Block Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Work Experience"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm bg-muted/30 border-border/40 focus:bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Section Type</Label>
              {isCustomSection ? (
                <div className="flex gap-1">
                  <Input
                    placeholder="CUSTOM SECTION"
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value.toUpperCase())}
                    className="h-9 text-sm bg-muted/30 border-border/40 uppercase flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2"
                    onClick={() => {
                      setIsCustomSection(false);
                      setSectionType("EXPERIENCE");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-9 text-sm border-border/40 bg-muted/30 hover:bg-muted/50">
                      {sectionType}
                      <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {allSectionTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSectionType(type)}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => setIsCustomSection(true)}>
                      <Plus className="h-3.5 w-3.5 mr-2 text-primary" />
                      <span className="text-primary font-medium">Custom...</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="latex" className="text-xs font-medium">LaTeX Content</Label>
            <Textarea
              id="latex"
              placeholder={`\\resumeExperienceHeading
  {Software Engineer | Company Name, Location}{Jan 2024 - Present}{}
  \\resumeItemListStart
    \\resumeItem{Built awesome things}
  \\resumeItemListEnd`}
              className="font-mono text-xs h-56 bg-muted/30 border-border/40 focus:bg-background leading-relaxed resize-none"
              value={latexContent}
              onChange={(e) => setLatexContent(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Enter raw LaTeX code for this content block. Use your resume template&apos;s custom commands.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs border-border/40">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !latexContent.trim() || isSubmitting}
            className="h-8 text-xs min-w-[110px]"
          >
            {isSubmitting ? "Creating..." : "Create Block"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
