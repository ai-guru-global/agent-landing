import { ExternalLink } from "lucide-react";
import type { Tab } from "../types";
import { formatNumber } from "../lib/catalog";
import { useI18n } from "../lib/i18n";

export function NavTabs({
  tab,
  onChange,
  agentCount,
  skillCount,
  source,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
  agentCount: number;
  skillCount: number;
  source: string;
}) {
  const { t, locale } = useI18n();
  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: "agents", label: t("nav.agents"), count: agentCount },
    { id: "skills", label: t("nav.skills"), count: skillCount },
    { id: "wizard", label: t("nav.wizard"), count: null },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-12 max-w-[1600px] items-stretch justify-between gap-4 px-4 lg:px-6">
        <div role="tablist" aria-label={t("nav.agents")} className="flex min-w-0 items-stretch gap-1 overflow-x-auto">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(item.id)}
                className={`relative flex shrink-0 items-center gap-2 px-3 text-[13px] transition-colors ${
                  active ? "font-medium text-ink" : "text-muted hover:bg-mist hover:text-ink"
                }`}
              >
                {item.label}
                {item.count != null ? (
                  <span className="alm-mono text-[10px] text-soft">
                    {formatNumber(item.count, locale)}
                  </span>
                ) : null}
                {active ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 bg-blue" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="hidden shrink-0 items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-blue md:flex"
        >
          {t("nav.source")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </nav>
  );
}
