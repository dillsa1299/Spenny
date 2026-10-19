// Hero headline animation (React Bits–style blur reveal) using GSAP; no Club SplitText plugin required.
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

type BlurTextProps = {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'p' | 'span'
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function BlurText({ text, className, as = 'h1' }: BlurTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { filter: 'blur(0px)', opacity: 1, y: 0 })
      return
    }

    gsap.fromTo(
      el,
      { filter: 'blur(14px)', opacity: 0, y: 16 },
      {
        filter: 'blur(0px)',
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power2.out',
      },
    )
  }, [text])

  const Tag = as

  return (
    <Tag ref={ref as never} className={className}>
      {text}
    </Tag>
  )
}
