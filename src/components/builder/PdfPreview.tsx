"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, FileText, AlertTriangle } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";

export function PdfPreview() {
  const { pdfUrl, error } = useBuilderStore();
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-full relative">
      {/* Floating Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md border border-border/60 px-1 py-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setZoom(Math.max(50, zoom - 10))}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <button
          className="text-[10px] font-medium text-muted-foreground w-9 text-center tabular-nums hover:text-foreground transition-colors"
          onClick={() => setZoom(100)}
          title="Reset zoom"
        >
          {zoom}%
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setZoom(Math.min(200, zoom + 10))}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
      </div>

      {/* Preview Area */}
      <div className="h-full overflow-auto preview-bg">
        <div className="min-h-full flex items-center justify-center py-4 px-4">
          {error ? (
            <div className="max-w-2xl w-full animate-fade-in-up">
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
              className="shadow-xl rounded-sm overflow-hidden transition-all duration-200 ease-out"
              style={{
                width: `calc(9.5in * ${zoom / 100})`,
                height: `calc(10.5in * ${zoom / 100})`,
              }}
            >
              <iframe
                src={`${pdfUrl}#navpanes=0&zoom=${zoom}`}
                className="w-full h-full border-0 bg-white"
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
