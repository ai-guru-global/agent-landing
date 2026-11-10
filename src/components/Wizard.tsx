import { ArrowLeft, ArrowRight, Check, Copy, GitCompare, ListChecks, RotateCcw, X } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import type { Agent, Catalog, Skill } from "../types";
import {
  formatNumber,
  formatTokenRange,
  pricingLabel,
  recommendAgents,
  recommendSkills,
  siteChoiceKey,
  TASKS,
  type AccessChoice,
  type BudgetChoice,
  type SiteChoice,
  type TaskId,
  type WizardAnswers,
} from "../lib/catalog";
import { buildWizardMarkdown } from "../lib/briefs";
import { useI18n } from "../lib/i18n";
import { AgentTypeMark, Badge, CategoryDot, EmptyState, SectionLabel } from "./ui";

interface WizardProps {
  catalog: Catalog;
  categoryColors: Record<string, string>;
  answers: WizardAnswers;
  onAnswers: (answers: WizardAnswers) => void;
  step: number;
  onStep: (step: number) => void;
  done: boolean;
  onDone: (done: boolean) => void;
  onReset: () => void;
  compareIds: string[];
  onToggleCompare: (agent: Agent) => void;
  onOpenAgent: (agent: Agent) => void;
  onOpenSkill: (skill: Skill) => void;
  onCopyInstall: (skill: Skill) => void;
  onCopy: (text: string, message: string) => void;
}

const ACCESS_OPTIONS: { value: AccessChoice; labelKey: string; descKey: string }[] = [
  { value: "console", labelKey: "wizard.access.console", descKey: "wizard.access.consoleDesc" },
  { value: "openAPI", labelKey: "wizard.access.openAPI", descKey: "wizard.access.openAPIDesc" },
  { value: "both", labelKey: "wizard.access.both", descKey: "wizard.access.bothDesc" },
];

const BUDGET_OPTIONS: { value: BudgetChoice; labelKey: string; descKey: string }[] = [
  { value: "free", labelKey: "wizard.budget.free", descKey: "wizard.budget.freeDesc" },
  { value: "any", labelKey: "wizard.budget.any", descKey: "wizard.budget.anyDesc" },
];

const SITE_OPTIONS: { value: SiteChoice; labelKey: string; descKey: string }[] = [
  { value: "CHINA", labelKey: "wizard.site.china", descKey: "wizard.site.chinaDesc" },
  { value: "INTERNATIONAL", labelKey: "wizard.site.intl", descKey: "wizard.site.intlDesc" },
  { value: "both", labelKey: "wizard.site.both", descKey: "wizard.site.bothDesc" },
];

export function Wizard({
  catalog,
  categoryColors,
  answers,
  onAnswers,
  step,
  onStep,
  done,
  onDone,
  onReset,
  compareIds,
  onToggleCompare,
  onOpenAgent,
  onOpenSkill,
  onCopyInstall,
  onCopy,
}: WizardProps) {
  const { t } = useI18n();
  const agentRecommendations = useMemo(
    () => recommendAgents(catalog.agents, answers),
    [catalog.agents, answers],
  );
  const skillRecommendations = useMemo(
    () => recommendSkills(catalog.skills, answers),
    [catalog.skills, answers],
  );

  const chooseTask = (id: TaskId) => onAnswers({ ...answers, task: id });
  const chooseAccess = (value: AccessChoice) => onAnswers({ ...answers, access: value });
  const chooseBudget = (value: BudgetChoice) => onAnswers({ ...answers, budget: value });
  const chooseSite = (value: SiteChoice) => onAnswers({ ...answers, site: value });

  const steps = [t("wizard.step1"), t("wizard.step2"), t("wizard.step3")];
  const canAdvance = step > 0 || Boolean(answers.task);

  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6">
        <div className="border border-line bg-paper">
          <div className="border-b border-line px-4 py-5 lg:px-8 lg:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-ink">
                  {t("wizard.title")}
                </h2>
                <p className="mt-2 max-w-[70ch] text-[13px] leading-6 text-muted">
                  {t("wizard.lead")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {steps.map((label, index) => {
                  const active = !done && step === index;
                  const complete = done || step > index;
                  const future = !done && index > step;
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={future}
                      onClick={() => {
                        onDone(false);
                        onStep(index);
                      }}
                      className={`flex items-center gap-2 border px-3 py-2 text-[11px] transition-colors ${
                        active
                          ? "border-blue bg-blue-soft text-blue-dark"
                          : complete
                            ? "border-line text-ink"
                            : "border-line text-soft"
                      } ${future ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      <span className="alm-mono text-[10px]">{complete ? <Check className="h-3 w-3" /> : `0${index + 1}`}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {done ? (
            <WizardResults
              catalog={catalog}
              answers={answers}
              agentRecommendations={agentRecommendations.slice(0, 3)}
              skillRecommendations={skillRecommendations.slice(0, 6)}
              categoryColors={categoryColors}
              compareIds={compareIds}
              onToggleCompare={onToggleCompare}
              onOpenAgent={onOpenAgent}
              onOpenSkill={onOpenSkill}
              onCopyInstall={onCopyInstall}
              onReset={onReset}
              onCopy={onCopy}
            />
          ) : (
            <div className="px-4 py-6 lg:px-8 lg:py-8">
              {step === 0 ? (
                <StepBlock hint={t("wizard.step1Hint")}>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {TASKS.map((item) => (
                      <OptionPanel
                        key={item.id}
                        selected={answers.task === item.id}
                        onClick={() => chooseTask(item.id)}
                        label={t(item.labelKey)}
                        description={t(item.descriptionKey)}
                      />
                    ))}
                  </div>
                </StepBlock>
              ) : null}

              {step === 1 ? (
                <StepBlock hint={t("wizard.step2Hint")}>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {ACCESS_OPTIONS.map((item) => (
                      <OptionPanel
                        key={item.value}
                        selected={answers.access === item.value}
                        onClick={() => chooseAccess(item.value)}
                        label={t(item.labelKey)}
                        description={t(item.descKey)}
                      />
                    ))}
                  </div>
                </StepBlock>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  <StepBlock hint={t("wizard.step3Hint")}>
                    <SectionLabel>{t("filter.pricing")}</SectionLabel>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {BUDGET_OPTIONS.map((item) => (
                        <OptionPanel
                          key={item.value}
                          selected={answers.budget === item.value}
                          onClick={() => chooseBudget(item.value)}
                          label={t(item.labelKey)}
                          description={t(item.descKey)}
                        />
                      ))}
                    </div>
                  </StepBlock>
                  <StepBlock hint={t("wizard.step3Hint")}>
                    <SectionLabel>{t("filter.site")}</SectionLabel>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {SITE_OPTIONS.map((item) => (
                        <OptionPanel
                          key={item.value}
                          selected={answers.site === item.value}
                          onClick={() => chooseSite(item.value)}
                          label={t(item.labelKey)}
                          description={t(item.descKey)}
                        />
                      ))}
                    </div>
                  </StepBlock>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  className="alm-btn alm-btn-sm alm-btn-ghost"
                  onClick={() => {
                    if (done) {
                      onDone(false);
                    }
                    if (step > 0) onStep(step - 1);
                  }}
                  disabled={step === 0}
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("wizard.back")}
                </button>
                <div className="flex items-center gap-2">
                  <span className="alm-mono text-[10px] text-soft">
                    {step + 1} / 3
                  </span>
                  {step < 2 ? (
                    <button
                      type="button"
                      className="alm-btn alm-btn-sm alm-btn-primary"
                      disabled={!canAdvance}
                      onClick={() => onStep(step + 1)}
                    >
                      {t("wizard.next")}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="alm-btn alm-btn-sm alm-btn-primary"
                      disabled={!answers.task}
                      onClick={() => onDone(true)}
                    >
                      {t("wizard.viewResults")}
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StepBlock({ hint, children }: { hint: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-[13px] text-ink">{hint}</p>
      {children}
    </div>
  );
}

function OptionPanel({
  selected,
  onClick,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex min-h-[92px] flex-col justify-between border p-4 text-left transition-colors ${
        selected
          ? "border-blue bg-blue-soft"
          : "border-line bg-paper hover:border-line-strong hover:bg-mist"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className={`text-[14px] font-medium ${selected ? "text-blue-dark" : "text-ink"}`}>
          {label}
        </span>
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
            selected ? "border-blue bg-blue text-white" : "border-line-strong bg-paper text-transparent"
          }`}
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      </span>
      <span className="mt-2 text-[11px] leading-5 text-muted">{description}</span>
    </button>
  );
}

function WizardResults({
  catalog,
  answers,
  agentRecommendations,
  skillRecommendations,
  categoryColors,
  compareIds,
  onToggleCompare,
  onOpenAgent,
  onOpenSkill,
  onCopyInstall,
  onReset,
  onCopy,
}: {
  catalog: Catalog;
  answers: WizardAnswers;
  agentRecommendations: ReturnType<typeof recommendAgents>;
  skillRecommendations: ReturnType<typeof recommendSkills>;
  categoryColors: Record<string, string>;
  compareIds: string[];
  onToggleCompare: (agent: Agent) => void;
  onOpenAgent: (agent: Agent) => void;
  onOpenSkill: (skill: Skill) => void;
  onCopyInstall: (skill: Skill) => void;
  onReset: () => void;
  onCopy: (text: string, message: string) => void;
}) {
  const { t, locale } = useI18n();
  const hasResults = agentRecommendations.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist px-4 py-3 lg:px-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="blue">{answers.task ? t(`wizard.task.${answers.task}`) : "—"}</Badge>
          <Badge>{t(`wizard.access.${answers.access}`)}</Badge>
          <Badge>{t(`wizard.budget.${answers.budget}`)}</Badge>
          <Badge>{t(siteChoiceKey(answers.site))}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onCopy(
                buildWizardMarkdown(
                  answers,
                  agentRecommendations,
                  skillRecommendations,
                  catalog,
                  locale,
                  t,
                ),
                t("wizard.briefCopied"),
              )
            }
            className="alm-btn alm-btn-sm alm-btn-secondary"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {t("wizard.copyBrief")}
          </button>
          <button type="button" onClick={onReset} className="alm-btn alm-btn-sm alm-btn-ghost">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("wizard.reset")}
          </button>
        </div>
      </div>

      {!hasResults ? (
        <EmptyState title={t("wizard.noResults")} hint={t("wizard.noResultsHint")} />
      ) : (
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="border-b border-line lg:border-b-0 lg:border-r">
            <div className="flex items-end justify-between gap-3 px-4 pt-6 lg:px-8">
              <div>
                <h3 className="text-[17px] font-semibold text-ink">{t("wizard.agents")}</h3>
                <p className="mt-1 text-[11px] text-muted">{t("wizard.resultsLead")}</p>
              </div>
              <span className="alm-mono text-[10px] text-soft">
                {agentRecommendations.length} / {catalog.meta.agentCount}
              </span>
            </div>
            <div className="mt-4 divide-y divide-line border-t border-line">
              {agentRecommendations.map((item, index) => (
                <RecommendationRow
                  key={item.agent.id}
                  item={item}
                  index={index}
                  color={categoryColors[item.agent.categoryCode] ?? "#6f6f6f"}
                  selected={compareIds.includes(item.agent.id)}
                  onToggleCompare={onToggleCompare}
                  onOpenAgent={onOpenAgent}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3 px-4 pt-6 lg:px-8">
              <div>
                <h3 className="text-[17px] font-semibold text-ink">{t("wizard.skills")}</h3>
                <p className="mt-1 text-[11px] text-muted">{t("wizard.resultsLead")}</p>
              </div>
              <span className="alm-mono text-[10px] text-soft">
                {skillRecommendations.length} / {catalog.meta.skillCount}
              </span>
            </div>
            <div className="mt-4">
              <table className="alm-table">
                <thead>
                  <tr>
                    <th className="w-16">{t("table.catalogId")}</th>
                    <th>{t("table.skill")}</th>
                    <th className="w-[86px] text-right">{t("table.installs")}</th>
                    <th className="w-[118px] text-right">{t("table.tokens")}</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {skillRecommendations.map((item) => (
                    <tr key={item.skill.name} onClick={() => onOpenSkill(item.skill)}>
                      <td className="alm-mono whitespace-nowrap text-[10px] text-soft">{item.skill.catalogId}</td>
                      <td>
                        <div className="text-[12px] font-medium text-ink">
                          {locale === "en" && item.skill.nameEn
                            ? item.skill.nameEn
                            : item.skill.displayName}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.reasons.slice(0, 2).map((reason) => (
                            <Badge key={reason} tone="blue">
                              {t(`wizard.reason.${reason}`)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="alm-mono text-[11px] text-ink">
                          {formatNumber(item.skill.installCount, locale)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="alm-mono text-[10px] text-muted">
                          {formatTokenRange(item.skill.minToken, item.skill.maxToken, locale)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onCopyInstall(item.skill);
                          }}
                          className="flex h-7 w-7 items-center justify-center text-soft hover:bg-mist hover:text-blue"
                          aria-label={t("wizard.copyInstall")}
                          title={t("wizard.copyInstall")}
                        >
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationRow({
  item,
  index,
  color,
  selected,
  onToggleCompare,
  onOpenAgent,
}: {
  item: ReturnType<typeof recommendAgents>[number];
  index: number;
  color: string;
  selected: boolean;
  onToggleCompare: (agent: Agent) => void;
  onOpenAgent: (agent: Agent) => void;
}) {
  const { t, locale, pick } = useI18n();
  const agent = item.agent;
  const conditions = [
    { key: "category", label: t("wizard.conditionCategory"), met: item.conditions.category },
    { key: "access", label: t("wizard.conditionAccess"), met: item.conditions.access },
    { key: "budget", label: t("wizard.conditionBudget"), met: item.conditions.budget },
    { key: "site", label: t("wizard.conditionSite"), met: item.conditions.site },
  ];

  return (
    <article className="grid gap-4 px-4 py-5 lg:grid-cols-[1fr_auto] lg:px-8">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="alm-mono text-[10px] text-soft">0{index + 1}</span>
          {index === 0 ? (
            <Badge tone="blue">{t("wizard.topPick")}</Badge>
          ) : (
            <Badge>{t("wizard.alternative")}</Badge>
          )}
          <span className="alm-mono text-[10px] text-soft">{agent.catalogId}</span>
          <AgentTypeMark type={agent.agentType} />
          <Badge tone={agent.isPaid ? "amber" : "green"}>{pricingLabel(agent.isPaid, locale)}</Badge>
        </div>
        <button
          type="button"
          onClick={() => onOpenAgent(agent)}
          className="mt-1.5 block text-left"
        >
          <span className="text-[16px] font-semibold text-ink">
            {locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
          </span>
          <span className="ml-2 text-[11px] text-muted">
            {locale === "en" && agent.nameEn ? agent.name : agent.nameEn}
          </span>
        </button>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
          <CategoryDot color={color} size={6} />
          {locale === "en" && agent.categoryNameEn ? agent.categoryNameEn : agent.categoryName}
          <span className="text-line">·</span>
          {pick(agent.subCategoryName, agent.subCategoryNameEn)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="alm-mono text-[10px] text-soft">
            {t("common.conditionsMet", { count: item.conditionsMet })}
          </span>
          {conditions.map((condition) => (
            <span
              key={condition.key}
              className={`alm-tag ${
                condition.met ? "border-transparent bg-[#defbe6] text-[#0e6027]" : "text-soft"
              }`}
            >
              {condition.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {condition.label}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.reasons.map((reason) => (
            <Badge key={reason} tone="blue">
              {t(`wizard.reason.${reason}`)}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-2 lg:flex-col">
        <button
          type="button"
          onClick={() => onOpenAgent(agent)}
          className="alm-btn alm-btn-sm alm-btn-secondary"
        >
          {t("wizard.viewAgent")}
        </button>
        <button
          type="button"
          onClick={() => onToggleCompare(agent)}
          className={`alm-btn alm-btn-sm ${selected ? "alm-btn-secondary" : "alm-btn-ghost border border-line-strong"}`}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
          {selected ? t("common.removeCompare") : t("wizard.addCompare")}
        </button>
      </div>
    </article>
  );
}
