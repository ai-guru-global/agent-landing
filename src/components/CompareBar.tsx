import { GitCompare, Trash2, X } from "lucide-react";
import type { Agent } from "../types";
import { formatNumber } from "../lib/catalog";
import { useI18n } from "../lib/i18n";

export function CompareBar({
  agents,
  onRemove,
  onClear,
  onOpen,
}: {
  agents: Agent[];
  onRemove: (agent: Agent) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  const { t, locale } = useI18n();
  if (agents.length === 0) return null;

  return (
    <div className="alm-rise fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-ink text-white">
      <div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2 lg:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="alm-mono text-[10px] uppercase tracking-[0.08em] text-white/55">
            {t("common.compareCount", { count: agents.length })}
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {agents.map((agent) => (
              <span
                key={agent.id}
                className="flex max-w-[260px] items-center gap-2 border border-white/25 px-2 py-1"
              >
                <span className="alm-mono text-[10px] text-white/45">{agent.catalogId}</span>
                <span className="truncate text-[11px] text-white/85">
                  {locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(agent)}
                  className="text-white/45 hover:text-white"
                  aria-label={`${t("compare.remove")} ${agent.catalogId}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-2 py-2 text-[11px] text-white/55 hover:text-white"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t("filter.clear")}
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={agents.length < 2}
            className="alm-btn alm-btn-sm alm-btn-primary"
            title={agents.length < 2 ? t("common.compareHint") : undefined}
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.compare")}
            {agents.length >= 2 ? (
              <span className="alm-mono text-[10px] text-white/70">{formatNumber(agents.length, locale)}</span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}
