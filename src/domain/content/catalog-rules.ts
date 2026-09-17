/**
 * AI School V3 — Vietnam Curriculum Catalog Rules
 * Enforces stage-specific mandatory, elective, and optional subject policies.
 */

export const THPT_MANDATORY_SUBJECT_IDS = [
  "literature",
  "math",
  "foreign_language_1",
  "history",
  "physical_education",
  "national_defense_security",
  "experiential_career",
  "local_education",
] as const;

export const THPT_ELECTIVE_SUBJECT_IDS = [
  "geography",
  "economic_legal_education",
  "physics",
  "chemistry",
  "biology",
  "technology",
  "informatics",
  "music",
  "fine_arts",
] as const;

export const THPT_OPTIONAL_SUBJECT_IDS = [
  "ethnic_minority_language",
  "foreign_language_2",
] as const;

export interface ThptSubjectSelection {
  studentId: string;
  grade: 10 | 11 | 12;
  selectedElectiveIds: string[];
  selectedOptionalIds?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  allEnrolledSubjectIds: string[];
}

/**
 * Validates a high school student's study package under GDPT 2018.
 * Rule: Student must enroll in all 8 mandatory subjects and select exactly 4 of 9 electives.
 */
export function validateThptSubjectSelection(
  selection: ThptSubjectSelection
): ValidationResult {
  const errors: string[] = [];
  const validElectiveSet = new Set<string>(THPT_ELECTIVE_SUBJECT_IDS);

  // 1. Check count of selected electives
  if (selection.selectedElectiveIds.length !== 4) {
    errors.push(
      `Học sinh THPT phải chọn đúng 4 môn lựa chọn (hiện chọn ${selection.selectedElectiveIds.length} môn).`
    );
  }

  // 2. Check for duplicate electives
  const uniqueElectives = new Set(selection.selectedElectiveIds);
  if (uniqueElectives.size !== selection.selectedElectiveIds.length) {
    errors.push("Danh sách môn lựa chọn không được có môn trùng lặp.");
  }

  // 3. Verify all selected electives are in the official 9-subject pool
  for (const electiveId of selection.selectedElectiveIds) {
    if (!validElectiveSet.has(electiveId)) {
      errors.push(
        `Môn '${electiveId}' không thuộc danh mục 9 môn học lựa chọn của cấp THPT.`
      );
    }
  }

  const allEnrolledSubjectIds = [
    ...THPT_MANDATORY_SUBJECT_IDS,
    ...Array.from(uniqueElectives),
    ...(selection.selectedOptionalIds || []),
  ];

  return {
    isValid: errors.length === 0,
    errors,
    allEnrolledSubjectIds,
  };
}

/**
 * Verifies preschool releases remain distinct.
 */
export function assertPreschoolReleaseIsolation(releaseId: string): void {
  const validReleases = ["current-national", "pilot"];
  if (!validReleases.includes(releaseId)) {
    throw new Error(
      `Invalid preschool release '${releaseId}'. Must be strictly 'current-national' or 'pilot'.`
    );
  }
}
