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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-[13px] text-gray-500 mt-1">Gerencie seu estoque</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-4 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800"
        >
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((p) => {
          const status = getStatus(p.estoqueAtual, p.estoqueMinimo)
          return (
            <div key={p.id} className="bg-white shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold">{p.nome}</h2>
              <p className="text-gray-600">{`Unidade: ${p.unidade}`}</p>
              <p className="text-gray-900 font-medium">{`Estoque Atual: ${p.estoqueAtual}`}</p>
              <p className="text-gray-500">{`Estoque Mínimo: ${p.estoqueMinimo}`}</p>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-[11px] font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          )
        })}
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
                  className="w-full h-10 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                    className="w-full h-10 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                    className="w-full h-10 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
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
                  className="w-full h-10 px-3 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 px-3 bg-gray-900 text-white rounded-md text-[13px] font-medium hover:bg-gray-800"
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
