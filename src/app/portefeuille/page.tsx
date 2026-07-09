import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWallet, getTransactions } from "@/server/queries/profil";
import { ModalRecharge } from "@/components/portefeuille/modal-recharge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { formatPrix } from "@/lib/utils";
import type { Transaction } from "@/lib/types/database.types";

const TYPE_CONFIG: Record<
  string,
  { label: string; icone: React.ReactNode; couleur: string; signe: string }
> = {
  deposit:    { label: "Recharge",     icone: <ArrowDownLeft className="h-4 w-4" />, couleur: "text-green-600", signe: "+" },
  withdrawal: { label: "Retrait",      icone: <ArrowUpRight className="h-4 w-4" />,  couleur: "text-red-600",   signe: "-" },
  payment:    { label: "Paiement",     icone: <ArrowUpRight className="h-4 w-4" />,  couleur: "text-red-600",   signe: "-" },
  refund:     { label: "Remboursement",icone: <ArrowDownLeft className="h-4 w-4" />, couleur: "text-green-600", signe: "+" },
  commission: { label: "Commission",   icone: <ArrowUpRight className="h-4 w-4" />,  couleur: "text-red-600",   signe: "-" },
};

const STATUT_BADGE: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed:    "bg-red-100 text-red-700",
};

export default async function PagePortefeuille() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const [wallet, transactions] = await Promise.all([
    getWallet(user.id),
    getTransactions(user.id, 30),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Carte solde */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-8">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Mon portefeuille</span>
          </div>
          <p className="text-4xl font-bold tracking-tight">
            {wallet ? formatPrix(wallet.balance) : "— F CFA"}
          </p>
          <p className="text-green-100 text-sm mt-1">Solde disponible</p>

          <div className="mt-6">
            <ModalRecharge />
          </div>
        </div>

        {/* Historique */}
        <div className="px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            Historique des transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">Aucune transaction pour le moment</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx: Transaction) => {
                const config = TYPE_CONFIG[tx.type] ?? {
                  label: tx.type,
                  icone: <RefreshCw className="h-4 w-4" />,
                  couleur: "text-gray-600",
                  signe: "",
                };
                return (
                  <li key={tx.id}>
                    <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                      <div className={`${config.couleur} bg-gray-50 rounded-full p-2`}>
                        {config.icone}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {tx.label ?? config.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString("fr-SN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${config.couleur}`}>
                          {config.signe}{formatPrix(tx.amount)}
                        </p>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${STATUT_BADGE[tx.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {tx.status === "pending" ? "En attente" : tx.status === "completed" ? "Validé" : "Échoué"}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="mt-0" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
