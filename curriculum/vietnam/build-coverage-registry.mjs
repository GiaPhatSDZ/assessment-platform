import fs from "fs";
import path from "path";

const catalogPath = path.resolve("curriculum/vietnam/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

const registry = [];

// 1. Preschool
for (const ageBand of catalog.preschool.scope) {
  registry.push({
    grade: ageBand,
    stage: "preschool",
    subjectId: "development_domains",
    subjectNameVi: "Các lĩnh vực phát triển mầm non",
    sourceStatus: "SOURCE_INGESTED",
    outcomesTotal: 0,
    outcomesReviewed: 0,
    nodesTotal: 0,
    nodesReviewed: 0,
    questionsReviewed: 0,
    lessonsPublished: 0,
    diagnosticReady: false,
  });
}

// 2. Grades 1 to 12
for (const gradeItem of catalog.grades) {
  const g = gradeItem.grade;
  const stage = g <= 5 ? "primary" : g <= 9 ? "lower-secondary" : "upper-secondary";

  const allSubjects = [
    ...(gradeItem.mandatory || []),
    ...(gradeItem.elective || []),
    ...(gradeItem.optional || []),
  ];

  for (const sub of allSubjects) {
    const isGrade6Math = g === 6 && sub.id === "math";

    registry.push({
      grade: g,
      stage,
      subjectId: sub.id,
      subjectNameVi: sub.name_vi,
      kind: sub.kind,
      sourceStatus: isGrade6Math ? "PUBLISHED" : "SOURCE_INGESTED",
      outcomesTotal: isGrade6Math ? 2 : 0,
      outcomesReviewed: isGrade6Math ? 2 : 0,
      nodesTotal: isGrade6Math ? 4 : 0,
      nodesReviewed: isGrade6Math ? 4 : 0,
      questionsReviewed: isGrade6Math ? 6 : 0,
      lessonsPublished: isGrade6Math ? 1 : 0,
      diagnosticReady: isGrade6Math,
    });
  }
}

const outputPath = path.resolve("curriculum/vietnam/coverage-registry.json");
fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), "utf-8");
console.log(`Generated coverage registry with ${registry.length} subject-grade records.`);
