// ---- Simple Prompt Simulator ---- //
function runPrompt() {
    const prompt = document.getElementById("prompt-input").value;

    if (!prompt.trim()) {
        document.getElementById("response-box").innerText = "Type a prompt above!";
        return;
    }

    document.getElementById("response-box").innerText =
        `Pretend AI Response to:\n\n"${prompt}"\n\n(This is mock output — real OpenAI API optional).`;
}

// ---- Specificity Slider Chart ---- //
const ctx1 = document.getElementById("specificity-chart");
let specificityChart = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: ["Specificity"],
        datasets: [{
            label: "Specificity Level",
            data: [5],
            backgroundColor: "#4b8bff"
        }]
    }
});

function updateSpecificity() {
    const value = document.getElementById("specificity-slider").value;
    document.getElementById("slider-value").innerText = value;
    specificityChart.data.datasets[0].data[0] = value;
    specificityChart.update();
}

// ---- Prompt Length Graph ---- //
const ctx2 = document.getElementById("length-chart");

let lengthChart = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: [10, 20, 40, 80, 120, 200],
        datasets: [{
            label: "Hypothetical Quality Score",
            data: [40, 50, 60, 75, 80, 85],
            borderColor: "#ff6363",
            fill: false
        }]
    },
});
