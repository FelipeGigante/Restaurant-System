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
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-200/60 flex flex-col z-40">
      <div className="h-14 flex items-center px-5 border-b border-gray-200/60">
        <h1 className="text-base font-semibold text-gray-900">Buffet</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 h-8 rounded-md text-[13px] font-medium transition-all
                  ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
