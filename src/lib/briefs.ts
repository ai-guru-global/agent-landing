import type { Agent, Catalog, Locale, Skill } from "../types";
import {
  formatDate,
  formatNumber,
  formatTokenRange,
  getTask,
  interfaceLabel,
  pricingLabel,
  siteChoiceKey,
  siteSummary,
  type AgentRecommendation,
  type SkillRecommendation,
  type WizardAnswers,
} from "./catalog";

type Translate = (key: string, params?: Record<string, string | number>) => string;

function agentName(agent: Agent, locale: Locale): string {
  return locale === "en" && agent.nameEn ? agent.nameEn : agent.name;
}

function skillName(skill: Skill, locale: Locale): string {
  return locale === "en" && skill.nameEn ? skill.nameEn : skill.displayName;
}

function categoryName(agent: Agent | Skill, locale: Locale): string {
  return locale === "en" && agent.categoryNameEn
    ? agent.categoryNameEn
    : agent.categoryName;
}

function reasonLabels(
  reasons: string[],
  t: Translate,
): string[] {
  return reasons.map((reason) => t(`wizard.reason.${reason}`));
}

export function buildCompareMarkdown(
  agents: Agent[],
  catalog: Catalog,
  locale: Locale,
  t: Translate,
): string {
  const date = formatDate(catalog.meta.fetchedAt, locale);
  const lines: string[] = [
    `# ${t("compare.title")}`,
    "",
    `> ${t("footer.source")} · ${t("footer.snapshot", { date })}`,
    `> ${t("footer.disclaimer")}`,
    "",
    `| ${t("compare.id")} | ${t("compare.name")} | ${t("compare.category")} | ${t("compare.pricing")} | ${t("compare.interfaces")} | ${t("compare.sites")} | ${t("compare.likes")} |`,
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const agent of agents) {
    lines.push(
      `| ${agent.catalogId} | ${agentName(agent, locale)} | ${categoryName(agent, locale)} | ${pricingLabel(agent.isPaid, locale)} | ${agent.supportedInterfaces.map((value) => interfaceLabel(value, locale)).join(" / ") || "—"} | ${siteSummary(agent.publishSites, locale)} | ${formatNumber(agent.likeCount, locale)} |`,
    );
  }

  lines.push("", `## ${t("compare.docs")}`, "");
  for (const agent of agents) {
    lines.push(
      `- ${agent.catalogId} ${agentName(agent, locale)} — ${agent.usageGuideUrl || t("common.na")}`,
    );
  }

  return lines.join("\n");
}

export function buildWizardMarkdown(
  answers: WizardAnswers,
  agentRecommendations: AgentRecommendation[],
  skillRecommendations: SkillRecommendation[],
  catalog: Catalog,
  locale: Locale,
  t: Translate,
): string {
  const task = getTask(answers.task);
  const date = formatDate(catalog.meta.fetchedAt, locale);
  const lines: string[] = [
    `# ${t("wizard.results")}`,
    "",
    `> ${t("footer.source")} · ${t("footer.snapshot", { date })}`,
    `> ${t("footer.disclaimer")}`,
    "",
    `- ${t("wizard.step1")}: ${task ? t(task.labelKey) : "—"}`,
    `- ${t("wizard.step2")}: ${t(`wizard.access.${answers.access}`)}`,
    `- ${t("filter.pricing")}: ${t(`wizard.budget.${answers.budget}`)}`,
    `- ${t("filter.site")}: ${t(siteChoiceKey(answers.site))}`,
    "",
    `## ${t("wizard.agents")}`,
    "",
  ];

  agentRecommendations.slice(0, 3).forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.agent.catalogId} ${agentName(item.agent, locale)} · ${categoryName(item.agent, locale)} · ${t("common.conditionsMet", { count: item.conditionsMet })}`,
    );
    lines.push(`   - ${t("wizard.why")}: ${reasonLabels(item.reasons, t).join(" / ")}`);
    lines.push(`   - ${t("common.official")}: ${item.agent.usageGuideUrl || t("common.na")}`);
  });

  lines.push("", `## ${t("wizard.skills")}`, "");
  skillRecommendations.slice(0, 6).forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.skill.catalogId} ${skillName(item.skill, locale)} · ${categoryName(item.skill, locale)} · ${formatNumber(item.skill.installCount, locale)} ${t("table.installs")} · ${formatTokenRange(item.skill.minToken, item.skill.maxToken, locale)} tokens`,
    );
    lines.push(`   - ${t("wizard.why")}: ${reasonLabels(item.reasons, t).join(" / ")}`);
    lines.push(`   - \`${item.skill.installCommand}\``);
  });

  return lines.join("\n");
}
