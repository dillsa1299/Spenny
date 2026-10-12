import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { registerGsapPlugins } from '@/lib/gsap'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type SmoothScrollProviderProps = {
  children: ReactNode
}

/**
 * Lenis smooth scroll with GSAP ScrollTrigger sync (React Bits / GSAP-friendly setup).
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    registerGsapPlugins()

    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return children
}
