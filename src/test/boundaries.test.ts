import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

/** The walls between the parts of the hub: checked on the source, so a stray import fails the build's tests. */

const ROOT = join(import.meta.dirname, '..', '..')

function sourceFiles(folder: string): string[] {
  return readdirSync(join(ROOT, folder)).flatMap((name) => {
    const path = join(folder, name)
    if (statSync(join(ROOT, path)).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) ? [path.split(sep).join('/')] : []
  })
}

function importsOf(file: string): string[] {
  const text = readFileSync(join(ROOT, file), 'utf8')
  return [...text.matchAll(/from '([^']+)'/g)].map((match) => match[1])
}

function gameOf(file: string): string | null {
  return /^src\/games\/([^/]+)\//.exec(file)?.[1] ?? null
}

/** Where an import points, as a path from the repo root, or the package name for packages. */
function target(file: string, imported: string): string {
  if (imported.startsWith('@/')) return `src/${imported.slice(2)}`
  if (!imported.startsWith('.')) return imported
  return relative(ROOT, join(ROOT, file, '..', imported)).split(sep).join('/')
}

const allFiles = [...sourceFiles('src'), ...sourceFiles('server'), ...sourceFiles('worker')]

describe('boundaries', () => {
  it('keep Cloudflare inside worker/', () => {
    const offenders = allFiles.filter(
      (file) =>
        !file.startsWith('worker/') &&
        !file.endsWith('boundaries.test.ts') &&
        (importsOf(file).some((imported) => imported.startsWith('cloudflare:')) ||
          /\b(DurableObject|WebSocketPair|ExportedHandler)\b/.test(readFileSync(join(ROOT, file), 'utf8'))),
    )

    expect(offenders).toEqual([])
  })

  it('keep the room core and the hub frame free of any one game', () => {
    const offenders = allFiles
      .filter((file) => file.startsWith('src/party/') || file.startsWith('src/components/'))
      .flatMap((file) => importsOf(file).map((imported) => [file, target(file, imported)]))
      .filter(([, path]) => path.startsWith('src/games/'))

    expect(offenders).toEqual([])
  })

  it('keep games out of each other', () => {
    const offenders = allFiles
      .filter((file) => gameOf(file) !== null)
      .flatMap((file) => importsOf(file).map((imported) => [file, target(file, imported)]))
      .filter(([file, path]) => gameOf(path) !== null && gameOf(path) !== gameOf(file))

    expect(offenders).toEqual([])
  })

  it('keep React and the browser out of the server and the game rules', () => {
    const serverSide = allFiles.filter(
      (file) => file.startsWith('server/') || /^src\/games\/[^/]+\/rules\//.test(file) || file === 'src/games/rules-registry.ts',
    )
    const offenders = serverSide
      .flatMap((file) => importsOf(file).map((imported) => [file, imported]))
      .filter(([, imported]) => /^(react|react-dom|react-i18next|@base-ui|@tanstack)/.test(imported))

    expect(offenders).toEqual([])
  })
})
