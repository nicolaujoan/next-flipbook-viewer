'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import Toolbar from "./toolbar/toolbar";
import { cn } from "../../../_lib/utils";
import Flipbook from "./flipbook/flipbook";
import { TransformWrapper } from "react-zoom-pan-pinch";
import { Document, pdfjs } from "react-pdf";
import PdfLoading from "./pad-loading/pdf-loading";
import useScreenSize from "../.././../_hooks/use-screensize";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FlipbookViewer = ({ pdfUrl, shareUrl, className, disableShare }) => {
  const containerRef = useRef();
  const flipbookRef  = useRef();

  const { width: screenWidth }          = useScreenSize();
  const screenReady                     = screenWidth > 0;
  const isMobile                        = screenReady && screenWidth < 768;

  const [pdfLoading, setPdfLoading]     = useState(true);
  const [pdfDetails, setPdfDetails]     = useState(null);
  const [screenfull, setScreenfull]     = useState(null);
  const [viewerStates, setViewerStates] = useState({ currentPageIndex: 0, zoomScale: 1 });

  useEffect(() => {
    import('screenfull').then((mod) => setScreenfull(mod.default ?? mod));
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

  const inner = pdfDetails && !pdfLoading && screenfull !== null && screenReady && (
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
  );

  return (
    <div ref={containerRef} className={cn(
      "relative h-[20.163rem] xs:h-[25.163rem] lg:h-[33.163rem] xl:h-[34.66rem] bg-foreground w-full overflow-hidden",
      className
    )}>
      {pdfLoading && <PdfLoading />}
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<></>}>
        {isMobile ? inner : (
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
            {inner}
          </TransformWrapper>
        )}
      </Document>
    </div>
  );
};

export default FlipbookViewer;
