"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, FileText, BookOpen, Check } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { CreateBlockModal } from "@/components/modals/CreateBlockModal";

const SECTION_FILTERS = ["ALL", "SUMMARY", "EDUCATION", "EXPERIENCE", "PROJECTS", "SKILLS"] as const;

export function BlockLibrary() {
  const { blocks, structure, addBlockToSection } = useBuilderStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch = block.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || block.sectionType === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAddBlock = (blockId: string, sectionType: string) => {
    if (structure.sectionOrder.includes(sectionType)) {
      addBlockToSection(blockId, sectionType);
    }
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
        <div className="px-3 pt-2">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-0.5 bg-muted/40 p-0.5">
            {SECTION_FILTERS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-[10px] px-2 py-1 h-6 data-[state=active]:shadow-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate leading-tight">{block.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{block.sectionType}</p>
                            </div>
                            {isInResume && (
                              <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-primary" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground/70 line-clamp-2 font-mono leading-relaxed">
                            {block.latexContent.substring(0, 65)}...
                          </p>
                          <Button
                            size="sm"
                            variant={isInResume ? "secondary" : "outline"}
                            className="w-full h-7 text-xs border-border/40 transition-all"
                            onClick={() => handleAddBlock(block.id, block.sectionType)}
                            disabled={isInResume || !structure.sectionOrder.includes(block.sectionType)}
                          >
                            {isInResume ? "Added" : "+ Add to Resume"}
                          </Button>
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
    </div>
  );
}
