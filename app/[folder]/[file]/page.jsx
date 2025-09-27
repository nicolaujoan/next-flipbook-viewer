import FlipbookViewer from '../../_components/ui/flipbook-viewer/flipbook-viewer'
import React from 'react'


const Page = ({ params }) => {
  const { folder, file } = params

  // Build the full PDF URL
  const pdfUrl = `/bucket/${folder}/${file}`;

  return (
    <div className="block">
      <FlipbookViewer pdfUrl={pdfUrl} />
    </div>
  )
}

export default Page