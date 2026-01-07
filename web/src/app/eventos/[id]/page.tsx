'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
    produtos: Array<{
      produto: { nome: string; unidade: string }
      quantidadePorPessoa: number
    }>
    assets: Array<{
      asset: { nome: string }
      tipo: string
      quantidade: number
    }>
  }
}

interface PlanejamentoResponse {
  checklistCompras: Array<{
    produto: string
    quantidade: number
    unidade: string
  }>
  checklistLevar: {
    produtos: Array<{
      produto: string
      quantidade: number
      unidade: string
    }>
    assets: Array<{
      asset: string
      tipo: string
      quantidade: number
    }>
  }
  warnings: string[]
}

export default function EventoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [planejamento, setPlanejamento] = useState<PlanejamentoResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchEvento()
    }
  }, [params.id])

  const fetchEvento = async () => {
    try {
      const res = await fetch(`http://localhost:3000/eventos/${params.id}`)
      const data = await res.json()
      setEvento(data)
    } catch (error) {
      console.error('Erro ao buscar evento:', error)
    }
  }

  const handlePlanejar = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/eventos/${params.id}/planejar`, {
        method: 'POST',
      })
      const data = await res.json()
      setPlanejamento(data)
      fetchEvento()
    } catch (error) {
      console.error('Erro ao planejar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFechar = async () => {
    if (!confirm('Deseja realmente fechar este evento?')) return

    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/eventos/${params.id}/fechar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sobras: [],
          perdas: [],
        }),
      })
      if (res.ok) {
        alert('Evento fechado com sucesso!')
        fetchEvento()
      }
    } catch (error) {
      console.error('Erro ao fechar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!evento) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 mb-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold">{evento.nome}</h1>
          <p className="text-gray-500 mt-1">{evento.cliente.nome}</p>
        </div>
        <div className="flex gap-3">
          {evento.status === 'DRAFT' && (
            <button
              onClick={handlePlanejar}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Planejando...' : '🎯 Planejar Evento'}
            </button>
          )}
          {evento.status === 'PLANNED' && (
            <button
              onClick={handleFechar}
              disabled={loading}
              className="px-6 py-3 bg-secondary-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Fechando...' : '✅ Fechar Evento'}
            </button>
          )}
        </div>
      </div>

      {/* Informações do Evento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-gray-500 mb-1">Data do Evento</div>
          <div className="text-xl font-semibold">
            {new Date(evento.data).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-gray-500 mb-1">Participantes</div>
          <div className="text-xl font-semibold">{evento.participantes} pessoas</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-gray-500 mb-1">Status</div>
          <div className="text-xl font-semibold capitalize">{evento.status}</div>
        </div>
      </div>

      {/* Planejamento */}
      {planejamento && (
        <div className="space-y-6">
          {planejamento.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Alertas</h3>
              <ul className="space-y-2">
                {planejamento.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checklist de Compras */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold">🛒 Checklist de Compras</h3>
              </div>
              <div className="p-6">
                {planejamento.checklistCompras.length > 0 ? (
                  <ul className="space-y-3">
                    {planejamento.checklistCompras.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <span className="font-medium">{item.produto}</span>
                        <span className="text-sm text-gray-600">
                          {item.quantidade} {item.unidade}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    ✅ Todos os itens em estoque!
                  </p>
                )}
              </div>
            </div>

            {/* Checklist do que levar */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold">📦 Checklist do que Levar</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Produtos</h4>
                  <ul className="space-y-2">
                    {planejamento.checklistLevar.produtos.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <span>{item.produto}</span>
                        <span className="text-gray-600">
                          {item.quantidade} {item.unidade}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Equipamentos</h4>
                  <ul className="space-y-2">
                    {planejamento.checklistLevar.assets.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <span>{item.asset}</span>
                        <span className="text-gray-600">{item.quantidade}x</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu do Evento */}
      {evento.menu && (
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">📋 Cardápio: {evento.menu.nome}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Ingredientes por Pessoa</h4>
                <ul className="space-y-2">
                  {evento.menu.produtos.map((item, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span>{item.produto.nome}</span>
                      <span className="text-gray-600">
                        {item.quantidadePorPessoa} {item.produto.unidade}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Equipamentos Necessários</h4>
                <ul className="space-y-2">
                  {evento.menu.assets.map((item, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span>{item.asset.nome}</span>
                      <span className="text-gray-600">
                        {item.tipo === 'PER_PERSON'
                          ? `${item.quantidade} por pessoa`
                          : `${item.quantidade} por evento`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
