"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, MessageCircle, User, LogIn, PlusCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HeaderProps = { estConnecte: boolean };

export function Header({ estConnecte }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const estPageAuth = pathname === "/connexion" || pathname === "/inscription";
  if (estPageAuth) return null;

  function handleRecherche(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
    if (q) router.push(`/annonces?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-1.5">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">
            <span className="text-green-600">Séné</span>
            <span className="text-orange-500">Marché</span>
          </span>
        </Link>

        {/* Recherche desktop */}
        <form onSubmit={handleRecherche} className="flex-1 hidden sm:block max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="q"
              placeholder="Rechercher une annonce…"
              className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white rounded-xl text-sm"
            />
          </div>
        </form>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {estConnecte ? (
            <>
              <Link href="/annonces/nouvelle">
                <Button
                  size="sm"
                  className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold h-9 px-4"
                >
                  <PlusCircle className="h-4 w-4" />
                  Publier
                </Button>
              </Link>
              <Link href="/messagerie">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-50">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profil">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-50">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/connexion">
              <Button size="sm" className="gap-1.5 rounded-xl h-9 bg-green-600 hover:bg-green-700 text-white font-semibold">
                <LogIn className="h-4 w-4" />
                <span>Connexion</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Recherche mobile */}
      <form onSubmit={handleRecherche} className="px-4 pb-2.5 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="q"
            placeholder="Rechercher…"
            className="pl-9 h-9 bg-gray-50 border-gray-200 rounded-xl text-sm"
          />
        </div>
      </form>
    </header>
  );
}
