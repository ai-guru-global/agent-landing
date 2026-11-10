import { useEffect, useState } from "react";
import { ChevronRight, Copy, SlidersHorizontal, X } from "lucide-react";
import type { Category, Skill, SortSkills, TokenFilter } from "../types";
import {
  formatNumber,
  formatTokenRange,
  tokenBucket,
} from "../lib/catalog";
import { useI18n } from "../lib/i18n";
import {
  Badge,
  CategoryDot,
  EmptyState,
  Highlight,
  SearchInput,
  Select,
} from "./ui";

interface SkillBrowserProps {
  skills: Skill[];
  totalCount: number;
  categories: Category[];
  categoryColors: Record<string, string>;
  query: string;
  onQuery: (value: string) => void;
  sort: SortSkills;
  onSort: (value: SortSkills) => void;
  category: string;
  onCategory: (value: string) => void;
  token: TokenFilter;
  onToken: (value: TokenFilter) => void;
  onOpenSkill: (skill: Skill) => void;
  onCopyInstall: (skill: Skill) => void;
  onClearFilters: () => void;
  onOpenFilters: () => void;
}

const PAGE = 40;

export function SkillBrowser({
  skills,
  totalCount,
  categories,
  categoryColors,
  query,
  onQuery,
  sort,
  onSort,
  category,
  onCategory,
  token,
  onToken,
  onOpenSkill,
  onCopyInstall,
  onClearFilters,
  onOpenFilters,
}: SkillBrowserProps) {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    setVisible(PAGE);
  }, [query, category, token, sort]);

  const shown = skills.slice(0, visible);
  const categoryName = category
    ? categories.find((item) => item.code === category)
    : undefined;
  const activeFilterCount = (category ? 1 : 0) + (token !== "all" ? 1 : 0);

  const sortOptions = [
    { value: "installs", label: t("sort.installs") },
    { value: "likes", label: t("sort.likes") },
    { value: "tokens", label: t("sort.tokens") },
    { value: "updated", label: t("sort.updated") },
    { value: "name", label: t("sort.name") },
  ];

  return (
    <div className="min-w-0 flex-1 bg-paper">
      <div className="sticky top-12 z-30 border-b border-line bg-paper px-3 py-3 lg:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{t("workspace.skills")}</h2>
            <p className="mt-0.5 truncate text-[11px] text-muted">{t("workspace.skillsLead")}</p>
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
              onChange={(value) => onSort(value as SortSkills)}
              options={sortOptions}
              ariaLabel={t("sort.label")}
            />
          </div>
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
            {token !== "all" ? (
              <button
                type="button"
                onClick={() => onToken("all")}
                className="alm-tag border-line-strong bg-mist text-ink"
              >
                {token === "light"
                  ? t("filter.light")
                  : token === "medium"
                    ? t("filter.medium")
                    : t("filter.heavy")}
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
            {formatNumber(skills.length, locale)} / {formatNumber(totalCount, locale)}
          </span>
        </div>
      </div>

      {skills.length === 0 ? (
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
              {shown.map((skill) => (
                <div key={skill.name} className="p-4">
                  <button
                    type="button"
                    onClick={() => onOpenSkill(skill)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="alm-mono whitespace-nowrap text-[10px] text-soft">{skill.catalogId}</span>
                      <span className="alm-mono text-[10px] text-muted">
                        {formatNumber(skill.installCount, locale)} {t("table.installs")}
                      </span>
                    </div>
                    <div className="mt-1 text-[14px] font-medium text-ink">
                      <Highlight
                        text={locale === "en" && skill.nameEn ? skill.nameEn : skill.displayName}
                        query={query}
                      />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {locale === "en" && skill.nameEn ? skill.displayName : skill.nameEn}
                    </div>
                    <p className="alm-line-clamp-2 mt-2 text-[12px] leading-5 text-muted">
                      {locale === "en" && skill.summaryEn ? skill.summaryEn : skill.summary}
                    </p>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge>
                      <CategoryDot color={categoryColors[skill.categoryCode] ?? "#6f6f6f"} size={6} />
                      {locale === "en" && skill.categoryNameEn
                        ? skill.categoryNameEn
                        : skill.categoryName}
                    </Badge>
                    <Badge>
                      {tokenBucket(skill) === "light"
                        ? t("filter.light")
                        : tokenBucket(skill) === "medium"
                          ? t("filter.medium")
                          : t("filter.heavy")}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => onCopyInstall(skill)}
                      className="alm-tag border-line-strong text-blue"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      {t("detail.copyInstall")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <table className="alm-table">
              <thead>
                <tr>
                  <th className="w-16">{t("table.catalogId")}</th>
                  <th className="w-[280px]">{t("table.skill")}</th>
                  <th className="w-[150px]">{t("table.category")}</th>
                  <th className="hidden xl:table-cell">{t("table.summary")}</th>
                  <th className="w-[84px] text-right">{t("table.installs")}</th>
                  <th className="w-[120px] text-right">{t("table.tokens")}</th>
                  <th className="w-[72px] text-right">{t("table.action")}</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {shown.map((skill) => (
                  <tr key={skill.name} onClick={() => onOpenSkill(skill)}>
                    <td className="alm-mono whitespace-nowrap text-[10px] text-soft">{skill.catalogId}</td>
                    <td>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenSkill(skill);
                        }}
                        className="block w-full text-left"
                      >
                        <span className="block truncate text-[13px] font-medium text-ink">
                          <Highlight
                            text={locale === "en" && skill.nameEn ? skill.nameEn : skill.displayName}
                            query={query}
                          />
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted">
                          <Highlight
                            text={locale === "en" && skill.nameEn ? skill.displayName : skill.nameEn}
                            query={query}
                          />
                        </span>
                      </button>
                    </td>
                    <td>
                      <span className="flex items-center gap-1.5 text-[12px] text-ink">
                        <CategoryDot color={categoryColors[skill.categoryCode] ?? "#6f6f6f"} size={6} />
                        <span className="truncate">
                          {locale === "en" && skill.categoryNameEn
                            ? skill.categoryNameEn
                            : skill.categoryName}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-soft">
                        {locale === "en" && skill.subCategoryNameEn
                          ? skill.subCategoryNameEn
                          : skill.subCategoryName}
                      </span>
                    </td>
                    <td className="hidden max-w-[360px] xl:table-cell">
                      <p className="alm-line-clamp-1 text-[12px] leading-5 text-muted">
                        {locale === "en" && skill.summaryEn ? skill.summaryEn : skill.summary}
                      </p>
                    </td>
                    <td className="text-right">
                      <span className="alm-mono text-[11px] text-ink">
                        {formatNumber(skill.installCount, locale)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="alm-mono text-[11px] text-muted">
                        {formatTokenRange(skill.minToken, skill.maxToken, locale)}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCopyInstall(skill);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center border border-line text-muted transition-colors hover:border-line-strong hover:text-blue"
                        aria-label={`${t("detail.copyInstall")} ${skill.name}`}
                        title={t("detail.copyInstall")}
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                    <td>
                      <ChevronRight className="h-4 w-4 text-soft" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible < skills.length ? (
            <div className="flex justify-center border-t border-line py-6">
              <button
                type="button"
                className="alm-btn alm-btn-sm alm-btn-secondary"
                onClick={() => setVisible((value) => value + PAGE)}
              >
                {t("common.loadMore")} · {formatNumber(skills.length - visible, locale)}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
