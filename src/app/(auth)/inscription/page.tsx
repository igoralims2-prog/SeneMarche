"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, ShoppingBag, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { envoyerOtpInscription, verifierOtp } from "@/server/actions/auth";

type Etape = "form" | "otp";

export default function PageInscription() {
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>("form");
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
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
        await envoyerOtpInscription(email, nom);
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
        await envoyerOtpInscription(email, nom);
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

      {/* Indicateur d'étapes */}
      <div className="flex justify-center gap-2 mb-6">
        {(["form", "otp"] as Etape[]).map((e, i) => (
          <div
            key={e}
            className={`h-2 rounded-full transition-all duration-300 ${
              e === etape
                ? "w-8 bg-green-600"
                : (["form", "otp"] as Etape[]).indexOf(etape) > i
                  ? "w-4 bg-green-300"
                  : "w-4 bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex items-start justify-center px-6">
        <div className="w-full max-w-sm">

          {etape === "form" && (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-7 space-y-6">
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-xl font-black text-gray-900">Créer un compte</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Tu recevras un code à 6 chiffres par email
                </p>
              </div>

              <form onSubmit={handleEnvoyer} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                    Nom complet
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="nom"
                      type="text"
                      placeholder="Moussa Diallo"
                      className="h-12 pl-9 rounded-xl border-gray-200 text-base"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      minLength={2}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email-ins" className="text-sm font-semibold text-gray-700">
                    Adresse email
                  </Label>
                  <Input
                    id="email-ins"
                    type="email"
                    placeholder="toi@exemple.com"
                    className="h-12 rounded-xl border-gray-200 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-bold"
                  disabled={isPending || nom.trim().length < 2}
                >
                  {isPending ? "Envoi…" : "Créer mon compte"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link href="/connexion" className="text-green-600 font-bold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          )}

          {etape === "otp" && (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-7 space-y-6">
              <div>
                <button
                  onClick={() => { setEtape("form"); setOtp(""); }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Modifier mes informations
                </button>

                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-xl font-black text-gray-900">Vérifie ton email</h1>
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
                  {isPending ? "Création du compte…" : "Créer mon compte 🚀"}
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
