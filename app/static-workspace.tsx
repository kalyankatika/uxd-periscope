"use client";
import { useEffect, useState } from "react";
import Planner from "./planner";
import { parseStaticPlan, resolveDataUrl, staticSourceSchema, type StaticSource } from "@/lib/static-source";
import type { Plan } from "@/lib/domain";

type Loaded = { plan: Plan; source: StaticSource };
export default function StaticWorkspace() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoaded(null);
    setError("");
    async function read() {
      try {
        const configUrl = new URL("./data/config.json", window.location.href).href;
        const options = { signal: controller.signal, cache: "no-store" as const, credentials: "same-origin" as const };
        const configResponse = await fetch(configUrl, options);
        if (!configResponse.ok) throw new Error("Unable to load data configuration.");
        const source = staticSourceSchema.parse(await configResponse.json());
        const response = await fetch(resolveDataUrl(source, configUrl), options);
        if (!response.ok) throw new Error(`Unable to load workspace data (HTTP ${response.status}).`);
        const plan = parseStaticPlan(await response.json());
        if (current) setLoaded({ plan, source });
      } catch (reason) {
        if (current && !controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : "Unable to load workspace data.");
      }
    }
    void read();
    return () => { current = false; controller.abort(); };
  }, [attempt]);
  if (!loaded) return <main style={{ maxWidth: 640, margin: "12vh auto", padding: 24 }}>
    <h1>Periscope</h1>
    {error ? <><h2>Data unavailable</h2><p role="alert">{error}</p>
      <p>Check the configured JSON source and its permissions. No example data has been substituted.</p>
      <button onClick={() => setAttempt(n => n + 1)}>Retry</button></>
      : <p role="status">Loading workspace…</p>}
  </main>;
  return <Planner key={attempt} initial={loaded.plan} readOnly
    sourceLabel={loaded.source.fictional ? `Example data · Fictional organization · ${loaded.source.label}` : loaded.source.label}
    sourceUpdatedAt={loaded.source.sourceUpdatedAt}
    onRefresh={() => setAttempt(n => n + 1)} />;
}
