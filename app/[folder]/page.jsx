"use client"

export const dynamic = 'force-dynamic';
import React, { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { useParams } from 'next/navigation'
import detectBackButton from 'detect-browser-back-navigation';

export default function FolderPage() {
  const params = useParams();
  const folder = params.folder;
  const [files, setFiles] = useState([]);
  const [pdfjs, setPdfjs] = useState(null);

  const loadFiles = useCallback(async () => {
    if (!folder) return;
    setFiles([]); // Reset to show loading state
    try {
      const res = await fetch(`/bucket/${folder}/index.json`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Error in loadFiles:", err);
    }
  }, [folder]);

  useEffect(() => {
    console.log("effect loading library")
    detectBackButton(() => {});
    async function loadPdfjs() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      setPdfjs(pdfjsLib);
    }
    loadPdfjs();
  }, []);

  useEffect(() => {
    console.log("effect loading files for folder:", folder);
    loadFiles();
  }, [loadFiles]);

  // Render gate: Wait for both library and data to be ready
  if (!pdfjs || files.length === 0) {
    return <p>Loading files for {folder}...</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {files.map((file) => (
        <PDFCard key={file} folder={folder} file={file} pdfjs={pdfjs} />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// PDFCard component (Remains the same as provided)
// -----------------------------------------------------------------------------

function PDFCard({ folder, file, pdfjs }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!pdfjs || !canvasRef.current) return
    let cancelled = false
    async function renderThumbnail() {
      try {
        const url = `/bucket/${folder}/${file}`

        const pdf = await pdfjs.getDocument(url).promise
        if (cancelled) return

        const page = await pdf.getPage(1)
        if (cancelled) return

        const viewport = page.getViewport({ scale: 0.8 }) // Assuming 0.8 scale from previous fix
        const canvas = canvasRef.current

        const context = canvas.getContext("2d", { alpha: false })

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({ canvasContext: context, viewport }).promise

      } catch (err) {
        console.error(`[${file}] Error rendering thumbnail:`, err)
      }
    }
    renderThumbnail()
    return () => {
      cancelled = true
    }
  }, [folder, file, pdfjs])

  return (
    <Link
      href={`/${folder}/${file}`}
      className="block border rounded-xl shadow hover:shadow-lg bg-white overflow-hidden"
    >
      <div className="aspect-[3/4] flex items-center justify-center bg-gray-100 p-2">
        <canvas
          ref={canvasRef}
          width="200"
          height="267"
          className="max-w-full max-h-full"
          // Re-applied visual debug styles for the canvas
          style={{
            opacity: 1,
            zIndex: 9999,
            backgroundColor: 'white',
          }}
        ></canvas>
      </div>
      <div className="p-3 text-sm font-medium truncate">{file}</div>
    </Link>
  )
}