#!/usr/bin/env node
/**
 * Fetch the public Alibaba Cloud Agent Catalog into public/data/catalog.json.
 * Usage: npm run fetch
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.AGENT_CATALOG_BASE || "https://agentcatalog.aliyun.com";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/data/catalog.json",
);
const CONCURRENCY = 6;
const RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(path) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: {
          accept: "application/json",
          "user-agent": "agent-landing-catalog-fetcher/1.0",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
      const body = await res.json();
      if (body.code !== 200) throw new Error(body.message || `API error ${body.code}`);
      return body.data;
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) await sleep(400 * attempt);
    }
  }
  throw lastError;
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  let done = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await fn(items[index], index);
      done += 1;
      if (done % 40 === 0 || done === items.length) {
        process.stdout.write(`  ${done}/${items.length}\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function truncate(value, max = 700) {
  const text = cleanText(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function repoFromGithubPath(path) {
  const match = /github\.com\/([^/]+)\/([^/]+)/.exec(path || "");
  return match ? `${match[1]}/${match[2]}` : "aliyun/alibabacloud-aiops-skills";
}

function normalizeAgent(raw, detail) {
  const agent = { ...raw, ...(detail || {}) };
  return {
    id: agent.agentId,
    name: cleanText(agent.name),
    nameEn: cleanText(agent.nameEn),
    description: cleanText(agent.description),
    descriptionEn: cleanText(agent.descriptionEn),
    categoryCode: agent.categoryCode,
    categoryName: cleanText(agent.categoryName),
    categoryNameEn: cleanText(agent.categoryNameEn),
    subCategoryCode: agent.subCategoryCode || "",
    subCategoryName: cleanText(agent.subCategoryName),
    subCategoryNameEn: cleanText(agent.subCategoryNameEn),
    usageGuideUrl: cleanText(agent.usageGuideUrl),
    features: (agent.productFeatureNodes || []).map((feature) => ({
      setName: cleanText(feature.featureSetName),
      name: cleanText(feature.featureName),
      description: cleanText(feature.featureDescription),
      setNameEn: cleanText(feature.featureSetNameEn),
      nameEn: cleanText(feature.featureNameEn),
      descriptionEn: cleanText(feature.featureDescriptionEn),
    })),
    publishSites: agent.publishSites || [],
    supportedInterfaces: agent.supportedInterfaces || [],
    isPaid: Boolean(agent.isPaid),
    billingLogic: cleanText(agent.billingLogic),
    billingLogicEn: cleanText(agent.billingLogicEn),
    openApiConfigs: (agent.openApiConfigs || []).map((config) => ({
      productCode: cleanText(config.productCode),
      apiVersion: cleanText(config.apiVersion),
      apiName: cleanText(config.apiName),
      apiTitle: cleanText(config.apiTitle),
      apiTitleEn: cleanText(config.apiTitleEn),
      apiDescription: cleanText(config.apiDescription),
      apiDescriptionEn: cleanText(config.apiDescriptionEn),
    })),
    consoleConfigs: (agent.consoleConfigs || []).map((config) => ({
      site: cleanText(config.site),
      consoleUrl: cleanText(config.consoleUrl),
    })),
    likeCount: Number(agent.likeCount || 0),
  };
}

function normalizeSkill(raw, detail) {
  const skill = { ...raw, ...(detail || {}) };
  const name = skill.skillName;
  const repo = repoFromGithubPath(skill.githubPath);
  return {
    name,
    displayName: cleanText(skill.displayName) || name,
    nameEn: cleanText(skill.nameEn) || cleanText(skill.displayName),
    description: cleanText(skill.description),
    descriptionEn: cleanText(skill.descriptionEn),
    summary: truncate(skill.skillMdDescriptionZh || skill.description),
    summaryEn: truncate(skill.skillMdDescriptionEn || skill.descriptionEn),
    categoryCode: skill.categoryCode,
    categoryName: cleanText(skill.categoryName),
    categoryNameEn: cleanText(skill.categoryNameEn),
    subCategoryCode: skill.subCategoryCode || "",
    subCategoryName: cleanText(skill.subCategoryName),
    subCategoryNameEn: cleanText(skill.subCategoryNameEn),
    githubPath: cleanText(skill.githubPath),
    installCommand: `npx skills add ${repo} --skill ${name}`,
    version: cleanText(skill.version),
    minToken: Number.isFinite(skill.minToken) ? skill.minToken : null,
    maxToken: Number.isFinite(skill.maxToken) ? skill.maxToken : null,
    likeCount: Number(skill.likeCount || 0),
    installCount: Number(skill.totalInstallCount || 0),
    hosted: Boolean(skill.hosted),
    updatedAt: cleanText(skill.updatedAt),
  };
}

async function main() {
  console.log(`Fetching catalog from ${BASE}`);
  const categories = await fetchJson("/api/public/categories");

  console.log("Fetching agents…");
  const agentPage = await fetchJson("/api/public/agents/search?pageSize=100&pageNum=1");
  const agentItems = agentPage.items || [];
  console.log(`  ${agentItems.length} agents; fetching details…`);
  const agents = await mapPool(agentItems, CONCURRENCY, async (item) => {
    try {
      const detail = await fetchJson(`/api/public/agents/${encodeURIComponent(item.agentId)}`);
      return normalizeAgent(item, detail);
    } catch (error) {
      console.warn(`  ! agent detail failed for ${item.agentId}: ${error.message}`);
      return normalizeAgent(item, null);
    }
  });

  console.log("Fetching skills…");
  const skillGroups = await fetchJson("/api/public/skills");
  const seenSkills = new Set();
  const skillItems = [];
  for (const group of skillGroups) {
    for (const item of group.list || []) {
      if (!seenSkills.has(item.skillName)) {
        seenSkills.add(item.skillName);
        skillItems.push(item);
      }
    }
  }
  console.log(`  ${skillItems.length} skills; fetching details…`);
  const skills = await mapPool(skillItems, CONCURRENCY, async (item) => {
    try {
      const detail = await fetchJson(`/api/public/skills/${encodeURIComponent(item.skillName)}`);
      return normalizeSkill(item, detail);
    } catch (error) {
      console.warn(`  ! skill detail failed for ${item.skillName}: ${error.message}`);
      return normalizeSkill(item, null);
    }
  });

  const topLevel = categories.filter((category) => category.level === 1);
  const categoryByCode = new Map(topLevel.map((category) => [category.categoryCode, category]));
  for (const skill of skills) {
    const category = categoryByCode.get(skill.categoryCode);
    if (category && (!skill.categoryName || skill.categoryName === skill.categoryCode)) {
      skill.categoryName = cleanText(category.categoryName);
      skill.categoryNameEn = cleanText(category.categoryNameEn);
    }
  }
  agents.forEach((agent, index) => {
    agent.catalogId = `AL-${String(index + 1).padStart(2, "0")}`;
  });
  skills.forEach((skill, index) => {
    skill.catalogId = `SK-${String(index + 1).padStart(3, "0")}`;
  });
  const active = topLevel.filter(
    (category) => (category.skillsCount || 0) + (category.agentCount || 0) > 0,
  );

  const snapshot = {
    meta: {
      schemaVersion: 1,
      source: BASE,
      sourceLabel: "阿里云 Agent 服务目录",
      sourceLabelEn: "Alibaba Cloud Agent Catalog",
      fetchedAt: new Date().toISOString(),
      agentCount: agents.length,
      skillCount: skills.length,
      categoryCount: topLevel.length,
      activeCategoryCount: active.length,
    },
    categories: categories.map((category) => ({
      code: category.categoryCode,
      name: cleanText(category.categoryName),
      nameEn: cleanText(category.categoryNameEn),
      level: category.level,
      parentCode: category.parentCode || "",
      skillCount: Number(category.skillsCount || 0),
      agentCount: Number(category.agentCount || 0),
    })),
    agents: agents.sort((a, b) => b.likeCount - a.likeCount || a.name.localeCompare(b.name, "zh")),
    skills: skills.sort(
      (a, b) => b.installCount - a.installCount || a.displayName.localeCompare(b.displayName, "zh"),
    ),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Saved ${snapshot.meta.agentCount} agents, ${snapshot.meta.skillCount} skills, ` +
      `${snapshot.meta.activeCategoryCount}/${snapshot.meta.categoryCount} active categories → ${OUT}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
