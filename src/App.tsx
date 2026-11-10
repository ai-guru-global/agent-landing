import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type {
  AccessFilter,
  Agent,
  DetailTarget,
  PriceFilter,
  SiteFilter,
  Skill,
  SortAgents,
  SortSkills,
  Tab,
  TokenFilter,
} from "./types";
import {
  buildCategoryColors,
  filterAgents,
  filterSkills,
  sortAgents as sortAgentList,
  sortSkills as sortSkillList,
  type AccessChoice,
  type BudgetChoice,
  type SiteChoice,
  type TaskId,
  type WizardAnswers,
} from "./lib/catalog";
import { buildCompareMarkdown } from "./lib/briefs";
import { copyText } from "./lib/clipboard";
import { useCatalog } from "./hooks/useCatalog";
import { useDialogFocus } from "./hooks/useDialogFocus";
import { useI18n } from "./lib/i18n";
import { Masthead } from "./components/Masthead";
import { NavTabs } from "./components/NavTabs";
import { Briefing } from "./components/Briefing";
import { CoverageBar } from "./components/CoverageBar";
import { FilterRail } from "./components/FilterRail";
import { AgentBrowser } from "./components/AgentBrowser";
import { SkillBrowser } from "./components/SkillBrowser";
import { Wizard } from "./components/Wizard";
import { DetailPanel } from "./components/DetailPanel";
import { CompareBar } from "./components/CompareBar";
import { CompareModal } from "./components/CompareModal";
import { Footer } from "./components/Footer";
import { SkeletonRows, Toast } from "./components/ui";

interface UrlState {
  tab: Tab;
  query: string;
  category: string;
  price: PriceFilter;
  access: AccessFilter;
  site: SiteFilter;
  token: TokenFilter;
  agentSort: SortAgents;
  skillSort: SortSkills;
  compareIds: string[];
  compareOpen: boolean;
  agentId: string | null;
  skillName: string | null;
  wizardTask: TaskId | null;
  wizardAccess: AccessChoice;
  wizardBudget: BudgetChoice;
  wizardSite: SiteChoice;
  wizardStep: number;
  wizardDone: boolean;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function optionalOneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function readUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    tab: oneOf(params.get("tab"), ["agents", "skills", "wizard"] as const, "agents"),
    query: params.get("q") ?? "",
    category: params.get("cat") ?? "",
    price: oneOf(params.get("price"), ["all", "free", "paid"] as const, "all"),
    access: oneOf(params.get("access"), ["all", "console", "openAPI"] as const, "all"),
    site: oneOf(
      params.get("site"),
      ["all", "CHINA", "INTERNATIONAL"] as const,
      "all",
    ),
    token: oneOf(params.get("token"), ["all", "light", "medium", "heavy"] as const, "all"),
    agentSort: oneOf(
      params.get("asort"),
      ["catalog", "likes", "name", "category"] as const,
      "catalog",
    ),
    skillSort: oneOf(
      params.get("ssort"),
      ["installs", "likes", "tokens", "updated", "name"] as const,
      "installs",
    ),
    compareIds: (params.get("compare") ?? "").split(",").filter(Boolean).slice(0, 3),
    compareOpen: params.get("compareOpen") === "1",
    agentId: params.get("agent"),
    skillName: params.get("skill"),
    wizardTask: optionalOneOf(params.get("wtask"), [
      "ops",
      "security",
      "data",
      "dev",
      "cost",
      "media",
    ] as const),
    wizardAccess: oneOf(
      params.get("waccess"),
      ["console", "openAPI", "both"] as const,
      "both",
    ),
    wizardBudget: oneOf(params.get("wbudget"), ["free", "any"] as const, "any"),
    wizardSite: oneOf(
      params.get("wsite"),
      ["CHINA", "INTERNATIONAL", "both"] as const,
      "both",
    ),
    wizardStep: Math.min(
      2,
      Math.max(0, Number.parseInt(params.get("wstep") ?? "0", 10) || 0),
    ),
    wizardDone: params.get("wdone") === "1",
  };
}

function scrollToWorkspace() {
  window.setTimeout(() => {
    const target = document.getElementById("workspace");
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, 30);
}

export function App() {
  const { catalog, loading, error, retry } = useCatalog();
  const { t, locale, setLocale } = useI18n();
  const [initial] = useState(readUrlState);

  const [tab, setTab] = useState<Tab>(initial.tab);
  const [query, setQuery] = useState(initial.query);
  const [category, setCategory] = useState(initial.category);
  const [price, setPrice] = useState<PriceFilter>(initial.price);
  const [access, setAccess] = useState<AccessFilter>(initial.access);
  const [site, setSite] = useState<SiteFilter>(initial.site);
  const [token, setToken] = useState<TokenFilter>(initial.token);
  const [agentSort, setAgentSort] = useState<SortAgents>(initial.agentSort);
  const [skillSort, setSkillSort] = useState<SortSkills>(initial.skillSort);
  const [compareIds, setCompareIds] = useState<string[]>(initial.compareIds);
  const [detail, setDetail] = useState<DetailTarget>(() =>
    initial.agentId
      ? { type: "agent", id: initial.agentId }
      : initial.skillName
        ? { type: "skill", name: initial.skillName }
        : null,
  );
  const [compareOpen, setCompareOpen] = useState(initial.compareOpen);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    tone: "default" | "error";
  } | null>(null);

  const [wizardAnswers, setWizardAnswers] = useState<WizardAnswers>({
    task: initial.wizardTask,
    access: initial.wizardAccess,
    budget: initial.wizardBudget,
    site: initial.wizardSite,
  });
  const [wizardStep, setWizardStep] = useState(initial.wizardStep);
  const [wizardDone, setWizardDone] = useState(initial.wizardDone && Boolean(initial.wizardTask));

  const categories = catalog?.categories ?? [];
  const categoryColors = useMemo(() => buildCategoryColors(categories), [categories]);
  const freeCount = catalog ? catalog.agents.filter((agent) => !agent.isPaid).length : 0;
  const installTotal = catalog
    ? catalog.skills.reduce((sum, skill) => sum + skill.installCount, 0)
    : 0;

  const filteredAgents = useMemo(() => {
    if (!catalog) return [];
    return sortAgentList(
      filterAgents(catalog.agents, { query, category, price, access, site }),
      agentSort,
      locale,
    );
  }, [catalog, query, category, price, access, site, agentSort, locale]);

  const filteredSkills = useMemo(() => {
    if (!catalog) return [];
    return sortSkillList(
      filterSkills(catalog.skills, { query, category, token }),
      skillSort,
      locale,
    );
  }, [catalog, query, category, token, skillSort, locale]);

  const compareAgents = useMemo(
    () =>
      compareIds
        .map((id) => catalog?.agents.find((agent) => agent.id === id))
        .filter((agent): agent is Agent => Boolean(agent)),
    [compareIds, catalog],
  );

  const detailAgent =
    detail?.type === "agent"
      ? (catalog?.agents.find((agent) => agent.id === detail.id) ?? null)
      : null;
  const detailSkill =
    detail?.type === "skill"
      ? (catalog?.skills.find((skill) => skill.name === detail.name) ?? null)
      : null;

  const notify = useCallback(
    (message: string, tone: "default" | "error" = "default") =>
      setToast({ id: Date.now(), message, tone }),
    [],
  );

  const handleCopy = useCallback(
    async (text: string, message: string) => {
      const ok = await copyText(text);
      notify(ok ? message : t("toast.copyFailed"), ok ? "default" : "error");
    },
    [notify, t],
  );

  const handleCopyInstall = useCallback(
    async (skill: Skill) => {
      const ok = await copyText(skill.installCommand);
      if (!ok) {
        setDetail({ type: "skill", name: skill.name });
        setCompareOpen(false);
        notify(t("toast.copyFailedDetail"), "error");
        return;
      }
      notify(t("toast.installCopied"));
    },
    [notify, t],
  );

  const handleToggleCompare = useCallback(
    (agent: Agent) => {
      if (compareIds.includes(agent.id)) {
        setCompareIds(compareIds.filter((id) => id !== agent.id));
        return;
      }
      if (compareIds.length >= 3) {
        notify(t("toast.maxCompare"), "error");
        return;
      }
      setCompareIds([...compareIds, agent.id]);
    },
    [compareIds, notify, t],
  );

  const openAgent = useCallback((agent: Agent) => {
    setDetail({ type: "agent", id: agent.id });
    setCompareOpen(false);
    setMobileFilters(false);
  }, []);

  const openSkill = useCallback((skill: Skill) => {
    setDetail({ type: "skill", name: skill.name });
    setCompareOpen(false);
    setMobileFilters(false);
  }, []);

  const openCompare = useCallback(() => {
    if (compareIds.length < 2) {
      notify(t("common.compareHint"), "error");
      return;
    }
    setDetail(null);
    setCompareOpen(true);
  }, [compareIds, notify, t]);

  const copyCompare = useCallback(() => {
    if (!catalog) return;
    void handleCopy(
      buildCompareMarkdown(compareAgents, catalog, locale, t),
      t("toast.compareCopied"),
    );
  }, [catalog, compareAgents, handleCopy, locale, t]);

  const changeTab = useCallback(
    (next: Tab) => {
      setTab(next);
      setMobileFilters(false);
      if (next === "wizard") window.scrollTo({ top: 0, behavior: "auto" });
    },
    [],
  );

  const browseAgents = useCallback(() => {
    setTab("agents");
    setMobileFilters(false);
    scrollToWorkspace();
  }, []);

  const browseSkills = useCallback(() => {
    setTab("skills");
    setMobileFilters(false);
    scrollToWorkspace();
  }, []);

  const startWizard = useCallback(() => {
    setTab("wizard");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const compareSample = useCallback(() => {
    if (!catalog) return;
    const ids = [...catalog.agents]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 3)
      .map((agent) => agent.id);
    setCompareIds(ids);
    setDetail(null);
    setCompareOpen(true);
  }, [catalog]);

  const clearAgentFilters = useCallback(() => {
    setQuery("");
    setCategory("");
    setPrice("all");
    setAccess("all");
    setSite("all");
  }, []);

  const clearSkillFilters = useCallback(() => {
    setQuery("");
    setCategory("");
    setToken("all");
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.title =
      locale === "zh"
        ? "Agent Landing · 阿里云 Agent 选型台"
        : "Agent Landing · Alibaba Cloud Agent Selection Desk";
  }, [locale]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (detail || compareOpen || mobileFilters) return;
      const input = document.querySelector<HTMLInputElement>('input[type="search"]');
      if (!input) return;
      event.preventDefault();
      input.focus();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [detail, compareOpen, mobileFilters]);

  useEffect(() => {
    if (!catalog) return;
    setCompareIds((prev) => {
      const next = prev.filter((id) => catalog.agents.some((agent) => agent.id === id)).slice(0, 3);
      return next.length === prev.length ? prev : next;
    });
  }, [catalog]);

  useEffect(() => {
    if (!catalog || !category) return;
    const match = catalog.categories.find(
      (item) => item.code === category && item.level === 1,
    );
    if (
      !match ||
      (tab === "agents" && match.agentCount === 0) ||
      (tab === "skills" && match.skillCount === 0)
    ) {
      setCategory("");
    }
  }, [catalog, category, tab]);

  useEffect(() => {
    if (!catalog || !detail) return;
    const valid =
      detail.type === "agent"
        ? catalog.agents.some((agent) => agent.id === detail.id)
        : catalog.skills.some((skill) => skill.name === detail.name);
    if (!valid) setDetail(null);
  }, [catalog, detail]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (locale !== "zh") params.set("lang", locale);
    if (tab !== "agents") params.set("tab", tab);
    if (query) params.set("q", query);
    if (category) params.set("cat", category);
    if (price !== "all") params.set("price", price);
    if (access !== "all") params.set("access", access);
    if (site !== "all") params.set("site", site);
    if (token !== "all") params.set("token", token);
    if (agentSort !== "catalog") params.set("asort", agentSort);
    if (skillSort !== "installs") params.set("ssort", skillSort);
    if (compareIds.length > 0) params.set("compare", compareIds.join(","));
    if (compareOpen && compareIds.length > 0) params.set("compareOpen", "1");
    if (detail?.type === "agent") params.set("agent", detail.id);
    if (detail?.type === "skill") params.set("skill", detail.name);
    const hasWizardState =
      Boolean(wizardAnswers.task) || wizardStep > 0 || wizardDone;
    if (tab === "wizard" && hasWizardState) {
      if (wizardAnswers.task) params.set("wtask", wizardAnswers.task);
      params.set("waccess", wizardAnswers.access);
      params.set("wbudget", wizardAnswers.budget);
      params.set("wsite", wizardAnswers.site);
      if (wizardStep > 0) params.set("wstep", String(wizardStep));
      if (wizardDone) params.set("wdone", "1");
    }
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [
    tab,
    query,
    category,
    price,
    access,
    site,
    token,
    agentSort,
    skillSort,
    compareIds,
    compareOpen,
    detail,
    wizardAnswers,
    wizardStep,
    wizardDone,
    locale,
  ]);

  if (loading) return <LoadingShell />;
  if (error || !catalog) {
    return <ErrorShell message={error ?? t("common.error")} onRetry={retry} />;
  }

  const filterProps = {
    tab,
    categories: catalog.categories,
    category,
    onCategory: setCategory,
    price,
    onPrice: setPrice,
    access,
    onAccess: setAccess,
    site,
    onSite: setSite,
    token,
    onToken: setToken,
    categoryColors,
    onClear: tab === "agents" ? clearAgentFilters : clearSkillFilters,
  };

  return (
    <div className={`flex min-h-screen flex-col bg-paper ${compareAgents.length > 0 ? "pb-16" : ""}`}>
      <Masthead
        locale={locale}
        setLocale={setLocale}
        source={catalog.meta.source}
        fetchedAt={catalog.meta.fetchedAt}
      />
      <NavTabs
        tab={tab}
        onChange={changeTab}
        agentCount={catalog.meta.agentCount}
        skillCount={catalog.meta.skillCount}
        source={catalog.meta.source}
      />

      <main className="flex-1">
        {tab !== "wizard" ? (
          <>
            <Briefing
              meta={catalog.meta}
              agents={catalog.agents}
              skills={catalog.skills}
              tab={tab}
              categoryCount={catalog.meta.activeCategoryCount}
              freeCount={freeCount}
              installTotal={installTotal}
              categoryColors={categoryColors}
              onStartWizard={startWizard}
              onBrowseAgents={browseAgents}
              onBrowseSkills={browseSkills}
              onCompareSample={compareSample}
              onOpenAgent={openAgent}
              onOpenSkill={openSkill}
            />
            <CoverageBar
              categories={catalog.categories}
              tab={tab}
              activeCategory={category}
              onSelect={setCategory}
              categoryColors={categoryColors}
            />
            <section id="workspace" className="bg-mist">
              <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
                <div className="flex min-h-[60vh] border border-line bg-paper">
                  <div className="hidden max-h-[calc(100vh-3rem)] overflow-y-auto lg:sticky lg:top-12 lg:block lg:self-start">
                    <FilterRail {...filterProps} />
                  </div>
                  {tab === "agents" ? (
                    <AgentBrowser
                      agents={filteredAgents}
                      totalCount={catalog.meta.agentCount}
                      categories={catalog.categories}
                      categoryColors={categoryColors}
                      query={query}
                      onQuery={setQuery}
                      sort={agentSort}
                      onSort={setAgentSort}
                      category={category}
                      onCategory={setCategory}
                      price={price}
                      onPrice={setPrice}
                      access={access}
                      onAccess={setAccess}
                      site={site}
                      onSite={setSite}
                      compareIds={compareIds}
                      onToggleCompare={handleToggleCompare}
                      onOpenAgent={openAgent}
                      onClearFilters={clearAgentFilters}
                      onOpenFilters={() => setMobileFilters(true)}
                    />
                  ) : (
                    <SkillBrowser
                      skills={filteredSkills}
                      totalCount={catalog.meta.skillCount}
                      categories={catalog.categories}
                      categoryColors={categoryColors}
                      query={query}
                      onQuery={setQuery}
                      sort={skillSort}
                      onSort={setSkillSort}
                      category={category}
                      onCategory={setCategory}
                      token={token}
                      onToken={setToken}
                      onOpenSkill={openSkill}
                      onCopyInstall={handleCopyInstall}
                      onClearFilters={clearSkillFilters}
                      onOpenFilters={() => setMobileFilters(true)}
                    />
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <Wizard
            catalog={catalog}
            categoryColors={categoryColors}
            answers={wizardAnswers}
            onAnswers={setWizardAnswers}
            step={wizardStep}
            onStep={setWizardStep}
            done={wizardDone}
            onDone={setWizardDone}
            onReset={() => {
              setWizardAnswers({ task: null, access: "both", budget: "any", site: "both" });
              setWizardStep(0);
              setWizardDone(false);
            }}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            onOpenAgent={openAgent}
            onOpenSkill={openSkill}
            onCopyInstall={handleCopyInstall}
            onCopy={(text, message) => void handleCopy(text, message)}
          />
        )}
      </main>

      <Footer meta={catalog.meta} />

      {!compareOpen ? (
        <CompareBar
          agents={compareAgents}
          onRemove={(agent) => setCompareIds((prev) => prev.filter((id) => id !== agent.id))}
          onClear={() => setCompareIds([])}
          onOpen={openCompare}
        />
      ) : null}

      {mobileFilters ? (
        <MobileFilterDrawer onClose={() => setMobileFilters(false)}>
          <FilterRail {...filterProps} onClose={() => setMobileFilters(false)} />
        </MobileFilterDrawer>
      ) : null}

      <DetailPanel
        catalog={catalog}
        agent={detailAgent}
        skill={detailSkill}
        categoryColors={categoryColors}
        compareIds={compareIds}
        onToggleCompare={handleToggleCompare}
        onClose={() => setDetail(null)}
        onOpenAgent={openAgent}
        onCopyInstall={handleCopyInstall}
      />

      {compareOpen ? (
        <CompareModal
          agents={compareAgents}
          categoryColors={categoryColors}
          onRemove={(agent) => setCompareIds((prev) => prev.filter((id) => id !== agent.id))}
          onClose={() => setCompareOpen(false)}
          onCopy={copyCompare}
        />
      ) : null}

      {toast ? <Toast key={toast.id} message={toast.message} tone={toast.tone} /> : null}
    </div>
  );
}

function MobileFilterDrawer({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  const focusRef = useDialogFocus(true, onClose);
  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <div className="alm-overlay absolute inset-0 bg-ink/45" onClick={onClose} />
      <div
        ref={focusRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="alm-panel-left absolute inset-y-0 left-0 w-[88%] max-w-sm bg-paper outline-none"
      >
        {children}
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="min-h-screen bg-mist">
      <div className="h-12 bg-ink" />
      <div className="h-12 border-b border-line bg-paper" />
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6">
        <div className="border border-line bg-paper p-4">
          <SkeletonRows rows={10} />
        </div>
      </div>
    </div>
  );
}

function ErrorShell({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <div className="h-12 bg-ink" />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg border border-line bg-paper p-8">
          <div className="flex h-10 w-10 items-center justify-center bg-[#fff1f1] text-red">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-[18px] font-semibold text-ink">{t("common.error")}</h1>
          <p className="mt-2 text-[13px] leading-6 text-muted">{t("common.errorHint")}</p>
          <p className="alm-mono mt-3 text-[10px] text-soft">{message}</p>
          <button type="button" onClick={onRetry} className="alm-btn alm-btn-sm alm-btn-primary mt-5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.retry")}
          </button>
        </div>
      </div>
    </div>
  );
}
