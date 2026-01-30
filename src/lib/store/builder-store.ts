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
  documentId?: string | null;
}

export interface ResumeStructure {
  sectionOrder: string[];
  sections: Record<string, string[]>; // sectionType -> blockIds
}

export interface SpacingSettings {
  section: number;
  block: number;
  line: number;
}

export interface ResumeDocument {
  id: string;
  name: string;
  updatedAt: string;
}

export interface AppSettings {
  sharedBlocks: boolean;
}

interface BuilderState {
  // Data
  blocks: ContentBlock[];
  structure: ResumeStructure;
  documentId: string | null;
  documentName: string;
  preamble: string;
  spacing: SpacingSettings;
  variantGroups: VariantGroup[];
  
  // Documents list
  documents: ResumeDocument[];
  
  // App settings
  settings: AppSettings;

  // Compilation state
  isCompiling: boolean;
  pdfUrl: string | null;
  error: string | null;

  // Actions - Blocks
  setBlocks: (blocks: ContentBlock[]) => void;
  addBlock: (block: Omit<ContentBlock, "id" | "tags">) => Promise<void>;
  updateBlock: (blockId: string, data: Partial<ContentBlock>) => Promise<void>;
  removeBlock: (blockId: string) => Promise<void>;

  // Actions - Structure
  setStructure: (structure: ResumeStructure) => void;
  addSection: (sectionType: string) => void;
  removeSection: (sectionType: string) => void;
  renameSection: (oldName: string, newName: string) => void;
  addBlockToSection: (blockId: string, sectionType: string) => Promise<boolean>;
  removeBlockFromSection: (blockId: string, sectionType: string) => void;
  reorderBlocksInSection: (sectionType: string, blockIds: string[]) => void;
  reorderSections: (sectionOrder: string[]) => void;

  // Actions - Preamble
  setPreamble: (preamble: string) => void;
  resetPreamble: () => void;

  // Actions - Spacing
  setSpacing: (spacing: SpacingSettings) => void;
  resetSpacing: () => void;

  // Actions - Variant Groups
  loadVariantGroups: () => Promise<void>;
  addBlockToVariantGroup: (blockId: string, groupId: string) => Promise<void>;
  removeBlockFromVariantGroup: (blockId: string) => Promise<void>;
  swapVariant: (oldBlockId: string, newBlockId: string) => Promise<void>;
  validateVariantConflict: (blockId: string) => Promise<{ hasConflict: boolean; conflictingBlock?: ContentBlock }>;

  // Actions - Compilation
  compile: () => Promise<void>;

  // Actions - Documents
  loadDocuments: () => Promise<void>;
  createDocument: (name: string) => Promise<string>;
  deleteDocument: (documentId: string) => Promise<void>;
  renameDocument: (name: string) => Promise<void>;
  switchDocument: (documentId: string) => Promise<void>;
  
  // Actions - Settings
  loadSettings: () => Promise<void>;
  setSharedBlocks: (shared: boolean) => Promise<void>;

  // Actions - Persistence
  loadDocument: (documentId?: string) => Promise<void>;
  loadBlocks: () => Promise<void>;
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
  preamble: "",
  spacing: { section: -8, block: -6, line: 1.0 },
  variantGroups: [],
  documents: [],
  settings: { sharedBlocks: true },
  isCompiling: false,
  pdfUrl: null,
  error: null,

  // Block actions
  setBlocks: (blocks) => set({ blocks }),

  addBlock: async (blockData) => {
    try {
      const state = get();
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...blockData,
          // If blocks are isolated, associate with current document
          documentId: state.settings.sharedBlocks ? null : state.documentId,
        }),
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

  updateBlock: async (blockId, data) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update block");

      const updatedBlock = await response.json();
      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === blockId ? updatedBlock : b)),
      }));
    } catch (error) {
      console.error("Error updating block:", error);
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

  renameSection: (oldName, newName) => {
    const trimmedNew = newName.trim().toUpperCase();
    if (!trimmedNew || oldName === trimmedNew) return;

    set((state) => {
      // Don't rename if new name already exists
      if (state.structure.sectionOrder.includes(trimmedNew)) return state;

      const newSections = { ...state.structure.sections };
      newSections[trimmedNew] = newSections[oldName] || [];
      delete newSections[oldName];

      return {
        structure: {
          sectionOrder: state.structure.sectionOrder.map((s) =>
            s === oldName ? trimmedNew : s
          ),
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

  // Preamble actions
  setPreamble: (preamble) => {
    set({ preamble });
    get().saveDocument();
  },

  resetPreamble: () => {
    set({ preamble: "" });
    get().saveDocument();
  },

  // Spacing actions
  setSpacing: (spacing) => {
    set({ spacing });
    get().saveDocument();
  },

  resetSpacing: () => {
    set({ spacing: { section: -8, block: -6, line: 1.0 } });
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
  loadDocuments: async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Failed to load documents");
      const docs = await response.json();
      set({ documents: docs });
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  },

  createDocument: async (name) => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create document");
      const newDoc = await response.json();
      
      // Refresh documents list
      await get().loadDocuments();
      
      return newDoc.id;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete document");
      
      // Refresh documents list
      await get().loadDocuments();
      
      // If we deleted the current document, switch to another
      if (get().documentId === documentId) {
        const docs = get().documents;
        if (docs.length > 0) {
          await get().switchDocument(docs[0].id);
        } else {
          // Create a new document if none left
          const newId = await get().createDocument("My Resume");
          await get().switchDocument(newId);
        }
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  renameDocument: async (name) => {
    const state = get();
    if (!state.documentId) return;
    
    set({ documentName: name });
    await get().saveDocument();
    await get().loadDocuments();
  },

  switchDocument: async (documentId) => {
    // Save current document first
    await get().saveDocument();
    
    // Clear PDF when switching
    const currentPdfUrl = get().pdfUrl;
    if (currentPdfUrl) {
      URL.revokeObjectURL(currentPdfUrl);
    }
    set({ pdfUrl: null, error: null });
    
    // Load new document
    await get().loadDocument(documentId);
  },

  loadDocument: async (documentId) => {
    try {
      // Load settings first
      await get().loadSettings();
      
      // Load blocks (will be filtered based on settings)
      await get().loadBlocks();

      // Load or create document
      if (documentId) {
        const docRes = await fetch(`/api/documents/${documentId}`);
        if (docRes.ok) {
          const doc = await docRes.json();
          const defaultSpacing = { section: -8, block: -6, line: 1.0 };
          set({
            documentId: doc.id,
            documentName: doc.name,
            structure: JSON.parse(doc.structure),
            preamble: doc.preamble || "",
            spacing: doc.spacing ? JSON.parse(doc.spacing) : defaultSpacing,
          });
          
          // Reload blocks again now that we have documentId
          await get().loadBlocks();
          
          // Load variant groups and documents list
          await get().loadVariantGroups();
          await get().loadDocuments();
          return;
        }
      }

      // Try to load first document or create one
      const docsRes = await fetch("/api/documents");
      const docs = await docsRes.json();

      if (docs.length > 0) {
        const doc = docs[0];
        const defaultSpacing = { section: -8, block: -6, line: 1.0 };
        set({
          documentId: doc.id,
          documentName: doc.name,
          structure: JSON.parse(doc.structure),
          preamble: doc.preamble || "",
          spacing: doc.spacing ? JSON.parse(doc.spacing) : defaultSpacing,
        });
        
        // Reload blocks with correct documentId
        await get().loadBlocks();
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

      // Load variant groups and documents list
      await get().loadVariantGroups();
      await get().loadDocuments();
    } catch (error) {
      console.error("Error loading document:", error);
    }
  },

  loadBlocks: async () => {
    const state = get();
    try {
      const params = new URLSearchParams();
      if (state.documentId) {
        params.append("documentId", state.documentId);
      }
      params.append("sharedBlocks", String(state.settings.sharedBlocks));
      
      const blocksRes = await fetch(`/api/blocks?${params.toString()}`);
      const blocks = await blocksRes.json();
      set({ blocks });
    } catch (error) {
      console.error("Error loading blocks:", error);
    }
  },

  loadSettings: async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const settings = await response.json();
        set({ settings: { sharedBlocks: settings.sharedBlocks } });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  },

  setSharedBlocks: async (shared) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedBlocks: shared }),
      });
      
      if (response.ok) {
        set({ settings: { sharedBlocks: shared } });
        // Reload blocks with new setting
        await get().loadBlocks();
      }
    } catch (error) {
      console.error("Error updating settings:", error);
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
          preamble: state.preamble,
          spacing: JSON.stringify(state.spacing),
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
