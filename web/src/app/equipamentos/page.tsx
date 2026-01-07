'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/config/api'

interface Asset {
  id: string
  nome: string
  tipo: string
  quantidadeTotal: number
  quantidadeDisponivel: number
}

export default function EquipamentosPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'EQUIPAMENTO',
    quantidadeTotal: 0,
  })

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const data = await apiClient('/assets')
      setAssets(data)
    } catch (error) {
      console.error('Erro ao buscar assets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient('/assets', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setShowModal(false)
      setFormData({ nome: '', tipo: 'EQUIPAMENTO', quantidadeTotal: 0 })
      fetchAssets()
    } catch (error) {
      console.error('Erro ao criar asset:', error)
    }
  }

  const getDisponibilidadeColor = (disponivel: number, total: number) => {
    const percentual = (disponivel / total) * 100
    if (percentual <= 30) return 'text-red-600 bg-red-50'
    if (percentual <= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipamentos e Utensílios</h1>
          <p className="text-gray-500 mt-1">
            Gerencie equipamentos e utensílios do buffet
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-white rounded-lg transition-colors font-medium"
          style={{ backgroundColor: '#ff4800' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#e63f00')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#ff4800')
          }
        >
          + Novo Item
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Total de Itens</div>
          <div className="text-2xl font-bold">{assets.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Equipamentos</div>
          <div className="text-2xl font-bold">
            {assets.filter((a) => a.tipo === 'EQUIPAMENTO').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Utensílios</div>
          <div className="text-2xl font-bold">
            {assets.filter((a) => a.tipo === 'UTENSILIO').length}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponível
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{asset.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      asset.tipo === 'EQUIPAMENTO'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {asset.tipo === 'EQUIPAMENTO' ? 'Equipamento' : 'Utensílio'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  {asset.quantidadeTotal}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  {asset.quantidadeDisponivel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDisponibilidadeColor(
                      asset.quantidadeDisponivel,
                      asset.quantidadeTotal
                    )}`}
                  >
                    {asset.quantidadeDisponivel === asset.quantidadeTotal
                      ? 'Todos disponíveis'
                      : `${Math.round(
                          (asset.quantidadeDisponivel / asset.quantidadeTotal) *
                            100
                        )}% disponível`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Novo Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                >
                  <option value="EQUIPAMENTO">Equipamento</option>
                  <option value="UTENSILIO">Utensílio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantidade Total
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantidadeTotal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantidadeTotal: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#ff4800' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#e63f00')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#ff4800')
                  }
                >
                  Criar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
