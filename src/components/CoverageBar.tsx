import type { Category, Tab } from "../types";
import { formatNumber } from "../lib/catalog";
import { useI18n } from "../lib/i18n";
import { CategoryDot } from "./ui";

export function CoverageBar({
  categories,
  tab,
  activeCategory,
  onSelect,
  categoryColors,
}: {
  categories: Category[];
  tab: Tab;
  activeCategory: string;
  onSelect: (code: string) => void;
  categoryColors: Record<string, string>;
}) {
  const { t, locale } = useI18n();
  const topLevel = categories.filter((category) => category.level === 1);
  const counts = topLevel.map((category) => ({
    category,
    count: tab === "skills" ? category.skillCount : category.agentCount,
  }));
  const total = counts.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1600px] px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="alm-label">{t("coverage.title")}</span>
            <span className="hidden text-[11px] text-soft sm:inline">{t("coverage.hint")}</span>
          </div>
          <span className="alm-mono text-[10px] text-soft">
            {formatNumber(total, locale)} {tab === "skills" ? t("coverage.skills") : t("coverage.agents")}
          </span>
        </div>

        <div className="mt-3 flex h-2.5 w-full gap-px overflow-hidden" aria-hidden="true">
          {total === 0
            ? null
            : counts
                .filter((item) => item.count > 0)
                .map(({ category, count }) => (
                  <button
                    key={category.code}
                    type="button"
                    onClick={() => onSelect(activeCategory === category.code ? "" : category.code)}
                    title={`${locale === "en" ? category.nameEn : category.name} · ${count}`}
                    className="h-full transition-opacity duration-150 hover:opacity-80"
                    style={{
                      flexGrow: count,
                      flexBasis: 0,
                      background: categoryColors[category.code] ?? "#6f6f6f",
                      opacity: activeCategory && activeCategory !== category.code ? 0.3 : 1,
                    }}
                  />
                ))}
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onSelect("")}
            aria-pressed={activeCategory === ""}
            className={`alm-tag shrink-0 transition-colors ${
              activeCategory === "" ? "border-ink bg-ink text-white" : "hover:border-line-strong"
            }`}
          >
            {t("coverage.all")}
          </button>
          {topLevel.map((category) => {
            const count = tab === "skills" ? category.skillCount : category.agentCount;
            if (count === 0) return null;
            const active = activeCategory === category.code;
            return (
              <button
                key={category.code}
                type="button"
                onClick={() => onSelect(active ? "" : category.code)}
                aria-pressed={active}
                className={`alm-tag shrink-0 transition-colors ${
                  active ? "border-ink bg-mist text-ink" : "hover:border-line-strong"
                }`}
              >
                <CategoryDot color={categoryColors[category.code] ?? "#6f6f6f"} size={6} />
                {locale === "en" && category.nameEn ? category.nameEn : category.name}
                <span className="alm-mono text-[10px] text-soft">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
