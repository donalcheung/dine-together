// Profanity and inappropriate content filter
// Blocks common racial slurs, vulgar language, and hateful terms

const INAPPROPRIATE_WORDS = [
  // Racial slurs and ethnic slurs
  'n1gg3r', 'n1gga', 'nigger', 'nigg', 'negro',
  'f4g', 'fag', 'fa66ot', 'faggot',
  'tr4nny', 'tranny',
  'g00k', 'gook', 'ch1nk', 'chink',
  'wh1tey', 'whitey',
  'j3w', 'jew',
  'r3tard', 'retard', 'r3t4rd',
  
  // Vulgar language
  'f**k', 'fuck', 'f*ck', 'f4ck', 'fck',
  'b1tch', 'bitch', 'b*tch',
  'a55hole', 'asshole', 'a$$hole',
  'c0cksucker', 'cocksucker', 'cock sucker',
  'sh1t', 'shit', 'sh*t', 's#it', 'piss',
  'damn', 'dammit', 'd4mn',
  'h3ll', 'hell',
  
  // Hate speech and extremist terminology
  'kkk',
  'nazi', 'n4zi',
  'supremacist',
  'terrorist',
  'pedophile', 'p3dophile',
  'child abuse',
  'rape', 'rapist',
  'murder', 'murderer',
  'bomb', 'bombing',
  'suicide',
  'self harm',
  
  // Drug-related
  'cocaine', 'heroin', 'meth',
  
  // Sexual explicit
  'xxx', 'porn', 'pornography', 'sex tape',
]

/**
 * Checks if text contains inappropriate language
 * @param text - The text to check
 * @returns Object with isClean status and filtered text
 */
export function filterProfanity(text: string): {
  isClean: boolean
  filtered: string
  hasIssues: string[]
} {
  if (!text) {
    return { isClean: true, filtered: text, hasIssues: [] }
  }

  // Convert to lowercase for checking but preserve original case
  const lowerText = text.toLowerCase()
  const issues: string[] = []
  let filtered = text

  // Check each inappropriate word
  // Helper to escape regex special characters
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  for (const word of INAPPROPRIATE_WORDS) {
    // Create regex that matches the word with word boundaries and variations
    // Also handles common number/symbol replacements like 4 for a, 1 for i, @ for a, etc.
    const patterns = [
      new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'),
      new RegExp(`\\b${escapeRegExp(word.replace(/3/g, 'e').replace(/4/g, 'a').replace(/1/g, 'i').replace(/0/g, 'o').replace(/5/g, 's'))}\\b`, 'gi'),
    ]

    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        issues.push(word)
        // Replace with asterisks of same length
        filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length))
      }
    }
  }

  return {
    isClean: issues.length === 0,
    filtered,
    hasIssues: [...new Set(issues)], // Remove duplicates
  }
}

/**
 * Validates text and throws error if inappropriate content found
 * @param text - Text to validate
 * @param fieldName - Name of the field being validated (for error message)
 * @throws Error if inappropriate content is detected
 */
export function validateProfanity(text: string, fieldName: string = 'text'): void {
  const result = filterProfanity(text)
  
  if (!result.isClean) {
    throw new Error(
      `${fieldName} contains inappropriate language. Please review and remove offensive content.`
    )
  }
}

/**
 * Sanitizes text by removing/replacing inappropriate content
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeProfanity(text: string): string {
  const result = filterProfanity(text)
  return result.filtered
}
