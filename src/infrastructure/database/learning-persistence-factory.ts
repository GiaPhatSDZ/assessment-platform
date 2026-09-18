import "server-only";

/**
 * AI School Learning Persistence V1 — Repository Factory
 *
 * Implements Controller Audit Requirements:
 * - A5: In production, missing Supabase configuration throws PERSISTENCE_NOT_CONFIGURED.
 *       In-memory fallback is strictly restricted to development/test.
 * - A6: Server-only module (`import "server-only"`).
 */

import { LearningPersistenceRepository } from "../../application/learning-persistence-repository";
import { DatabasePersistenceError } from "../../domain/learning-persistence/types";
import { isSupabaseAdminConfigured } from "./supabase-server";
import { SupabaseLearningPersistenceRepository } from "./supabase-learning-persistence-repository";
import { InMemoryLearningPersistenceRepository } from "./in-memory-learning-persistence-repository";

let inMemorySingleton: InMemoryLearningPersistenceRepository | null = null;

export function getLearningPersistenceRepository(): LearningPersistenceRepository {
  if (isSupabaseAdminConfigured()) {
    return new SupabaseLearningPersistenceRepository();
  }

  // A5: In production, fail loud if persistence is not configured
  if (process.env.NODE_ENV === "production") {
    throw new DatabasePersistenceError(
      "PERSISTENCE_NOT_CONFIGURED: Supabase admin credentials are not configured in production."
    );
  }

  // Development / Test only fallback
  if (!inMemorySingleton) {
    inMemorySingleton = new InMemoryLearningPersistenceRepository();
  }
  return inMemorySingleton;
}

export function resetInMemoryLearningPersistenceRepository(): void {
  if (inMemorySingleton) {
    inMemorySingleton.clear();
  }
}
