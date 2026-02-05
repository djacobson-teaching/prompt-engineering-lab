// Interactive simulator for Bernoulli, Dice, and Binomial distributions
// Uses Chart.js to display counts and (when available) theoretical probabilities

// Lightweight seeded RNG (mulberry32) for reproducible runs if desired
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const distribution = document.getElementById('distribution');
  const params = document.getElementById('params');
  const p = document.getElementById('p');
  const sides = document.getElementById('sides');
  const n_binomial = document.getElementById('n_binomial');
  const p_binomial = document.getElementById('p_binomial');

  const trialsInput = document.getElementById('trials');
  const trialsRange = document.getElementById('trialsRange');
  const runBtn = document.getElementById('run');
  const animateBtn = document.getElementById('animate');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const downloadBtn = document.getElementById('download');
  const batchSizeInput = document.getElementById('batchSize');

  const doneEl = document.getElementById('done');
  const meanEl = document.getElementById('mean');
  const varEl = document.getElementById('variance');
  const theoMeanEl = document.getElementById('theoMean');
  const theoVarEl = document.getElementById('theoVar');
  const progressFill = document.getElementById('progressFill');

  // Sync number input and range
  trialsInput.addEventListener('input', () => { trialsRange.value = trialsInput.value; });
  trialsRange.addEventListener('input', () => { trialsInput.value = trialsRange.value; });

  // Toggle parameter visibility
  distribution.addEventListener('change', () => {
    document.querySelectorAll('.param').forEach(el => el.style.display = 'none');
    const val = distribution.value;
    if (val === 'bernoulli') document.querySelector('.param.bernoulli').style.display = 'flex';
    if (val === 'dice') document.querySelector('.param.dice').style.display = 'flex';
    if (val === 'binomial') document.querySelector('.param.binomial').style.display = 'flex';
    reset();
  });

  // Chart setup
  const ctx = document.getElementById('chart').getContext('2d');
  let chart;
  let labels = [];
  let counts = [];
  let theoDataset = null;

  function prepareDistribution() {
    const dist = distribution.value;
    if (dist === 'bernoulli') {
      labels = ['0', '1']; // tails=0 heads=1
      counts = [0,0];
    } else if (dist === 'dice') {
      const s = Math.max(2, parseInt(sides.value,10) || 6);
      labels = Array.from({length:s}, (_,i) => String(i+1));
      counts = new Array(s).fill(0);
    } else if (dist === 'binomial') {
      const n = Math.max(1, parseInt(n_binomial.value,10) || 10);
      labels = Array.from({length:n+1}, (_,k) => String(k));
      counts = new Array(n+1).fill(0);
    }
  }

  function createChart() {
    prepareDistribution();
    if (chart) chart.destroy();

    const data = {
      labels,
      datasets: [{
        type: 'bar',
        label: 'Counts',
        data: counts,
        backgroundColor: 'rgba(96,165,250,0.9)',
      }]
    };

    chart = new Chart(ctx, {
      data,
      options: {
        maintainAspectRatio: false,
        animation: {duration: 200},
        scales: {
          x: {beginAtZero:true},
          y: {beginAtZero:true, ticks:{precision:0}}
        },
        plugins:{
          legend:{display:false},
          tooltip:{mode:'index', intersect:false}
        }
      }
    });
  }

  createChart();

  // Simulation utilities
  function sampleOne() {
    const dist = distribution.value;
    if (dist === 'bernoulli') {
      const r = Math.random();
      return r < parseFloat(p.value) ? 1 : 0;
    } else if (dist === 'dice') {
      const s = Math.max(2, parseInt(sides.value,10) || 6);
      return Math.floor(Math.random()*s) + 1;
    } else if (dist === 'binomial') {
      const n = Math.max(1, parseInt(n_binomial.value,10) || 10);
      const prob = parseFloat(p_binomial.value);
      let sum = 0;
      for (let i=0;i<n;i++) if (Math.random() < prob) sum++;
      return sum;
    }
  }

  function theoretical() {
    const dist = distribution.value;
    if (dist === 'bernoulli') {
      const prob = parseFloat(p.value);
      const mean = prob;
      const variance = prob*(1-prob);
      const probs = [1-prob, prob];
      return {mean, variance, probs};
    }
    if (dist === 'dice') {
      const s = Math.max(2, parseInt(sides.value,10) || 6);
      const mean = (s+1)/2;
      const variance = ((s*s)-1)/12;
      const p = new Array(s).fill(1/s);
      return {mean, variance, probs:p};
    }
    if (dist === 'binomial') {
      const n = Math.max(1, parseInt(n_binomial.value,10) || 10);
      const prob = parseFloat(p_binomial.value);
      // pmf for k=0..n
      const probs = new Array(n+1).fill(0);
      for (let k=0;k<=n;k++){
        probs[k] = binom(n,k)*Math.pow(prob,k)*Math.pow(1-prob,n-k);
      }
      const mean = n*prob;
      const variance = n*prob*(1-prob);
      return {mean, variance, probs};
    }
    return null;
  }

  // Binomial helper
  function binom(n,k){
    if (k<0 || k>n) return 0;
    if (k===0 || k===n) return 1;
    k = Math.min(k, n-k);
    let c = 1;
    for (let i=0;i<k;i++){
      c = c * (n-i) / (i+1);
    }
    return c;
  }

  // Update theoretical overlay
  function updateTheoreticalOverlay(totalSamples) {
    const t = theoretical();
    // remove previous overlay if exists
    if (chart.data.datasets.length > 1) chart.data.datasets.splice(1);
    if (!t) return;
    // scale probabilities to counts
    const scaled = t.probs.map(p => p * totalSamples);
    chart.data.datasets.push({
      type: 'line',
      label: 'Theoretical (scaled)',
      data: scaled,
      borderColor: 'rgba(255,193,7,0.95)',
      borderWidth: 2,
      tension: 0.2,
      pointRadius: 3,
      fill: false,
      yAxisID: undefined
    });
    chart.update();
    theoMeanEl.textContent = (t.mean).toFixed(3);
    theoVarEl.textContent = (t.variance).toFixed(3);
  }

  function resetStats() {
    doneEl.textContent = '0';
    meanEl.textContent = '—';
    varEl.textContent = '—';
    theoMeanEl.textContent = '—';
    theoVarEl.textContent = '—';
    progressFill.style.width = '0%';
  }

  // Data storage for download
  let samplesLog = [];

  // Simulation runner (instant)
  function runInstant() {
    reset();
    const total = parseInt(trialsInput.value,10) || 1000;
    const start = performance.now();
    for (let i=0;i<total;i++){
      const v = sampleOne();
      recordValue(v);
    }
    const duration = (performance.now()-start);
    finalizeRun(total);
    console.info(`Completed ${total} samples in ${duration.toFixed(1)} ms`);
  }

  // Animated runner (batch) with pause/resume
  let running = false;
  let paused = false;
  let toDo = 0;
  async function runAnimated() {
    reset();
    running = true;
    paused = false;
    pauseBtn.disabled = false;
    animateBtn.disabled = true;
    runBtn.disabled = true;

    toDo = parseInt(trialsInput.value,10) || 1000;
    const batch = Math.max(1, parseInt(batchSizeInput.value,10) || 500);
    let completed = 0;

    function stepBatch() {
      const nowBatch = Math.min(batch, toDo - completed);
      for (let j=0;j<nowBatch;j++){
        const v = sampleOne();
        recordValue(v);
      }
      completed += nowBatch;
      updateStats(completed);
      progressFill.style.width = `${(completed/toDo*100).toFixed(2)}%`;
      chart.update('none'); // faster, no animation
    }

    while (completed < toDo && running) {
      if (paused) {
        await new Promise(r => setTimeout(r,100));
        continue;
      }
      stepBatch();
      // yield to UI
      await new Promise(r => setTimeout(r, 12));
    }

    running = false;
    pauseBtn.disabled = true;
    animateBtn.disabled = false;
    runBtn.disabled = false;
    finalizeRun(toDo);
  }

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  function recordValue(v) {
    // map sample value to index
    const dist = distribution.value;
    let idx = 0;
    if (dist === 'bernoulli') idx = v === 1 ? 1 : 0;
    else if (dist === 'dice') idx = Number(v)-1;
    else if (dist === 'binomial') idx = Number(v);
    counts[idx] = (counts[idx] || 0) + 1;
    samplesLog.push(v);
  }

  function updateStats(completed) {
    doneEl.textContent = String(completed);
    const mean = sampleMean();
    const variance = sampleVariance();
    meanEl.textContent = isNaN(mean) ? '—' : mean.toFixed(4);
    varEl.textContent = isNaN(variance) ? '—' : variance.toFixed(4);
    updateTheoreticalOverlay(completed);
  }

  function finalizeRun(total) {
    updateStats(total);
    chart.update();
  }

  // Reset
  function reset() {
    running = false;
    paused = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    animateBtn.disabled = false;
    runBtn.disabled = false;

    prepareDistribution();
    createChart();
    samplesLog = [];
    resetStats();
  }

  // Stats helpers
  function sampleMean() {
    if (!samplesLog.length) return NaN;
    let s = 0;
    for (const x of samplesLog) s += Number(x);
    return s / samplesLog.length;
  }
  function sampleVariance() {
    const m = sampleMean();
    if (!samplesLog.length) return NaN;
    let s2 = 0;
    for (const x of samplesLog) {
      const d = Number(x)-m;
      s2 += d*d;
    }
    return s2 / samplesLog.length;
  }

  // Download CSV
  function downloadCSV() {
    if (!samplesLog.length) {
      alert('No samples to download. Run a simulation first.');
      return;
    }
    const header = 'sample_index,value\n';
    const body = samplesLog.map((v,i) => `${i+1},${v}`).join('\n');
    const blob = new Blob([header + body], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${distribution.value}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Attach button actions
  runBtn.addEventListener('click', runInstant);
  animateBtn.addEventListener('click', () => { if (!running) runAnimated(); });
  resetBtn.addEventListener('click', reset);
  downloadBtn.addEventListener('click', downloadCSV);

  // Recreate chart when parameters change
  [p, sides, n_binomial, p_binomial].forEach(el => {
    el.addEventListener('change', () => {
      reset();
    });
  });

  // Initialize (set correct params UI)
  distribution.dispatchEvent(new Event('change'));
});
