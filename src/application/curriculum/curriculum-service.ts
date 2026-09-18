import sourceRegistryData from "@/curriculum/sources/registry.json";
import { CurriculumSource, KnowledgeGraph } from "@/src/domain/curriculum/types";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";

export class CurriculumService {
  /**
   * @deprecated HISTORICAL_BASELINE_NON_AUTHORITATIVE
   * Retained for legacy test reference only.
   * Canonical source authority is subject-specific (e.g. `curriculum/vietnam/lower-secondary/grade-6/math/source-registry.json`)
   * conforming to the frozen R2.1 SourceDocument provenance schema.
   */
  static getSourceRegistry(): { version: string; sources: CurriculumSource[] } {
    return sourceRegistryData as unknown as { version: string; sources: CurriculumSource[] };
  }

  /**
   * Client-side graph delivery fails-closed.
   * Canonical knowledge nodes and prerequisite edges remain SOURCE_LINKED and unreviewed.
   * Student client runtime receives NO graph when graph content has not reached the required review state.
   */
  static getFractionsKnowledgeGraph(): KnowledgeGraph {
    return {
      id: "",
      subjectId: "math",
      topicId: "fractions",
      version: "0.0.0",
      updatedAt: "",
      nodes: [],
      edges: [],
    };
  }

  /**
   * Client-side diagnostic items fail-closed by default.
   * Canonical question banks must be loaded exclusively through the server-only delivery layer
   * (`StudentContentDeliveryService`), preventing unpublished draft question items from entering client bundles.
   */
  static getInitialDiagnosticItems(): DiagnosticItem[] {
    return [];
  }

  static getReTestItems(): DiagnosticItem[] {
    return [];
  }
}
