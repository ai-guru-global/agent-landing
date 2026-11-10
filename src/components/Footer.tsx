import { ExternalLink } from "lucide-react";
import type { CatalogMeta } from "../types";
import { formatDate } from "../lib/catalog";
import { useI18n } from "../lib/i18n";

export function Footer({ meta }: { meta: CatalogMeta }) {
  const { t, locale } = useI18n();
  const date = formatDate(meta.fetchedAt, locale);
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] lg:px-6">
        <div>
          <div className="alm-mono text-[11px] tracking-[0.1em] text-white/80">AGENT LANDING</div>
          <p className="mt-3 max-w-md text-[12px] leading-5 text-white/55">
            {t("footer.disclaimer")}
          </p>
        </div>
        <div>
          <div className="alm-label text-white/40">{t("nav.source")}</div>
          <a
            href={meta.source}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-1.5 text-[12px] text-white/75 hover:text-white"
          >
            {locale === "zh" ? meta.sourceLabel : meta.sourceLabelEn}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <div className="mt-2 text-[12px] text-white/50">
            {t("footer.snapshot", { date })}
          </div>
        </div>
        <div>
          <div className="alm-label text-white/40">{t("footer.built")}</div>
          <div className="mt-3 text-[12px] text-white/55">{t("footer.refresh")}</div>
          <a
            href="https://github.com/ai-guru-global/agent-landing"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-white/75 hover:text-white"
          >
            GitHub · {t("footer.license")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
