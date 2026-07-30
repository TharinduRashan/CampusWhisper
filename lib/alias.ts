/**
 * CampusWhisper — Anonymous Alias Generator
 *
 * Generates a stable, deterministic alias for a user within a post.
 * The same user always gets the same alias (#XXXX) within a given post,
 * but different aliases across different posts — preserving anonymity.
 *
 * Identity is NEVER stored — this runs purely from post_id + user_id.
 *
 * Algorithm:
 *   seed = postId + userId  (concatenated strings)
 *   hash = simple 32-bit FNV-1a hash of seed
 *   alias = "#" + upper-case base-36 representation, padded to 4 chars
 *
 * Example: generateAlias("abc123", "xyz789") → "#K4MQ"
 */

// ── FNV-1a 32-bit hash ────────────────────────────────────────

function fnv1a32(str: string): number {
  let hash = 0x811c9dc5 // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    // Multiply by FNV prime (32-bit, with overflow wrapping)
    hash = Math.imul(hash, 0x01000193)
  }
  // Convert to unsigned 32-bit integer
  return hash >>> 0
}

// ── Alias generation ──────────────────────────────────────────

/**
 * Generates a stable alias tag for a user within a specific post.
 *
 * @param postId   - The post's UUID
 * @param userId   - The user's UUID (never stored / exposed)
 * @returns        - A tag like "#K4MQ" or "#0000" if inputs are missing
 */
export function generateAlias(postId: string, userId: string): string {
  if (!postId || !userId) return '#0000'

  const seed = `${postId}:${userId}`
  const hash = fnv1a32(seed)

  // Convert to base-36 (0-9 + A-Z), take last 4 chars, uppercase
  const code = hash.toString(36).toUpperCase().slice(-4).padStart(4, '0')
  return `#${code}`
}

/**
 * Returns the full display label for an anonymous user.
 *
 * @param postId   - The post's UUID
 * @param userId   - The user's UUID
 * @param isAuthor - Whether this user is the post's author
 * @returns        - "Anonymous #K4MQ" or "OP #K4MQ" for the original poster
 */
export function getAnonLabel(
  postId: string,
  userId: string,
  isAuthor = false
): string {
  const alias = generateAlias(postId, userId)
  return isAuthor ? `OP ${alias}` : `Anonymous ${alias}`
}

/**
 * Returns just the alias fragment without "Anonymous".
 * Used for compact displays (e.g. in notification items).
 */
export function getAlias(postId: string, userId: string): string {
  return generateAlias(postId, userId)
}

/**
 * Color bucket for alias tag (gives each alias a consistent accent color).
 * Returns a Tailwind arbitrary color class string.
 *
 * Maps hash → one of 8 soft hues so aliases feel visually distinct.
 */
const ALIAS_COLORS = [
  'bg-violet-500/15 text-violet-300',
  'bg-blue-500/15   text-blue-300',
  'bg-teal-500/15   text-teal-300',
  'bg-green-500/15  text-green-300',
  'bg-yellow-500/15 text-yellow-300',
  'bg-orange-500/15 text-orange-300',
  'bg-rose-500/15   text-rose-300',
  'bg-pink-500/15   text-pink-300',
] as const

export function getAliasColor(postId: string, userId: string): string {
  if (!postId || !userId) return ALIAS_COLORS[0]
  const hash = fnv1a32(`${postId}:${userId}`)
  return ALIAS_COLORS[hash % ALIAS_COLORS.length]
}
