import { X } from "lucide-react";
import type {
  AccessFilter,
  Category,
  PriceFilter,
  SiteFilter,
  Tab,
  TokenFilter,
} from "../types";
import { formatNumber } from "../lib/catalog";
import { useI18n } from "../lib/i18n";
import { CategoryDot, SectionLabel } from "./ui";

interface FilterRailProps {
  tab: Tab;
  categories: Category[];
  category: string;
  onCategory: (value: string) => void;
  price: PriceFilter;
  onPrice: (value: PriceFilter) => void;
  access: AccessFilter;
  onAccess: (value: AccessFilter) => void;
  site: SiteFilter;
  onSite: (value: SiteFilter) => void;
  token: TokenFilter;
  onToken: (value: TokenFilter) => void;
  categoryColors: Record<string, string>;
  onClear: () => void;
  onClose?: () => void;
}

export function FilterRail({
  tab,
  categories,
  category,
  onCategory,
  price,
  onPrice,
  access,
  onAccess,
  site,
  onSite,
  token,
  onToken,
  categoryColors,
  onClear,
  onClose,
}: FilterRailProps) {
  const { t, locale } = useI18n();
  const topLevel = categories
    .filter((item) => item.level === 1)
    .filter((item) => (tab === "skills" ? item.skillCount : item.agentCount) > 0)
    .sort(
      (a, b) =>
        (tab === "skills" ? b.skillCount : b.agentCount) -
        (tab === "skills" ? a.skillCount : a.agentCount),
    );

  const radios = <T extends string>(
    value: T,
    onChange: (value: T) => void,
    options: { value: T; label: string }[],
  ) => (
    <div className="space-y-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className="alm-radio-row"
        >
          <span>{option.label}</span>
          <span className="alm-radio-dot" aria-hidden="true" />
        </button>
      ))}
    </div>
  );

  return (
    <aside className="flex h-full w-full flex-col bg-paper lg:w-[264px] lg:shrink-0 lg:border-r lg:border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <SectionLabel>{t("filter.title")}</SectionLabel>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-blue hover:text-blue-dark"
          >
            {t("filter.clear")}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center text-muted hover:bg-mist hover:text-ink"
              aria-label={t("filter.close")}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <div>
          <SectionLabel>{t("filter.category")}</SectionLabel>
          <div className="mt-2 max-h-64 space-y-0.5 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onCategory("")}
              aria-pressed={category === ""}
              className="alm-radio-row"
            >
              <span>{t("filter.all")}</span>
              <span className="alm-mono text-[10px] text-soft">
                {formatNumber(
                  topLevel.reduce(
                    (sum, item) => sum + (tab === "skills" ? item.skillCount : item.agentCount),
                    0,
                  ),
                  locale,
                )}
              </span>
            </button>
            {topLevel.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => onCategory(category === item.code ? "" : item.code)}
                aria-pressed={category === item.code}
                className="alm-radio-row gap-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryDot color={categoryColors[item.code] ?? "#6f6f6f"} size={6} />
                  <span className="truncate">
                    {locale === "en" && item.nameEn ? item.nameEn : item.name}
                  </span>
                </span>
                <span className="alm-mono text-[10px] text-soft">
                  {tab === "skills" ? item.skillCount : item.agentCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tab === "agents" ? (
          <>
            <div>
              <SectionLabel>{t("filter.pricing")}</SectionLabel>
              <div className="mt-2">
                {radios<PriceFilter>(price, onPrice, [
                  { value: "all", label: t("filter.all") },
                  { value: "free", label: t("filter.free") },
                  { value: "paid", label: t("filter.paid") },
                ])}
              </div>
            </div>
            <div>
              <SectionLabel>{t("filter.interface")}</SectionLabel>
              <div className="mt-2">
                {radios<AccessFilter>(access, onAccess, [
                  { value: "all", label: t("filter.all") },
                  { value: "console", label: t("filter.console") },
                  { value: "openAPI", label: t("filter.openAPI") },
                ])}
              </div>
            </div>
            <div>
              <SectionLabel>{t("filter.site")}</SectionLabel>
              <div className="mt-2">
                {radios<SiteFilter>(site, onSite, [
                  { value: "all", label: t("filter.all") },
                  { value: "CHINA", label: t("filter.china") },
                  { value: "INTERNATIONAL", label: t("filter.international") },
                ])}
              </div>
            </div>
          </>
        ) : (
          <div>
            <SectionLabel>{t("filter.token")}</SectionLabel>
            <div className="mt-2">
              {radios<TokenFilter>(token, onToken, [
                { value: "all", label: t("filter.all") },
                { value: "light", label: t("filter.light") },
                { value: "medium", label: t("filter.medium") },
                { value: "heavy", label: t("filter.heavy") },
              ])}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
