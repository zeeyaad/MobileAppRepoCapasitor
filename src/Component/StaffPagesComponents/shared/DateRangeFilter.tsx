/**
 * DateRangeFilter
 * ─────────────────────────────────────────────────────────────────────────────
 * A reusable RTL-ready date filter component.
 *
 * Usage:
 *   const [range, setRange] = useState<DateRange>({ from: undefined, to: undefined });
 *   <DateRangeFilter value={range} onChange={setRange} />
 *
 * The `onChange` callback fires with { from, to } where both values are
 * ISO date strings ("YYYY-MM-DD") or undefined.
 *
 * The parent can then use `from` and `to` as query params:
 *   api.get("/endpoint", { params: { from: range.from, to: range.to } })
 */

import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
    from: string | undefined; // "YYYY-MM-DD"
    to: string | undefined;   // "YYYY-MM-DD"
}

interface Preset {
    label: string;
    get: () => DateRange;
}

interface DateRangeFilterProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    /** Placeholder text shown when no filter is active */
    placeholder?: string;
    /** Extra className for the wrapper */
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date): string => d.toISOString().split("T")[0];

const today = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const startOf = (d: Date): Date => {
    const c = new Date(d);
    c.setDate(1);
    c.setHours(0, 0, 0, 0);
    return c;
};

const endOf = (d: Date): Date => {
    const c = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    c.setHours(23, 59, 59, 999);
    return c;
};

// Return pure data from preset definitions, translate via hook later
const PRESETS: Omit<Preset, 'label'> & { key: string; get: () => DateRange }[] = [
    {
        key: "dateRange.today",
        get: () => { const t = toISO(today()); return { from: t, to: t }; },
    },
    {
        key: "dateRange.last7Days",
        get: () => {
            const t = today();
            const f = new Date(t); f.setDate(f.getDate() - 6);
            return { from: toISO(f), to: toISO(t) };
        },
    },
    {
        key: "dateRange.last30Days",
        get: () => {
            const t = today();
            const f = new Date(t); f.setDate(f.getDate() - 29);
            return { from: toISO(f), to: toISO(t) };
        },
    },
    {
        key: "dateRange.thisMonth",
        get: () => {
            const t = today();
            return { from: toISO(startOf(t)), to: toISO(endOf(t)) };
        },
    },
    {
        key: "dateRange.lastMonth",
        get: () => {
            const t = today();
            const first = new Date(t.getFullYear(), t.getMonth() - 1, 1);
            const last = new Date(t.getFullYear(), t.getMonth(), 0);
            return { from: toISO(first), to: toISO(last) };
        },
    },
    {
        key: "dateRange.thisYear",
        get: () => {
            const y = today().getFullYear();
            return { from: `${y}-01-01`, to: `${y}-12-31` };
        },
    },
    {
        key: "dateRange.lastYear",
        get: () => {
            const y = today().getFullYear() - 1;
            return { from: `${y}-01-01`, to: `${y}-12-31` };
        },
    },
    {
        key: "dateRange.last1Year",
        get: () => {
            const t = today();
            const f = new Date(t); f.setFullYear(f.getFullYear() - 1);
            return { from: toISO(f), to: toISO(t) };
        },
    },
];

// ─── Formatted label ──────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("ar-EG", {
            day: "numeric", month: "short", year: "numeric",
        });
    } catch { return iso; }
}

function rangeLabel(value: DateRange): string | null {
    if (!value.from && !value.to) return null;
    if (value.from === value.to) return fmtDate(value.from!);
    if (value.from && value.to) return `${fmtDate(value.from)} — ${fmtDate(value.to)}`;
    if (value.from) return `${fmtDate(value.from)} →`;
    return `→ ${fmtDate(value.to!)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DateRangeFilter({
    value,
    onChange,
    placeholder,
    className = "",
}: DateRangeFilterProps) {
    const { t } = useTranslation(["common"]);
    const finalPlaceholder = placeholder || t("dateRange.placeholder");
    const [open, setOpen] = useState(false);
    const [customFrom, setCustomFrom] = useState(value.from ?? "");
    const [customTo, setCustomTo] = useState(value.to ?? "");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync local inputs when external value resets
    useEffect(() => {
        setCustomFrom(value.from ?? "");
        setCustomTo(value.to ?? "");
    }, [value.from, value.to]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const applyCustom = () => {
        if (!customFrom && !customTo) return;
        onChange({ from: customFrom || undefined, to: customTo || undefined });
        setOpen(false);
    };

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ from: undefined, to: undefined });
        setCustomFrom("");
        setCustomTo("");
    };

    const label = rangeLabel(value);
    const hasValue = !!(value.from || value.to);

    return (
        <div ref={wrapperRef} className={`relative inline-block ${className}`} dir="rtl">
            {/* ── Trigger button ── */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`
          flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium
          transition-all whitespace-nowrap select-none
          ${hasValue
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-muted/40"
                    }
        `}
            >
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span className="max-w-[220px] truncate">
                    {label ?? finalPlaceholder}
                </span>
                {hasValue ? (
                    <X
                        className="w-3.5 h-3.5 shrink-0 opacity-60 hover:opacity-100"
                        onClick={clear}
                    />
                ) : (
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                )}
            </button>

            {/* ── Dropdown panel ── */}
            {open && (
                <div className="
          absolute top-full mt-1.5 z-50 min-w-[280px] w-max
          bg-popover border border-border rounded-xl shadow-lg overflow-hidden
          right-0
        ">
                    {/* Preset buttons */}
                    <div className="p-1.5 border-b border-border grid grid-cols-2 gap-1">
                        {PRESETS.map((preset) => {
                            const presetRange = preset.get();
                            const isActive = value.from === presetRange.from && value.to === presetRange.to;
                            return (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => {
                                        onChange(presetRange);
                                        setOpen(false);
                                    }}
                                    className={`
                    px-3 py-1.5 rounded-lg text-sm text-start transition-colors
                    ${isActive
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "hover:bg-muted text-foreground"
                                        }
                  `}
                                >
                                    {t(preset.key)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom date range */}
                    <div className="p-3 space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
                            {t("dateRange.customRange")}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] text-muted-foreground mb-0.5 block">{t("dateRange.from")}</label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    max={customTo || undefined}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="
                    w-full h-8 px-2 rounded-md border border-border bg-background
                    text-sm text-foreground text-left
                    focus:outline-none focus:ring-1 focus:ring-primary
                  "
                                    dir="ltr"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-muted-foreground mb-0.5 block">{t("dateRange.to")}</label>
                                <input
                                    type="date"
                                    value={customTo}
                                    min={customFrom || undefined}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="
                    w-full h-8 px-2 rounded-md border border-border bg-background
                    text-sm text-foreground text-left
                    focus:outline-none focus:ring-1 focus:ring-primary
                  "
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={applyCustom}
                                disabled={!customFrom && !customTo}
                                className="
                  flex-1 h-8 rounded-md bg-primary text-primary-foreground text-sm font-medium
                  hover:opacity-90 transition-opacity disabled:opacity-40
                "
                            >
                                {t("dateRange.apply")}
                            </button>
                            {hasValue && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="
                    h-8 px-3 rounded-md border border-border text-sm text-muted-foreground
                    hover:bg-muted transition-colors
                  "
                                >
                                    {t("dateRange.clear")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
