import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Register GSAP plugins once for the app (safe to call multiple times). */
export function registerGsapPlugins() {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}
