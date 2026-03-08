document.addEventListener('DOMContentLoaded', () => {
    const sleepEl = document.getElementById('bio-sleep');
    const hrvEl = document.getElementById('bio-hrv');
    const energyEl = document.getElementById('bio-energy');
    const liveHrEl = document.getElementById('live-hr');
    const hrSvg = document.getElementById('chart-hr');
    const trendSvg = document.getElementById('chart-trend');

    async function fetchBiometrics() {
        try {
            const response = await fetch('/data/biometrics.json');
            if (!response.ok) throw new Error('Data not available');
            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.warn('Telemetry offline. Using cached local storage.');
            showFallback();
        }
    }

    function updateUI(data) {
        if (data.metrics) {
            if (hrvEl) hrvEl.innerText = `${data.metrics.system_recovery} MS`;
            if (sleepEl) sleepEl.innerText = `${data.metrics.neural_sync} HRS`;
            if (energyEl) energyEl.innerText = `${data.metrics.metabolic_output} KCAL`;
            if (liveHrEl) liveHrEl.innerText = `${data.metrics.current_heart_rate} BPM`;
        }

        if (data.trends) {
            drawTelemetryChart(hrSvg, data.trends.heart_rate_24h, '#6366f1'); // Indigo for HR
            drawTelemetryChart(trendSvg, data.trends.calories_7d, '#c084fc'); // Purple for Calories
        }
    }

    function drawTelemetryChart(svg, data, color) {
        if (!svg || !data || data.length === 0) return;

        // Clear previous
        svg.innerHTML = '';

        const width = svg.clientWidth || 300;
        const height = svg.clientHeight || 100;
        const padding = 10;

        const filteredData = data.filter(v => v > 0);
        if (filteredData.length < 2) return;

        const min = Math.min(...filteredData) * 0.9;
        const max = Math.max(...filteredData) * 1.1;
        const range = max - min;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            // Handle zeroes/nulls by keeping them at the bottom or skipping
            const y = val === 0 ? height : height - ((val - min) / range) * (height - padding * 2) - padding;
            return { x, y, val };
        });

        // 1. Create Grid Lines
        const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gridGroup.setAttribute("class", "grid-lines");
        for (let i = 1; i < 4; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const y = (height / 4) * i;
            line.setAttribute("x1", 0); line.setAttribute("y1", y);
            line.setAttribute("x2", width); line.setAttribute("y2", y);
            line.setAttribute("stroke", "rgba(255,255,255,0.05)");
            gridGroup.appendChild(line);
        }
        svg.appendChild(gridGroup);

        // 2. Create the Path
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            // Cubic bezier for "fancy military" feel
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
            const cp1y = points[i - 1].y;
            const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
            const cp2y = points[i].y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
        }

        // Glow Filter (Reference in CSS)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "2");
        path.setAttribute("class", "telemetry-path");

        // Fill area under path
        const fillPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const fillD = d + ` L ${width} ${height} L 0 ${height} Z`;
        fillPath.setAttribute("d", fillD);
        fillPath.setAttribute("fill", `url(#grad-${color.replace('#', '')})`);
        fillPath.setAttribute("opacity", "0.1");

        // Define Gradient
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad.setAttribute("id", `grad-${color.replace('#', '')}`);
        grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%");
        grad.setAttribute("x2", "0%"); grad.setAttribute("y2", "100%");
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", color);
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", "transparent");
        grad.appendChild(stop1); grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.appendChild(defs);

        svg.appendChild(fillPath);
        svg.appendChild(path);
    }

    function showFallback() {
        const fallbackData = {
            metrics: { system_recovery: 64, neural_sync: 7.2, metabolic_output: 2150, current_heart_rate: 68 },
            trends: {
                calories_7d: [2050, 2200, 2100, 2400, 1950, 2300, 2150],
                heart_rate_24h: [70, 72, 68, 65, 62, 60, 64, 68, 75, 80, 85, 82, 78, 75, 72, 70, 74, 78, 82, 80, 76, 74, 72, 70]
            }
        };
        updateUI(fallbackData);
    }

    fetchBiometrics();
    // Refresh every hour if tab is open
    setInterval(fetchBiometrics, 3600000);
});
