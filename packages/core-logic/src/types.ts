/**
 * Shared domain types for Aether Link
 *
 * These types represent the API-level domain objects that are serialized
 * across the application. They differ from database types in that:
 * - Date objects are serialized to ISO strings
 * - UUIDs are represented as strings
 * - Nullable fields are explicitly typed
 */

/**
 * User entity (API representation)
 * Corresponds to the users table
 */
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile entity (API representation)
 * Corresponds to the profiles table
 */
export interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Link entity (API representation)
 * Corresponds to the links table
 */
export interface Link {
  id: string;
  profileId: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input DTOs (Data Transfer Objects)
 * These types define the shape of data sent to the API
 */

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
  email: string;
  password: string;
}

/**
 * Input for creating a new profile
 */
export interface CreateProfileInput {
  userId: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Input for updating a profile
 */
export interface UpdateProfileInput {
  handle?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isPublic?: boolean;
}

/**
 * Input for creating a new link
 */
export interface CreateLinkInput {
  profileId: string;
  title: string;
  url: string;
  icon?: string;
  position?: number;
}

/**
 * Input for updating a link
 */
export interface UpdateLinkInput {
  title?: string;
  url?: string;
  icon?: string | null;
  isActive?: boolean;
}

/**
 * Input for reordering links
 */
export interface ReorderLinksInput {
  profileId: string;
  linkIds: string[];
}

/**
 * API Response Types
 */

/**
 * Response for handle availability check
 */
export interface HandleAvailabilityResponse {
  available: boolean;
}

/**
 * Type guard to check if a value is a Profile
 */
export function isProfile(value: unknown): value is Profile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'userId' in value &&
    'handle' in value &&
    'displayName' in value
  );
}

/**
 * Type guard to check if a value is a Link
 */
export function isLink(value: unknown): value is Link {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'profileId' in value &&
    'title' in value &&
    'url' in value
  );
}

/**
 * Type guard to check if a value is a User
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}
