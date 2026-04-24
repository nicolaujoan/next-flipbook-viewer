'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import Toolbar from "./toolbar/toolbar";
import { cn } from "../../../_lib/utils";
import Flipbook from "./flipbook/flipbook";
import { TransformWrapper } from "react-zoom-pan-pinch";
import { Document, pdfjs } from "react-pdf";
import PdfLoading from "./pad-loading/pdf-loading";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker must be set after the import, not before.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FlipbookViewer = ({ pdfUrl, shareUrl, className, disableShare }) => {
  const containerRef = useRef();
  const flipbookRef  = useRef();

  const [pdfLoading, setPdfLoading]   = useState(true);
  const [pdfDetails, setPdfDetails]   = useState(null);
  const [screenfull, setScreenfull]   = useState(null);
  const [viewerStates, setViewerStates] = useState({
    currentPageIndex: 0,
    zoomScale: 1,
  });

  // screenfull accesses `document` on import — lazy-load it client-side only
  // to avoid crashes during SSR / iOS hydration.
  useEffect(() => {
    import('screenfull').then((mod) => {
      setScreenfull(mod.default ?? mod);
    });
  }, []);

  const onDocumentLoadSuccess = useCallback(async (document) => {
    try {
      const pageDetails = await document.getPage(1);
      setPdfDetails({
        totalPages: document.numPages,
        width:      pageDetails.view[2],
        height:     pageDetails.view[3],
      });
      setPdfLoading(false);
    } catch (error) {
      console.error('Error loading document:', error);
    }
  }, []);

  return (
    <div ref={containerRef} className={cn(
      "relative h-[20.163rem] xs:h-[25.163rem] lg:h-[33.163rem] xl:h-[34.66rem] bg-foreground w-full overflow-hidden",
      className
    )}>
      {pdfLoading && <PdfLoading />}
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<></>}>
        {pdfDetails && !pdfLoading && screenfull && (
          <TransformWrapper
            doubleClick={{ disabled: true }}
            pinch={{ step: 2 }}
            disablePadding={viewerStates.zoomScale <= 1}
            initialScale={1}
            minScale={1}
            maxScale={5}
            onTransformed={({ state }) =>
              setViewerStates(prev => ({ ...prev, zoomScale: state.scale }))
            }
          >
            <div className="w-full relative bg-foreground flex flex-col justify-between">
              <Flipbook
                viewerStates={viewerStates}
                setViewerStates={setViewerStates}
                flipbookRef={flipbookRef}
                screenfull={screenfull}
                pdfDetails={pdfDetails}
              />
              <Toolbar
                viewerStates={viewerStates}
                setViewerStates={setViewerStates}
                containerRef={containerRef}
                flipbookRef={flipbookRef}
                screenfull={screenfull}
                pdfDetails={pdfDetails}
                shareUrl={shareUrl}
                disableShare={disableShare}
              />
            </div>
          </TransformWrapper>
        )}
      </Document>
    </div>
  );
};

export default FlipbookViewer;
