'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Equipamentos', href: '/equipamentos' },
    { name: 'Cardápios', href: '/cardapios' },
    { name: 'Clientes', href: '/clientes' },
  ]

  return (
    <aside className="bg-gray-100 w-64 h-full shadow-md">
      <SidebarHeader />
      <SidebarNavigation />
    </aside>
  )
}

function SidebarHeader() {
  return (
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold">Menu</h2>
    </div>
  )
}

function SidebarNavigation() {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/cardapios', label: 'Cardápios' },
    { href: '/clientes', label: 'Clientes' },
    { href: '/eventos', label: 'Eventos' },
    { href: '/produtos', label: 'Produtos' },
  ]

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block p-2 rounded hover:bg-gray-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
