// app/not-found/page.tsx

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden shadow-lg">
            <Image
              src="/mbongou.jpeg"
              alt="MBONGOU Logo"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Oups !
          </h1>
          <p className="text-muted-foreground">
        Désolé chers utilisateurs la page que vous recherchez est introuvable.
          </p>
        </div>

        <div className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-4 text-center">
          <h2 className="text-2xl font-semibold">Erreur 404</h2>
          <p className="text-muted-foreground">
            Il semblerait que cette page n'existe pas ou ait été déplacée.
          </p>
          <Link href="/" passHref>
            <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
