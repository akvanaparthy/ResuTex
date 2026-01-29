"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useBuilderStore } from "@/lib/store/builder-store";

export function PdfPreview() {
  const { isCompiling, pdfUrl, compile, error } = useBuilderStore();
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="h-12 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={compile}
            disabled={isCompiling}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCompiling ? "animate-spin" : ""}`} />
            {isCompiling ? "Compiling..." : "Compile"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div>
          {pdfUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} download="resume.pdf">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
        {error ? (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md">
            <h3 className="font-semibold text-destructive mb-2">Compilation Error</h3>
            <pre className="text-sm text-destructive whitespace-pre-wrap">{error}</pre>
          </div>
        ) : pdfUrl ? (
          <div
            className="bg-white shadow-lg"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              src={pdfUrl}
              className="w-[8.5in] h-[11in] border-0"
              title="Resume Preview"
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="w-[8.5in] h-[11in] bg-white shadow-lg flex items-center justify-center">
              <div>
                <p className="text-lg mb-2">No preview yet</p>
                <p className="text-sm">Add blocks and click "Compile" to preview</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
