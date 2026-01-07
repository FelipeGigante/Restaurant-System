'use client'

import { useEffect, useState } from 'react'

interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  createdAt: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const res = await fetch('http://localhost:3000/clientes')
      const data = await res.json()
      setClientes(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:3000/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email || undefined,
          telefone: formData.telefone || undefined,
        }),
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ nome: '', email: '', telefone: '' })
        fetchClientes()
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie sua carteira de clientes</p>
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
          + Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Total de Clientes</div>
          <div className="text-2xl font-bold">{clientes.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Com Email</div>
          <div className="text-2xl font-bold">
            {clientes.filter((c) => c.email).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Com Telefone</div>
          <div className="text-2xl font-bold">
            {clientes.filter((c) => c.telefone).length}
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: '#ff4800' }}
              >
                {cliente.nome
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {cliente.nome}
                </h3>
                <div className="space-y-1 mt-2">
                  {cliente.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📱</span>
                      <span>{cliente.telefone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <span>📅</span>
                    <span>Desde {formatDate(cliente.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                className="text-sm font-medium transition-colors w-full text-left"
                style={{ color: '#ff4800' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = '#e63f00')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = '#ff4800')
                }
              >
                Ver Eventos →
              </button>
            </div>
          </div>
        ))}
      </div>

      {clientes.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-gray-500 mb-6">
            Comece adicionando clientes para gerenciar seus eventos
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
            Adicionar Primeiro Cliente
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Novo Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#ff4800' } as React.CSSProperties}
                  placeholder="(11) 99999-9999"
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
                  Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
