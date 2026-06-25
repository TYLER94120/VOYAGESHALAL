'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/search', label: 'Recherche' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#1a3a2a] text-lg">◆</span>
            <span className="font-bold text-base tracking-widest text-[#1a3a2a] uppercase">
              Voyages<span className="text-[#c9a870]">Halal</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-[#1a3a2a] font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <span className="text-sm text-gray-400">FR · EN</span>
          </nav>

          <div className="hidden md:flex items-center">
            <Link
              href="/application"
              className="bg-[#1a3a2a] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#2d5a3d] transition-colors"
            >
              L'application
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-gray-700 hover:text-[#1a3a2a] font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/application"
              className="mt-3 block text-center bg-[#1a3a2a] text-white px-4 py-2 rounded-full text-sm font-semibold"
              onClick={() => setIsOpen(false)}
            >
              L'application
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
