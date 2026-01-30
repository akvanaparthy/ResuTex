import { create } from "zustand";

export interface VariantGroup {
  id: string;
  name: string;
  color: string;
}

export interface ContentBlock {
  id: string;
  name: string;
  sectionType: string;
  blockType: string;
  latexContent: string;
  templateData?: string;
  tags: string[];
  variantGroupId?: string | null;
  variantGroup?: VariantGroup | null;
}

export interface ResumeStructure {
  sectionOrder: string[];
  sections: Record<string, string[]>; // sectionType -> blockIds
}

interface BuilderState {
  // Data
  blocks: ContentBlock[];
  structure: ResumeStructure;
  documentId: string | null;
  documentName: string;
  variantGroups: VariantGroup[];

  // Compilation state
  isCompiling: boolean;
  pdfUrl: string | null;
  error: string | null;

  // Actions - Blocks
  setBlocks: (blocks: ContentBlock[]) => void;
  addBlock: (block: Omit<ContentBlock, "id" | "tags">) => Promise<void>;
  removeBlock: (blockId: string) => Promise<void>;

  // Actions - Structure
  setStructure: (structure: ResumeStructure) => void;
  addSection: (sectionType: string) => void;
  removeSection: (sectionType: string) => void;
  addBlockToSection: (blockId: string, sectionType: string) => Promise<boolean>;
  removeBlockFromSection: (blockId: string, sectionType: string) => void;
  reorderBlocksInSection: (sectionType: string, blockIds: string[]) => void;
  reorderSections: (sectionOrder: string[]) => void;

  // Actions - Variant Groups
  loadVariantGroups: () => Promise<void>;
  addBlockToVariantGroup: (blockId: string, groupId: string) => Promise<void>;
  removeBlockFromVariantGroup: (blockId: string) => Promise<void>;
  swapVariant: (oldBlockId: string, newBlockId: string) => Promise<void>;
  validateVariantConflict: (blockId: string) => Promise<{ hasConflict: boolean; conflictingBlock?: ContentBlock }>;

  // Actions - Compilation
  compile: () => Promise<void>;

  // Actions - Persistence
  loadDocument: (documentId?: string) => Promise<void>;
  saveDocument: () => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initial state
  blocks: [],
  structure: {
    sectionOrder: [],
    sections: {},
  },
  documentId: null,
  documentName: "My Resume",
  variantGroups: [],
  isCompiling: false,
  pdfUrl: null,
  error: null,

  // Block actions
  setBlocks: (blocks) => set({ blocks }),

  addBlock: async (blockData) => {
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockData),
      });

      if (!response.ok) throw new Error("Failed to create block");

      const newBlock = await response.json();
      set((state) => ({
        blocks: [...state.blocks, newBlock],
      }));
    } catch (error) {
      console.error("Error adding block:", error);
      throw error;
    }
  },

  removeBlock: async (blockId) => {
    try {
      await fetch(`/api/blocks/${blockId}`, { method: "DELETE" });

      set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== blockId),
        structure: {
          ...state.structure,
          sections: Object.fromEntries(
            Object.entries(state.structure.sections).map(([key, ids]) => [
              key,
              ids.filter((id) => id !== blockId),
            ])
          ),
        },
      }));
    } catch (error) {
      console.error("Error removing block:", error);
    }
  },

  // Structure actions
  setStructure: (structure) => set({ structure }),

  addSection: (sectionType) => {
    set((state) => {
      if (state.structure.sectionOrder.includes(sectionType)) return state;

      return {
        structure: {
          sectionOrder: [...state.structure.sectionOrder, sectionType],
          sections: {
            ...state.structure.sections,
            [sectionType]: [],
          },
        },
      };
    });
    // Auto-save after change
    get().saveDocument();
  },

  removeSection: (sectionType) => {
    set((state) => {
      const newSections = { ...state.structure.sections };
      delete newSections[sectionType];

      return {
        structure: {
          sectionOrder: state.structure.sectionOrder.filter((s) => s !== sectionType),
          sections: newSections,
        },
      };
    });
    get().saveDocument();
  },

  addBlockToSection: async (blockId, sectionType) => {
    // Validate variant conflict first
    const { hasConflict, conflictingBlock } = await get().validateVariantConflict(blockId);

    if (hasConflict) {
      // Return false to indicate conflict - caller should handle UI
      return false;
    }

    set((state) => {
      const currentBlocks = state.structure.sections[sectionType] || [];
      if (currentBlocks.includes(blockId)) return state;

      return {
        structure: {
          ...state.structure,
          sections: {
            ...state.structure.sections,
            [sectionType]: [...currentBlocks, blockId],
          },
        },
      };
    });
    get().saveDocument();
    return true;
  },

  removeBlockFromSection: (blockId, sectionType) => {
    set((state) => ({
      structure: {
        ...state.structure,
        sections: {
          ...state.structure.sections,
          [sectionType]: (state.structure.sections[sectionType] || []).filter(
            (id) => id !== blockId
          ),
        },
      },
    }));
    get().saveDocument();
  },

  reorderBlocksInSection: (sectionType, blockIds) => {
    set((state) => ({
      structure: {
        ...state.structure,
        sections: {
          ...state.structure.sections,
          [sectionType]: blockIds,
        },
      },
    }));
    get().saveDocument();
  },

  reorderSections: (sectionOrder) => {
    set((state) => ({
      structure: {
        ...state.structure,
        sectionOrder,
      },
    }));
    get().saveDocument();
  },

  // Compilation
  compile: async () => {
    const state = get();
    set({ isCompiling: true, error: null });

    try {
      // First save the document
      await state.saveDocument();

      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: state.documentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Compilation failed");
      }

      // Create blob URL for PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Revoke old URL
      if (state.pdfUrl) {
        URL.revokeObjectURL(state.pdfUrl);
      }

      set({ pdfUrl: url, isCompiling: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Compilation failed",
        isCompiling: false,
      });
    }
  },

  // Persistence
  loadDocument: async (documentId) => {
    try {
      // Load all blocks
      const blocksRes = await fetch("/api/blocks");
      const blocks = await blocksRes.json();
      set({ blocks });

      // Load or create document
      if (documentId) {
        const docRes = await fetch(`/api/documents/${documentId}`);
        if (docRes.ok) {
          const doc = await docRes.json();
          set({
            documentId: doc.id,
            documentName: doc.name,
            structure: JSON.parse(doc.structure),
          });
          return;
        }
      }

      // Try to load first document or create one
      const docsRes = await fetch("/api/documents");
      const docs = await docsRes.json();

      if (docs.length > 0) {
        const doc = docs[0];
        set({
          documentId: doc.id,
          documentName: doc.name,
          structure: JSON.parse(doc.structure),
        });
      } else {
        // Create new document
        const createRes = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "My Resume" }),
        });
        const newDoc = await createRes.json();
        set({
          documentId: newDoc.id,
          documentName: newDoc.name,
          structure: JSON.parse(newDoc.structure),
        });
      }

      // Load variant groups
      await get().loadVariantGroups();
    } catch (error) {
      console.error("Error loading document:", error);
    }
  },

  saveDocument: async () => {
    const state = get();
    if (!state.documentId) return;

    try {
      await fetch(`/api/documents/${state.documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.documentName,
          structure: JSON.stringify(state.structure),
        }),
      });
    } catch (error) {
      console.error("Error saving document:", error);
    }
  },

  // Variant group actions
  loadVariantGroups: async () => {
    try {
      const response = await fetch("/api/variant-groups");
      if (!response.ok) throw new Error("Failed to load variant groups");
      const groups = await response.json();
      set({ variantGroups: groups });
    } catch (error) {
      console.error("Error loading variant groups:", error);
    }
  },

  addBlockToVariantGroup: async (blockId, groupId) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantGroupId: groupId }),
      });

      if (!response.ok) throw new Error("Failed to add block to variant group");

      const updatedBlock = await response.json();

      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === blockId ? updatedBlock : b)),
      }));

      // Reload groups to get updated block lists
      await get().loadVariantGroups();
    } catch (error) {
      console.error("Error adding block to variant group:", error);
      throw error;
    }
  },

  removeBlockFromVariantGroup: async (blockId) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantGroupId: null }),
      });

      if (!response.ok) throw new Error("Failed to remove block from variant group");

      const updatedBlock = await response.json();

      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === blockId ? updatedBlock : b)),
      }));

      await get().loadVariantGroups();
    } catch (error) {
      console.error("Error removing block from variant group:", error);
      throw error;
    }
  },

  swapVariant: async (oldBlockId, newBlockId) => {
    const state = get();
    if (!state.documentId) return;

    try {
      const response = await fetch("/api/swap-variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: state.documentId,
          oldBlockId,
          newBlockId,
        }),
      });

      if (!response.ok) throw new Error("Failed to swap variant");

      // Update local state - find old block and replace with new
      const oldBlock = state.blocks.find((b) => b.id === oldBlockId);
      if (!oldBlock) return;

      set((state) => {
        const newStructure = { ...state.structure };
        Object.keys(newStructure.sections).forEach((sectionType) => {
          newStructure.sections[sectionType] = newStructure.sections[sectionType].map(
            (id) => (id === oldBlockId ? newBlockId : id)
          );
        });

        return { structure: newStructure };
      });

      await get().saveDocument();
    } catch (error) {
      console.error("Error swapping variant:", error);
      throw error;
    }
  },

  validateVariantConflict: async (blockId) => {
    const state = get();
    if (!state.documentId) return { hasConflict: false };

    try {
      const response = await fetch("/api/validate-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: state.documentId,
          blockId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.conflict) {
          const conflictingBlock = state.blocks.find((b) => b.id === data.conflictingBlockId);
          return { hasConflict: true, conflictingBlock };
        }
      }

      return { hasConflict: false };
    } catch (error) {
      console.error("Error validating variant conflict:", error);
      return { hasConflict: false };
    }
  },
}));
