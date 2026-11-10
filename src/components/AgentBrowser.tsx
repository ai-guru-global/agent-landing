import {
  ChevronRight,
  Heart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Agent, AgentType, Category, SortAgents } from "../types";
import {
  formatNumber,
  interfaceLabel,
  pricingLabel,
  siteSummary,
} from "../lib/catalog";
import { useI18n } from "../lib/i18n";
import {
  AgentTypeMark,
  Badge,
  CategoryDot,
  EmptyState,
  Highlight,
  SearchInput,
  Select,
} from "./ui";

interface AgentBrowserProps {
  agents: Agent[];
  totalCount: number;
  categories: Category[];
  categoryColors: Record<string, string>;
  query: string;
  onQuery: (value: string) => void;
  sort: SortAgents;
  onSort: (value: SortAgents) => void;
  agentType: AgentType | "all";
  onAgentType: (value: AgentType | "all") => void;
  typeCounts: Record<"all" | AgentType, number>;
  category: string;
  onCategory: (value: string) => void;
  price: "all" | "free" | "paid";
  onPrice: (value: "all" | "free" | "paid") => void;
  access: "all" | "console" | "openAPI";
  onAccess: (value: "all" | "console" | "openAPI") => void;
  site: "all" | "CHINA" | "INTERNATIONAL";
  onSite: (value: "all" | "CHINA" | "INTERNATIONAL") => void;
  compareIds: string[];
  onToggleCompare: (agent: Agent) => void;
  onOpenAgent: (agent: Agent) => void;
  onClearFilters: () => void;
  onOpenFilters: () => void;
}

export function AgentBrowser({
  agents,
  totalCount,
  categories,
  categoryColors,
  query,
  onQuery,
  sort,
  onSort,
  agentType,
  onAgentType,
  typeCounts,
  category,
  onCategory,
  price,
  onPrice,
  access,
  onAccess,
  site,
  onSite,
  compareIds,
  onToggleCompare,
  onOpenAgent,
  onClearFilters,
  onOpenFilters,
}: AgentBrowserProps) {
  const { t, locale } = useI18n();
  const categoryName = category
    ? categories.find((item) => item.code === category)
    : undefined;
  const activeFilterCount =
    (category ? 1 : 0) + (price !== "all" ? 1 : 0) + (access !== "all" ? 1 : 0) + (site !== "all" ? 1 : 0);

  const sortOptions = [
    { value: "catalog", label: t("sort.catalog") },
    { value: "likes", label: t("sort.likes") },
    { value: "name", label: t("sort.name") },
    { value: "category", label: t("sort.category") },
  ];

  return (
    <div className="min-w-0 flex-1 bg-paper">
      <div className="sticky top-12 z-30 border-b border-line bg-paper px-3 py-3 lg:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{t("workspace.agents")}</h2>
            <p className="mt-0.5 truncate text-[11px] text-muted">{t("workspace.agentsLead")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenFilters}
              className="alm-btn alm-btn-sm border border-line bg-paper text-ink lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {t("filter.mobile")}
              {activeFilterCount > 0 ? (
                <span className="alm-mono bg-blue px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <Select
              value={sort}
              onChange={(value) => onSort(value as SortAgents)}
              options={sortOptions}
              ariaLabel={t("sort.label")}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div
            className="flex max-w-full overflow-x-auto border border-line"
            role="group"
            aria-label={t("agentType.type")}
            title={t("agentType.legend")}
          >
            {(
              [
                { value: "all" as const, label: t("agentType.all"), activeClass: "bg-ink text-white" },
                {
                  value: "standalone" as const,
                  label: t("agentType.standalone"),
                  activeClass: "bg-blue text-white",
                },
                {
                  value: "embedded" as const,
                  label: t("agentType.embedded"),
                  activeClass: "bg-muted text-white",
                },
              ] as const
            ).map((item) => {
              const active = agentType === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onAgentType(item.value)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-1.5 border-r border-line px-2.5 py-1.5 text-[11px] transition-colors last:border-r-0 ${
                    active ? item.activeClass : "bg-paper text-muted hover:bg-mist"
                  }`}
                >
                  {item.label}
                  <span
                    className={`alm-mono text-[10px] ${
                      active ? "text-white/65" : "text-soft"
                    }`}
                  >
                    {formatNumber(typeCounts[item.value], locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-1.5 hidden text-[10px] text-soft lg:block">
          {t("agentType.legendShort")}
        </div>
        <div className="mt-3">
          <SearchInput value={query} onChange={onQuery} placeholder={t("search.placeholder")} />
        </div>
        <div className="mt-2 flex min-h-6 flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {categoryName ? (
              <button
                type="button"
                onClick={() => onCategory("")}
                className="alm-tag border-line-strong bg-mist text-ink"
              >
                {locale === "en" && categoryName.nameEn ? categoryName.nameEn : categoryName.name}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {price !== "all" ? (
              <button
                type="button"
                onClick={() => onPrice("all")}
                className="alm-tag border-line-strong bg-mist text-ink"
              >
                {price === "free" ? t("filter.free") : t("filter.paid")}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {access !== "all" ? (
              <button
                type="button"
                onClick={() => onAccess("all")}
                className="alm-tag border-line-strong bg-mist text-ink"
              >
                {access === "console" ? t("filter.console") : t("filter.openAPI")}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {site !== "all" ? (
              <button
                type="button"
                onClick={() => onSite("all")}
                className="alm-tag border-line-strong bg-mist text-ink"
              >
                {site === "CHINA" ? t("filter.china") : t("filter.international")}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-[11px] text-blue hover:text-blue-dark"
              >
                {t("filter.clear")}
              </button>
            ) : null}
          </div>
          <span className="alm-mono text-[10px] text-soft">
            {formatNumber(agents.length, locale)} / {formatNumber(totalCount, locale)}
          </span>
        </div>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          title={t("common.noResults")}
          hint={t("common.noResultsHint")}
          action={
            <button type="button" className="alm-btn alm-btn-sm alm-btn-secondary" onClick={onClearFilters}>
              {t("common.clearFilters")}
            </button>
          }
        />
      ) : (
        <>
          <div className="lg:hidden">
            <div className="divide-y divide-line">
              {agents.map((agent) => (
                <AgentMobileRow
                  key={agent.id}
                  agent={agent}
                  color={categoryColors[agent.categoryCode] ?? "#6f6f6f"}
                  query={query}
                  selected={compareIds.includes(agent.id)}
                  compareDisabled={!compareIds.includes(agent.id) && compareIds.length >= 3}
                  onToggleCompare={onToggleCompare}
                  onOpen={onOpenAgent}
                />
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <table className="alm-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <span className="sr-only">{t("common.compare")}</span>
                  </th>
                  <th className="w-16">{t("table.catalogId")}</th>
                  <th>{t("table.agent")}</th>
                  <th className="w-[150px]">{t("table.category")}</th>
                  <th className="w-[170px]">{t("table.access")}</th>
                  <th className="w-[80px]">{t("table.pricing")}</th>
                  <th className="w-[64px] text-right">{t("table.likes")}</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const selected = compareIds.includes(agent.id);
                  return (
                    <tr
                      key={agent.id}
                      data-selected={selected}
                      onClick={() => onOpenAgent(agent)}
                    >
                      <td onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="alm-check"
                          checked={selected}
                          disabled={!selected && compareIds.length >= 3}
                          onChange={() => onToggleCompare(agent)}
                          aria-label={`${t("common.addCompare")} ${agent.catalogId}`}
                          title={!selected && compareIds.length >= 3 ? t("common.maxCompare") : undefined}
                        />
                      </td>
                      <td className="alm-mono whitespace-nowrap text-[10px] text-soft">{agent.catalogId}</td>
                      <td>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenAgent(agent);
                          }}
                          className="block max-w-[420px] text-left"
                        >
                          <span className="block truncate text-[13px] font-medium text-ink">
                            <Highlight
                              text={locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
                              query={query}
                            />
                          </span>
                          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
                            <AgentTypeMark type={agent.agentType} />
                            <span className="text-line" aria-hidden="true">
                              ·
                            </span>
                            <span className="truncate">
                              <Highlight
                                text={locale === "en" && agent.nameEn ? agent.name : agent.nameEn}
                                query={query}
                              />
                            </span>
                          </span>
                        </button>
                      </td>
                      <td>
                        <span className="flex items-center gap-1.5 text-[12px] text-ink">
                          <CategoryDot color={categoryColors[agent.categoryCode] ?? "#6f6f6f"} size={6} />
                          <span className="truncate">
                            {locale === "en" && agent.categoryNameEn
                              ? agent.categoryNameEn
                              : agent.categoryName}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-soft">
                          {locale === "en" && agent.subCategoryNameEn
                            ? agent.subCategoryNameEn
                            : agent.subCategoryName}
                        </span>
                      </td>
                      <td>
                        <span className="flex flex-wrap gap-1">
                          {agent.supportedInterfaces.map((value) => (
                            <Badge key={value} tone={value === "openAPI" ? "blue" : "default"}>
                              {interfaceLabel(value, locale)}
                            </Badge>
                          ))}
                        </span>
                        <span className="mt-1 block text-[10px] text-soft">
                          {siteSummary(agent.publishSites, locale)}
                        </span>
                      </td>
                      <td>
                        <Badge tone={agent.isPaid ? "amber" : "green"}>
                          {pricingLabel(agent.isPaid, locale)}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <span className="alm-mono inline-flex items-center gap-1 text-[11px] text-muted">
                          <Heart className="h-3 w-3" aria-hidden="true" />
                          {formatNumber(agent.likeCount, locale)}
                        </span>
                      </td>
                      <td>
                        <ChevronRight className="h-4 w-4 text-soft" aria-hidden="true" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function AgentMobileRow({
  agent,
  color,
  query,
  selected,
  compareDisabled,
  onToggleCompare,
  onOpen,
}: {
  agent: Agent;
  color: string;
  query: string;
  selected: boolean;
  compareDisabled: boolean;
  onToggleCompare: (agent: Agent) => void;
  onOpen: (agent: Agent) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <div className={`p-4 ${selected ? "bg-blue-soft" : "bg-paper"}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onOpen(agent)} className="min-w-0 flex-1 text-left">
          <div className="alm-mono whitespace-nowrap text-[10px] text-soft">{agent.catalogId}</div>
          <div className="mt-1 text-[14px] font-medium text-ink">
            <Highlight
              text={locale === "en" && agent.nameEn ? agent.nameEn : agent.name}
              query={query}
            />
          </div>
          <div className="mt-0.5 text-[11px] text-muted">
            {locale === "en" && agent.nameEn ? agent.name : agent.nameEn}
          </div>
        </button>
        <input
          type="checkbox"
          className="alm-check mt-1"
          checked={selected}
          disabled={compareDisabled}
          onChange={() => onToggleCompare(agent)}
          aria-label={`${t("common.addCompare")} ${agent.catalogId}`}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge>
          <CategoryDot color={color} size={6} />
          {locale === "en" && agent.categoryNameEn ? agent.categoryNameEn : agent.categoryName}
        </Badge>
        <AgentTypeMark type={agent.agentType} className="px-0.5" />
        <Badge tone={agent.isPaid ? "amber" : "green"}>
          {pricingLabel(agent.isPaid, locale)}
        </Badge>
        {agent.supportedInterfaces.map((value) => (
          <Badge key={value} tone={value === "openAPI" ? "blue" : "default"}>
            {interfaceLabel(value, locale)}
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-soft">
        <span>{siteSummary(agent.publishSites, locale)}</span>
        <span className="alm-mono inline-flex items-center gap-1">
          <Heart className="h-3 w-3" aria-hidden="true" />
          {formatNumber(agent.likeCount, locale)}
        </span>
      </div>
    </div>
  );
}
