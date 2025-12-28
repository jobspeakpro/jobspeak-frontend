// src/utils/vocabCoach.js
// Vocabulary coaching system with pronunciation support

// Built-in dictionary for common coaching words with IPA phonetics
const VOCAB_DICTIONARY = {
    // Communication & Clarity
    articulate: {
        us: "/ɑːrˈtɪkjəleɪt/",
        uk: "/ɑːˈtɪkjʊleɪt/",
        definition: "Express thoughts clearly and effectively in words.",
        category: "communication"
    },
    succinct: {
        us: "/səkˈsɪŋkt/",
        uk: "/səkˈsɪŋkt/",
        definition: "Brief and clearly expressed, without unnecessary words.",
        category: "communication"
    },
    concise: {
        us: "/kənˈsaɪs/",
        uk: "/kənˈsaɪs/",
        definition: "Giving information clearly in few words.",
        category: "communication"
    },

    // Metrics & Results
    quantify: {
        us: "/ˈkwɑːntɪfaɪ/",
        uk: "/ˈkwɒntɪfaɪ/",
        definition: "Express or measure the quantity of something in numbers.",
        category: "metrics"
    },
    measurable: {
        us: "/ˈmeʒərəbl/",
        uk: "/ˈmeʒərəbl/",
        definition: "Able to be measured or assessed with specific data.",
        category: "metrics"
    },
    impact: {
        us: "/ˈɪmpækt/",
        uk: "/ˈɪmpækt/",
        definition: "The effect or influence of one thing on another.",
        category: "metrics"
    },

    // Ownership & Accountability
    ownership: {
        us: "/ˈoʊnərʃɪp/",
        uk: "/ˈəʊnəʃɪp/",
        definition: "Taking responsibility for outcomes and decisions.",
        category: "ownership"
    },
    accountability: {
        us: "/əˌkaʊntəˈbɪləti/",
        uk: "/əˌkaʊntəˈbɪləti/",
        definition: "Being responsible and answerable for your actions.",
        category: "ownership"
    },
    initiative: {
        us: "/ɪˈnɪʃətɪv/",
        uk: "/ɪˈnɪʃətɪv/",
        definition: "The ability to act independently and take charge.",
        category: "ownership"
    },

    // Structure & Organization
    structured: {
        us: "/ˈstrʌktʃərd/",
        uk: "/ˈstrʌktʃəd/",
        definition: "Organized in a clear, logical framework or pattern.",
        category: "structure"
    },
    systematic: {
        us: "/ˌsɪstəˈmætɪk/",
        uk: "/ˌsɪstəˈmætɪk/",
        definition: "Done according to a fixed plan or system; methodical.",
        category: "structure"
    },

    // Professional qualities
    professionalism: {
        us: "/prəˈfeʃənəlɪzəm/",
        uk: "/prəˈfeʃənəlɪzəm/",
        definition: "The competence and behavior expected of a professional.",
        category: "professional"
    },
    composure: {
        us: "/kəmˈpoʊʒər/",
        uk: "/kəmˈpəʊʒə/",
        definition: "The state of being calm and in control of oneself.",
        category: "professional"
    },
    diligence: {
        us: "/ˈdɪlɪdʒəns/",
        uk: "/ˈdɪlɪdʒəns/",
        definition: "Careful and persistent work or effort.",
        category: "professional"
    },

    // Role-specific (can expand)
    collaborate: {
        us: "/kəˈlæbəreɪt/",
        uk: "/kəˈlæbəreɪt/",
        definition: "Work jointly with others on a project or activity.",
        category: "teamwork"
    },
    prioritize: {
        us: "/praɪˈɔːrətaɪz/",
        uk: "/praɪˈɒrɪtaɪz/",
        definition: "Determine the order of importance for tasks or goals.",
        category: "organization"
    },
    optimize: {
        us: "/ˈɑːptɪmaɪz/",
        uk: "/ˈɒptɪmaɪz/",
        definition: "Make the best or most effective use of resources.",
        category: "improvement"
    },
    streamline: {
        us: "/ˈstriːmlaɪn/",
        uk: "/ˈstriːmlaɪn/",
        definition: "Make a process more efficient by simplifying it.",
        category: "improvement"
    }
};

// Profanity filter - never suggest these
const BLOCKED_WORDS = [
    'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'piss',
    'dick', 'cock', 'pussy', 'cunt', 'bastard', 'whore', 'slut'
];

/**
 * Pick 2 vocabulary words based on answer analysis
 */
export function pickVocab({ transcript, targetRole, scoreData }) {
    const words = [];

    // If inappropriate content, return safe neutral words only
    if (scoreData.hideTranscript) {
        return [
            createVocabCard('professionalism', targetRole),
            createVocabCard('composure', targetRole)
        ];
    }

    // Pick words based on detected weaknesses
    const needsMetrics = scoreData.specificityScore < 12;
    const needsStructure = scoreData.structureScore < 20;
    const needsClarity = scoreData.clarityScore < 14;

    // Strategy: Pick 2 words from different categories
    if (needsMetrics) {
        words.push(pickFromCategory('metrics', targetRole));
    }

    if (needsStructure && words.length < 2) {
        words.push(pickFromCategory('structure', targetRole));
    }

    if (needsClarity && words.length < 2) {
        words.push(pickFromCategory('communication', targetRole));
    }

    // Fill remaining slots with ownership/professional words
    while (words.length < 2) {
        const category = words.length === 0 ? 'ownership' : 'professional';
        words.push(pickFromCategory(category, targetRole));
    }

    return words;
}

/**
 * Pick a random word from a category
 */
function pickFromCategory(category, targetRole) {
    const categoryWords = Object.keys(VOCAB_DICTIONARY).filter(
        word => VOCAB_DICTIONARY[word].category === category
    );

    if (categoryWords.length === 0) {
        // Fallback to any word
        const allWords = Object.keys(VOCAB_DICTIONARY);
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        return createVocabCard(randomWord, targetRole);
    }

    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    return createVocabCard(randomWord, targetRole);
}

/**
 * Create a vocabulary card with all details
 */
function createVocabCard(word, targetRole) {
    const entry = VOCAB_DICTIONARY[word];

    if (!entry) {
        // Fallback if word not in dictionary
        return {
            word,
            usPhonetic: '',
            ukPhonetic: '',
            definition: 'A professional term to enhance your answer.',
            usageExample: `I demonstrated ${word} in my previous role.`
        };
    }

    // Create role-specific usage example
    const usageExample = createUsageExample(word, targetRole, entry.category);

    return {
        word,
        usPhonetic: entry.us,
        ukPhonetic: entry.uk,
        definition: entry.definition,
        usageExample
    };
}

/**
 * Create a usage example tailored to target role
 */
function createUsageExample(word, targetRole, category) {
    const role = targetRole || 'professional';

    // Role-specific templates
    const templates = {
        quantify: `I ${word} the impact by tracking a 25% improvement in ${role} metrics.`,
        measurable: `The results were ${word}, showing clear progress in our ${role} objectives.`,
        articulate: `I ${word} the technical solution to stakeholders in simple terms.`,
        ownership: `I took ${word} of the project and drove it to completion.`,
        initiative: `I showed ${word} by proposing a new approach to solve the problem.`,
        structured: `I used a ${word} approach to break down the complex ${role} challenge.`,
        collaborate: `I ${word} with cross-functional teams to deliver the solution.`,
        prioritize: `I ${word} tasks based on business impact and urgency.`,
        professionalism: `I maintained ${word} throughout the challenging situation.`,
        composure: `I kept my ${word} under pressure and focused on solutions.`
    };

    return templates[word] || `I demonstrated ${word} in my ${role} work.`;
}

/**
 * Check if user used target words in their answer
 */
export function checkWordUsage(transcript, targetWords) {
    if (!transcript || !targetWords || targetWords.length === 0) {
        return { used: 0, words: [] };
    }

    const lower = transcript.toLowerCase();
    const usedWords = [];

    targetWords.forEach(wordObj => {
        const word = wordObj.word.toLowerCase();
        // Basic stemming: check for word or word + s/ed/ing
        const patterns = [
            new RegExp(`\\b${word}\\b`, 'i'),
            new RegExp(`\\b${word}s\\b`, 'i'),
            new RegExp(`\\b${word}ed\\b`, 'i'),
            new RegExp(`\\b${word}ing\\b`, 'i')
        ];

        if (patterns.some(p => p.test(lower))) {
            usedWords.push(wordObj.word);
        }
    });

    return {
        used: usedWords.length,
        words: usedWords
    };
}
