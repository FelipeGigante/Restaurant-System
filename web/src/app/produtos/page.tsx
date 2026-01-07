'use client'

import { useEffect, useState } from 'react'
import { apiClient, API_URL } from '@/config/api'

interface Produto {
  id: string
  nome: string
  unidade: string
  estoqueAtual: number
  estoqueMinimo: number
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    unidade: 'kg',
    estoqueAtual: 0,
    estoqueMinimo: 0,
  })

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const data = await apiClient('/produtos')
      setProdutos(data)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient('/produtos', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setShowModal(false)
      setFormData({ nome: '', unidade: 'kg', estoqueAtual: 0, estoqueMinimo: 0 })
      fetchProdutos()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const getStatus = (atual: number, minimo: number) => {
    if (atual <= minimo) return { label: 'Crítico', color: 'bg-red-100 text-red-700' }
    if (atual <= minimo * 2) return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'OK', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
          <p className="text-[13px] text-gray-500 mt-1">Gerencie seu estoque</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-8 px-3 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800"
        >
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200/60 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-200/60">
            <tr>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase">
                Produto
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase">
                Unidade
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase">
                Estoque
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase">
                Mínimo
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produtos.map((p) => {
              const status = getStatus(p.estoqueAtual, p.estoqueMinimo)
              return (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-gray-900">{p.nome}</div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-gray-600">{p.unidade}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    {p.estoqueAtual}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-gray-500">{p.estoqueMinimo}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-200/60">
              <h2 className="text-base font-semibold text-gray-900">Novo Produto</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Unidade
                  </label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full h-9 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="kg">kg</option>
                    <option value="un">unidade</option>
                    <option value="litro">litro</option>
                    <option value="pacote">pacote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.estoqueAtual}
                    onChange={(e) =>
                      setFormData({ ...formData, estoqueAtual: parseFloat(e.target.value) })
                    }
                    className="w-full h-9 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.estoqueMinimo}
                  onChange={(e) =>
                    setFormData({ ...formData, estoqueMinimo: parseFloat(e.target.value) })
                  }
                  className="w-full h-9 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-9 px-3 border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 px-3 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
