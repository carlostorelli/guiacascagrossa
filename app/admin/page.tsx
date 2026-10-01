'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Product, AdminStats } from '@/types';
import {
  BarChart3,
  Users,
  FileText,
  MousePointerClick,
  Flame,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Download,
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'import'>('dashboard');

  // Modal State for Editing / Creating Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Import State
  const [importPreview, setImportPreview] = useState<Partial<Product>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fetchStatsAndProducts = async () => {
    try {
      const [resStats, resProds] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/products'),
      ]);

      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data.stats);
      }

      if (resProds.ok) {
        const data = await resProds.json();
        setProducts(data.products || []);
      }
    } catch {
      // quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndProducts();
  }, []);

  // Save product edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchStatsAndProducts();
      }
    } catch (err) {
      alert('Erro ao salvar produto');
    }
  };

  // Toggle active product
  const handleToggleActive = async (p: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, active: !p.active }),
      });
      if (res.ok) fetchStatsAndProducts();
    } catch {
      // quiet fail
    }
  };

  // Handle Excel/CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        // Map columns flexibly
        const mapped: Partial<Product>[] = json.map((row, index) => {
          const name = row['Nome'] || row['Nome do Suplemento'] || row['Produto'] || row['name'] || '';
          const brand = row['Marca'] || row['brand'] || (row['Link']?.includes('oficialfarma') ? 'Oficial Farma' : 'Growth Supplements');
          const indication = row['Indicação'] || row['Indicaçao'] || row['indication'] || '';
          const usage = row['Como Tomar'] || row['Como tomar'] || row['usage_instruction'] || '';
          const link = row['Link'] || row['link'] || row['URL'] || '';
          const category = row['Categoria'] || row['category'] || 'Suplementos';
          const coupon = row['Cupom'] || 'BRIGADEIRO';

          return {
            name,
            brand,
            brand_id: brand.toLowerCase().includes('oficial') ? 'oficial-farma' : 'growth-supplements',
            indication,
            usage_instruction: usage,
            url: link,
            category,
            coupon,
            active: true,
            priority: 5,
          };
        }).filter((item) => Boolean(item.name));

        setImportPreview(mapped);
      } catch (err) {
        alert('Erro ao interpretar arquivo CSV/XLSX');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Commit imported rows
  const handleCommitImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: importPreview }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportSuccess(`Importação concluída: ${data.added} adicionados, ${data.updated} atualizados.`);
        setImportPreview([]);
        fetchStatsAndProducts();
      } else {
        alert(data.error || 'Erro na importação');
      }
    } catch {
      alert('Erro na requisição');
    } finally {
      setImporting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.indication.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292F33] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#B6FF3B]">
              <ShieldCheck className="w-4 h-4 text-[#B6FF3B]" />
              <span>Painel de Controle Oficial</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#F5F7F8]">
              Administração de Catálogo & Métricas
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-[#111416] p-1.5 rounded-xl border border-[#292F33]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#B6FF3B] text-[#080A0B]'
                  : 'text-[#929A9F] hover:text-[#F5F7F8]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#B6FF3B] text-[#080A0B]'
                  : 'text-[#929A9F] hover:text-[#F5F7F8]'
              }`}
            >
              Produtos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-[#B6FF3B] text-[#080A0B]'
                  : 'text-[#929A9F] hover:text-[#F5F7F8]'
              }`}
            >
              Importar Planilha
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD METRICS */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#929A9F]">
                  <span className="text-xs uppercase font-bold tracking-wide">Guias Gerados</span>
                  <FileText className="w-4 h-4 text-[#B6FF3B]" />
                </div>
                <div className="text-3xl font-black text-[#F5F7F8] font-mono">
                  {stats.totalGuides}
                </div>
                <div className="text-[11px] text-[#929A9F]">Planos nutricionais emitidos</div>
              </div>

              <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#929A9F]">
                  <span className="text-xs uppercase font-bold tracking-wide">Cliques Totais</span>
                  <MousePointerClick className="w-4 h-4 text-[#B6FF3B]" />
                </div>
                <div className="text-3xl font-black text-[#F5F7F8] font-mono">
                  {stats.totalClicks}
                </div>
                <div className="text-[11px] text-[#929A9F]">Redirecionamentos para lojas</div>
              </div>

              <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#929A9F]">
                  <span className="text-xs uppercase font-bold tracking-wide">Cópia de Cupom</span>
                  <Flame className="w-4 h-4 text-[#B6FF3B] fill-[#B6FF3B]" />
                </div>
                <div className="text-3xl font-black text-[#B6FF3B] font-mono">
                  {stats.couponCopies}
                </div>
                <div className="text-[11px] text-[#929A9F]">Cliques em &quot;Copiar Cupom&quot;</div>
              </div>

              <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-[#929A9F]">
                  <span className="text-xs uppercase font-bold tracking-wide">PDFs Baixados</span>
                  <Download className="w-4 h-4 text-[#B6FF3B]" />
                </div>
                <div className="text-3xl font-black text-[#F5F7F8] font-mono">
                  {stats.totalPdfs}
                </div>
                <div className="text-[11px] text-[#929A9F]">Guias impressos / salvos</div>
              </div>
            </div>

            {/* Clicks Breakdown by Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-black uppercase text-[#F5F7F8]">
                  Conversão Comercial por Marca
                </h3>
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Growth Supplements</span>
                      <span className="font-mono text-[#B6FF3B]">{stats.growthClicks} cliques</span>
                    </div>
                    <div className="w-full bg-[#181C1F] h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-[#B6FF3B] h-full rounded-full"
                        style={{
                          width: `${
                            stats.totalClicks > 0
                              ? (stats.growthClicks / stats.totalClicks) * 100
                              : 50
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Oficial Farma</span>
                      <span className="font-mono text-[#B6FF3B]">{stats.oficialFarmaClicks} cliques</span>
                    </div>
                    <div className="w-full bg-[#181C1F] h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7be600] h-full rounded-full"
                        style={{
                          width: `${
                            stats.totalClicks > 0
                              ? (stats.oficialFarmaClicks / stats.totalClicks) * 100
                              : 50
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Recommended Products */}
              <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-black uppercase text-[#F5F7F8]">
                  Produtos Mais Recomendados pelo Motor
                </h3>
                <div className="space-y-2 pt-1">
                  {stats.topRecommendedProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-[#181C1F] p-2.5 rounded-lg border border-[#292F33]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#B6FF3B]">#{idx + 1}</span>
                        <span className="font-bold text-[#F5F7F8]">{p.name}</span>
                        <span className="text-[10px] text-[#929A9F]">({p.brand})</span>
                      </div>
                      <span className="font-mono font-extrabold text-[#B6FF3B] bg-[#111416] px-2 py-0.5 rounded border border-[#292F33]">
                        {p.count} indicações
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#929A9F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtrar por nome ou marca..."
                  className="w-full bg-[#111416] border border-[#292F33] focus:border-[#B6FF3B] text-xs text-[#F5F7F8] pl-9 pr-4 py-2 rounded-xl outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    brand: 'Growth Supplements',
                    brand_id: 'growth-supplements',
                    category: 'Suplementos',
                    indication: '',
                    usage_instruction: '',
                    url: '',
                    coupon: 'BRIGADEIRO',
                    priority: 5,
                    active: true,
                  });
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Produto</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-[#111416] border border-[#292F33] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#F5F7F8]">
                  <thead className="bg-[#181C1F] text-[#929A9F] uppercase text-[10px] tracking-wider border-b border-[#292F33]">
                    <tr>
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4">Marca</th>
                      <th className="py-3 px-4">Indicação</th>
                      <th className="py-3 px-4">Como Tomar</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181C1F]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#181C1F]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#F5F7F8]">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-[#929A9F]">{p.brand}</td>
                        <td className="py-3 px-4 text-[#929A9F] max-w-xs truncate">
                          {p.indication || 'Informação não cadastrada'}
                        </td>
                        <td className="py-3 px-4 text-[#929A9F] max-w-xs truncate">
                          {p.usage_instruction || 'Informação não cadastrada'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              p.active
                                ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30'
                                : 'bg-[#292F33] text-[#929A9F]'
                            }`}
                          >
                            {p.active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#181C1F] hover:bg-[#292F33] text-[#F5F7F8] cursor-pointer"
                            title="Editar produto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#181C1F] hover:bg-[#292F33] text-[#B6FF3B] inline-block"
                              title="Abrir URL oficial"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IMPORT CATALOG */}
        {activeTab === 'import' && (
          <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase text-[#F5F7F8]">
                Importador de Catálogo (CSV / XLSX)
              </h2>
              <p className="text-xs text-[#929A9F]">
                Carregue uma planilha de suplementos para atualizar links, indicações e produtos sem alterar código.
              </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-[#292F33] hover:border-[#B6FF3B]/50 rounded-2xl p-8 text-center space-y-4 transition-all">
              <Upload className="w-10 h-10 text-[#B6FF3B] mx-auto" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#F5F7F8]">
                  Selecione um arquivo .xlsx ou .csv
                </div>
                <div className="text-xs text-[#929A9F]">
                  Mapeamento automático de: Nome, Marca, Indicação, Como Tomar, Link, Cupom
                </div>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase px-5 py-2.5 rounded-xl cursor-pointer">
                  <span>Escolher Arquivo</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Success Message */}
            {importSuccess && (
              <div className="p-4 rounded-xl bg-[#B6FF3B]/10 border border-[#B6FF3B]/40 text-[#B6FF3B] text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#181C1F]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-[#F5F7F8]">
                    Pré-visualização da Importação ({importPreview.length} produtos encontrados)
                  </h3>
                  <button
                    disabled={importing}
                    onClick={handleCommitImport}
                    className="bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase px-6 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {importing ? 'Importando...' : 'Confirmar e Salvar no Catálogo'}
                  </button>
                </div>

                <div className="bg-[#181C1F] border border-[#292F33] rounded-xl overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111416] text-[#929A9F] text-[10px] uppercase border-b border-[#292F33]">
                      <tr>
                        <th className="py-2.5 px-3">Nome</th>
                        <th className="py-2.5 px-3">Marca</th>
                        <th className="py-2.5 px-3">Indicação</th>
                        <th className="py-2.5 px-3">Como Tomar</th>
                        <th className="py-2.5 px-3">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#292F33] text-[#F5F7F8]">
                      {importPreview.slice(0, 10).map((r, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-bold">{r.name}</td>
                          <td className="py-2 px-3 text-[#929A9F]">{r.brand}</td>
                          <td className="py-2 px-3 text-[#929A9F] max-w-xs truncate">{r.indication}</td>
                          <td className="py-2 px-3 text-[#929A9F] max-w-xs truncate">{r.usage_instruction}</td>
                          <td className="py-2 px-3 text-[#B6FF3B] max-w-xs truncate">{r.url || '(sem link)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: EDIT / CREATE PRODUCT */}
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 bg-[#080A0B]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111416] border border-[#292F33] rounded-3xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#292F33] pb-4">
                <h3 className="text-base font-black uppercase text-[#F5F7F8]">
                  {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#929A9F] hover:text-[#F5F7F8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[#929A9F] font-bold">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] p-2.5 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#929A9F] font-bold">Marca</label>
                    <select
                      value={editingProduct.brand_id || 'growth-supplements'}
                      onChange={(e) => {
                        const bId = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          brand_id: bId,
                          brand: bId === 'oficial-farma' ? 'Oficial Farma' : 'Growth Supplements',
                        });
                      }}
                      className="w-full bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] p-2.5 rounded-xl outline-none"
                    >
                      <option value="growth-supplements">Growth Supplements</option>
                      <option value="oficial-farma">Oficial Farma</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#929A9F] font-bold">Cupom Oficial</label>
                    <input
                      type="text"
                      value={editingProduct.coupon || 'BRIGADEIRO'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, coupon: e.target.value })}
                      className="w-full bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] p-2.5 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#929A9F] font-bold">Link Oficial (URL)</label>
                  <input
                    type="url"
                    value={editingProduct.url || ''}
                    placeholder="https://..."
                    onChange={(e) => setEditingProduct({ ...editingProduct, url: e.target.value })}
                    className="w-full bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] p-2.5 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#929A9F] font-bold">Indicação no Catálogo</label>
                  <textarea
                    rows={2}
                    value={editingProduct.indication || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, indication: e.target.value })}
                    className="w-full bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] p-2.5 rounded-xl outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#929A9F] font-bold">Como Tomar (Instrução)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.usage_instruction || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, usage_instruction: e.target.value })}
                    className="w-full bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] p-2.5 rounded-xl outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#292F33]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#181C1F] text-[#929A9F] font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#B6FF3B] text-[#080A0B] font-black uppercase neon-glow"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
