
import { checkContentSafety } from './professionalismGate.js';

console.log("Running Content Safety Tests...");

const testCases = [
    { text: "I worked very hard on the project.", expectSafe: true, label: "Clean text" },
    { text: "It was a fucking disaster.", expectSafe: false, label: "Profanity (fucking)" },
    { text: "Hey baby, trust me.", expectSafe: false, label: "Banned word (baby)" },
    { text: "She is a naughty girl.", expectSafe: false, label: "Banned word (girl)" },
    { text: "You feel fine tonight?", expectSafe: false, label: "Phrase (fine tonight)" },
    { text: "It was sh*t.", expectSafe: false, label: "Leetspeak (sh*t)" },
    { text: "I hate that b!tch.", expectSafe: false, label: "Leetspeak (b!tch)" },
    { text: "You are an asshole.", expectSafe: false, label: "Profanity (asshole)" },
    { text: "This is pure crap.", expectSafe: false, label: "Mild Profanity (crap)" },
    { text: "   fuck   ", expectSafe: false, label: "Spaced profanity" },
    // Specific requests
    { text: "I managed the team well.", expectSafe: true, label: "Professional text" },
];

let passed = 0;
let failed = 0;

testCases.forEach((tc) => {
    // Mock simple LEET replacement for the test if not fully implemented in regex yet:
    // Actually, let's see if our regex catches it.

    // Note: The regex in the file uses literal string sources or specific regexes.
    // We are testing the file logic directly.

    const result = checkContentSafety(tc.text);
    const isSafe = result.safe;

    if (isSafe === tc.expectSafe) {
        console.log(`[PASS] ${tc.label}: "${tc.text}" -> Safe: ${isSafe}`);
        passed++;
    } else {
        console.error(`[FAIL] ${tc.label}: "${tc.text}" -> Expected Safe: ${tc.expectSafe}, Got: ${isSafe}`);
        console.log("Reasons:", result.reasons);
        failed++;
    }
});

console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);
