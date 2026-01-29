"use client";

import { useEffect } from "react";
import { ResumeStructure } from "@/components/builder/ResumeStructure";
import { BlockLibrary } from "@/components/builder/BlockLibrary";
import { PdfPreview } from "@/components/builder/PdfPreview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, ChevronDown } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";

export default function BuilderPage() {
  const { loadDocument, pdfUrl, compile } = useBuilderStore();

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleExportPdf = async () => {
    if (!pdfUrl) {
      await compile();
    }
    const state = useBuilderStore.getState();
    if (state.pdfUrl) {
      const link = document.createElement("a");
      link.href = state.pdfUrl;
      link.download = `${state.documentName}.pdf`;
      link.click();
    }
  };

  const handleExportTex = async () => {
    const state = useBuilderStore.getState();
    if (!state.documentId) return;

    try {
      const response = await fetch("/api/compile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: state.documentId }),
      });
      const { latex } = await response.json();
      
      const blob = new Blob([latex], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.documentName}.tex`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting LaTeX:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">ResuTex</h1>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">LaTeX Resume Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPdf}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTex}>
                <FileText className="h-4 w-4 mr-2" />
                Export as LaTeX (.tex)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 40% */}
        <div className="w-2/5 flex flex-col border-r">
          {/* Top: Resume Structure */}
          <div className="flex-1 overflow-hidden">
            <ResumeStructure />
          </div>
          {/* Bottom: Block Library */}
          <div className="h-1/2 border-t overflow-hidden">
            <BlockLibrary />
          </div>
        </div>

        {/* Right Panel - 60% */}
        <div className="w-3/5">
          <PdfPreview />
        </div>
      </div>
    </div>
  );
}
