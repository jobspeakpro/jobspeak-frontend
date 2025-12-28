// src/utils/scoringEngine.js
// GOLD scoring system - Detailed, actionable feedback

/**
 * Calculate answer score using rubric:
 * Structure (0-35) + Relevance (0-25) + Specificity (0-20) + Clarity (0-20) = 0-100
 */

// Profanity/inappropriate content detection
const INAPPROPRIATE_PATTERNS = [
    /\b(fuck|shit|damn|bitch|ass|hell|crap|piss|dick|cock|pussy|cunt|bastard|whore|slut)\b/i,
    /\b(sex|sexual|porn|nude|naked|rape)\b/i,
    /\b(kill|murder|violence|weapon|gun|knife|blood)\b/i
];

function containsInappropriateContent(text) {
    return INAPPROPRIATE_PATTERNS.some(pattern => pattern.test(text));
}

// STAR method detection
function detectSTAR(text) {
    const hasS = /\b(situation|context|when|at the time|background)\b/i.test(text);
    const hasT = /\b(task|challenge|problem|goal|objective|needed to)\b/i.test(text);
    const hasA = /\b(action|did|implemented|created|developed|decided|approach)\b/i.test(text);
    const hasR = /\b(result|outcome|impact|achieved|improved|increased|decreased|saved)\b/i.test(text);

    return { hasS, hasT, hasA, hasR, count: [hasS, hasT, hasA, hasR].filter(Boolean).length };
}

// Specificity detection (numbers, metrics, tools)
function detectSpecifics(text) {
    const hasNumbers = /\d+%|\d+\+?|[$€£]\d+|[0-9]+[kmb]?\b/i.test(text);
    const hasTools = /\b(python|java|react|sql|aws|docker|kubernetes|jira|slack|excel|salesforce|tableau)\b/i.test(text);
    const hasMetrics = /\b(increased|decreased|improved|reduced|saved|grew|scaled|optimized)\s+\w+\s+(by|to|from)\s+\d+/i.test(text);

    return { hasNumbers, hasTools, hasMetrics };
}

// Word count and sentence structure
function analyzeClarity(text) {
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;

    return { words, sentences, avgWordsPerSentence };
}

/**
 * Main scoring function - GOLD version with detailed feedback
 */
export function scoreAnswer(transcript, questionText = '') {
    // Safety: handle null/undefined/empty
    if (!transcript || typeof transcript !== 'string') {
        return {
            totalScore: 0,
            structureScore: 0,
            relevanceScore: 0,
            specificityScore: 0,
            clarityScore: 0,
            label: 'Needs work',
            whatWorked: [],
            improveNext: [
                {
                    title: 'No transcript captured',
                    detail: 'We didn\'t receive your answer. Please try recording again or use text input.',
                    snippet: null
                }
            ],
            hiringManagerHeard: "I'm not confident you can handle this consistently yet.",
            hideTranscript: false,
            signals: { clarity: 'Low', ownership: 'Low', impact: 'Low' }
        };
    }

    const text = transcript.trim();

    // Edge case: Empty or too short
    if (text.length < 8 || text.split(/\s+/).length < 3) {
        return {
            totalScore: 0,
            structureScore: 0,
            relevanceScore: 0,
            specificityScore: 0,
            clarityScore: 0,
            label: 'Needs work',
            whatWorked: [],
            improveNext: [
                {
                    title: 'Provide a complete answer',
                    detail: 'Your response was too brief to evaluate. Aim for 3-5 sentences that tell a complete story.',
                    snippet: 'Try: "In my role at X, I faced Y challenge. I did Z, which resulted in A outcome."'
                }
            ],
            hiringManagerHeard: "I'm not confident you can handle this consistently yet.",
            hideTranscript: false,
            signals: null
        };
    }

    // Edge case: Inappropriate content
    if (containsInappropriateContent(text)) {
        return {
            totalScore: 0,
            structureScore: 0,
            relevanceScore: 0,
            specificityScore: 0,
            clarityScore: 0,
            label: 'Needs work',
            whatWorked: [],
            improveNext: [
                {
                    title: 'Maintain professionalism',
                    detail: 'Interview answers must be workplace-appropriate. Focus on professional experiences and use respectful language.',
                    snippet: null
                },
                {
                    title: 'Use the STAR method',
                    detail: 'Structure your answer: Situation → Task → Action → Result. This keeps you focused on relevant details.',
                    snippet: null
                }
            ],
            hiringManagerHeard: "I'm not confident you can handle this consistently yet.",
            hideTranscript: true,
            signals: null
        };
    }

    // Edge case: "I don't know" / uncertainty
    const uncertaintyPatterns = /\b(don't know|not sure|no idea|idk|dunno|maybe|i guess)\b/i;
    if (uncertaintyPatterns.test(text) && text.split(/\s+/).length < 15) {
        return {
            totalScore: 15,
            structureScore: 5,
            relevanceScore: 5,
            specificityScore: 3,
            clarityScore: 2,
            label: 'Needs work',
            whatWorked: [],
            improveNext: [
                {
                    title: 'Use the STAR template',
                    detail: 'Even if you\'re unsure, structure helps. Start with: "In [situation], I needed to [task]. I [action], which led to [result]."',
                    snippet: 'Example: "When our system went down, I coordinated the team, debugged the issue, and restored service in 2 hours."'
                },
                {
                    title: 'Draw from any experience',
                    detail: 'School projects, volunteer work, or personal initiatives all count. Pick something you actually did and describe it clearly.',
                    snippet: null
                }
            ],
            hiringManagerHeard: "I'm not confident you can handle this consistently yet.",
            hideTranscript: false,
            signals: { clarity: 'Low', ownership: 'Low', impact: 'Low' }
        };
    }

    // Calculate component scores
    const star = detectSTAR(text);
    const specifics = detectSpecifics(text);
    const clarity = analyzeClarity(text);

    // 1. Structure Score (0-35)
    let structureScore = 0;
    if (star.count === 0) structureScore = 5;
    else if (star.count === 1) structureScore = 10;
    else if (star.count === 2) structureScore = 20;
    else if (star.count === 3) structureScore = 28;
    else if (star.count === 4) structureScore = 35;

    // 2. Relevance Score (0-25)
    let relevanceScore = 18;
    if (clarity.words < 20) relevanceScore = 10;
    if (clarity.words >= 50) relevanceScore = 22;

    // 3. Specificity Score (0-20)
    let specificityScore = 0;
    if (specifics.hasNumbers) specificityScore += 8;
    if (specifics.hasTools) specificityScore += 6;
    if (specifics.hasMetrics) specificityScore += 6;
    if (specificityScore === 0) specificityScore = 4;
    specificityScore = Math.min(20, specificityScore);

    // 4. Clarity Score (0-20)
    let clarityScore = 14;
    if (clarity.words < 15) clarityScore = 8;
    if (clarity.words > 200) clarityScore = 12;
    if (clarity.avgWordsPerSentence > 30) clarityScore -= 2;
    if (clarity.avgWordsPerSentence < 10) clarityScore += 2;
    if (clarity.sentences >= 3 && clarity.sentences <= 7) clarityScore += 4;
    clarityScore = Math.max(0, Math.min(20, clarityScore));

    // Total Score
    const totalScore = structureScore + relevanceScore + specificityScore + clarityScore;

    // Score Label
    let label = 'Needs work';
    if (totalScore >= 90) label = 'Excellent';
    else if (totalScore >= 75) label = 'Strong';
    else if (totalScore >= 60) label = 'Good';
    else if (totalScore >= 40) label = 'Okay';

    // GOLD: Detailed "What Worked" (3 bullets)
    const whatWorked = [];

    if (star.count >= 4) {
        whatWorked.push({
            title: 'Complete STAR structure',
            detail: 'You covered Situation, Task, Action, and Result. This shows you can organize thoughts clearly under pressure.',
            snippet: null
        });
    } else if (star.count >= 3) {
        whatWorked.push({
            title: 'Strong structure',
            detail: 'You included most STAR elements. Hiring managers can follow your story easily, which builds trust.',
            snippet: null
        });
    } else if (star.count >= 2) {
        whatWorked.push({
            title: 'Partial structure',
            detail: 'You touched on some key elements. With a bit more organization, this answer would be even stronger.',
            snippet: null
        });
    }

    if (specifics.hasMetrics) {
        whatWorked.push({
            title: 'Quantified impact',
            detail: 'You included measurable results. Numbers make your accomplishments concrete and memorable to interviewers.',
            snippet: null
        });
    } else if (specifics.hasNumbers) {
        whatWorked.push({
            title: 'Specific details',
            detail: 'You mentioned concrete numbers or data. This adds credibility and shows you track your work.',
            snippet: null
        });
    }

    if (clarity.sentences >= 3 && clarity.sentences <= 6 && clarity.avgWordsPerSentence < 20) {
        whatWorked.push({
            title: 'Clear and concise',
            detail: 'Your answer was easy to follow without rambling. Brevity shows confidence and respect for the interviewer\'s time.',
            snippet: null
        });
    }

    if (whatWorked.length === 0) {
        whatWorked.push({
            title: 'You answered',
            detail: 'You provided a response, which is the first step. Now let\'s refine it to make it more compelling.',
            snippet: null
        });
    }

    // Limit to 3
    const finalWhatWorked = whatWorked.slice(0, 3);

    // GOLD: Detailed "Improve Next" (3 bullets)
    const improveNext = [];

    // Check for missing STAR components
    if (!star.hasS && star.count < 4) {
        improveNext.push({
            title: 'Add the Situation',
            detail: 'Start by setting context: where were you, what was happening? This helps the interviewer picture the scenario.',
            snippet: 'Try: "At my previous company, we faced a critical deadline when..."'
        });
    }

    if (!star.hasR && star.count < 4) {
        improveNext.push({
            title: 'State the Result',
            detail: 'Always close with the outcome. What happened because of your actions? Did it work? What did you learn?',
            snippet: 'End with: "As a result, we delivered on time and the client renewed their contract."'
        });
    }

    if (!specifics.hasNumbers && !specifics.hasMetrics) {
        improveNext.push({
            title: 'Add measurable impact',
            detail: 'Include at least one number: percentage improvement, time saved, money earned, or team size. Metrics prove value.',
            snippet: 'Instead of "improved performance," say "reduced load time by 40%."'
        });
    }

    if (clarity.words < 30) {
        improveNext.push({
            title: 'Expand with context',
            detail: 'Your answer is too brief. Add 2-3 sentences explaining the challenge, your approach, and the outcome.',
            snippet: null
        });
    }

    if (clarity.words > 150) {
        improveNext.push({
            title: 'Be more concise',
            detail: 'Aim for 60-100 words. Cut filler words and focus on the most important details that show your impact.',
            snippet: 'Remove phrases like "I think," "kind of," "basically." Get straight to the point.'
        });
    }

    if (clarity.avgWordsPerSentence > 25) {
        improveNext.push({
            title: 'Shorten your sentences',
            detail: 'Long sentences are hard to follow. Break complex ideas into 2-3 shorter sentences for clarity.',
            snippet: null
        });
    }

    // Limit to 3
    const finalImproveNext = improveNext.slice(0, 3);
    if (finalImproveNext.length === 0) {
        finalImproveNext.push({
            title: 'Practice with more examples',
            detail: 'Your answer is solid. To level up, practice telling this story in different ways and add more specific details.',
            snippet: null
        });
    }

    // Hiring Manager Interpretation
    const targetRole = localStorage.getItem('target_role');
    const roleSuffix = targetRole && targetRole !== 'General interview' ? ` for a ${targetRole} role.` : '.';

    let hiringManagerHeard = '';
    if (totalScore <= 39) {
        hiringManagerHeard = "I'm not confident you can handle this consistently yet" + roleSuffix;
    } else if (totalScore <= 59) {
        hiringManagerHeard = "You have the right idea, but I need clearer specifics and outcome" + roleSuffix;
    } else if (totalScore <= 74) {
        hiringManagerHeard = "You can do the work—add more measurable impact" + roleSuffix;
    } else if (totalScore <= 89) {
        hiringManagerHeard = "Strong answer—clear ownership and results" + roleSuffix;
    } else {
        hiringManagerHeard = "Excellent—this signals high ownership, strong judgment, and impact" + roleSuffix;
    }

    // Signal Mapping
    const signals = {
        clarity: clarityScore >= 16 ? 'High' : clarityScore >= 12 ? 'Med' : 'Low',
        ownership: (structureScore + relevanceScore) >= 40 ? 'High' : (structureScore + relevanceScore) >= 25 ? 'Med' : 'Low',
        impact: specificityScore >= 14 ? 'High' : specificityScore >= 8 ? 'Med' : 'Low'
    };

    return {
        totalScore,
        structureScore,
        relevanceScore,
        specificityScore,
        clarityScore,
        label,
        whatWorked: finalWhatWorked,
        improveNext: finalImproveNext,
        hiringManagerHeard,
        hideTranscript: false,
        signals
    };
}
