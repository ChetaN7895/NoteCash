import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Lock, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  fileUrl?: string;
  title: string;
  isGuest: boolean;
  noteId: string;
  previewPages?: number;
}

const PDFPreview = ({
  fileUrl,
  title,
  isGuest,
  noteId,
  previewPages = 2,
}: PDFPreviewProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  const isBlocked = isGuest && currentPage > previewPages;

  // Load the PDF document
  useEffect(() => {
    if (!fileUrl) {
      setIsLoadingPdf(false);
      setError("No file URL provided");
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      setIsLoadingPdf(true);
      setError(null);

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;

        if (!cancelled) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) {
          setError("Failed to load PDF. The file may be unavailable.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPdf(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  // Render a specific page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel any ongoing render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setIsRenderingPage(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
      } finally {
        setIsRenderingPage(false);
      }
    },
    [pdfDoc, scale]
  );

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDoc && !isBlocked) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc, renderPage, isBlocked]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (isGuest && currentPage >= previewPages) return;
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleLoginClick = () => {
    navigate("/login", { state: { from: `/notes/${noteId}` } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden border shadow-card bg-card"
    >
      {/* Preview Area */}
      <div className="relative bg-secondary overflow-auto" style={{ maxHeight: "70vh" }}>
        {isLoadingPdf ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Loading PDF...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Canvas container */}
            <div className="flex justify-center p-4">
              <canvas
                ref={canvasRef}
                className="shadow-lg"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              {isRenderingPage && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Guest Blur Overlay */}
            {isGuest && currentPage >= previewPages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 backdrop-blur-md bg-background/60 flex flex-col items-center justify-center p-6"
              >
                <div className="bg-card rounded-2xl p-8 shadow-lg border max-w-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Preview Limited</h3>
                  <p className="text-muted-foreground mb-6">
                    You've viewed {previewPages} of {totalPages} pages. Login to
                    access the full document.
                  </p>
                  <Button variant="hero" className="w-full" onClick={handleLoginClick}>
                    Login to View All Pages
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Free to download after login
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      {totalPages > 0 && (
        <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm font-medium min-w-[100px] text-center">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={
                  currentPage === totalPages ||
                  (isGuest && currentPage >= previewPages)
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= 0.75}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= 3}>
                <ZoomIn className="w-4 h-4" />
              </Button>

              {isGuest && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                  <Lock className="w-3 h-3" />
                  <span>
                    Preview: {previewPages}/{totalPages} pages
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Preview Progress Bar for Guests */}
          {isGuest && (
            <div className="mt-3">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentPage / previewPages) * 100}%`,
                  }}
                  className="h-full bg-primary rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {currentPage >= previewPages
                  ? "Login to continue viewing"
                  : `${previewPages - currentPage} more preview page${
                      previewPages - currentPage !== 1 ? "s" : ""
                    } available`}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PDFPreview;
