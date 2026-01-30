"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, GripVertical, MoreVertical, ChevronDown, ChevronRight, Trash2, Layers, Check, X, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBuilderStore, type ContentBlock } from "@/lib/store/builder-store";
import { SwapVariantModal } from "@/components/modals/SwapVariantModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Suggested common sections (can still add custom ones)
const SUGGESTED_SECTIONS = [
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
  "INTERESTS",
];

// Generate icon from section name (first 2 letters)
const getSectionIcon = (sectionType: string): string => {
  return sectionType.substring(0, 2).toUpperCase();
};

interface SortableBlockItemProps {
  block: ContentBlock;
  sectionType: string;
  onRemove: () => void;
  onSwapVariant?: (block: ContentBlock) => void;
}

function SortableBlockItem({ block, sectionType, onRemove, onSwapVariant }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasVariantGroup = block.variantGroupId && block.variantGroup;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md group/item hover:bg-muted/50 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-3 w-3 text-muted-foreground/30 group-hover/item:text-muted-foreground/60 transition-colors" />
      </div>
      {hasVariantGroup ? (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: block.variantGroup!.color }}
        />
      ) : (
        <div className="w-1 h-4 rounded-full bg-primary/20 flex-shrink-0" />
      )}
      <span className="text-sm flex-1 truncate text-foreground/80">{block.name}</span>
      <div className="flex items-center gap-0.5">
        {hasVariantGroup && onSwapVariant && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground"
                title="Swap Variant"
              >
                <Repeat className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSwapVariant(block)}>
                <Repeat className="h-3.5 w-3.5 mr-2" />
                Swap Variant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Remove from Resume
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!hasVariantGroup && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface SortableSectionProps {
  sectionType: string;
  sectionBlocks: string[];
  isExpanded: boolean;
  blockCount: number;
  onToggle: () => void;
  onRemoveSection: () => void;
  onRemoveBlock: (blockId: string) => void;
  blocks: ContentBlock[];
  onReorderBlocks: (blockIds: string[]) => void;
  onSwapVariant?: (block: ContentBlock) => void;
}

function SortableSection({
  sectionType,
  sectionBlocks,
  isExpanded,
  blockCount,
  onToggle,
  onRemoveSection,
  onRemoveBlock,
  blocks,
  onReorderBlocks,
  onSwapVariant,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionType });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionBlocks.indexOf(active.id as string);
      const newIndex = sectionBlocks.indexOf(over.id as string);
      const newOrder = arrayMove(sectionBlocks, oldIndex, newIndex);
      onReorderBlocks(newOrder);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border/50 bg-card/50 overflow-hidden transition-all duration-200 hover:border-border"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 px-2.5 py-2 group transition-colors hover:bg-muted/40">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={onToggle}
        >
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {getSectionIcon(sectionType)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">{sectionType}</span>
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {blockCount}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onRemoveSection}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Remove Section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="border-t border-border/40 animate-slide-down">
          {sectionBlocks.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                No blocks. Add from the library below.
              </p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionBlocks}
                  strategy={verticalListSortingStrategy}
                >
                  {sectionBlocks.map((blockId) => {
                    const block = blocks.find((b) => b.id === blockId);
                    if (!block) return null;

                    return (
                      <SortableBlockItem
                        key={blockId}
                        block={block}
                        sectionType={sectionType}
                        onRemove={() => onRemoveBlock(blockId)}
                        onSwapVariant={onSwapVariant}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ResumeStructure() {
  const { structure, blocks, removeBlockFromSection, addSection, removeSection, reorderSections, reorderBlocksInSection } = useBuilderStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(structure.sectionOrder));
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSectionName, setCustomSectionName] = useState("");
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedBlockForSwap, setSelectedBlockForSwap] = useState<ContentBlock | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const availableSuggestions = SUGGESTED_SECTIONS.filter(
    (type) => !structure.sectionOrder.includes(type)
  );

  const handleAddCustomSection = () => {
    const trimmed = customSectionName.trim().toUpperCase();
    if (trimmed && !structure.sectionOrder.includes(trimmed)) {
      addSection(trimmed);
      setCustomSectionName("");
      setIsAddingCustom(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCustomSection();
    } else if (e.key === "Escape") {
      setIsAddingCustom(false);
      setCustomSectionName("");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = structure.sectionOrder.indexOf(active.id as string);
      const newIndex = structure.sectionOrder.indexOf(over.id as string);
      const newOrder = arrayMove(structure.sectionOrder, oldIndex, newIndex);
      reorderSections(newOrder);
    }
  };

  const handleSwapVariant = (block: ContentBlock) => {
    setSelectedBlockForSwap(block);
    setSwapModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Resume Structure
            </h2>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {structure.sectionOrder.length} sections
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {structure.sectionOrder.length === 0 ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                <Layers className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground/60">No sections yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add a section to start building</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={structure.sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                {structure.sectionOrder.map((sectionType, index) => {
                  const sectionBlocks = structure.sections[sectionType] || [];
                  const isExpanded = expandedSections.has(sectionType);

                  return (
                    <div
                      key={sectionType}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <SortableSection
                        sectionType={sectionType}
                        sectionBlocks={sectionBlocks}
                        isExpanded={isExpanded}
                        blockCount={sectionBlocks.length}
                        onToggle={() => toggleSection(sectionType)}
                        onRemoveSection={() => removeSection(sectionType)}
                        onRemoveBlock={(blockId) => removeBlockFromSection(blockId, sectionType)}
                        blocks={blocks}
                        onReorderBlocks={(newOrder) => reorderBlocksInSection(sectionType, newOrder)}
                        onSwapVariant={handleSwapVariant}
                      />
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      {/* Add Section Area */}
      <div className="p-3 border-t border-border/60 space-y-2">
        {isAddingCustom ? (
          <div className="flex items-center gap-1">
            <Input
              placeholder="SECTION NAME"
              value={customSectionName}
              onChange={(e) => setCustomSectionName(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="h-8 text-xs uppercase"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={handleAddCustomSection}
              disabled={!customSectionName.trim()}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsAddingCustom(false);
                setCustomSectionName("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-xs border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Section
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              {availableSuggestions.slice(0, 8).map((section) => (
                <DropdownMenuItem key={section} onClick={() => addSection(section)}>
                  <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center mr-2">
                    <span className="text-[9px] font-bold text-primary">
                      {getSectionIcon(section)}
                    </span>
                  </div>
                  {section}
                </DropdownMenuItem>
              ))}
              {availableSuggestions.length > 0 && (
                <div className="h-px bg-border my-1" />
              )}
              <DropdownMenuItem onClick={() => setIsAddingCustom(true)}>
                <Plus className="h-3.5 w-3.5 mr-2 text-primary" />
                <span className="text-primary font-medium">Custom Section...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SwapVariantModal
        open={swapModalOpen}
        onOpenChange={setSwapModalOpen}
        currentBlock={selectedBlockForSwap}
      />
    </div>
  );
}
