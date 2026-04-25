import type { ComponentType, SVGProps } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  subtitle?: string;
  tone?: "blue" | "cyan" | "orange";
  emphasis?: "primary" | "secondary";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, { circle: string; icon: string }> = {
  blue: {
    circle: "bg-[#1b71bc]/20",
    icon: "text-[#1b71bc]",
  },
  cyan: {
    circle: "bg-[#1face1]/20",
    icon: "text-[#1face1]",
  },
  orange: {
    circle: "bg-[#f8931c]/20",
    icon: "text-[#f8931c]",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  tone = "blue",
  emphasis = "secondary",
}: StatCardProps) {
  const isPrimary = emphasis === "primary";
  const styleTone = toneStyles[tone];

  return (
    <div
      className={`
        rounded-[14px] border border-border bg-card p-6
        shadow-[0_6px_18px_rgba(16,24,40,0.08)] transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,24,40,0.12)]
        ${isPrimary ? "p-7" : ""}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`${isPrimary ? "text-[15px]" : "text-[13px]"} font-medium text-muted-foreground`}>{title}</p>
          <p className={`mt-2 ${isPrimary ? "text-[34px]" : "text-[28px]"} font-extrabold leading-none text-foreground`}>
            {value}
          </p>
          {subtitle && <p className="mt-2 text-[12px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`rounded-full p-3 ${styleTone.circle}`}>
          <Icon className={`h-6 w-6 ${styleTone.icon}`} />
        </div>
      </div>
    </div>
  );
}
