import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Ce handler utilise la clé service_role — jamais exposée au client
// TODO: Vérifier la signature HMAC de l'agrégateur avant de traiter
// Exemple PayTech : header "Hash" = SHA512(api_key + api_secret + params)

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, key);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  // TODO: Vérifier la signature HMAC de l'agrégateur ici
  // const signature = request.headers.get("Hash") ?? "";
  // if (!verifierSignature(signature, body)) {
  //   return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  // }

  const { ref_command, type_event } = body as {
    ref_command?: string;
    type_event?: string;
  };

  if (!ref_command || !type_event) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getServiceClient() as any;

  if (type_event === "sale_complete") {
    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount, user_id")
      .eq("provider_reference", ref_command)
      .eq("status", "pending")
      .single();

    if (payment) {
      await supabase
        .from("payments")
        .update({ status: "success", updated_at: new Date().toISOString() })
        .eq("id", payment.id);

      // TODO: appeler une fonction SQL SECURITY DEFINER pour créditer le wallet
      // afin d'éviter toute race condition sur le solde
      // await supabase.rpc("crediter_wallet", { p_user_id: payment.user_id, p_montant: payment.amount });
    }
  } else if (type_event === "sale_canceled") {
    await supabase
      .from("payments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("provider_reference", ref_command);
  }

  return NextResponse.json({ received: true });
}
