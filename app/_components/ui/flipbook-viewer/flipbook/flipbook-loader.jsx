import React, { forwardRef, memo, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import PdfPage from './pdf-page'
import { useDebounce } from '../../../../_hooks/use-debounce';
import { cn } from '../../../../_lib/utils';
import useScreenSize from '../../../../_hooks/use-screensize';

const MemoizedPdfPage = memo(PdfPage)

// Pages kept in canvas on each side of the current page.
// Mobile gets a tighter window to stay under iOS canvas memory limits.
const VIEW_AHEAD_DESKTOP = 4;
const VIEW_AHEAD_MOBILE  = 2;

const FlipbookLoader = forwardRef(({ pdfDetails, scale, viewerStates, setViewerStates, viewRange, setViewRange }, ref) => {
    const { width } = useScreenSize();
    const isMobile = width > 0 && width < 768;
    const viewAhead = isMobile ? VIEW_AHEAD_MOBILE : VIEW_AHEAD_DESKTOP;

    const debouncedZoom = useDebounce(viewerStates.zoomScale, 500);

    const isPageInViewRange = (index) => index >= viewRange[0] && index <= viewRange[1];
    const isPageInView      = (index) => viewerStates.currentPageIndex === index || viewerStates.currentPageIndex + 1 === index;

    const onFlip = useCallback((e) => {
        let newViewRange;
        if (e.data > viewerStates.currentPageIndex) {
            newViewRange = [viewRange[0], Math.max(Math.min(e.data + viewAhead, pdfDetails.totalPages), viewRange[1])];
        } else if (e.data < viewerStates.currentPageIndex) {
            newViewRange = [Math.min(Math.max(e.data - viewAhead, 0), viewRange[0]), viewRange[1]];
        } else {
            newViewRange = viewRange;
        }
        setViewRange(newViewRange);
        setViewerStates({ ...viewerStates, currentPageIndex: e.data });
    }, [viewerStates, viewRange, viewAhead, setViewRange, setViewerStates, pdfDetails.totalPages]);

    return (
        <div className="relative">
            <HTMLFlipBook
                ref={ref}
                key={scale}
                startPage={viewerStates.currentPageIndex}
                width={pdfDetails.width * scale * 5}
                height={pdfDetails.height * scale * 5}
                size="stretch"
                drawShadow={false}
                flippingTime={700}
                usePortrait={isMobile}
                singlePage={isMobile}
                showCover={true}
                showPageCorners={false}
                onFlip={onFlip}
                disableFlipByClick={isMobile}
                className={cn(viewerStates.zoomScale > 1 && 'pointer-events-none md:pointer-events-none')}
            >
                {Array.from({ length: pdfDetails.totalPages }, (_, index) => (
                    <MemoizedPdfPage
                        key={index}
                        height={pdfDetails.height * scale}
                        zoomScale={debouncedZoom}
                        page={index + 1}
                        isPageInViewRange={isPageInViewRange(index)}
                        isPageInView={isPageInView(index)}
                    />
                ))}
            </HTMLFlipBook>
        </div>
    );
});

FlipbookLoader.displayName = 'FlipbookLoader';

export default FlipbookLoader;
