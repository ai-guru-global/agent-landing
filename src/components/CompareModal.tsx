import type { ReactNode } from "react";
import { Copy, ExternalLink, X } from "lucide-react";
import type { Agent } from "../types";
import { useDialogFocus } from "../hooks/useDialogFocus";
import {
  agentTypeLabelKey,
  billingNote,
  formatNumber,
  interfaceLabel,
  pricingLabel,
  siteLabel,
} from "../lib/catalog";
import { useI18n } from "../lib/i18n";
import { Badge, CategoryDot, EmptyState, SectionLabel } from "./ui";

interface CompareRow {
  label: string;
  values: string[];
  render: (agent: Agent) => ReactNode;
  diffable?: boolean;
}

export function CompareModal({
  agents,
  categoryColors,
  onRemove,
  onClose,
  onCopy,
}: {
  agents: Agent[];
  categoryColors: Record<string, string>;
  onRemove: (agent: Agent) => void;
  onClose: () => void;
  onCopy: () => void;
}) {
  const { t, locale, pick } = useI18n();
  const focusRef = useDialogFocus(true, onClose);

  const rows: CompareRow[] = [
    {
      label: t("compare.id"),
      values: agents.map((agent) => agent.catalogId),
      render: (agent) => <span className="alm-mono whitespace-nowrap text-[11px] text-soft">{agent.catalogId}</span>,
      diffable: false,
    },
    {
      label: t("compare.agentType"),
      values: agents.map((agent) => agent.agentType),
      render: (agent) => (
        <Badge tone={agent.agentType === "standalone" ? "blue" : "default"}>
          {t(agentTypeLabelKey(agent.agentType))}
        </Badge>
      ),
    },
    {
      label: t("compare.category"),
      values: agents.map((agent) => `${agent.categoryCode}/${agent.subCategoryCode}`),
      render: (agent) => (
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-ink">
            <CategoryDot color={categoryColors[agent.categoryCode] ?? "#6f6f6f"} size={6} />
            {locale === "en" && agent.categoryNameEn ? agent.categoryNameEn : agent.categoryName}
          </div>
          <div className="mt-0.5 text-[10px] text-soft">
            {pick(agent.subCategoryName, agent.subCategoryNameEn)}
          </div>
        </div>
      ),
    },
    {
      label: t("filter.pricing"),
      values: agents.map((agent) => String(agent.isPaid)),
      render: (agent) => (
        <Badge tone={agent.isPaid ? "amber" : "green"}>{pricingLabel(agent.isPaid, locale)}</Badge>
      ),
    },
    {
      label: t("compare.interfaces"),
      values: agents.map((agent) => [...agent.supportedInterfaces].sort().join(",")),
      render: (agent) => (
        <div className="flex flex-wrap gap-1">
          {agent.supportedInterfaces.map((value) => (
            <Badge key={value} tone={value === "openAPI" ? "blue" : "default"}>
              {interfaceLabel(value, locale)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: t("compare.sites"),
      values: agents.map((agent) => [...agent.publishSites].sort().join(",")),
      render: (agent) => (
        <div className="flex flex-wrap gap-1">
          {agent.publishSites.map((site) => (
            <Badge key={site}>{siteLabel(site, locale)}</Badge>
          ))}
        </div>
      ),
    },
    {
      label: t("compare.features"),
      values: agents.map((agent) => String(agent.features.length)),
      render: (agent) => (
        <span className="text-[12px] text-ink">{formatNumber(agent.features.length, locale)}</span>
      ),
    },
    {
      label: t("compare.api"),
      values: agents.map((agent) => String(agent.openApiConfigs.length)),
      render: (agent) => (
        <div>
          <div className="text-[12px] text-ink">
            {formatNumber(agent.openApiConfigs.length, locale)}
          </div>
          {agent.openApiConfigs[0] ? (
            <div className="mt-0.5 text-[10px] text-soft">
              {pick(agent.openApiConfigs[0].apiTitle, agent.openApiConfigs[0].apiTitleEn)}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      label: t("compare.console"),
      values: agents.map((agent) => agent.consoleConfigs.map((config) => config.site).join(",")),
      render: (agent) =>
        agent.consoleConfigs.length === 0 ? (
          <span className="text-[12px] text-soft">—</span>
        ) : (
          <div className="space-y-1">
            {agent.consoleConfigs.map((config) => (
              <a
                key={config.consoleUrl}
                href={config.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-blue hover:text-blue-dark"
              >
                {siteLabel(config.site, locale)}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ))}
          </div>
        ),
    },
    {
      label: t("compare.likes"),
      values: agents.map((agent) => String(agent.likeCount)),
      render: (agent) => (
        <span className="alm-mono text-[12px] text-ink">{formatNumber(agent.likeCount, locale)}</span>
      ),
    },
    {
      label: t("detail.billing"),
      values: agents.map((agent) => billingNote(agent, locale)),
      render: (agent) => (
        <p className="text-[11px] leading-5 text-muted">
          {billingNote(agent, locale) || t("detail.billingFallback")}
        </p>
      ),
    },
    {
      label: t("compare.docs"),
      values: agents.map((agent) => agent.usageGuideUrl),
      render: (agent) => (
        <a
          href={agent.usageGuideUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-blue hover:text-blue-dark"
        >
          {t("common.official")}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ),
      diffable: false,
    },
  ];

  const diffCount = rows.filter(
    (row) => row.diffable !== false && new Set(row.values).size > 1,
  ).length;

  return (
    <div className="alm-overlay fixed inset-0 z-[90] flex items-center justify-center bg-ink/55 p-3 lg:p-6" onClick={onClose}>
      <div
        ref={focusRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        tabIndex={-1}
        className="alm-panel-modal flex max-h-[92vh] w-full max-w-[1280px] flex-col bg-paper outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-ink px-4 py-3 text-white lg:px-5">
          <div className="flex items-center gap-3">
            <SectionLabel>{t("compare.title")}</SectionLabel>
            <span className="alm-mono text-[10px] text-white/50">
              {formatNumber(agents.length, locale)} / 3 · {t("compare.diffCount", { count: diffCount })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1.5 border border-white/25 px-2.5 py-1.5 text-[11px] text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {t("compare.copy")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-white/65 hover:bg-white/10 hover:text-white"
              aria-label={t("compare.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {agents.length < 2 ? (
          <EmptyState title={t("compare.empty")} hint={t("compare.minHint")} />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="border-b border-line bg-mist px-4 py-2 text-[10px] text-muted md:hidden">
              {t("compare.swipeHint")}
            </div>
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 w-[150px] border-b border-r border-line bg-mist px-4 py-3 text-left">
                    <span className="alm-label">{t("compare.field")}</span>
                  </th>
                  {agents.map((agent) => (
                    <th
                      key={agent.id}
                      className="border-b border-line bg-mist px-4 py-3 text-left align-top"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="alm-mono text-[10px] text-soft">{agent.catalogId}</div>
                          <div className="mt-1 text-[13px] font-semibold text-ink">
                            {locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
                          </div>
                          <div className="mt-0.5 truncate text-[10px] text-muted">
                            {locale === "en" && agent.nameEn ? agent.name : agent.nameEn}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(agent)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center text-soft hover:bg-line hover:text-ink"
                          aria-label={`${t("compare.remove")} ${agent.catalogId}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const differs =
                    row.diffable !== false && new Set(row.values).size > 1;
                  return (
                    <tr key={row.label}>
                      <th className="sticky left-0 z-10 border-b border-r border-line bg-paper px-4 py-3 text-left align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-muted">{row.label}</span>
                          {differs ? (
                            <span
                              className="h-1.5 w-1.5 bg-blue"
                              title={t("common.difference")}
                              aria-label={t("common.difference")}
                            />
                          ) : null}
                        </div>
                      </th>
                      {agents.map((agent, index) => (
                        <td
                          key={agent.id}
                          className={`border-b border-line px-4 py-3 align-top ${
                            differs ? "bg-blue-soft/45" : "bg-paper"
                          }`}
                        >
                          {row.render(agent)}
                          <span className="sr-only">{row.values[index]}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
