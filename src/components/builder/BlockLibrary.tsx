"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, FileText } from "lucide-react";
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
    // Check if section exists, if not we might need to create it
    if (structure.sectionOrder.includes(sectionType)) {
      addBlockToSection(blockId, sectionType);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase text-muted-foreground">
            Block Library
          </h2>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Block
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="ALL" className="flex-1 flex flex-col" onValueChange={setFilter}>
        <div className="px-4 pt-2">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1">
            {SECTION_FILTERS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs px-2 py-1">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredBlocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No blocks found.</p>
                <p className="text-sm">Create your first block!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredBlocks.map((block) => {
                  const isInResume = Object.values(structure.sections)
                    .flat()
                    .includes(block.id);

                  return (
                    <Card
                      key={block.id}
                      className={`cursor-pointer hover:border-primary/50 transition-colors ${
                        isInResume ? "border-primary/30 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-sm truncate">{block.name}</p>
                            <p className="text-xs text-muted-foreground">{block.sectionType}</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {block.latexContent.substring(0, 60)}...
                          </p>
                          <Button
                            size="sm"
                            variant={isInResume ? "secondary" : "outline"}
                            className="w-full text-xs"
                            onClick={() => handleAddBlock(block.id, block.sectionType)}
                            disabled={isInResume || !structure.sectionOrder.includes(block.sectionType)}
                          >
                            {isInResume ? "Added" : "+ Add"}
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
