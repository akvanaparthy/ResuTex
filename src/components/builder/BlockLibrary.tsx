"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, FileText, BookOpen, Check, Trash2, MoreVertical, Palette, X, Pencil, Minus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBuilderStore, type ContentBlock } from "@/lib/store/builder-store";
import { CreateBlockModal } from "@/components/modals/CreateBlockModal";
import { EditBlockModal } from "@/components/modals/EditBlockModal";
import { VariantGroupModal } from "@/components/modals/VariantGroupModal";
import { useToast } from "@/hooks/use-toast";

export function BlockLibrary() {
  const { blocks, structure, addBlockToSection, removeBlock, removeBlockFromSection, removeBlockFromVariantGroup, updateBlock } = useBuilderStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedBlockForVariant, setSelectedBlockForVariant] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBlockForEdit, setSelectedBlockForEdit] = useState<ContentBlock | null>(null);

  // Get unique section types from blocks
  const uniqueSectionTypes = Array.from(new Set(blocks.map((b) => b.sectionType))).sort();
  const sectionFilters = ["ALL", ...uniqueSectionTypes];

  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch = block.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || block.sectionType === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAddBlock = async (blockId: string, sectionType: string) => {
    if (structure.sectionOrder.includes(sectionType)) {
      const success = await addBlockToSection(blockId, sectionType);
      if (!success) {
        // Conflict detected - handled by ResumeStructure
        toast({
          title: "Variant Conflict",
          description: "Another block from this variant group is already in the resume.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (confirm("Delete this block? This cannot be undone.")) {
      await removeBlock(blockId);
    }
  };

  const handleAddToVariantGroup = (blockId: string) => {
    setSelectedBlockForVariant(blockId);
    setVariantModalOpen(true);
  };

  const handleRemoveFromVariantGroup = async (blockId: string) => {
    if (confirm("Remove this block from its variant group?")) {
      try {
        await removeBlockFromVariantGroup(blockId);
        toast({
          title: "Removed from Group",
          description: "Block removed from variant group.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove block from variant group.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditBlock = (block: ContentBlock) => {
    setSelectedBlockForEdit(block);
    setEditModalOpen(true);
  };

  const handleSaveBlock = async (data: Partial<ContentBlock>) => {
    if (!selectedBlockForEdit) return;
    try {
      await updateBlock(selectedBlockForEdit.id, data);
      toast({
        title: "Block Updated",
        description: "Block has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update block.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromResume = (blockId: string, sectionType: string) => {
    removeBlockFromSection(blockId, sectionType);
    toast({
      title: "Block Removed",
      description: "Block removed from resume.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Block Library
            </h2>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs gap-1 px-2.5"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-3 w-3" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            className="h-8 pl-8 text-xs bg-muted/40 border-border/40 focus:bg-background transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="ALL" className="flex-1 flex flex-col min-h-0" onValueChange={setFilter}>
        {sectionFilters.length > 1 && (
          <div className="px-3 pt-2">
            <TabsList className="w-full justify-start h-auto flex-wrap gap-0.5 bg-muted/40 p-0.5">
              {sectionFilters.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="text-[10px] px-2 py-1 h-6 data-[state=active]:shadow-sm">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-3">
            {filteredBlocks.length === 0 ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground/60">No blocks found</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first block</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredBlocks.map((block, index) => {
                  const isInResume = Object.values(structure.sections)
                    .flat()
                    .includes(block.id);

                  return (
                    <Card
                      key={block.id}
                      className={`group cursor-pointer transition-all duration-200 animate-fade-in-up border-border/40 hover:border-border hover:shadow-sm ${
                        isInResume ? "border-primary/25 bg-primary/[0.03]" : "bg-card/60"
                      }`}
                      style={{
                        animationDelay: `${index * 30}ms`,
                        ...(block.variantGroupId && block.variantGroup
                          ? { borderLeft: `3px solid ${block.variantGroup.color}` }
                          : {}),
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate leading-tight">{block.name}</p>
                              {block.variantGroupId && block.variantGroup && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: block.variantGroup.color }}
                                  />
                                  <span
                                    className="text-[10px] font-medium truncate"
                                    style={{ color: block.variantGroup.color }}
                                  >
                                    {block.variantGroup.name}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-0.5">{block.sectionType}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {isInResume && (
                                <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                  <Check className="h-2.5 w-2.5 text-primary" />
                                </div>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditBlock(block)}>
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                    Edit Block
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {block.variantGroupId ? (
                                    <DropdownMenuItem onClick={() => handleRemoveFromVariantGroup(block.id)}>
                                      <X className="h-3.5 w-3.5 mr-2" />
                                      Remove from Variant Group
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleAddToVariantGroup(block.id)}>
                                      <Palette className="h-3.5 w-3.5 mr-2" />
                                      Add to Variant Group
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeleteBlock(block.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Delete Block
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground/70 line-clamp-2 font-mono leading-relaxed">
                            {block.latexContent.substring(0, 65)}...
                          </p>
                          {isInResume ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                              onClick={() => handleRemoveFromResume(block.id, block.sectionType)}
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-7 text-xs border-border/40 transition-all"
                              onClick={() => handleAddBlock(block.id, block.sectionType)}
                              disabled={!structure.sectionOrder.includes(block.sectionType)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add to Resume
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>

      <CreateBlockModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      <EditBlockModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        block={selectedBlockForEdit}
        onSave={handleSaveBlock}
      />
      <VariantGroupModal
        open={variantModalOpen}
        onOpenChange={setVariantModalOpen}
        blockId={selectedBlockForVariant}
      />
    </div>
  );
}
