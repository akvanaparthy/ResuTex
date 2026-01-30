"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut, FileText, AlertTriangle, Package, FileCode, SlidersHorizontal } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";
import { useToast } from "@/hooks/use-toast";
import { PreambleModal } from "@/components/modals/PreambleModal";
import { SpacingSettingsModal } from "@/components/modals/SpacingSettingsModal";

export function PdfPreview() {
  const { isCompiling, pdfUrl, compile, error } = useBuilderStore();
  const [zoom, setZoom] = useState(100);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [preambleModalOpen, setPreambleModalOpen] = useState(false);
  const [spacingModalOpen, setSpacingModalOpen] = useState(false);
  const { toast } = useToast();

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

  const handleDebugLatex = async () => {
    const state = useBuilderStore.getState();
    if (!state.documentId) return;

    try {
      const response = await fetch("/api/compile-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: state.documentId }),
      });

      const data = await response.json();

      // Open LaTeX in a new window for inspection
      const debugWindow = window.open("", "_blank");
      if (debugWindow) {
        debugWindow.document.write(`
          <html>
            <head>
              <title>LaTeX Source Debug</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
                pre { white-space: pre-wrap; word-wrap: break-word; line-height: 1.5; }
                .line-num { color: #858585; user-select: none; }
                h2 { color: #4ec9b0; }
                .block { margin: 10px 0; padding: 10px; background: #252526; border-left: 3px solid #007acc; }
              </style>
            </head>
            <body>
              <h1>LaTeX Source Debug</h1>
              <h2>Blocks:</h2>
              ${data.blocks.map((b: any) => `
                <div class="block">
                  <strong>${b.name}</strong> (${b.sectionType})<br/>
                  <small>${b.contentPreview}...</small>
                </div>
              `).join("")}
              <h2>Generated LaTeX (with line numbers):</h2>
              <pre>${data.numberedLatex}</pre>
            </body>
          </html>
        `);
      }

      console.log("LaTeX Debug:", data);
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-11 border-b border-border/60 bg-background flex items-center justify-between px-4">
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
          {pdfUrl && !isCompiling && !isSettingUp && (
            <div className="flex items-center gap-1 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
              <span className="text-[10px] text-muted-foreground">Ready</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button
            className="text-[10px] font-medium text-muted-foreground w-10 text-center tabular-nums hover:text-foreground transition-colors"
            onClick={() => setZoom(100)}
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto preview-bg">
        <div className="min-h-full flex items-start justify-center p-8">
          {error ? (
            <div className="max-w-2xl w-full animate-fade-in-up mt-8">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-destructive">Compilation Error</h3>
                    <div className="mt-3 max-h-[60vh] overflow-auto rounded border border-destructive/20 bg-background/50 p-3">
                      <pre className="text-xs text-destructive/90 whitespace-pre-wrap font-mono leading-relaxed">{error}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div
              className="shadow-xl rounded-sm overflow-hidden transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <iframe
                src={pdfUrl}
                className="w-[8.5in] h-[11in] border-0 bg-white"
                title="Resume Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center animate-fade-in" style={{ minHeight: "calc(100vh - 10rem)" }}>
              <div className="text-center">
                <div className="w-16 h-20 mx-auto mb-5 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-foreground/50">No preview yet</p>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">
                  Add blocks to your resume and click Compile to preview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <PreambleModal open={preambleModalOpen} onOpenChange={setPreambleModalOpen} />
      <SpacingSettingsModal open={spacingModalOpen} onOpenChange={setSpacingModalOpen} />
    </div>
  );
}
