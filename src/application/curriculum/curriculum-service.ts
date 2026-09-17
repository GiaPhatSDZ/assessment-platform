import sourceRegistryData from "@/curriculum/sources/registry.json";
import fractionsGraphData from "@/curriculum/graphs/math-grade6-fractions.json";
import fractionsItemsData from "@/assessment-items/reviewed/math-grade6-fractions.json";
import { CurriculumSource, KnowledgeGraph } from "@/src/domain/curriculum/types";
import { DiagnosticItem } from "@/src/domain/diagnostic/types";

export class CurriculumService {
  static getSourceRegistry(): { version: string; sources: CurriculumSource[] } {
    return sourceRegistryData as unknown as { version: string; sources: CurriculumSource[] };
  }

  static getFractionsKnowledgeGraph(): KnowledgeGraph {
    return fractionsGraphData as unknown as KnowledgeGraph;
  }

  static getInitialDiagnosticItems(): DiagnosticItem[] {
    const items = fractionsItemsData.items as unknown as DiagnosticItem[];
    return items.filter((i) => !i.isReTest);
  }

  static getReTestItems(): DiagnosticItem[] {
    const items = fractionsItemsData.items as unknown as DiagnosticItem[];
    return items.filter((i) => i.isReTest);
  }
}
