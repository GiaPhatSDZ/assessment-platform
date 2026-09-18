import sourceRegistryData from "@/curriculum/sources/registry.json";
import fractionsGraphData from "@/curriculum/graphs/math-grade6-fractions.json";
import canonicalQuestionItems from "@/curriculum/vietnam/lower-secondary/grade-6/math/question-bank/items.json";
import { filterPublishedForStudent } from "@/src/domain/content/publication-guard";
import { CurriculumSource, KnowledgeGraph } from "@/src/domain/curriculum/types";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";

function canonicalToDiagnosticItem(item: any): DiagnosticItem {
  let promptText = "";
  if (Array.isArray(item.prompt)) {
    promptText = item.prompt
      .map((p: any) => (p.type === "block_math" || p.type === "inline_math" ? `$${p.latex}$` : p.value || ""))
      .join(" ");
  } else if (typeof item.prompt === "string") {
    promptText = item.prompt;
  }

  const options = Array.isArray(item.options)
    ? item.options.map((opt: any) => {
        let optText = "";
        if (Array.isArray(opt.content)) {
          optText = opt.content
            .map((c: any) => (c.type === "block_math" || c.type === "inline_math" ? `$${c.latex}$` : c.value || ""))
            .join(" ");
        } else if (typeof opt.text === "string") {
          optText = opt.text;
        } else if (typeof opt.content === "string") {
          optText = opt.content;
        }
        return {
          id: opt.id,
          text: optText || opt.id,
        };
      })
    : [];

  return {
    id: item.id,
    primaryNodeId: item.primaryNodeId,
    nodeIds: [item.primaryNodeId, ...(item.supportingNodeIds || [])],
    type: item.type || "MULTIPLE_CHOICE",
    cognitiveDemand: item.cognitiveDemand || "APPLY",
    prompt: promptText,
    options,
    correctAnswer: item.correctAnswer || "opt-1",
    rationale: typeof item.rationale === "string" ? item.rationale : "",
    distractorRationales: item.distractorRationales,
    misconceptionTags: item.misconceptionTags || [],
    itemStatus: item.itemMaturity || "DRAFT",
    isReTest: Boolean(item.isReTest),
  };
}

export class CurriculumService {
  static getSourceRegistry(): { version: string; sources: CurriculumSource[] } {
    return sourceRegistryData as unknown as { version: string; sources: CurriculumSource[] };
  }

  static getFractionsKnowledgeGraph(): KnowledgeGraph {
    return fractionsGraphData as unknown as KnowledgeGraph;
  }

  /**
   * Sourced strictly through canonical curriculum question bank and the single publication guard.
   * If canonical items are in DRAFT state or lack valid review attestations,
   * filterPublishedForStudent returns empty array (fail-closed).
   */
  static getInitialDiagnosticItems(): DiagnosticItem[] {
    const publishedCanonical = filterPublishedForStudent(canonicalQuestionItems as any[]);
    const mapped = publishedCanonical.map(canonicalToDiagnosticItem);
    return mapped.filter((i) => !i.isReTest);
  }

  static getReTestItems(): DiagnosticItem[] {
    const publishedCanonical = filterPublishedForStudent(canonicalQuestionItems as any[]);
    const mapped = publishedCanonical.map(canonicalToDiagnosticItem);
    return mapped.filter((i) => i.isReTest);
  }
}
