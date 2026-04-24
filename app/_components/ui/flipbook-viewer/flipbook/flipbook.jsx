'use client';
import React, { memo, useState, useEffect, useCallback } from 'react';
import useRefSize from '../../../../_hooks/use-ref-size';
import useScreenSize from '../../../../_hooks/use-screensize';
import FlipbookLoader from './flipbook-loader';
import { cn } from '../../../../_lib/utils';
import { TransformComponent } from 'react-zoom-pan-pinch';

const Flipbook = memo(({ viewerStates, setViewerStates, flipbookRef, pdfDetails }) => {
    const { ref, width, height, refreshSize } = useRefSize();
    const { width: screenWidth } = useScreenSize();
    const isMobile = screenWidth > 0 && screenWidth < 768;

    const [scale, setScale] = useState(1);
    const [wrapperCss, setWrapperCss] = useState({});
    // Mobile starts with a tighter view range
    const [viewRange, setViewRange] = useState([0, isMobile ? 2 : 4]);

    // On mobile, one page fills the container; on desktop, two pages side-by-side.
    useEffect(() => {
        if (pdfDetails && width && height) {
            const pageColumns = isMobile ? 1 : 2;
            const calculatedScale = Math.min(
                width / (pageColumns * pdfDetails.width),
                height / pdfDetails.height
            );
            setScale(calculatedScale);
            setWrapperCss({
                width:  `${pdfDetails.width * calculatedScale * pageColumns}px`,
                height: `${pdfDetails.height * calculatedScale}px`,
            });
        }
    }, [pdfDetails, width, height, isMobile]);

    const shrinkPageLoadingRange = useCallback(() => {
        const ahead = isMobile ? 2 : 4;
        setViewRange([
            Math.max(viewerStates.currentPageIndex - ahead, 0),
            Math.min(viewerStates.currentPageIndex + ahead, pdfDetails.totalPages),
        ]);
    }, [viewerStates.currentPageIndex, pdfDetails.totalPages, isMobile]);

    const handleFullscreenChange = useCallback(() => {
        shrinkPageLoadingRange();
        refreshSize();
    }, [shrinkPageLoadingRange, refreshSize]);

    useEffect(() => {
        if (screenfull?.isEnabled) screenfull.on('change', handleFullscreenChange);
        return () => { if (screenfull?.isEnabled) screenfull.off('change', handleFullscreenChange); };
    }, [handleFullscreenChange]);

    return (
        <div ref={ref} className={cn(
            "relative h-[15rem] xs:h-[20rem] lg:h-[28rem] xl:h-[30rem] w-full bg-transparent flex justify-center items-center overflow-hidden",
            screenfull?.isFullscreen && 'h-[calc(100vh-5.163rem)] xs:h-[calc(100vh-5.163rem)] lg:h-[calc(100vh-5.163rem)] xl:h-[calc(100vh-4.66rem)]'
        )}>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
                <div className='overflow-hidden flex justify-center items-center h-full w-full'>
                    {pdfDetails && scale && (
                        <div style={wrapperCss}>
                            <FlipbookLoader
                                ref={flipbookRef}
                                pdfDetails={pdfDetails}
                                scale={scale}
                                viewRange={viewRange}
                                setViewRange={setViewRange}
                                viewerStates={viewerStates}
                                setViewerStates={setViewerStates}
                            />
                        </div>
                    )}
                </div>
            </TransformComponent>
        </div>
    );
});

Flipbook.displayName = 'Flipbook';
export default Flipbook;
