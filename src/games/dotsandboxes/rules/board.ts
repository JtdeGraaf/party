/** How many boxes along each side of the board. */
export type BoardSize = 3 | 4 | 5

export const BOARD_SIZES: readonly BoardSize[] = [3, 4, 5]

export function isBoardSize(value: unknown): value is BoardSize {
  return BOARD_SIZES.includes(value as BoardSize)
}

/**
 * A line between two neighbouring dots. `h-2-1` runs across, from dot (row 2, column 1) to the right; `v-2-1` runs
 * down from that dot.
 */
export type Line = { direction: 'h' | 'v'; row: number; column: number }

export function lineId({ direction, row, column }: Line): string {
  return `${direction}-${row}-${column}`
}

/** The line an id names, or null when it isn't a line on a board of this size. */
export function readLine(id: string, size: BoardSize): Line | null {
  const match = /^([hv])-(\d+)-(\d+)$/.exec(id)
  if (!match) return null
  const line: Line = { direction: match[1] as 'h' | 'v', row: Number(match[2]), column: Number(match[3]) }
  const lastRow = line.direction === 'h' ? size : size - 1
  const lastColumn = line.direction === 'h' ? size - 1 : size
  if (line.row > lastRow || line.column > lastColumn) return null
  return line
}

/** Every line on the board, across first, then down. */
export function allLines(size: BoardSize): Line[] {
  const across = grid(size + 1, size).map(([row, column]) => ({ direction: 'h' as const, row, column }))
  const down = grid(size, size + 1).map(([row, column]) => ({ direction: 'v' as const, row, column }))
  return [...across, ...down]
}

/** A box is named after its top-left dot: `2-1`. */
export function allBoxes(size: BoardSize): string[] {
  return grid(size, size).map(([row, column]) => `${row}-${column}`)
}

/** The one or two boxes a line is a side of. */
export function boxesBeside(line: Line, size: BoardSize): string[] {
  const { direction, row, column } = line
  const candidates = direction === 'h' ? [[row - 1, column], [row, column]] : [[row, column - 1], [row, column]]
  return candidates
    .filter(([boxRow, boxColumn]) => boxRow >= 0 && boxColumn >= 0 && boxRow < size && boxColumn < size)
    .map(([boxRow, boxColumn]) => `${boxRow}-${boxColumn}`)
}

/** The four lines around a box. */
export function sidesOf(box: string): string[] {
  const [row, column] = box.split('-').map(Number)
  return [`h-${row}-${column}`, `h-${row + 1}-${column}`, `v-${row}-${column}`, `v-${row}-${column + 1}`]
}

function grid(rows: number, columns: number): [number, number][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => [row, column] as [number, number]),
  ).flat()
}
