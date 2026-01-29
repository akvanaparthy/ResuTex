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
import { ChevronDown } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";

const SECTION_TYPES = [
  "SUMMARY",
  "EDUCATION",
  "EXPERIENCE",
  "PROJECTS",
  "SKILLS",
  "ACHIEVEMENTS",
  "CERTIFICATIONS",
] as const;

interface CreateBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBlockModal({ open, onOpenChange }: CreateBlockModalProps) {
  const { addBlock } = useBuilderStore();
  const [name, setName] = useState("");
  const [sectionType, setSectionType] = useState<string>("EXPERIENCE");
  const [latexContent, setLatexContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Reset form
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Block</DialogTitle>
          <DialogDescription>
            Create a reusable LaTeX content block for your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Block Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mavenwit Experience"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Section Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {sectionType}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {SECTION_TYPES.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => setSectionType(type)}
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="latex">LaTeX Content</Label>
            <Textarea
              id="latex"
              placeholder={`\\resumeExperienceHeading
  {Software Engineer | Company Name, Location}{Jan 2024 - Present}{}
  \\resumeItemListStart
    \\resumeItem{Built awesome things}
  \\resumeItemListEnd`}
              className="font-mono text-sm h-64"
              value={latexContent}
              onChange={(e) => setLatexContent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter raw LaTeX code for this content block. Use your resume template&apos;s custom commands.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !latexContent.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Block"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
