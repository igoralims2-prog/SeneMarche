"use server";

import { createClient } from "@/lib/supabase/server";

export type InitierDepotPayload = {
  montant: number;
  telephone: string;
  provider: "wave" | "orange_money";
};

export async function initierDepot(payload: InitierDepotPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // TODO: Supabase — insérer un enregistrement payments en status 'pending'
  // puis appeler l'API PayTech/PayDunya avec le montant et le numéro
  // La route /api/paiements/webhook mettra à jour le statut via IPN

  // Simulation : on renvoie un objet factice
  return {
    success: true,
    message: `Demande de ${payload.montant} F CFA via ${payload.provider} envoyée au ${payload.telephone}. Tu recevras une confirmation par SMS.`,
  };
}
