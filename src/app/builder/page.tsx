"use client";

import { useEffect, useState } from "react";
import { ResumeStructure } from "@/components/builder/ResumeStructure";
import { BlockLibrary } from "@/components/builder/BlockLibrary";
import { PdfPreview } from "@/components/builder/PdfPreview";
import { DocumentSelector } from "@/components/builder/DocumentSelector";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { PreambleModal } from "@/components/modals/PreambleModal";
import { SpacingSettingsModal } from "@/components/modals/SpacingSettingsModal";
import { AISelectModal } from "@/components/modals/AISelectModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, FileText, ChevronDown, Sun, Moon, Monitor, Settings, RefreshCw, Package, FileCode, SlidersHorizontal, Sparkles } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

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
  const { loadDocument, pdfUrl, compile, isCompiling } = useBuilderStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preambleModalOpen, setPreambleModalOpen] = useState(false);
  const [spacingModalOpen, setSpacingModalOpen] = useState(false);
  const [aiSelectModalOpen, setAiSelectModalOpen] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleLatexSetup = async () => {
    setIsSettingUp(true);
    toast({
      title: "Installing LaTeX Packages",
      description: "This may take 1-2 minutes. Please wait...",
    });

    try {
      const response = await fetch("/api/latex-setup", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✓ Setup Complete",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Setup Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to run LaTeX setup. Check console for details.",
        variant: "destructive",
      });
      console.error("LaTeX setup error:", error);
    } finally {
      setIsSettingUp(false);
    }
  };

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
      <header className="h-13 border-b border-border/60 flex items-center px-5 bg-background/80 backdrop-blur-sm relative z-10">
        {/* Left side - Logo and Document */}
        <div className="flex items-center gap-3 w-[35%]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs tracking-tight">Rx</span>
            </div>
            <h1 className="text-base font-semibold tracking-tight">ResuTex</h1>
          </div>
          <div className="h-4 w-px bg-border/60" />
          <DocumentSelector />
        </div>

        {/* Right side - Compile controls and Export */}
        <div className="flex-1 flex items-center justify-between">
          {/* Compile controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isCompiling ? "secondary" : "default"}
              size="sm"
              onClick={compile}
              disabled={isCompiling || isSettingUp}
              className="h-7 text-xs gap-1.5 min-w-[100px]"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Compile
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLatexSetup}
              disabled={isSettingUp || isCompiling}
              className="h-7 text-xs gap-1.5 border-border/60"
              title="Install required LaTeX packages"
            >
              {isSettingUp ? (
                <>
                  <Package className="h-3 w-3 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Package className="h-3 w-3" />
                  Setup
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreambleModalOpen(true)}
              disabled={isSettingUp || isCompiling}
              className="h-7 text-xs gap-1.5 border-border/60"
              title="Edit LaTeX preamble"
            >
              <FileCode className="h-3 w-3" />
              Preamble
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpacingModalOpen(true)}
              disabled={isSettingUp || isCompiling}
              className="h-7 text-xs gap-1.5 border-border/60"
              title="Adjust spacing settings"
            >
              <SlidersHorizontal className="h-3 w-3" />
              Spacing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiSelectModalOpen(true)}
              disabled={isSettingUp || isCompiling}
              className="h-7 text-xs gap-1.5 border-border/60"
              title="AI-powered variant selection"
            >
              <Sparkles className="h-3 w-3" />
              AI Suggest
            </Button>
            {pdfUrl && !isCompiling && !isSettingUp && (
              <div className="flex items-center gap-1 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                <span className="text-[10px] text-muted-foreground">Ready</span>
              </div>
            )}
          </div>

          {/* Settings and Export */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-[35%_1fr] gap-0">
        {/* Left Side */}
        <div className="h-full overflow-hidden grid grid-rows-2 gap-0">
          {/* Resume Structure */}
          <div className="overflow-hidden border-r border-border/60">
            <ResumeStructure />
          </div>

          {/* Block Library */}
          <div className="overflow-hidden border-r border-t border-border/60">
            <BlockLibrary />
          </div>
        </div>

        {/* Right Side - PDF Preview */}
        <div className="h-full overflow-hidden">
          <PdfPreview />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <PreambleModal open={preambleModalOpen} onOpenChange={setPreambleModalOpen} />
      <SpacingSettingsModal open={spacingModalOpen} onOpenChange={setSpacingModalOpen} />
      <AISelectModal open={aiSelectModalOpen} onOpenChange={setAiSelectModalOpen} />
    </div>
  );
}
