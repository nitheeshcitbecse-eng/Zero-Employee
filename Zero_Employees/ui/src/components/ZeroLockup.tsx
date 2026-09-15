import { cn } from "../lib/utils";
import { ZeroGlyph } from "./ZeroMark";

interface ZeroLockupProps {
  /** Hide from assistive tech when the name is already announced nearby. */
  decorative?: boolean;
  className?: string;
  /** Render the mark alone, for tight chrome like a collapsed sidebar rail. */
  markOnly?: boolean;
}

/**
 * The full lockup — mark plus wordmark.
 *
 * Built from an inline SVG mark beside real text rather than outlined
 * letterforms, so the wordmark inherits `--font-heading` and stays selectable
 * and searchable. Everything is `currentColor`, so one geometry serves both
 * the light and dark surfaces.
 *
 * Size it by setting a text size on the container; the mark tracks the
 * wordmark's cap height via `em` units rather than a fixed pixel box.
 */
export function ZeroLockup({ decorative = false, className, markOnly = false }: ZeroLockupProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-[0.45em] text-[1.0625rem] leading-none", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Zero Employees"}
    >
      <ZeroGlyph className="h-[1.15em] w-[1.15em] shrink-0 text-primary" />
      {!markOnly && (
        <span
          aria-hidden="true"
          className="font-heading font-medium tracking-[-0.02em] text-foreground"
        >
          Zero<span className="text-muted-foreground"> Employees</span>
        </span>
      )}
    </span>
  );
}
