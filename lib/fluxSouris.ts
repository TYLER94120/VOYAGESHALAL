'use client'
import { useEffect, type RefObject } from 'react'
import { brancherFluxSouris } from './fluxSouris.mjs'

// Le crochet React n'est qu'un branchement : toute la logique vit dans
// lib/fluxSouris.mjs, pour que le banc d'essai du navigateur
// (scripts/test-swipe-pc.mjs) charge le code RÉELLEMENT livré.
export function useFluxSouris(ref: RefObject<HTMLElement | null>) {
  useEffect(() => brancherFluxSouris(ref.current), [ref])
}
