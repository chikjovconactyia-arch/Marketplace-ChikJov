"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, Building2, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateEmpresaAction } from "@/app/actions/admin-empresas";

interface Empresa {
  id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  active: boolean;
  is_featured: boolean | null;
  subscription_active: boolean | null;
  instagram: string | null;
}

interface EditEmpresaModalProps {
  empresa: Empresa;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function EditEmpresaModal({ empresa, isOpen, onClose, onSuccess }: EditEmpresaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: empresa.name || "",
    cnpj: empresa.cnpj || "",
    email: empresa.email || "",
    phone: empresa.phone || "",
    website: empresa.website || "",
    address: empresa.address || "",
    city: empresa.city || "",
    state: empresa.state || "",
    category: empresa.category || "",
    description: empresa.description || "",
    logo_url: empresa.logo_url || "",
    active: empresa.active,
    is_featured: empresa.is_featured ?? false,
    subscription_active: empresa.subscription_active ?? false,
    instagram: empresa.instagram || "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Limpa o instagram para salvar apenas o handle
      const sanitizedData = {
        ...formData,
        instagram: formData.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").replace(/^@/, "")
      };
      
      const res = await updateEmpresaAction(empresa.id, sanitizedData);
      if (res.ok) {
        onSuccess(res.message);
        onClose();
      } else {
        alert(res.message);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Editar Empresa</h2>
              <p className="text-xs text-white/70">Atualize as informações cadastrais</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Nome da Empresa</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="Ex: Restaurante do João"
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">CNPJ</label>
              <input
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="00.000.000/0000-00"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Email de Contato</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="contato@empresa.com"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Telefone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Categoria</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="Ex: Gastronomia"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Website</label>
              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="https://www.empresa.com"
              />
            </div>
            
            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider flex items-center gap-1.5">
                <Instagram className="h-3 w-3" /> Instagram
              </label>
              <input
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="@suaempresa"
              />
            </div>

            {/* Endereço */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Endereço Completo</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="Rua, número, bairro..."
              />
            </div>

            {/* Cidade */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Cidade</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="Ex: São Paulo"
              />
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Estado (UF)</label>
              <input
                name="state"
                maxLength={2}
                value={formData.state}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="Ex: SP"
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">URL do Logo</label>
              <input
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-[#E8E4F3] px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all"
                placeholder="https://link-da-imagem.com/logo.png"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-ink-subtle uppercase tracking-wider">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-[#E8E4F3] p-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50 transition-all resize-none"
                placeholder="Descreva brevemente a empresa..."
              />
            </div>

            {/* Toggles */}
            <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-[#E8E4F3] text-brand-600 focus:ring-brand-500 transition-all"
                />
                <span className="text-sm font-medium text-ink group-hover:text-brand-600">Empresa Ativa</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-[#E8E4F3] text-accent-600 focus:ring-accent-500 transition-all"
                />
                <span className="text-sm font-medium text-ink group-hover:text-accent-600">Destaque</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="subscription_active"
                  checked={formData.subscription_active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-[#E8E4F3] text-emerald-600 focus:ring-emerald-500 transition-all"
                />
                <span className="text-sm font-medium text-ink group-hover:text-emerald-600">Assinatura Ativa</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#F1ECF8] pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-2.5 text-sm font-bold text-ink-subtle hover:text-ink transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
