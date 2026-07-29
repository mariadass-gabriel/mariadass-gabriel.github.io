document.getElementById('year').textContent = new Date().getFullYear();

// --- Hero figure: synthetic log-log scatter + regression line ---
// Purely illustrative (not real data), evokes the log-log power-law
// regressions from the heavy-tails / agent-based modeling project.
(function () {
  const svgNS = "http://www.w3.org/2000/svg";
  const scatterGroup = document.getElementById('scatter');
  const ticksGroup = document.querySelector('.ticks');
  const regline = document.getElementById('regline');
  if (!scatterGroup || !ticksGroup || !regline) return;

  const plotLeft = 60, plotRight = 440, plotTop = 30, plotBottom = 360;

  // ticks
  for (let i = 0; i <= 4; i++) {
    const x = plotLeft + (i / 4) * (plotRight - plotLeft);
    const y = plotBottom - (i / 4) * (plotBottom - plotTop);

    const tickX = document.createElementNS(svgNS, 'line');
    tickX.setAttribute('x1', x); tickX.setAttribute('x2', x);
    tickX.setAttribute('y1', plotBottom); tickX.setAttribute('y2', plotBottom + 6);
    tickX.setAttribute('class', 'axis');
    ticksGroup.appendChild(tickX);

    const tickY = document.createElementNS(svgNS, 'line');
    tickY.setAttribute('x1', plotLeft - 6); tickY.setAttribute('x2', plotLeft);
    tickY.setAttribute('y1', y); tickY.setAttribute('y2', y);
    tickY.setAttribute('class', 'axis');
    ticksGroup.appendChild(tickY);
  }

  // synthetic points following a rough power-law trend + noise
  let seed = 42;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const slope = -1.35;
  const intercept = 0.92;
  const points = [];

  for (let i = 0; i < 42; i++) {
    const xNorm = 0.06 + rand() * 0.9;
    const noise = (rand() - 0.5) * 0.16;
    const yNorm = intercept + slope * xNorm + noise;
    points.push([xNorm, Math.max(0, Math.min(1, yNorm + 0.4))]);
  }

  points.forEach(([xn, yn], i) => {
    const cx = plotLeft + xn * (plotRight - plotLeft);
    const cy = plotBottom - yn * (plotBottom - plotTop);
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', 3.2);
    c.setAttribute('class', 'scatter-pt');
    c.style.animationDelay = `${0.6 + i * 0.015}s`;
    scatterGroup.appendChild(c);
  });

  // regression line across the plot
  const x1 = plotLeft + 0.04 * (plotRight - plotLeft);
  const y1 = plotBottom - Math.min(1, Math.max(0, intercept + slope * 0.04 + 0.4)) * (plotBottom - plotTop);
  const x2 = plotLeft + 0.98 * (plotRight - plotLeft);
  const y2 = plotBottom - Math.min(1, Math.max(0, intercept + slope * 0.98 + 0.4)) * (plotBottom - plotTop);

  regline.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
})();
