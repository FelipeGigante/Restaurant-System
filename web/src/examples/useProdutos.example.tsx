/**
 * Exemplo de como consumir a API do backend
 *
 * Este arquivo demonstra como fazer requisições à API
 * usando a configuração centralizada
 */

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/config/api';

interface Produto {
  id: number;
  nome: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export function ProdutosExample() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        const data = await apiClient('/produtos');
        setProdutos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Produtos</h1>
      <ul>
        {produtos.map((produto) => (
          <li key={produto.id}>
            {produto.nome} - Estoque: {produto.estoqueAtual} {produto.unidade}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Exemplo de POST request
export async function criarProduto(nome: string, unidade: string) {
  return apiClient('/produtos', {
    method: 'POST',
    body: JSON.stringify({ nome, unidade }),
  });
}

// Exemplo de PATCH request
export async function ajustarEstoque(id: number, quantidade: number, tipo: 'entrada' | 'saida') {
  return apiClient(`/produtos/${id}/estoque`, {
    method: 'PATCH',
    body: JSON.stringify({ quantidade, tipo }),
  });
}
