/**
 * Professionalism-First Rewrite Gate
 * 
 * Rules:
 * - Hard bans: Profanity, sexual content, slurs, drug/explicit content.
 * - Specific user bans: "baby", "girl", "fine tonight".
 * - Behavior: Discard unsafe text, return safe template.
 */

// Regex Patterns
const PATTERNS = {
    // Hard profanity (basic list to capture intent without being exhaustive/offensive in code)
    // Includes leetspeak variations matches
    PROFANITY: /\b(fuck|shit|bitch|cunt|dick|cock|pussy|asshole|whore|slut|bastard|damn|piss|crap)\b/i,

    // Suffix checks (fucking, fucked, etc) - The \b above handles simple cases, but we want robust suffix handling
    // We'll use a more flexible regex for root + wildcards if needed, or rely on inclusion
    PROFANITY_ROOTS: /(fuck|shit|bitch|cunt|dick|cock|pussy|asshole|whore|slut|bastard)/i,

    // Specific user requests
    INFORMAL_FLIRT: /\b(baby|girl|fine tonight|hottie|sexy|love you|miss you)\b/i,

    // Slurs (representative, non-exhaustive)
    SLURS: /\b(nigger|nigga|faggot|dyke|kike|chink|spic|retard)\b/i,

    // Sexual/Explicit
    SEXUAL: /\b(sex|porn|nude|naked|erotic|clitoris|penis|vagina|orgasm)\b/i,
};

/**
 * Checks text for unprofessional content.
 * @param {string} text 
 * @returns {{ safe: boolean, reasons: string[], metadata: object }}
 */
export function checkContentSafety(text) {
    if (!text || typeof text !== 'string') return { safe: true, reasons: [], metadata: null };

    const lowerText = text.toLowerCase();
    const reasons = [];

    // 1. Check Profanity
    // Check roots for robust suffix matching
    if (PATTERNS.PROFANITY_ROOTS.test(lowerText) ||
        // Check strict list (words that shouldn't be matched as roots, e.g. "crap" -> "scraper" is safe, so strict boundary)
        PATTERNS.PROFANITY.test(lowerText) ||
        // Leet checks
        /f[u\*@$]ck/i.test(lowerText) ||
        /sh[i\*!1]t/i.test(lowerText) ||
        /b[i\*!1]tch/i.test(lowerText) ||
        /a[s\$]{2}hole/i.test(lowerText)
    ) {
        reasons.push("profanity");
    }

    // 2. Check Specific Informal/Flirt
    if (PATTERNS.INFORMAL_FLIRT.test(lowerText)) {
        reasons.push("informal_flirt");
    }

    // 3. Check Slurs
    if (PATTERNS.SLURS.test(lowerText)) {
        reasons.push("slur");
    }

    // 4. Check Sexual
    if (PATTERNS.SEXUAL.test(lowerText)) {
        reasons.push("sexual_content");
    }

    if (reasons.length > 0) {
        return {
            safe: false,
            reasons,
            metadata: {
                flagged: true,
                reasons,
                mode: "template_rewrite"
            }
        };
    }

    return { safe: true, reasons: [], metadata: null };
}

/**
 * Generates a neutral, professional rewrite template.
 * Preserves question intent (workplace context) and generic scenario.
 * @param {string} questionText 
 */
export function getSafeRewrite(questionText = "") {
    // Extract potential topic from question if easy, otherwise use generic
    // Simple heuristic: "Tell me about a time you [TOPIC]"

    return `In a professional setting, it is important to communicate with clarity and respect. Regarding the question "${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}", a strong answer would follow the STAR method (Situation, Task, Action, Result) to demonstrate your qualifications.

For example:
"In my previous role, I encountered a complex challenge that required immediate attention. I analyzed the situation, collaborated with my team to identify the root cause, and implemented a strategic solution. This approach not only resolved the issue but also improved our overall process efficiency by 15%."

This rewrite focuses on professional competencies and strictly avoids informal or inappropriate language.`;
}

/**
 * Mock result object for intercepted answers
 */
export function getBlockedResult(questionText, safetyCheck) {
    return {
        improved: getSafeRewrite(questionText),
        feedback: {
            whatWorked: "You provided an answer.",
            improveNext: "Please ensure your language is professional and suitable for a workplace interview setting.",
            hiringManagerHeard: "The candidate used language that would be considered inappropriate or unprofessional in a business context.",
            score: 0 // Penalize score
        },
        metadata: {
            professionalism: safetyCheck.metadata
        }
    };
}
