export class AssessmentDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentDomainError";
  }
}

export class AssessmentValidationError extends AssessmentDomainError {
  constructor(message: string, public readonly issues?: unknown[]) {
    super(message);
    this.name = "AssessmentValidationError";
  }
}

export class AssessmentScoringError extends AssessmentDomainError {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentScoringError";
  }
}

export class AssessmentNotFoundError extends AssessmentDomainError {
  constructor(identifier: string) {
    super(`Assessment not found: ${identifier}`);
    this.name = "AssessmentNotFoundError";
  }
}
