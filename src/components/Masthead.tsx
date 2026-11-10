import { ExternalLink, Github } from "lucide-react";
import type { Locale } from "../types";
import { formatDate } from "../lib/catalog";
import { useI18n } from "../lib/i18n";

function LogoMark() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-blue">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1z" fill="white" />
        <path d="M8.5 8.5h4v4h-4z" stroke="white" />
      </svg>
    </span>
  );
}

export function Masthead({
  locale,
  setLocale,
  source,
  fetchedAt,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  source: string;
  fetchedAt: string;
}) {
  const { t } = useI18n();
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <span className="alm-mono shrink-0 text-[11px] font-medium tracking-[0.1em]">
            {t("app.name")}
          </span>
          <span className="hidden h-4 w-px shrink-0 bg-white/25 sm:block" />
          <span className="hidden truncate text-[13px] text-white/65 sm:block">
            {t("app.subtitle")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="alm-label hidden items-center gap-2 text-white/55 md:flex">
            <span className="h-1.5 w-1.5 bg-blue" aria-hidden="true" />
            {t("app.snapshot")} · {formatDate(fetchedAt, locale)}
          </span>
          <div
            className="flex h-7 items-center border border-white/25"
            role="group"
            aria-label={t("nav.language")}
          >
            <button
              type="button"
              onClick={() => setLocale("zh")}
              aria-pressed={locale === "zh"}
              className={`h-full px-2 text-[11px] transition-colors ${
                locale === "zh" ? "bg-white text-ink" : "text-white/65 hover:text-white"
              }`}
            >
              {t("lang.zh")}
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`h-full px-2 text-[11px] transition-colors ${
                locale === "en" ? "bg-white text-ink" : "text-white/65 hover:text-white"
              }`}
            >
              {t("lang.en")}
            </button>
          </div>
          <a
            href={source}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.source")}
            className="hidden h-7 w-7 items-center justify-center text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:flex"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/ai-guru-global/agent-landing"
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.github")}
            className="flex h-7 w-7 items-center justify-center text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
