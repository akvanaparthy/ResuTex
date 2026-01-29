"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, ZoomIn, ZoomOut, FileText, AlertTriangle } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";

export function PdfPreview() {
  const { isCompiling, pdfUrl, compile, error } = useBuilderStore();
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-11 border-b border-border/60 bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isCompiling ? "secondary" : "default"}
            size="sm"
            onClick={compile}
            disabled={isCompiling}
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
          {pdfUrl && !isCompiling && (
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

        <div>
          {pdfUrl && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-border/60" asChild>
              <a href={pdfUrl} download="resume.pdf">
                <Download className="h-3 w-3" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto preview-bg">
        <div className="min-h-full flex items-start justify-center p-8">
          {error ? (
            <div className="max-w-lg w-full animate-fade-in-up mt-8">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-destructive">Compilation Error</h3>
                    <pre className="mt-2 text-xs text-destructive/80 whitespace-pre-wrap font-mono leading-relaxed break-all">{error}</pre>
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
    </div>
  );
}
