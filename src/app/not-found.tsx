import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function PageIntrouvable() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>

        <p className="text-7xl font-black text-green-600 mb-2">404</p>
        <h1 className="text-xl font-black text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-sm text-gray-500 mb-6">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
