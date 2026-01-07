'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/config/api'

interface Menu {
  id: string
  nome: string
  descricao: string | null
  produtos: Array<{
    produto: {
      nome: string
      unidade: string
    }
    quantidadePorPessoa: number
  }>
  assets: Array<{
    asset: {
      nome: string
    }
    tipo: string
    quantidade: number
  }>
}

export default function CardapiosPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  })

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const data = await apiClient('/menus')
      setMenus(data)
    } catch (error) {
      console.error('Erro ao buscar menus:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient('/menus', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setShowModal(false)
      setFormData({ nome: '', descricao: '' })
      fetchMenus()
    } catch (error) {
      console.error('Erro ao criar menu:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cardápios</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os cardápios e receitas do buffet
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
          + Novo Cardápio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white shadow-md rounded-md p-4"
          >
            <h2 className="text-lg font-semibold">{menu.nome}</h2>
            {menu.descricao && (
              <p className="text-gray-600 mb-4">{menu.descricao}</p>
            )}

            <div className="space-y-4">
              {/* Produtos */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📦</span>
                  <span>Ingredientes ({menu.produtos.length})</span>
                </h4>
                {menu.produtos.length > 0 ? (
                  <ul className="space-y-2">
                    {menu.produtos.slice(0, 3).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded"
                      >
                        <span className="text-gray-700">
                          {item.produto.nome}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {item.quantidadePorPessoa} {item.produto.unidade}/pessoa
                        </span>
                      </li>
                    ))}
                    {menu.produtos.length > 3 && (
                      <li className="text-xs text-gray-500 pl-3">
                        +{menu.produtos.length - 3} mais...
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Nenhum ingrediente cadastrado
                  </p>
                )}
              </div>

              {/* Assets */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🔧</span>
                  <span>Equipamentos ({menu.assets.length})</span>
                </h4>
                {menu.assets.length > 0 ? (
                  <ul className="space-y-2">
                    {menu.assets.slice(0, 3).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded"
                      >
                        <span className="text-gray-700">
                          {item.asset.nome}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {item.tipo === 'PER_PERSON'
                            ? `${item.quantidade}/pessoa`
                            : `${item.quantidade}/evento`}
                        </span>
                      </li>
                    ))}
                    {menu.assets.length > 3 && (
                      <li className="text-xs text-gray-500 pl-3">
                        +{menu.assets.length - 3} mais...
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Nenhum equipamento cadastrado
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {menus.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">
            Nenhum cardápio cadastrado
          </h3>
          <p className="text-gray-500 mb-6">
            Crie cardápios personalizados com ingredientes e equipamentos
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block px-6 py-3 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: '#ff4800' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#e63f00')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#ff4800')
            }
          >
            Criar Primeiro Cardápio
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Novo Cardápio</h2>
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
                  placeholder="Ex: Churrasco Premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                  rows={3}
                  placeholder="Descreva o cardápio..."
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 Após criar o cardápio, você poderá adicionar ingredientes e
                  equipamentos na página de detalhes.
                </p>
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
                  Criar Cardápio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
