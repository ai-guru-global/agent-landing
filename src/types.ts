export type Locale = "zh" | "en";
export type Tab = "agents" | "skills" | "wizard";
export type AgentType = "standalone" | "embedded";

export interface Category {
  code: string;
  name: string;
  nameEn: string;
  level: number;
  parentCode: string;
  skillCount: number;
  agentCount: number;
}

export interface Feature {
  setName: string;
  name: string;
  description: string;
  setNameEn: string;
  nameEn: string;
  descriptionEn: string;
}

export interface OpenApiConfig {
  productCode: string;
  apiVersion: string;
  apiName: string;
  apiTitle: string;
  apiTitleEn: string;
  apiDescription: string;
  apiDescriptionEn: string;
}

export interface ConsoleConfig {
  site: string;
  consoleUrl: string;
}

export interface Agent {
  catalogId: string;
  id: string;
  agentType: AgentType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  categoryCode: string;
  categoryName: string;
  categoryNameEn: string;
  subCategoryCode: string;
  subCategoryName: string;
  subCategoryNameEn: string;
  usageGuideUrl: string;
  features: Feature[];
  publishSites: string[];
  supportedInterfaces: string[];
  isPaid: boolean;
  billingLogic: string;
  billingLogicEn: string;
  openApiConfigs: OpenApiConfig[];
  consoleConfigs: ConsoleConfig[];
  likeCount: number;
}

export interface Skill {
  catalogId: string;
  name: string;
  displayName: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  summary: string;
  summaryEn: string;
  categoryCode: string;
  categoryName: string;
  categoryNameEn: string;
  subCategoryCode: string;
  subCategoryName: string;
  subCategoryNameEn: string;
  githubPath: string;
  installCommand: string;
  version: string;
  minToken: number | null;
  maxToken: number | null;
  likeCount: number;
  installCount: number;
  hosted: boolean;
  updatedAt: string;
}

export interface CatalogMeta {
  schemaVersion: number;
  source: string;
  sourceLabel: string;
  sourceLabelEn: string;
  fetchedAt: string;
  agentCount: number;
  skillCount: number;
  categoryCount: number;
  activeCategoryCount: number;
  agentTypeCounts: {
    standalone: number;
    embedded: number;
  };
  agentTypeSource: string;
}

export interface Catalog {
  meta: CatalogMeta;
  categories: Category[];
  agents: Agent[];
  skills: Skill[];
}

export type DetailTarget =
  | { type: "agent"; id: string }
  | { type: "skill"; name: string }
  | null;

export type SortAgents = "catalog" | "likes" | "name" | "category";
export type SortSkills = "installs" | "likes" | "tokens" | "updated" | "name";
export type PriceFilter = "all" | "free" | "paid";
export type AccessFilter = "all" | "console" | "openAPI";
export type SiteFilter = "all" | "CHINA" | "INTERNATIONAL";
export type TokenFilter = "all" | "light" | "medium" | "heavy";

export type WizardReasons =
  | "category"
  | "keyword"
  | "interface"
  | "free"
  | "site"
  | "popular"
  | "token";
