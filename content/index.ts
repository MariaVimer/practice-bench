import type { Exercise } from "../lib/types";
import { PILOT } from "./exercises/pilot";
import { CML } from "./exercises/cml";
import { RATES } from "./exercises/rates";
import { PERCENTS_FRACTIONS } from "./exercises/percents-fractions";
import { NEGATIVES } from "./exercises/negatives";
import { ALGEBRA } from "./exercises/algebra";

export const EXERCISES: Exercise[] = [...PILOT, ...CML, ...RATES, ...PERCENTS_FRACTIONS, ...NEGATIVES, ...ALGEBRA];
export const byId = (id: string) => EXERCISES.find((e) => e.id === id);
