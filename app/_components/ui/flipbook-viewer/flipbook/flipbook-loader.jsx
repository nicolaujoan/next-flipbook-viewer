import React, { forwardRef, memo, useCallback, useMemo } from 'react'
import HTMLFlipBook from 'react-pageflip'
import PdfPage from './pdf-page'
import { useDebounce } from '../../../../_hooks/use-debounce';
import { cn } from '../../../../_lib/utils';
import useScreenSize from '../../../../_hooks/use-screensize';

const MemoizedPdfPage = memo(PdfPage)

const VIEW_AHEAD_DESKTOP = 4;
const VIEW_AHEAD_MOBILE  = 2;

const FlipbookLoader = forwardRef(({ pdfDetails, scale, viewerStates, setViewerStates, viewRange, setViewRange }, ref) => {
    const { width } = useScreenSize();

    // width=0 means useScreenSize hasn't measured yet — don't render until known
    // to avoid a desktop→mobile prop flip that corrupts react-pageflip internals.
    const ready    = width > 0;
    const isMobile = ready && width < 768;
    const viewAhead = isMobile ? VIEW_AHEAD_MOBILE : VIEW_AHEAD_DESKTOP;

    const debouncedZoom = useDebounce(viewerStates.zoomScale, 500);

    // Stable page indices array — only rebuilt when totalPages changes.
    const pageIndices = useMemo(
        () => Array.from({ length: pdfDetails.totalPages }, (_, i) => i),
        [pdfDetails.totalPages]
    );

    const isPageInViewRange = useCallback(
        (index) => index >= viewRange[0] && index <= viewRange[1],
        [viewRange]
    );
    const isPageInView = useCallback(
        (index) => viewerStates.currentPageIndex === index || viewerStates.currentPageIndex + 1 === index,
        [viewerStates.currentPageIndex]
    );

    const onFlip = useCallback((e) => {
        const newPage = e.data;
        const newViewRange = [
            Math.max(newPage - viewAhead, 0),
            Math.min(newPage + viewAhead, pdfDetails.totalPages),
        ];
        // Defer state update until after the flip animation frame to avoid
        // triggering a React reconciliation while the GPU is animating.
        requestAnimationFrame(() => {
            setViewRange(newViewRange);
            setViewerStates(prev => ({ ...prev, currentPageIndex: newPage }));
        });
    }, [viewAhead, pdfDetails.totalPages, setViewRange, setViewerStates]);

    if (!ready) return null;

    return (
        <div className="relative">
            <HTMLFlipBook
                ref={ref}
                startPage={viewerStates.currentPageIndex}
                width={pdfDetails.width * scale * 5}
                height={pdfDetails.height * scale * 5}
                size="stretch"
                drawShadow={false}
                flippingTime={isMobile ? 0 : 700}
                usePortrait={isMobile}
                singlePage={isMobile}
                showCover={true}
                showPageCorners={false}
                onFlip={onFlip}
                disableFlipByClick={isMobile}
                className={cn(viewerStates.zoomScale > 1 && 'pointer-events-none md:pointer-events-none')}
            >
                {pageIndices.map((index) => (
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
