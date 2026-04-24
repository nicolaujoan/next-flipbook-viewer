import React, { useEffect, useCallback } from 'react';
import { Button } from '../../button';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import Zoom from './zoom';
import SliderNav from './slider-nav/slider-nav';
import useScreenSize from '../../../../_hooks/use-screensize';
import Share from '../../share';

const Toolbar = ({ flipbookRef, containerRef, screenfull, pdfDetails, viewerStates, shareUrl, disableShare }) => {
    const { width: screenWidth } = useScreenSize();
    const isMobile = screenWidth > 0 && screenWidth < 768;

    const pagesInFlipView = ((viewerStates.currentPageIndex + 1) % 2 === 0 && (viewerStates.currentPageIndex + 1) !== pdfDetails.totalPages)
        ? `${viewerStates.currentPageIndex + 1} - ${viewerStates.currentPageIndex + 2}`
        : (viewerStates.currentPageIndex + 1);

    const fullScreen = useCallback(() => {
        if (screenfull?.isEnabled) {
            screenfull.toggle(containerRef.current, { navigationUI: 'hide' });
            screenfull.on('error', (event) => console.error('Fullscreen error', event));
        }
    }, [screenfull, containerRef]);

    // keyboardjs accesses `document` on import — lazy-load it client-side only.
    useEffect(() => {
        let keyboardjs;
        let handleRight, handleLeft;

        import('keyboardjs').then((mod) => {
            keyboardjs = mod.default ?? mod;
            handleRight = () => flipbookRef.current?.pageFlip()?.flipNext();
            handleLeft  = () => flipbookRef.current?.pageFlip()?.flipPrev();
            keyboardjs.bind('right', null, handleRight);
            keyboardjs.bind('left',  null, handleLeft);
        });

        return () => {
            if (keyboardjs && handleRight && handleLeft) {
                keyboardjs.unbind('right', null, handleRight);
                keyboardjs.unbind('left',  null, handleLeft);
            }
        };
    }, [flipbookRef]);

    const isFullscreen = screenfull?.isEnabled && screenfull?.isFullscreen;

    return (
        <div className="px-3 w-full bg-background">
            <SliderNav
                flipbookRef={flipbookRef}
                pdfDetails={pdfDetails}
                viewerStates={viewerStates}
                screenWidth={screenWidth}
            />
            <div className="flex items-center gap-2 pb-2 max-xl:pt-2">
                <div className="hidden lg:block flex-1"></div>
                <Button
                    onClick={() => isMobile
                        ? flipbookRef.current?.pageFlip()?.turnToPrevPage()
                        : flipbookRef.current?.pageFlip()?.flipPrev()
                    }
                    disabled={viewerStates.currentPageIndex === 0}
                    variant='secondary'
                    size='icon'
                    className='size-8 min-w-8'
                >
                    <ChevronLeft className="size-4 min-w-4" />
                </Button>
                <Button
                    onClick={() => isMobile
                        ? flipbookRef.current?.pageFlip()?.turnToNextPage()
                        : flipbookRef.current?.pageFlip()?.flipNext()
                    }
                    disabled={
                        viewerStates.currentPageIndex === pdfDetails?.totalPages - 1 ||
                        viewerStates.currentPageIndex === pdfDetails?.totalPages - 2
                    }
                    variant='secondary'
                    size='icon'
                    className='size-8 min-w-8'
                >
                    <ChevronRight className="size-4 min-w-4" />
                </Button>
                <Zoom zoomScale={viewerStates.zoomScale} screenWidth={screenWidth} />
                {!disableShare && <Share shareUrl={shareUrl} />}
                <Button
                    onClick={fullScreen}
                    variant='secondary'
                    size='icon'
                    className='size-8 min-w-8'
                >
                    {isFullscreen
                        ? <Minimize className="size-4 min-w-4" />
                        : <Maximize className="size-4 min-w-4" />
                    }
                </Button>
                <div className="flex-1"></div>
                {pdfDetails?.totalPages > 0 && (
                    <p className='text-sm font-medium'>
                        {pagesInFlipView} of {pdfDetails.totalPages}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
