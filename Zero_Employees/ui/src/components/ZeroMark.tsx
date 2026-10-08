import type { SVGProps } from "react";
import { cn } from "../lib/utils";

/**
 * The Zero mark, animated: a single ring that draws itself on and then off.
 *
 * The geometry is deliberately one `<circle>` rather than a path, because the
 * draw-on/draw-off animation is driven by `stroke-dasharray` and a circle's
 * circumference is exact (2πr = 56.549 at r=9). The keyframes in `index.css`
 * hard-code that length, so changing `r` here means changing it there too.
 *
 * Rotated -90° so the stroke begins at twelve o'clock; without it the ring
 * appears to start drawing from the right edge, which reads as off-balance.
 */
export function ZeroMarkIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("zero-thinking-icon", className)}
      aria-hidden="true"
      {...props}
    >
      <circle
        className="zero-thinking-icon-path"
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
}

/** Full-page loading state: a large, centered, muted drawing ring. */
export function ZeroLoading({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn("flex min-h-dvh w-full items-center justify-center", className)}
    >
      <ZeroMarkIcon className="h-24 w-24 text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/**
 * The static mark: a serif zero, drawn as an outer letterform ellipse with a
 * narrower one knocked out of it. The counter is proportionally taller than it
 * is wide, so the stroke comes out thick at the sides and thin at the top and
 * bottom — the weight modulation of a serif face. That contrast is the whole
 * point: a uniform ring would read as a generic geometric circle.
 */
export function ZeroGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2.5a7.5 9.5 0 1 1 0 19 7.5 9.5 0 1 1 0-19Zm0 2.9a3.8 6.6 0 1 0 0 13.2 3.8 6.6 0 1 0 0-13.2Z"
      />
    </svg>
  );
}
