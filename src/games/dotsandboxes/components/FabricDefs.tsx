/**
 * The four cotton prints, as SVG patterns any SVG on the page can fill with `url(#fabric-n)`. Each print has its own
 * shape (checks, dots, stripes, stars) so seats are told apart without colour.
 */
export function FabricDefs() {
  return (
    <svg className="absolute size-0 overflow-hidden" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="backing-cloth" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect className="quilt-backing-ground" width="6" height="6" />
          <rect className="quilt-backing-thread" width="6" height="1" />
          <rect className="quilt-backing-thread" width="1" height="6" x="3" />
        </pattern>
        <pattern id="fabric-0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect className="quilt-print-0" width="20" height="20" />
          <rect className="quilt-print-wash" width="10" height="20" />
          <rect className="quilt-print-wash" width="20" height="10" />
        </pattern>
        <pattern id="fabric-1" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect className="quilt-print-1" width="20" height="20" />
          <circle className="quilt-motif-1" cx="5" cy="5" r="3.2" />
          <circle className="quilt-motif-1" cx="15" cy="15" r="3.2" />
        </pattern>
        <pattern id="fabric-2" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect className="quilt-print-2" width="14" height="14" />
          <rect className="quilt-motif-2" x="2" width="3.4" height="14" />
          <rect className="quilt-motif-2" x="8.6" width="1.2" height="14" />
        </pattern>
        <pattern id="fabric-3" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect className="quilt-print-3" width="24" height="24" />
          <path className="quilt-motif-3" d={star(6, 6)} />
          <path className="quilt-motif-3" d={star(18, 18)} />
        </pattern>
      </defs>
    </svg>
  )
}

/** A small four-pointed star centred on (x, y). */
function star(x: number, y: number): string {
  return `M${x} ${y - 4.5}L${x + 1.3} ${y - 1.3}L${x + 4.5} ${y}L${x + 1.3} ${y + 1.3}L${x} ${y + 4.5}L${x - 1.3} ${y + 1.3}L${x - 4.5} ${y}L${x - 1.3} ${y - 1.3}Z`
}
