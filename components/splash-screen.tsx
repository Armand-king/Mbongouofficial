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
        <div className="w-full max-w-md mx-auto my-6">
  <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
    <div
      className="h-4 rounded-full transition-all duration-500"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(to right, #16a34a, #2563eb)" // vert -> bleu
      }}
    />
  </div>
  <div className="text-center text-sm mt-1 text-blue-700 dark:text-blue-300 font-semibold">
    {progress}%
  </div>
</div>
      </div>
    </div>
  )
}
