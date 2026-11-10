import type {
  AccessFilter,
  Agent,
  Category,
  Locale,
  PriceFilter,
  SiteFilter,
  Skill,
  SortAgents,
  SortSkills,
  TokenFilter,
  WizardReasons,
} from "../types";

export const PALETTE = [
  "#0f62fe",
  "#1192e8",
  "#007d79",
  "#198038",
  "#ee538b",
  "#8a3ffc",
  "#ff832b",
  "#f1c21b",
  "#005d5d",
  "#9f1853",
  "#fa4d56",
  "#002d9c",
  "#a56eff",
  "#6f6f6f",
  "#6929c4",
  "#ff7eb6",
  "#08bdba",
  "#b28600",
];

export function buildCategoryColors(categories: Category[]): Record<string, string> {
  const colors: Record<string, string> = {};
  categories
    .filter((category) => category.level === 1)
    .forEach((category, index) => {
      colors[category.code] = PALETTE[index % PALETTE.length];
    });
  return colors;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(value);
}

export function formatCompact(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(iso: string, locale: Locale): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatTokenRange(
  min: number | null,
  max: number | null,
  locale: Locale,
): string {
  const low = min ?? max;
  const high = max ?? min;
  if (low == null || high == null) return "—";
  if (low === high) return formatCompact(low, locale);
  return `${formatCompact(low, locale)}–${formatCompact(high, locale)}`;
}

export function tokenBucket(skill: Skill): Exclude<TokenFilter, "all"> {
  const max = skill.maxToken ?? 0;
  if (max < 20_000) return "light";
  if (max <= 60_000) return "medium";
  return "heavy";
}

export function siteLabel(site: string, locale: Locale): string {
  if (site === "CHINA") return locale === "zh" ? "中国站" : "China";
  if (site === "INTERNATIONAL") return locale === "zh" ? "国际站" : "International";
  return site;
}

export function siteSummary(sites: string[], locale: Locale): string {
  if (sites.includes("CHINA") && sites.includes("INTERNATIONAL")) {
    return locale === "zh" ? "双站点" : "Both sites";
  }
  if (sites.includes("CHINA")) return siteLabel("CHINA", locale);
  if (sites.includes("INTERNATIONAL")) return siteLabel("INTERNATIONAL", locale);
  return "—";
}

export function interfaceLabel(value: string, locale: Locale): string {
  if (value === "console") return locale === "zh" ? "控制台" : "Console";
  if (value === "openAPI") return "OpenAPI";
  return value;
}

export function pricingLabel(isPaid: boolean, locale: Locale): string {
  if (!isPaid) return locale === "zh" ? "免费" : "Free";
  return locale === "zh" ? "付费" : "Paid";
}

export function tokenizeQuery(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function agentHaystack(agent: Agent): string {
  return [
    agent.catalogId,
    agent.name,
    agent.nameEn,
    agent.description,
    agent.descriptionEn,
    agent.categoryName,
    agent.categoryNameEn,
    agent.subCategoryName,
    agent.subCategoryNameEn,
    ...agent.features.flatMap((feature) => [
      feature.setName,
      feature.setNameEn,
      feature.name,
      feature.nameEn,
      feature.description,
      feature.descriptionEn,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export function skillHaystack(skill: Skill): string {
  return [
    skill.catalogId,
    skill.name,
    skill.displayName,
    skill.nameEn,
    skill.description,
    skill.descriptionEn,
    skill.summary,
    skill.summaryEn,
    skill.categoryName,
    skill.categoryNameEn,
    skill.subCategoryName,
    skill.subCategoryNameEn,
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesTokens(haystack: string, tokens: string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

export interface AgentFilterOptions {
  query: string;
  category: string;
  price: PriceFilter;
  access: AccessFilter;
  site: SiteFilter;
}

export function filterAgents(agents: Agent[], options: AgentFilterOptions): Agent[] {
  const tokens = tokenizeQuery(options.query);
  return agents.filter((agent) => {
    if (options.category && agent.categoryCode !== options.category) return false;
    if (options.price === "free" && agent.isPaid) return false;
    if (options.price === "paid" && !agent.isPaid) return false;
    if (options.access !== "all" && !agent.supportedInterfaces.includes(options.access)) {
      return false;
    }
    if (options.site !== "all" && !agent.publishSites.includes(options.site)) return false;
    if (tokens.length > 0 && !matchesTokens(agentHaystack(agent), tokens)) return false;
    return true;
  });
}

export function sortAgents(
  agents: Agent[],
  sort: SortAgents,
  locale: Locale,
): Agent[] {
  const copy = [...agents];
  copy.sort((a, b) => {
    switch (sort) {
      case "likes":
        return b.likeCount - a.likeCount || a.catalogId.localeCompare(b.catalogId);
      case "name":
        return (locale === "en" ? a.nameEn : a.name).localeCompare(
          locale === "en" ? b.nameEn : b.name,
          locale === "zh" ? "zh" : "en",
        );
      case "category":
        return (
          (locale === "en" ? a.categoryNameEn : a.categoryName).localeCompare(
            locale === "en" ? b.categoryNameEn : b.categoryName,
            locale === "zh" ? "zh" : "en",
          ) || a.catalogId.localeCompare(b.catalogId)
        );
      case "catalog":
      default:
        return a.catalogId.localeCompare(b.catalogId);
    }
  });
  return copy;
}

export interface SkillFilterOptions {
  query: string;
  category: string;
  token: TokenFilter;
}

export function filterSkills(skills: Skill[], options: SkillFilterOptions): Skill[] {
  const tokens = tokenizeQuery(options.query);
  return skills.filter((skill) => {
    if (options.category && skill.categoryCode !== options.category) return false;
    if (options.token !== "all" && tokenBucket(skill) !== options.token) return false;
    if (tokens.length > 0 && !matchesTokens(skillHaystack(skill), tokens)) return false;
    return true;
  });
}

export function sortSkills(
  skills: Skill[],
  sort: SortSkills,
  locale: Locale,
): Skill[] {
  const copy = [...skills];
  copy.sort((a, b) => {
    switch (sort) {
      case "likes":
        return b.likeCount - a.likeCount || b.installCount - a.installCount;
      case "tokens":
        return (b.maxToken ?? 0) - (a.maxToken ?? 0) || b.installCount - a.installCount;
      case "updated":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "name":
        return (locale === "en" ? a.nameEn : a.displayName).localeCompare(
          locale === "en" ? b.nameEn : b.displayName,
          locale === "zh" ? "zh" : "en",
        );
      case "installs":
      default:
        return b.installCount - a.installCount || b.likeCount - a.likeCount;
    }
  });
  return copy;
}

export type TaskId = "ops" | "security" | "data" | "dev" | "cost" | "media";
export type AccessChoice = "console" | "openAPI" | "both";
export type BudgetChoice = "free" | "any";
export type SiteChoice = "CHINA" | "INTERNATIONAL" | "both";

export interface WizardAnswers {
  task: TaskId | null;
  access: AccessChoice;
  budget: BudgetChoice;
  site: SiteChoice;
}

export interface TaskDefinition {
  id: TaskId;
  labelKey: string;
  descriptionKey: string;
  categories: string[];
  keywords: string[];
}

export const TASKS: TaskDefinition[] = [
  {
    id: "ops",
    labelKey: "wizard.task.ops",
    descriptionKey: "wizard.task.opsDesc",
    categories: ["migrationom", "database", "middleware", "computing", "storage", "netcdn"],
    keywords: [
      "运维",
      "诊断",
      "故障",
      "监控",
      "迁移",
      "变更",
      "O&M",
      "diagnos",
      "monitor",
      "migration",
      "incident",
      "operation",
    ],
  },
  {
    id: "security",
    labelKey: "wizard.task.security",
    descriptionKey: "wizard.task.securityDesc",
    categories: ["security"],
    keywords: ["安全", "合规", "审计", "防火墙", "漏洞", "security", "compliance", "audit", "firewall", "vulnerability"],
  },
  {
    id: "data",
    labelKey: "wizard.task.data",
    descriptionKey: "wizard.task.dataDesc",
    categories: ["aiml", "analyticscomputing", "database"],
    keywords: ["数据", "分析", "AI", "机器学习", "大模型", "知识库", "data", "analytics", "machine learning", "model", "llm", "rag"],
  },
  {
    id: "dev",
    labelKey: "wizard.task.dev",
    descriptionKey: "wizard.task.devDesc",
    categories: ["developertools", "container", "middleware"],
    keywords: ["开发", "集成", "API", "部署", "容器", "develop", "integration", "deploy", "container", "sdk"],
  },
  {
    id: "cost",
    labelKey: "wizard.task.cost",
    descriptionKey: "wizard.task.costDesc",
    categories: ["computing", "storage", "migrationom"],
    keywords: ["成本", "费用", "资源", "治理", "优化", "cost", "billing", "resource", "governance", "optimize"],
  },
  {
    id: "media",
    labelKey: "wizard.task.media",
    descriptionKey: "wizard.task.mediaDesc",
    categories: ["mediaservices", "netcdn", "storage"],
    keywords: ["媒体", "视频", "图片", "内容", "CDN", "media", "video", "image", "content"],
  },
];

export function getTask(id: TaskId | null): TaskDefinition | undefined {
  return TASKS.find((task) => task.id === id);
}

export function siteChoiceKey(site: SiteChoice): string {
  if (site === "CHINA") return "wizard.site.china";
  if (site === "INTERNATIONAL") return "wizard.site.intl";
  return "wizard.site.both";
}

export interface AgentRecommendation {
  agent: Agent;
  score: number;
  reasons: WizardReasons[];
  conditions: {
    category: boolean;
    access: boolean;
    budget: boolean;
    site: boolean;
  };
  conditionsMet: number;
}

export interface SkillRecommendation {
  skill: Skill;
  score: number;
  reasons: WizardReasons[];
}

function keywordHits(haystack: string, keywords: string[]): number {
  const lower = haystack.toLowerCase();
  const hits = new Set<string>();
  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) hits.add(keyword.toLowerCase());
  }
  return hits.size;
}

export function recommendAgents(
  agents: Agent[],
  answers: WizardAnswers,
): AgentRecommendation[] {
  const task = getTask(answers.task);
  if (!task) return [];

  const scored = agents.map((agent) => {
    const hits = keywordHits(agentHaystack(agent), task.keywords);
    const categoryMatch = task.categories.includes(agent.categoryCode);
    const accessMatch =
      answers.access === "both" || agent.supportedInterfaces.includes(answers.access);
    const budgetMatch = answers.budget === "any" || !agent.isPaid;
    const siteMatch =
      answers.site === "both" || agent.publishSites.includes(answers.site);

    const reasons: WizardReasons[] = [];
    let score = 0;

    if (categoryMatch) {
      score += 40;
      reasons.push("category");
    }
    if (hits > 0) {
      score += Math.min(hits, 3) * 8;
      reasons.push("keyword");
    }
    if (accessMatch && answers.access !== "both") {
      score += 20;
      reasons.push("interface");
    } else if (accessMatch) {
      score += 12;
    }
    if (!agent.isPaid) {
      score += answers.budget === "free" ? 15 : 5;
      reasons.push("free");
    }
    if (siteMatch && answers.site !== "both") {
      score += 10;
      reasons.push("site");
    } else if (siteMatch) {
      score += 6;
    }
    score += Math.min(agent.likeCount / 30, 1) * 5;

    return {
      agent,
      score,
      reasons,
      conditions: {
        category: categoryMatch,
        access: accessMatch,
        budget: budgetMatch,
        site: siteMatch,
      },
      conditionsMet: [categoryMatch, accessMatch, budgetMatch, siteMatch].filter(Boolean)
        .length,
    };
  });

  const relevant = scored.filter(
    (item) =>
      item.conditions.category ||
      item.reasons.includes("keyword") ||
      item.conditionsMet === 4,
  );
  const pool = relevant.length >= 3 ? relevant : scored;

  return pool.sort(
    (a, b) =>
      b.score - a.score ||
      b.conditionsMet - a.conditionsMet ||
      b.agent.likeCount - a.agent.likeCount,
  );
}

export function recommendSkills(
  skills: Skill[],
  answers: WizardAnswers,
): SkillRecommendation[] {
  const task = getTask(answers.task);
  if (!task) return [];

  const maxInstalls = Math.max(...skills.map((skill) => skill.installCount), 1);
  const scored = skills.map((skill) => {
    const hits = keywordHits(skillHaystack(skill), task.keywords);
    const categoryMatch = task.categories.includes(skill.categoryCode);
    const reasons: WizardReasons[] = [];
    let score = 0;

    if (categoryMatch) {
      score += 40;
      reasons.push("category");
    }
    if (hits > 0) {
      score += Math.min(hits, 3) * 10;
      reasons.push("keyword");
    }
    if (skill.installCount >= 500) {
      score += Math.min(skill.installCount / maxInstalls, 1) * 20;
      reasons.push("popular");
    }
    if ((skill.maxToken ?? 0) > 0 && (skill.maxToken ?? 0) <= 60_000) {
      score += 5;
      reasons.push("token");
    }
    score += Math.min(skill.likeCount / 20, 1) * 5;

    return { skill, score, reasons };
  });

  const relevant = scored.filter(
    (item) =>
      item.reasons.includes("category") ||
      item.reasons.includes("keyword") ||
      item.skill.installCount >= 1000,
  );
  const pool = relevant.length >= 3 ? relevant : scored;

  return pool.sort(
    (a, b) => b.score - a.score || b.skill.installCount - a.skill.installCount,
  );
}
