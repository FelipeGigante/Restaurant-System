'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/config/api'

interface Evento {
  id: string
  nome: string
  data: string
  cidade: string
  participantes: number
  status: string
  cliente: {
    nome: string
  }
  menu?: {
    nome: string
  }
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])

  useEffect(() => {
    fetchEventos()
  }, [])

  const fetchEventos = async () => {
    try {
      const data = await apiClient('/eventos')
      setEventos(data)
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PLANNED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      CLOSED: 'bg-green-100 text-green-700',
      CANCELED: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      PLANNED: 'Planejado',
      IN_PROGRESS: 'Em Andamento',
      CLOSED: 'Fechado',
      CANCELED: 'Cancelado',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus eventos e planejamentos</p>
        </div>
        <Link
          href="/eventos/novo"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          + Novo Evento
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-card rounded-lg border border-border hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{evento.nome}</h3>
                  <p className="text-sm text-gray-500">{evento.cliente.nome}</p>
                </div>
                {getStatusBadge(evento.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📅</span>
                  <span>{formatDate(evento.data)}</span>
                </div>
                {evento.cidade && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <span>{evento.cidade}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">👥</span>
                  <span>{evento.participantes} participantes</span>
                </div>
                {evento.menu && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📋</span>
                    <span>{evento.menu.nome}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-border">
              <Link
                href={`/eventos/${evento.id}`}
                className="text-primary-500 hover:text-primary-600 font-medium text-sm"
              >
                Ver Detalhes →
              </Link>
              {evento.status === 'DRAFT' && (
                <button
                  onClick={() => {
                    /* Planejar evento */
                  }}
                  className="px-3 py-1 bg-primary-500 text-white rounded text-xs font-medium hover:bg-primary-600 transition-colors"
                >
                  Planejar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {eventos.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum evento cadastrado</h3>
          <p className="text-gray-500 mb-6">
            Comece criando seu primeiro evento para gerenciar seu buffet
          </p>
          <Link
            href="/eventos/novo"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Criar Primeiro Evento
          </Link>
        </div>
      )}
    </div>
  )
}
