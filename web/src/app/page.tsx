'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/config/api'

interface Stats {
  eventos: number
  produtos: number
  assets: number
  clientes: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    eventos: 0,
    produtos: 0,
    assets: 0,
    clientes: 0,
  })

  useEffect(() => {
    apiClient('/eventos')
      .then((data) => setStats((prev) => ({ ...prev, eventos: data.length })))
      .catch((err) => console.error(err))

    apiClient('/produtos')
      .then((data) => setStats((prev) => ({ ...prev, produtos: data.length })))
      .catch((err) => console.error(err))

    apiClient('/assets')
      .then((data) => setStats((prev) => ({ ...prev, assets: data.length })))
      .catch((err) => console.error(err))

    apiClient('/clientes')
      .then((data) => setStats((prev) => ({ ...prev, clientes: data.length })))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Início</h1>
        <p className="text-[13px] text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Eventos', value: stats.eventos, href: '/eventos' },
          { label: 'Produtos', value: stats.produtos, href: '/produtos' },
          { label: 'Equipamentos', value: stats.assets, href: '/equipamentos' },
          { label: 'Clientes', value: stats.clientes, href: '/clientes' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg border border-gray-200/60 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="text-[13px] text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Próximos Eventos */}
      <div className="bg-white rounded-lg border border-gray-200/60">
        <div className="px-5 py-3 border-b border-gray-200/60">
          <h3 className="text-sm font-medium text-gray-900">Próximos Eventos</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-900">Casamento Maria e José</div>
              <div className="text-[13px] text-gray-500 mt-0.5">15 de Março • 100 pessoas</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-[11px] font-medium">
                PLANEJADO
              </span>
              <Link
                href="/eventos"
                className="text-[13px] text-gray-600 hover:text-gray-900"
              >
                Ver →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-white rounded-lg border border-gray-200/60">
        <div className="px-5 py-3 border-b border-gray-200/60">
          <h3 className="text-sm font-medium text-gray-900">Alertas de Estoque</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-md">
            <div className="w-1 h-full bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-red-900">Picanha - Estoque Baixo</div>
              <div className="text-[13px] text-red-700/70 mt-0.5">Apenas 20kg disponíveis</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-yellow-50/50 rounded-md">
            <div className="w-1 h-full bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-yellow-900">Guardanapos - Atenção</div>
              <div className="text-[13px] text-yellow-700/70 mt-0.5">100 pacotes disponíveis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
