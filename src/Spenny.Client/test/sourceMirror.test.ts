// Ensures every src module has a mirrored test file under test/ (excluding this support tree).
import { existsSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = path.join(clientRoot, 'src')
const testRoot = path.join(clientRoot, 'test')

function walkSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []
  for (const name of entries) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      files.push(...walkSourceFiles(full))
      continue
    }
    if (!/\.(ts|tsx)$/.test(name) || name.endsWith('.d.ts')) {
      continue
    }
    files.push(full)
  }
  return files
}

function hasMirroredTest(relativeFromSrc: string): boolean {
  const base = relativeFromSrc.replace(/\.(tsx?)$/, '')
  return (
    existsSync(path.join(testRoot, `${base}.test.ts`)) ||
    existsSync(path.join(testRoot, `${base}.test.tsx`))
  )
}

describe('test folder mirrors src', () => {
  it('every file under src/ has test/<same-path>.test.ts(x)', () => {
    const sources = walkSourceFiles(srcRoot)
    const missing = sources
      .map((absolute) => path.relative(srcRoot, absolute))
      .filter((rel) => !hasMirroredTest(rel))

    expect(missing).toEqual([])
  })
})
