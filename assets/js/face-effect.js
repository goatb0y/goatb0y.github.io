/**
 * face-effect.js
 * Implements a 3D face follow-cursor effect using a 9x9 grid video.
 */

(function () {
    const video = document.getElementById('face-video');
    if (!video) return;

    let videoLoaded = false;
    let width, height, centerX, centerY;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const range = 500; // Sensitivity radius

    // Wait for metadata to ensure duration is available
    video.addEventListener('loadedmetadata', () => {
        videoLoaded = true;
        updateDimensions();
        // Initial look at camera (center of 9x9 grid)
        updateFace(0.5, 0.5);
    });

    function updateDimensions() {
        const rect = video.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        centerX = rect.left + width / 2;
        centerY = rect.top + height / 2;
    }

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', updateDimensions, { passive: true });

    function handleMouseMove(e) {
        if (!videoLoaded) return;

        let clientX, clientY;

        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        if (clientX === undefined || clientY === undefined) return;

        // Calculate dx and dy from -1 to 1 based on cursor distance from center
        let dx = (clientX - centerX) / range;
        let dy = (clientY - centerY) / range;

        // Final Normalized Coordinates (0 to 1)
        // Invert NX as per handover note: "Invert the X-axis but keep Y standard 
        // to ensure the face 'follows' the mouse"
        let nx = Math.max(0, Math.min(1, (1 - dx) / 2));
        let ny = Math.max(0, Math.min(1, (dy + 1) / 2));

        updateFace(nx, ny);
    }

    function updateFace(nx, ny) {
        if (!video.duration) return;

        // Grid is 9x9 (81 frames)
        const gridSize = 9;
        const totalFrames = gridSize * gridSize;

        // Find the Row/Column with proper clamping
        const col = Math.min(gridSize - 1, Math.floor(nx * gridSize));
        const row = Math.min(gridSize - 1, Math.floor(ny * gridSize));

        // Calculate Index (row-by-row: Top-Left -> Top-Right -> Bottom-Right)
        const index = row * gridSize + col;

        // Calculate Timestamp
        const timestamp = (index / totalFrames) * video.duration;

        // Instant seek (optimized via All-Intra frames)
        video.currentTime = timestamp;
    }

    // Attach listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: true });

    // Periodically update dimensions to handle scrolling or layout shifts
    setInterval(updateDimensions, 2000);
})();
