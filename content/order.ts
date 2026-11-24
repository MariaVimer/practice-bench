// The order problems appear on the Bench: by section, then as listed. Previous/Next follow it.
import { EXERCISES } from "./index";
import { CLUSTERS, type Cluster } from "../lib/types";

export const ORDERED = (Object.keys(CLUSTERS) as Cluster[]).flatMap((c) => EXERCISES.filter((e) => e.cluster === c));

export function neighbours(id: string) {
  const i = ORDERED.findIndex((e) => e.id === id);
  return { prev: i > 0 ? ORDERED[i - 1] : undefined, next: i >= 0 && i < ORDERED.length - 1 ? ORDERED[i + 1] : undefined };
}
