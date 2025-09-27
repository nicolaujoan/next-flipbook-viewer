import React from 'react'

export default function FolderLayout({ children, params }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-semibold capitalize">
          {params.folder} – Flipbooks
        </h1>
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer className="p-4 text-center text-gray-500">
        © {new Date().getFullYear()} My Flipbook Service
      </footer>
    </div>
  )
}
