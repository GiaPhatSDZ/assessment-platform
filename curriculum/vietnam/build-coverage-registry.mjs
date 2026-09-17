import fs from "fs";
import path from "path";

const catalogPath = path.resolve("curriculum/vietnam/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

export function buildCoverageRegistry() {
  const registry = [];

  // 1. Preschool
  for (const ageBand of catalog.preschool.scope) {
    const subjectDir = path.resolve(`curriculum/vietnam/preschool/current-national/${ageBand}/development_domains`);
    const hasSource = fs.existsSync(path.join(subjectDir, "source-registry.json"));

    registry.push({
      grade: ageBand,
      stage: "preschool",
      subjectId: "development_domains",
      subjectNameVi: "Các lĩnh vực phát triển mầm non",
      kind: "mandatory",
      sourceStatus: hasSource ? "SOURCE_INGESTED" : "NOT_INGESTED",
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
      ...(gradeItem.electives || gradeItem.elective || []),
      ...(gradeItem.optional || []),
    ];

    for (const sub of allSubjects) {
      const subjectDir = path.resolve(`curriculum/vietnam/${stage}/grade-${g}/${sub.id}`);

      let sourceStatus = "NOT_INGESTED";
      let outcomesTotal = 0;
      let outcomesReviewed = 0;
      let nodesTotal = 0;
      let nodesReviewed = 0;
      let questionsReviewed = 0;
      let lessonsPublished = 0;
      let diagnosticReady = false;

      const sourcePath = path.join(subjectDir, "source-registry.json");
      if (fs.existsSync(sourcePath)) {
        sourceStatus = "SOURCE_INGESTED";

        const loPath = path.join(subjectDir, "learning-outcomes.json");
        if (fs.existsSync(loPath)) {
          try {
            const los = JSON.parse(fs.readFileSync(loPath, "utf-8"));
            outcomesTotal = los.length;
            outcomesReviewed = los.filter(
              (lo) => lo.reviewState === "INTERNAL_REVIEWED" || lo.reviewState === "SUBJECT_EXPERT_REVIEWED"
            ).length;
            if (outcomesTotal > 0) {
              sourceStatus = "OUTCOMES_EXTRACTED";
            }
          } catch {}
        }

        const knPath = path.join(subjectDir, "knowledge-nodes.json");
        if (fs.existsSync(knPath)) {
          try {
            const nodes = JSON.parse(fs.readFileSync(knPath, "utf-8"));
            nodesTotal = nodes.length;
            nodesReviewed = nodes.filter(
              (n) => n.reviewState === "INTERNAL_REVIEWED" || n.reviewState === "SUBJECT_EXPERT_REVIEWED"
            ).length;
          } catch {}
        }

        const qPath = path.join(subjectDir, "question-bank/items.json");
        let hasItems = false;
        if (fs.existsSync(qPath)) {
          try {
            const items = JSON.parse(fs.readFileSync(qPath, "utf-8"));
            hasItems = items.length > 0;
            questionsReviewed = items.filter(
              (i) =>
                (i.reviewState === "INTERNAL_REVIEWED" || i.reviewState === "SUBJECT_EXPERT_REVIEWED") &&
                (i.publicationState === "PUBLISHED_BETA" || i.publicationState === "PUBLISHED_VERIFIED")
            ).length;
            if (hasItems) {
              sourceStatus = "CONTENT_IN_REVIEW";
            }
          } catch {}
        }

        const lDir = path.join(subjectDir, "lessons");
        if (fs.existsSync(lDir)) {
          try {
            const files = fs.readdirSync(lDir).filter((f) => f.endsWith(".json"));
            for (const f of files) {
              const lesson = JSON.parse(fs.readFileSync(path.join(lDir, f), "utf-8"));
              if (
                (lesson.reviewState === "INTERNAL_REVIEWED" || lesson.reviewState === "SUBJECT_EXPERT_REVIEWED") &&
                (lesson.publicationState === "PUBLISHED_BETA" || lesson.publicationState === "PUBLISHED_VERIFIED")
              ) {
                lessonsPublished++;
              }
            }
            if (files.length > 0) {
              sourceStatus = "CONTENT_IN_REVIEW";
            }
          } catch {}
        }

        const manifestPath = path.join(subjectDir, "publication-manifest.json");
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            // Strict rule: Gemini cannot self-publish. Only PUBLISHED if manifest scope is BETA/VERIFIED AND verified reviews exist
            if (
              (manifest.publicationScope === "BETA" || manifest.publicationScope === "VERIFIED") &&
              questionsReviewed > 0 &&
              outcomesReviewed > 0
            ) {
              sourceStatus = "PUBLISHED";
              diagnosticReady = true;
            }
          } catch {}
        }
      }

      registry.push({
        grade: g,
        stage,
        subjectId: sub.id,
        subjectNameVi: sub.name_vi,
        kind: sub.kind,
        sourceStatus,
        outcomesTotal,
        outcomesReviewed,
        nodesTotal,
        nodesReviewed,
        questionsReviewed,
        lessonsPublished,
        diagnosticReady,
      });
    }
  }

  return registry;
}

// Script runner
if (process.argv[1] && process.argv[1].endsWith("build-coverage-registry.mjs")) {
  const registry = buildCoverageRegistry();
  const outputPath = path.resolve("curriculum/vietnam/coverage-registry.json");
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), "utf-8");
  console.log(`Generated dynamic coverage registry with ${registry.length} subject-grade records.`);
  const statusCounts = {};
  for (const r of registry) {
    statusCounts[r.sourceStatus] = (statusCounts[r.sourceStatus] || 0) + 1;
  }
  console.log("Status distribution:", statusCounts);
}
