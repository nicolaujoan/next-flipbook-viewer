// app/layout.jsx
import React from "react"
import "./_styles/globals.css" // if you use Tailwind/global styles

export const metadata = {
  title: "My Flipbook Service",
  description: "Online flippingbook viewer",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  )
}