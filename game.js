function scorePrompt() {
    const text = document.getElementById("game-input").value.toLowerCase();
    let score = 0;

    // Scoring rules
    if (text.includes("10th") || text.includes("grade")) score += 20;
    if (text.includes("recursion")) score += 20;
    if (text.includes("simple") || text.includes("easy")) score += 15;
    if (text.includes("analogy") || text.includes("visual")) score += 25;
    if (text.includes("explain") || text.includes("teach")) score += 10;
    if (text.includes("steps") || text.includes("example")) score += 10;

    let message = "";

    if (score < 40) {
        message = "😬 Needs work. Try specifying the audience, task, and format.";
    } else if (score < 70) {
        message = "👍 Not bad! Add clarity, constraints, or examples to boost it.";
    } else if (score < 90) {
        message = "🔥 Strong prompt! You're thinking like a prompt engineer.";
    } else {
        message = "🚀 Perfect! This is a top-tier prompt.";
    }

    document.getElementById("result").innerHTML = `
        <h3>Your Score: ${score} / 100</h3>
        <p>${message}</p>
    `;
}
