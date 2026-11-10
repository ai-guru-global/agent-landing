import { useCallback, useEffect, useState } from "react";
import type { Catalog } from "../types";

interface CatalogState {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useCatalog(): CatalogState {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.BASE_URL}data/catalog.json`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Catalog>;
      })
      .then((data) => {
        if (!data?.meta || !Array.isArray(data.agents) || !Array.isArray(data.skills)) {
          throw new Error("Unexpected catalog shape");
        }
        setCatalog(data);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Unknown error");
        setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  return { catalog, loading, error, retry };
}
