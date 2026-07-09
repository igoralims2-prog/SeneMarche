"use client";

import { useState, useTransition } from "react";
import { initierDepot } from "@/server/actions/portefeuille";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const MONTANTS_RAPIDES = [1000, 2000, 5000, 10000, 20000, 50000];

export function ModalRecharge() {
  const [ouvert, setOuvert] = useState(false);
  const [montant, setMontant] = useState("");
  const [telephone, setTelephone] = useState("");
  const [provider, setProvider] = useState<"wave" | "orange_money">("wave");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const montantNum = parseInt(montant, 10);
    if (!montantNum || montantNum < 500) return;

    startTransition(async () => {
      const res = await initierDepot({ montant: montantNum, telephone, provider });
      if (res.success) {
        setMessage(res.message);
        setMontant("");
      }
    });
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger
        render={
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <Plus className="h-4 w-4" />
            Recharger
          </Button>
        }
      />

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Recharger mon portefeuille</DialogTitle>
        </DialogHeader>

        {message ? (
          <div className="text-center py-4">
            <p className="text-green-700 font-medium text-sm">{message}</p>
            <Button
              className="mt-4 w-full bg-green-600 hover:bg-green-700"
              onClick={() => { setMessage(null); setOuvert(false); }}
            >
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Choix opérateur */}
            <div>
              <Label>Opérateur</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["wave", "orange_money"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setProvider(op)}
                    className={`border rounded-xl py-3 text-sm font-medium transition-colors ${
                      provider === op
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {op === "wave" ? "🌊 Wave" : "🟠 Orange Money"}
                  </button>
                ))}
              </div>
            </div>

            {/* Montants rapides */}
            <div>
              <Label>Montant (F CFA)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
                {MONTANTS_RAPIDES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMontant(String(m))}
                    className={`border rounded-lg py-2 text-xs font-medium transition-colors ${
                      montant === String(m)
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {m.toLocaleString("fr-SN")}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Autre montant"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                min={500}
                className="mt-1"
              />
            </div>

            {/* Numéro de téléphone */}
            <div>
              <Label htmlFor="telephone">Numéro de téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="77 123 45 67"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending || !montant || !telephone}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Envoi en cours…" : "Confirmer la recharge"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
