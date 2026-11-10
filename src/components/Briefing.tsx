import { ArrowRight, GitCompare } from "lucide-react";
import type { Agent, CatalogMeta, Skill, Tab } from "../types";
import { formatNumber, pricingLabel } from "../lib/catalog";
import { useI18n } from "../lib/i18n";
import { AgentTypeMark, Badge, CategoryDot } from "./ui";

export function Briefing({
  meta,
  agents,
  skills,
  tab,
  categoryCount,
  freeCount,
  installTotal,
  categoryColors,
  onStartWizard,
  onBrowseAgents,
  onBrowseSkills,
  onCompareSample,
  onOpenAgent,
  onOpenSkill,
}: {
  meta: CatalogMeta;
  agents: Agent[];
  skills: Skill[];
  tab: Tab;
  categoryCount: number;
  freeCount: number;
  installTotal: number;
  categoryColors: Record<string, string>;
  onStartWizard: () => void;
  onBrowseAgents: () => void;
  onBrowseSkills: () => void;
  onCompareSample: () => void;
  onOpenAgent: (agent: Agent) => void;
  onOpenSkill: (skill: Skill) => void;
}) {
  const { t, locale } = useI18n();
  const sampleAgents = [...agents].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);
  const sampleSkills = [...skills].sort((a, b) => b.installCount - a.installCount).slice(0, 3);
  const isSkills = tab === "skills";
  const date = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(meta.fetchedAt));

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6 lg:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <div>
            <h1 className="max-w-full text-[clamp(2rem,3.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink lg:max-w-[24ch]">
              <span className="whitespace-nowrap">{t("hero.titleA1")}</span>{" "}
              <span className="whitespace-nowrap">{t("hero.titleA2")}</span>
              <br />
              <span className="text-blue">{t("hero.titleB")}</span>
            </h1>
            <p className="mt-4 max-w-[62ch] text-[14px] leading-7 text-muted lg:text-[15px]">
              {t("hero.lead")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="alm-btn alm-btn-primary" onClick={onStartWizard}>
                {t("hero.ctaWizard")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="alm-btn alm-btn-secondary"
                onClick={isSkills ? onBrowseSkills : onBrowseAgents}
              >
                {isSkills ? t("hero.ctaSkills") : t("hero.ctaAgents")}
              </button>
            </div>
            <div className="alm-meta mt-6">
              {t("hero.meta", {
                date,
                categories: categoryCount,
                free: freeCount,
                installs: formatNumber(installTotal, locale),
              })}
            </div>
          </div>

          <div className="hidden border border-line bg-paper lg:block">
            <div className="flex items-start justify-between gap-4 border-b border-line bg-mist px-4 py-3">
              <div>
                <div className="text-[13px] font-semibold text-ink">
                  {isSkills ? t("hero.skillsMatrixTitle") : t("hero.matrixTitle")}
                </div>
                <div className="mt-1 text-[11px] leading-4 text-muted">
                  {isSkills ? t("hero.skillsMatrixNote") : t("hero.matrixNote")}
                </div>
              </div>
              <Badge tone="blue" className="alm-mono shrink-0 text-[10px]">
                3 / {formatNumber(isSkills ? meta.skillCount : meta.agentCount, locale)}
              </Badge>
            </div>
            <div className="divide-y divide-line">
              {isSkills
                ? sampleSkills.map((skill) => (
                    <button
                      key={skill.name}
                      type="button"
                      onClick={() => onOpenSkill(skill)}
                      className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-mist"
                    >
                      <span className="alm-mono text-[10px] text-soft">{skill.catalogId}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {locale === "en" && skill.nameEn ? skill.nameEn : skill.displayName}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                          <CategoryDot
                            color={categoryColors[skill.categoryCode] ?? "#6f6f6f"}
                            size={6}
                          />
                          {locale === "en" && skill.categoryNameEn
                            ? skill.categoryNameEn
                            : skill.categoryName}
                        </span>
                      </span>
                      <Badge className="alm-mono">
                        {formatNumber(skill.installCount, locale)}
                      </Badge>
                    </button>
                  ))
                : sampleAgents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => onOpenAgent(agent)}
                      className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-mist"
                    >
                      <span className="alm-mono text-[10px] text-soft">{agent.catalogId}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                          <CategoryDot color={categoryColors[agent.categoryCode] ?? "#6f6f6f"} size={6} />
                          {locale === "en" && agent.categoryNameEn
                            ? agent.categoryNameEn
                            : agent.categoryName}
                          <span className="text-line" aria-hidden="true">
                            ·
                          </span>
                          <AgentTypeMark type={agent.agentType} />
                        </span>
                      </span>
                      <Badge tone={agent.isPaid ? "amber" : "green"}>
                        {pricingLabel(agent.isPaid, locale)}
                      </Badge>
                    </button>
                  ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
              {isSkills ? (
                <button
                  type="button"
                  onClick={onBrowseSkills}
                  className="alm-btn alm-btn-sm alm-btn-primary"
                >
                  {t("hero.skillsMatrixCta")}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCompareSample}
                  className="alm-btn alm-btn-sm alm-btn-primary"
                >
                  <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("hero.matrixCompare")}
                </button>
              )}
              <button
                type="button"
                onClick={isSkills ? onBrowseSkills : onBrowseAgents}
                className="text-[12px] text-blue hover:text-blue-dark"
              >
                {isSkills ? t("hero.ctaSkills") : t("hero.matrixAll")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
