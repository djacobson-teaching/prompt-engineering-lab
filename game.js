<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Engineering Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<nav>
    <a href="index.html">Home</a>
    <a href="game.html">Interactive Game</a>
</nav>

<header class="hero">
    <h1>🎮 Prompt Engineering Challenge</h1>
    <p>Write a better prompt than the AI. Score points. Level up.</p>
</header>

<section>
    <h2>Scenario</h2>
    <p>You need the AI to explain recursion to a 10th grader using simple language and one visual analogy.</p>

    <h2>Your Prompt</h2>
    <textarea id="game-input" placeholder="Write your prompt here..."></textarea>

    <button onclick="scorePrompt()">Submit</button>

    <div id="result"></div>
</section>

<script src="game.js"></script>
</body>
</html>
