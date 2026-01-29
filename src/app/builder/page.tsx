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
import { Download, FileText, ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useTheme } from "@/components/ThemeProvider";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-13 border-b border-border/60 flex items-center justify-between px-5 bg-background/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs tracking-tight">Rx</span>
            </div>
            <h1 className="text-base font-semibold tracking-tight">ResuTex</h1>
          </div>
          <div className="h-4 w-px bg-border/60" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Builder</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="h-4 w-px bg-border/60 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border/60">
                <Download className="h-3.5 w-3.5" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        {/* Left Panel */}
        <div className="w-[480px] min-w-[380px] flex flex-col border-r border-border/60 bg-background">
          <div className="flex-1 overflow-hidden">
            <ResumeStructure />
          </div>
          <div className="h-[45%] min-h-[200px] border-t border-border/60 overflow-hidden">
            <BlockLibrary />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-w-0">
          <PdfPreview />
        </div>
      </div>
    </div>
  );
}
