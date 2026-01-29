"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, GripVertical, MoreVertical, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ResumeStructure() {
  const { structure, blocks, removeBlockFromSection, addSection, removeSection } = useBuilderStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(structure.sectionOrder));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const availableSections = SECTION_TYPES.filter(
    (type) => !structure.sectionOrder.includes(type)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm uppercase text-muted-foreground">
          Resume Structure
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {structure.sectionOrder.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No sections yet.</p>
              <p className="text-sm">Add a section to get started.</p>
            </div>
          ) : (
            structure.sectionOrder.map((sectionType) => {
              const sectionBlocks = structure.sections[sectionType] || [];
              const isExpanded = expandedSections.has(sectionType);

              return (
                <div key={sectionType} className="border rounded-lg">
                  {/* Section Header */}
                  <div
                    className="flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleSection(sectionType)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium text-sm flex-1">{sectionType}</span>
                    <span className="text-xs text-muted-foreground">
                      {sectionBlocks.length} block{sectionBlocks.length !== 1 ? "s" : ""}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeSection(sectionType)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="border-t">
                      {sectionBlocks.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No blocks. Drag blocks here from the library.
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {sectionBlocks.map((blockId) => {
                            const block = blocks.find((b) => b.id === blockId);
                            if (!block) return null;

                            return (
                              <div
                                key={blockId}
                                className="flex items-center gap-2 p-2 bg-muted/30 rounded hover:bg-muted/50"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                <span className="text-sm flex-1 truncate">{block.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeBlockFromSection(blockId, sectionType)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Add Section Button */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full" disabled={availableSections.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {availableSections.map((section) => (
              <DropdownMenuItem key={section} onClick={() => addSection(section)}>
                {section}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
