"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",              label: "Accueil",  icon: Home },
  { href: "/annonces",      label: "Explorer", icon: Search },
  { href: "/annonces/nouvelle", label: "Publier", icon: PlusCircle, special: true },
  { href: "/favoris",       label: "Favoris",  icon: Heart },
  { href: "/messagerie",    label: "Messages", icon: MessageCircle },
];

export function BottomNav() {
  const pathname = usePathname();
  const estPageAuth = pathname === "/connexion" || pathname === "/inscription";
  if (estPageAuth) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 sm:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, special }) => {
          const actif = pathname === href;

          if (special) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 transition-all active:scale-95">
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2 px-3 transition-colors"
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                actif ? "bg-green-50" : ""
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  actif ? "text-green-600" : "text-gray-400"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                actif ? "text-green-600" : "text-gray-400"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
