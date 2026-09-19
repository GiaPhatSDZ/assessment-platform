import "server-only";

/**
 * AI School V3 — Canonical Item Resolver
 *
 * Implements Controller Amendment A6:
 * Canonical item resolver returns explicit subjectId/topicId metadata.
 * Session compatibility must match this metadata.
 * Do not infer subject/topic from IDs or filesystem paths.
 */

import canonicalGrade6Items from "@/curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json";
import { QuestionItem } from "./schema";

export interface ResolvedCanonicalItem {
  item: QuestionItem;
  subjectId: string;
  topicId: string;
}

export type CanonicalItemResolver = (
  itemId: string
) => Promise<ResolvedCanonicalItem | null> | ResolvedCanonicalItem | null;

/**
 * Production canonical item resolver.
 * Searches authoritative curriculum repositories and attaches explicit subjectId/topicId metadata.
 */
export const defaultCanonicalItemResolver: CanonicalItemResolver = (itemId: string): ResolvedCanonicalItem | null => {
  const g6Item = (canonicalGrade6Items as unknown as QuestionItem[]).find((i) => i.id === itemId);
  if (g6Item) {
    return {
      item: g6Item,
      subjectId: "math",
      topicId: "math-grade6-fractions",
    };
  }

  return null;
};
