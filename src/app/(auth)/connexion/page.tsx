"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ShoppingBag, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { envoyerOtpConnexion, verifierOtp } from "@/server/actions/auth";

export default function PageConnexion() {
  const router = useRouter();
  const [etape, setEtape] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerifier = useCallback(
    (code: string) => {
      startTransition(async () => {
        try {
          await verifierOtp(email, code);
          router.push("/");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Code incorrect");
          setOtp("");
        }
      });
    },
    [email, router]
  );

  // Auto-soumission quand les 6 chiffres sont saisis
  useEffect(() => {
    if (otp.length === 6 && etape === "otp" && !isPending) {
      handleVerifier(otp);
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleEnvoyer(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await envoyerOtpConnexion(email);
        setEtape("otp");
        setCountdown(60);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
      }
    });
  }

  function handleRenvoyer() {
    startTransition(async () => {
      try {
        await envoyerOtpConnexion(email);
        setCountdown(60);
        setOtp("");
        toast.success("Nouveau code envoyé !");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="flex justify-center pt-12 pb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-green-600">Séné</span>
            <span className="text-orange-500">Marché</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pt-4">
        <div className="w-full max-w-sm">

          {etape === "email" ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-7 space-y-6">
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-xl font-black text-gray-900">Connexion</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Entre ton email — on t&apos;envoie un code à 6 chiffres
                </p>
              </div>

              <form onSubmit={handleEnvoyer} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="toi@exemple.com"
                    className="h-12 rounded-xl border-gray-200 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-bold"
                  disabled={isPending}
                >
                  {isPending ? "Envoi en cours…" : "Recevoir mon code"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500">
                Pas encore de compte ?{" "}
                <Link href="/inscription" className="text-green-600 font-bold hover:underline">
                  S&apos;inscrire
                </Link>
              </p>
            </div>

          ) : (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-7 space-y-6">
              <div>
                <button
                  onClick={() => { setEtape("email"); setOtp(""); }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Changer d&apos;email
                </button>

                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-xl font-black text-gray-900">Vérifie ta boîte mail</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Code envoyé à{" "}
                  <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isPending}
                />

                <Button
                  onClick={() => handleVerifier(otp)}
                  className="w-full h-12 rounded-xl text-base font-bold"
                  disabled={isPending || otp.length < 6}
                >
                  {isPending ? "Vérification…" : "Confirmer le code"}
                </Button>
              </div>

              <div className="text-center space-y-2">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Renvoyer le code dans{" "}
                    <span className="font-semibold text-green-600">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleRenvoyer}
                    disabled={isPending}
                    className="flex items-center gap-1.5 mx-auto text-sm text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renvoyer le code
                  </button>
                )}
                <p className="text-xs text-gray-400">Le code expire dans 10 minutes</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
