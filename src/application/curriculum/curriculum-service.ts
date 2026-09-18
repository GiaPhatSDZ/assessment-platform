import sourceRegistryData from "@/curriculum/sources/registry.json";
import fractionsGraphData from "@/curriculum/graphs/math-grade6-fractions.json";
import { CurriculumSource, KnowledgeGraph } from "@/src/domain/curriculum/types";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";

export class CurriculumService {
  static getSourceRegistry(): { version: string; sources: CurriculumSource[] } {
    return sourceRegistryData as unknown as { version: string; sources: CurriculumSource[] };
  }

  static getFractionsKnowledgeGraph(): KnowledgeGraph {
    return fractionsGraphData as unknown as KnowledgeGraph;
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
