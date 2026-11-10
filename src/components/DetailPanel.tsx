import {
  Check,
  Copy,
  ExternalLink,
  GitCompare,
  Github,
  X,
} from "lucide-react";
import type { Agent, Catalog, Skill } from "../types";
import {
  formatDate,
  formatNumber,
  formatTokenRange,
  interfaceLabel,
  pricingLabel,
  siteLabel,
} from "../lib/catalog";
import { useDialogFocus } from "../hooks/useDialogFocus";
import { useI18n } from "../lib/i18n";
import { Badge, CategoryDot, SectionLabel } from "./ui";

interface DetailPanelProps {
  catalog: Catalog;
  agent: Agent | null;
  skill: Skill | null;
  categoryColors: Record<string, string>;
  compareIds: string[];
  onToggleCompare: (agent: Agent) => void;
  onClose: () => void;
  onOpenAgent: (agent: Agent) => void;
  onCopyInstall: (skill: Skill) => void;
}

export function DetailPanel({
  catalog,
  agent,
  skill,
  categoryColors,
  compareIds,
  onToggleCompare,
  onClose,
  onOpenAgent,
  onCopyInstall,
}: DetailPanelProps) {
  const open = Boolean(agent || skill);
  const focusRef = useDialogFocus(open, onClose);
  const { t } = useI18n();

  if (!agent && !skill) return null;

  return (
    <div
      className="alm-overlay fixed inset-0 z-[80] flex justify-end bg-ink/45"
      onClick={onClose}
    >
      <div
        ref={focusRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabIndex={-1}
        className="alm-panel-right flex h-full w-full max-w-[520px] flex-col bg-paper outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-mist px-4">
          <div className="flex min-w-0 items-center gap-3">
            <SectionLabel>{agent ? t("detail.agent") : t("detail.skill")}</SectionLabel>
            <span className="alm-mono text-[10px] text-soft">
              {agent ? agent.catalogId : skill?.catalogId}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-muted hover:bg-line hover:text-ink"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {agent ? (
            <AgentDetail
              agent={agent}
              categoryColors={categoryColors}
              compareSelected={compareIds.includes(agent.id)}
              onToggleCompare={onToggleCompare}
            />
          ) : skill ? (
            <SkillDetail
              skill={skill}
              catalog={catalog}
              categoryColors={categoryColors}
              onOpenAgent={onOpenAgent}
              onCopyInstall={onCopyInstall}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AgentDetail({
  agent,
  categoryColors,
  compareSelected,
  onToggleCompare,
}: {
  agent: Agent;
  categoryColors: Record<string, string>;
  compareSelected: boolean;
  onToggleCompare: (agent: Agent) => void;
}) {
  const { t, locale, pick } = useI18n();
  const color = categoryColors[agent.categoryCode] ?? "#6f6f6f";
  const billing = pick(agent.billingLogic, agent.billingLogicEn) || t("detail.billingFallback");
  const groups = agent.features.reduce<Record<string, typeof agent.features>>((acc, feature) => {
    const key = pick(feature.setName, feature.setNameEn);
    (acc[key] ??= []).push(feature);
    return acc;
  }, {});

  return (
    <article>
      <header className="border-b border-line px-5 py-5">
        <h2 id="detail-title" className="text-[22px] font-semibold leading-tight text-ink">
          {locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          {locale === "en" && agent.nameEn ? agent.name : agent.nameEn}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge>
            <CategoryDot color={color} size={6} />
            {locale === "en" && agent.categoryNameEn ? agent.categoryNameEn : agent.categoryName}
          </Badge>
          {agent.subCategoryName ? <Badge>{pick(agent.subCategoryName, agent.subCategoryNameEn)}</Badge> : null}
          <Badge tone={agent.isPaid ? "amber" : "green"}>{pricingLabel(agent.isPaid, locale)}</Badge>
          {agent.publishSites.map((site) => (
            <Badge key={site}>{siteLabel(site, locale)}</Badge>
          ))}
          {agent.supportedInterfaces.map((value) => (
            <Badge key={value} tone={value === "openAPI" ? "blue" : "default"}>
              {interfaceLabel(value, locale)}
            </Badge>
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-6 text-muted">
          {pick(agent.description, agent.descriptionEn)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={agent.usageGuideUrl}
            target="_blank"
            rel="noreferrer"
            className="alm-btn alm-btn-sm alm-btn-primary"
          >
            {t("detail.usageGuide")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => onToggleCompare(agent)}
            className={`alm-btn alm-btn-sm ${compareSelected ? "alm-btn-secondary" : "alm-btn-ghost border border-line-strong"}`}
          >
            {compareSelected ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {compareSelected ? t("common.removeCompare") : t("common.addCompare")}
          </button>
        </div>
      </header>

      <section className="border-b border-line px-5 py-5">
        <SectionLabel>{t("detail.features")}</SectionLabel>
        {agent.features.length === 0 ? (
          <p className="mt-3 text-[12px] text-muted">{t("detail.noFeatures")}</p>
        ) : (
          <div className="mt-3 space-y-5">
            {Object.entries(groups).map(([groupName, features]) => (
              <div key={groupName}>
                <div className="text-[11px] font-medium text-soft">{groupName}</div>
                <div className="mt-2 divide-y divide-line border-t border-line">
                  {features.map((feature) => (
                    <div key={`${feature.setName}-${feature.name}`} className="py-3">
                      <div className="text-[13px] font-medium text-ink">
                        {pick(feature.name, feature.nameEn)}
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-muted">
                        {pick(feature.description, feature.descriptionEn)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-b border-line px-5 py-5">
        <SectionLabel>{t("detail.billing")}</SectionLabel>
        <p className="mt-3 text-[12px] leading-5 text-muted">{billing}</p>
      </section>

      {agent.openApiConfigs.length > 0 ? (
        <section className="border-b border-line px-5 py-5">
          <div className="flex items-center justify-between">
            <SectionLabel>{t("detail.openapi")}</SectionLabel>
            <span className="alm-mono text-[10px] text-soft">
              {t("detail.openApiCount", { count: agent.openApiConfigs.length })}
            </span>
          </div>
          <div className="mt-3 divide-y divide-line border-t border-line">
            {agent.openApiConfigs.map((config) => (
              <div key={`${config.productCode}-${config.apiName}`} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-ink">
                    {pick(config.apiTitle, config.apiTitleEn) || config.apiName}
                  </span>
                  <span className="alm-mono text-[10px] text-soft">
                    {config.productCode} · {config.apiVersion}
                  </span>
                </div>
                <p className="alm-mono mt-1 text-[10px] text-soft">{config.apiName}</p>
                <p className="mt-1 text-[12px] leading-5 text-muted">
                  {pick(config.apiDescription, config.apiDescriptionEn)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {agent.consoleConfigs.length > 0 ? (
        <section className="border-b border-line px-5 py-5">
          <SectionLabel>{t("detail.console")}</SectionLabel>
          <div className="mt-3 space-y-2">
            {agent.consoleConfigs.map((config) => (
              <a
                key={`${config.site}-${config.consoleUrl}`}
                href={config.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-line px-3 py-2 text-[12px] text-ink hover:border-line-strong"
              >
                <span>{siteLabel(config.site, locale)}</span>
                <ExternalLink className="h-3.5 w-3.5 text-blue" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-5 py-5">
        <SectionLabel>{t("detail.metadata")}</SectionLabel>
        <div className="mt-3 grid grid-cols-2 border-l border-t border-line">
          <MetaCell label={t("detail.likes")} value={formatNumber(agent.likeCount, locale)} />
          <MetaCell
            label={t("detail.interfaces")}
            value={agent.supportedInterfaces.map((value) => interfaceLabel(value, locale)).join(" / ") || "—"}
          />
          <MetaCell label={t("detail.subCategory")} value={pick(agent.subCategoryName, agent.subCategoryNameEn)} />
          <MetaCell
            label={t("filter.site")}
            value={agent.publishSites.map((site) => siteLabel(site, locale)).join(" / ") || "—"}
          />
        </div>
      </section>
    </article>
  );
}

function SkillDetail({
  skill,
  catalog,
  categoryColors,
  onOpenAgent,
  onCopyInstall,
}: {
  skill: Skill;
  catalog: Catalog;
  categoryColors: Record<string, string>;
  onOpenAgent: (agent: Agent) => void;
  onCopyInstall: (skill: Skill) => void;
}) {
  const { t, locale, pick } = useI18n();
  const color = categoryColors[skill.categoryCode] ?? "#6f6f6f";
  const related = catalog.agents
    .filter((agent) => agent.categoryCode === skill.categoryCode)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3);

  return (
    <article>
      <header className="border-b border-line px-5 py-5">
        <h2 id="detail-title" className="text-[22px] font-semibold leading-tight text-ink">
          {locale === "en" && skill.nameEn ? skill.nameEn : skill.displayName}
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          {locale === "en" && skill.nameEn ? skill.displayName : skill.nameEn}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge>
            <CategoryDot color={color} size={6} />
            {locale === "en" && skill.categoryNameEn ? skill.categoryNameEn : skill.categoryName}
          </Badge>
          {skill.subCategoryName ? <Badge>{pick(skill.subCategoryName, skill.subCategoryNameEn)}</Badge> : null}
          <Badge tone={skill.hosted ? "blue" : "default"}>
            {skill.hosted ? t("detail.hostedYes") : t("detail.hostedNo")}
          </Badge>
          <Badge>v{skill.version}</Badge>
          <Badge>{formatNumber(skill.installCount, locale)} {t("detail.installs")}</Badge>
        </div>
        <p className="mt-4 text-[13px] leading-6 text-muted">
          {pick(skill.summary, skill.summaryEn)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCopyInstall(skill)}
            className="alm-btn alm-btn-sm alm-btn-primary"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {t("detail.copyInstall")}
          </button>
          <a
            href={skill.githubPath}
            target="_blank"
            rel="noreferrer"
            className="alm-btn alm-btn-sm alm-btn-ghost border border-line-strong"
          >
            <Github className="h-3.5 w-3.5" aria-hidden="true" />
            {t("detail.openGithub")}
          </a>
        </div>
      </header>

      <section className="border-b border-line px-5 py-5">
        <SectionLabel>{t("detail.install")}</SectionLabel>
        <div className="mt-3 border border-line bg-ink">
          <div className="flex items-center justify-between border-b border-white/15 px-3 py-2">
            <span className="alm-mono text-[10px] uppercase tracking-[0.08em] text-white/50">
              shell
            </span>
            <button
              type="button"
              onClick={() => onCopyInstall(skill)}
              className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white"
            >
              <Copy className="h-3 w-3" aria-hidden="true" />
              {t("common.copy")}
            </button>
          </div>
          <pre className="overflow-x-auto p-3 text-[11px] leading-5 text-white">
            <code>{skill.installCommand}</code>
          </pre>
        </div>
        <p className="mt-2 text-[11px] text-soft">{t("detail.installHint")}</p>
      </section>

      <section className="border-b border-line px-5 py-5">
        <SectionLabel>{t("detail.metadata")}</SectionLabel>
        <div className="mt-3 grid grid-cols-2 border-l border-t border-line">
          <MetaCell label={t("detail.version")} value={skill.version} />
          <MetaCell label={t("detail.installs")} value={formatNumber(skill.installCount, locale)} />
          <MetaCell label={t("detail.likes")} value={formatNumber(skill.likeCount, locale)} />
          <MetaCell
            label={t("detail.tokens")}
            value={formatTokenRange(skill.minToken, skill.maxToken, locale)}
          />
          <MetaCell label={t("detail.updated")} value={formatDate(skill.updatedAt, locale)} />
          <MetaCell
            label={t("detail.hosted")}
            value={skill.hosted ? t("detail.hostedYes") : t("detail.hostedNo")}
          />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="px-5 py-5">
          <SectionLabel>{t("detail.relatedAgents")}</SectionLabel>
          <div className="mt-3 divide-y divide-line border-t border-line">
            {related.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => onOpenAgent(agent)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-mist"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryDot color={categoryColors[agent.categoryCode] ?? "#6f6f6f"} size={6} />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium text-ink">
                      {locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
                    </span>
                    <span className="alm-mono text-[10px] text-soft">{agent.catalogId}</span>
                  </span>
                </span>
                <Badge tone={agent.isPaid ? "amber" : "green"}>
                  {pricingLabel(agent.isPaid, locale)}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-line px-3 py-3">
      <div className="alm-label">{label}</div>
      <div className="mt-1 text-[12px] text-ink">{value || "—"}</div>
    </div>
  );
}
