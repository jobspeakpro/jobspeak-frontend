/**
 * API Response Normalizers
 * 
 * These functions normalize API responses to ensure safe data shapes
 * at boundaries, preventing crashes from missing/malformed data.
 */

/**
 * Safely converts any value to an array
 */
const safeArray = (v) => {
    if (Array.isArray(v)) return v;
    if (v) return [v];
    return [];
};

/**
 * Safely converts any value to a string
 */
const safeString = (v, defaultValue = "") => {
    if (typeof v === "string") return v;
    if (v === null || v === undefined) return defaultValue;
    return String(v);
};

/**
 * Safely converts any value to a number
 */
const safeNumber = (v, defaultValue = 0) => {
    if (typeof v === "number" && !isNaN(v)) return v;
    const parsed = Number(v);
    return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Normalizes practice feedback API responses
 * Handles responses from /api/practice/answer and /api/practice/summary
 * 
 * @param {Object} raw - Raw API response
 * @returns {Object} Normalized feedback object with guaranteed safe types
 */
export function normalizePracticeFeedback(raw) {
    if (!raw || typeof raw !== "object") {
        return {
            score: 0,
            whatWorked: [],
            improveNext: [],
            interpretation: "",
            improved: "",
            vocabulary: [],
            questionText: "",
            transcript: "",
            clearerRewriteAudioUrl: null,
            created_at: null,
        };
    }

    // Handle nested structures - check analysis, guidance, or flat result
    const analysisObj = raw.analysis || raw.guidance || raw;

    // Extract score
    const score = safeNumber(analysisObj.score || raw.score, 0);

    // Extract whatWorked/strengths
    const whatWorkedRaw = analysisObj.whatWorked || analysisObj.strengths || [];
    const whatWorked = safeArray(whatWorkedRaw);

    // Extract improveNext/improvements with multiple fallback paths
    const improveNextRaw =
        analysisObj.improvements ||
        analysisObj.improveNext ||
        analysisObj.feedback?.improvements ||
        analysisObj.feedback?.weaknesses ||
        analysisObj.summary?.improvements ||
        raw.improvements ||
        [];
    const improveNext = safeArray(improveNextRaw);

    // Extract interpretation/hiringManagerHeard
    const interpretation = safeString(
        analysisObj.interpretation ||
        analysisObj.hiringManagerHeard ||
        analysisObj.hmHeard ||
        analysisObj.feedback?.interpretation ||
        analysisObj.feedback?.whatHiringManagerHeard ||
        analysisObj.summary?.interpretation ||
        raw.interpretation
    );

    // Extract improved answer/clearer rewrite
    const improved = safeString(
        analysisObj.clearerRewrite ||
        analysisObj.improved ||
        analysisObj.improvedAnswer ||
        analysisObj.rewrite ||
        analysisObj.betterAnswer ||
        analysisObj.feedback?.clearerRewrite ||
        analysisObj.feedback?.rewrite ||
        analysisObj.summary?.rewrite ||
        raw.clearerRewrite ||
        raw.improved
    );

    // Extract vocabulary with multiple fallback paths
    const vocabRaw =
        analysisObj.vocabulary ||
        analysisObj.vocab ||
        analysisObj.feedback?.vocabulary ||
        analysisObj.feedback?.vocab ||
        analysisObj.summary?.vocabulary ||
        raw.vocabulary ||
        [];
    const vocabulary = safeArray(vocabRaw);

    // Extract question text
    const questionText = safeString(
        raw.questionText || raw.question || analysisObj.questionText
    );

    // Extract transcript
    const transcript = safeString(
        raw.transcript || raw.answerText || analysisObj.transcript
    );

    // Extract audio URL for clearer rewrite
    const clearerRewriteAudioUrl =
        analysisObj.clearerRewriteAudioUrl ||
        analysisObj.clearerRewrite?.audioUrl ||
        analysisObj.audioUrl ||
        analysisObj.feedback?.clearerRewriteAudioUrl ||
        analysisObj.feedback?.audioUrl ||
        raw.clearerRewriteAudioUrl ||
        raw.audioUrl ||
        null;

    // Extract timestamp
    const created_at = raw.created_at || null;

    return {
        score,
        whatWorked,
        improveNext,
        interpretation,
        improved,
        vocabulary,
        questionText,
        transcript,
        clearerRewriteAudioUrl,
        created_at,
    };
}

/**
 * Normalizes mock interview summary API responses
 * Handles responses from /api/mock-interview/summary
 * 
 * @param {Object} raw - Raw API response
 * @returns {Object} Normalized summary object with guaranteed safe types
 */
export function normalizeMockSummary(raw) {
    if (!raw || typeof raw !== "object") {
        return {
            recommendation: "No recommendation available",
            percentile: "",
            recommendationType: "default",
            overallScore: 0,
            strongestArea: { title: "N/A", description: "" },
            biggestRisk: { title: "N/A", description: "" },
            strengths: [],
            improvements: [],
            hiringManagerHeard: null,
            improvedExample: null,
            attemptCount: 0,
            perQuestion: [],
        };
    }

    // Extract recommendation
    const recommendation = safeString(
        raw.recommendation,
        "No recommendation available"
    );

    // Extract percentile
    const percentile = safeString(raw.percentile);

    // Extract recommendation type
    const recommendationType = safeString(
        raw.recommendationType,
        "default"
    );

    // Extract overall score (handle both camelCase and snake_case)
    const overallScore = safeNumber(
        raw.overallScore || raw.overall_score,
        0
    );

    // Extract strongest area (handle string or object, both camelCase and snake_case)
    let strongestArea = { title: "N/A", description: "" };
    const rawStrongestArea = raw.strongestArea || raw.strongest_area;
    if (rawStrongestArea) {
        if (typeof rawStrongestArea === "string") {
            strongestArea = { title: rawStrongestArea, description: "" };
        } else if (typeof rawStrongestArea === "object") {
            strongestArea = {
                title: safeString(
                    rawStrongestArea.title ||
                    rawStrongestArea.label ||
                    "N/A"
                ),
                description: safeString(rawStrongestArea.description),
            };
        }
    }

    // Extract biggest risk (handle string or object)
    let biggestRisk = { title: "N/A", description: "" };
    if (raw.biggestRisk) {
        if (typeof raw.biggestRisk === "string") {
            biggestRisk = { title: raw.biggestRisk, description: "" };
        } else if (typeof raw.biggestRisk === "object") {
            biggestRisk = {
                title: safeString(
                    raw.biggestRisk.title ||
                    raw.biggestRisk.label ||
                    "N/A"
                ),
                description: safeString(raw.biggestRisk.description),
            };
        }
    }

    // Extract strengths array
    const strengths = safeArray(raw.strengths);

    // Extract improvements array
    const improvements = safeArray(raw.improvements);

    // Extract hiring manager heard (what the hiring manager likely heard)
    const hiringManagerHeard = safeString(
        raw.hiringManagerHeard ||
        raw.hiring_manager_heard ||
        raw.interpretation ||
        raw.hmHeard
    ) || null;

    // Extract improved example (clearer rewrite / better answer)
    const improvedExample = safeString(
        raw.improvedExample ||
        raw.improved_example ||
        raw.clearerRewrite ||
        raw.clearer_rewrite ||
        raw.betterAnswer ||
        raw.improved
    ) || null;

    // Extract attempt count
    const attemptCount = safeNumber(
        raw.attemptCount || raw.attempt_count,
        0
    );

    // Extract per-question data with transcript normalization
    const rawQuestions = safeArray(raw.perQuestion || raw.per_question);
    const perQuestion = rawQuestions.map(q => ({
        ...q,
        transcript: safeString(
            q.transcript ||
            q.answerText ||
            q.answer_text ||
            q.userAnswer ||
            q.answer ||
            ""
        ).trim() // Ensure whitespace only becomes empty field
    }));

    return {
        recommendation,
        percentile,
        recommendationType,
        overallScore,
        strongestArea,
        biggestRisk,
        strengths,
        improvements,
        hiringManagerHeard,
        improvedExample,
        attemptCount,
        perQuestion,
    };
}
