import { forwardRef, type ReactNode } from "react";
import { Check, ChevronDown, Search, SearchX, X } from "lucide-react";
import type { AgentType } from "../types";
import { agentTypeShortKey, tokenizeQuery } from "../lib/catalog";
import { useI18n } from "../lib/i18n";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0 || !text) return <>{text}</>;
  const regex = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(regex);
  const set = new Set(tokens);
  return (
    <>
      {parts.map((part, index) =>
        set.has(part.toLowerCase()) ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

type Tone = "default" | "blue" | "green" | "amber" | "red";

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const toneClass =
    tone === "blue"
      ? "alm-tag-blue"
      : tone === "green"
        ? "alm-tag-green"
        : tone === "amber"
          ? "alm-tag-amber"
          : tone === "red"
            ? "alm-tag-red"
            : "";
  return <span className={`alm-tag ${toneClass} ${className}`}>{children}</span>;
}

export function CategoryDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{ width: size, height: size, background: color }}
    />
  );
}

export function AgentTypeMark({
  type,
  className = "",
}: {
  type: AgentType;
  className?: string;
}) {
  const { t } = useI18n();
  const standalone = type === "standalone";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 text-[10px] ${
        standalone ? "text-blue-dark" : "text-soft"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 ${standalone ? "bg-blue" : "bg-soft"}`}
        aria-hidden="true"
      />
      {t(agentTypeShortKey(type))}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="alm-label">{children}</div>;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange, placeholder }, ref) {
    const { t } = useI18n();
    return (
      <div className="relative w-full">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="alm-input pl-10 pr-24"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex h-7 w-7 items-center justify-center text-soft hover:bg-line hover:text-ink"
              aria-label={t("search.clear")}
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="alm-mono hidden border border-line bg-paper px-1.5 py-0.5 text-[10px] text-soft sm:block">
              /
            </kbd>
          )}
        </div>
      </div>
    );
  },
);

export function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="alm-select"
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted"
      />
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  icon,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center bg-mist text-muted">
        {icon ?? <SearchX className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{hint}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function SkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-3 py-4">
          <div className="alm-skeleton h-3 w-12" />
          <div className="min-w-0 flex-1">
            <div className="alm-skeleton h-4 w-1/3" />
            <div className="alm-skeleton mt-2 h-3 w-2/3" />
          </div>
          <div className="alm-skeleton hidden h-3 w-20 sm:block" />
          <div className="alm-skeleton hidden h-3 w-14 md:block" />
        </div>
      ))}
    </div>
  );
}

export function Toast({
  message,
  tone = "default",
}: {
  message: string;
  tone?: "default" | "error";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="alm-rise fixed bottom-24 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 bg-ink px-4 py-3 text-sm text-white"
    >
      {tone === "error" ? (
        <span className="h-2 w-2 bg-red" aria-hidden="true" />
      ) : (
        <Check className="h-4 w-4 text-green" aria-hidden="true" />
      )}
      {message}
    </div>
  );
}

