"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { updateClienteAction } from "@/app/actions/admin-clientes";

interface EditClienteModalProps {
  cliente: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditClienteModal({ cliente, onClose, onSuccess }: EditClienteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: cliente.full_name || "",
    phone: cliente.phone || "",
    city: cliente.city || "",
    subscription_plan: cliente.subscription_plan || "",
    subscription_status: cliente.subscription_status || "inactive",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Se alterou o plano para um válido, define automaticamente como Ativo
      if (name === "subscription_plan" && value !== "") {
        next.subscription_status = "active";
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateClienteAction(cliente.id, formData);
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao atualizar o cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">Editar Cliente</h2>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            {/* Nome Completo */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nome Completo</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Telefone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Telefone (WhatsApp)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Plano */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Plano</label>
                <select
                  name="subscription_plan"
                  value={formData.subscription_plan}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="">Nenhum</option>
                  <option value="Plano Gratuito">Plano Gratuito</option>
                  <option value="Plano Pró">Plano Pró</option>
                  <option value="Plano Indique e Ganhe">Plano Indique e Ganhe</option>
                </select>
                {formData.subscription_plan === "Plano Gratuito" && (
                  <p className="mt-2 rounded-lg bg-surface-muted p-2.5 text-xs text-ink-muted">
                    <strong className="font-semibold text-brand-600">Regra:</strong> 30 dias podendo gerar voucher.
                  </p>
                )}
                {formData.subscription_plan === "Plano Pró" && (
                  <p className="mt-2 rounded-lg bg-surface-muted p-2.5 text-xs text-ink-muted">
                    <strong className="font-semibold text-brand-600">Regra:</strong> Plano Anual com acesso completo, podendo gerar voucher.
                  </p>
                )}
                {formData.subscription_plan === "Plano Indique e Ganhe" && (
                  <p className="mt-2 rounded-lg bg-surface-muted p-2.5 text-xs text-ink-muted">
                    <strong className="font-semibold text-brand-600">Regra:</strong> Acesso completo desde que gere pelo menos 1 indicação com o link dele renovando automaticamente o acesso para gerar voucher.
                  </p>
                )}
              </div>

              {/* Status do Plano */}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Status Assinatura</label>
                <select
                  name="subscription_status"
                  value={formData.subscription_status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-ink/20 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="past_due">Atrasado</option>
                  <option value="canceled">Cancelado</option>
                </select>
              </div>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
