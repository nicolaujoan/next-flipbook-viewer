import { cn } from "../../../../_lib/utils";
import React, { forwardRef, memo } from "react";
import { Page } from "react-pdf";

// iOS Safari has a hard canvas memory limit (~256 MB). Capping DPR at 2 halves
// memory usage with no visible quality difference on Retina screens.
const MAX_DPR = 2;

const safeDevicePixelRatio = () =>
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, MAX_DPR) : 1;

const PdfPage = forwardRef(({ page, height, zoomScale, isPageInView, isPageInViewRange }, ref) => {
    const baseDpr = safeDevicePixelRatio();
    const dpr = (isPageInView && zoomScale > 1.7)
        ? Math.min(zoomScale * baseDpr, MAX_DPR * 2)
        : baseDpr;

    return (
        <div ref={ref} className={cn(page % 2 === 0 ? 'bg-background' : 'bg-muted')} >
            {isPageInViewRange && (
                <Page
                    devicePixelRatio={dpr}
                    height={height}
                    pageNumber={page}
                    loading={<></>}
                />
            )}
        </div>
    );
});

PdfPage.displayName = "PdfPage";

export default memo(PdfPage);
