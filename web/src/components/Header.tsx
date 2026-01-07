'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200/60 h-14 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      <input
        type="search"
        placeholder="Buscar..."
        className="w-64 h-8 px-3 text-[13px] bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all"
      />

      <Link
        href="/eventos/novo"
        className="h-8 px-3 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center"
      >
        Novo Evento
      </Link>
    </header>
  )
}
