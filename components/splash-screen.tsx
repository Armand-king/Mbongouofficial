"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import Image from "next/image"
import styles from "@/styles/ProgressBar.module.css"

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 p-4">
            <Image
              src="./mbongou.jpeg"
              alt=" Mbongou.App Logo"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white"> Mbongou.App</h1>
          <p className="text-white/80 text-lg">Gérez votre budget intelligemment</p>
        </div>
        <div className="w-64 mx-auto">
      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}

          // Ici tu passes la variable CSS personnalisée --progress-width en React
          // Elle sera injectée dans la classe .progressBar qui l'utilise dans width: var(--progress-width);
          style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
      suppressHydrationWarning  />
      </div>
      <p className="text-white/60 text-sm mt-2">{progress}%</p>
    </div>
        </div>
      </div>
  )
}
