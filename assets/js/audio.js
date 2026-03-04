/**
 * SUBSPACE AUDIO // YT MUSIC INTEGRATION
 * Handles YouTube IFrame API, playlist control, and equalizer animation
 */

// CONFIGURATION
const DEFAULT_PLAYLIST_ID = 'PL5AFV1HsQbkyE2A6ALd614B80lvV-NclH'; // User's custom mix
let player;
let isMuted = true;
let eqInterval;

// Initialize YouTube API
window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        playerVars: {
            listType: 'playlist',
            list: DEFAULT_PLAYLIST_ID,
            autoplay: 1,
            mute: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    console.log("Subspace Audio: Core Online");

    // Set shuffle on
    player.setShuffle(true);

    // Start playback (will be muted)
    player.playVideoAt(0);

    updatePlayerInfo();
    createEqualizer();

    // Update progress bar every second
    setInterval(updateProgress, 1000);
}

function onPlayerStateChange(event) {
    const statusLabel = document.querySelector('.audio-status');
    const playPauseBtn = document.getElementById('audio-play-pause');
    const miniPlayPauseBtn = document.getElementById('mini-audio-play-pause');

    const playIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    const pauseIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

    if (event.data === YT.PlayerState.PLAYING) {
        if (statusLabel) statusLabel.innerText = 'PLAYING // SUBSPACE';
        startEqualizer();
        updatePlayerInfo();
        if (playPauseBtn) playPauseBtn.innerHTML = pauseIcon;
        if (miniPlayPauseBtn) miniPlayPauseBtn.innerHTML = pauseIcon;
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (statusLabel) statusLabel.innerText = 'PAUSED';
        stopEqualizer();
        if (playPauseBtn) playPauseBtn.innerHTML = playIcon;
        if (miniPlayPauseBtn) miniPlayPauseBtn.innerHTML = playIcon;
    } else if (event.data === YT.PlayerState.BUFFERING) {
        if (statusLabel) statusLabel.innerText = 'BUFFERING...';
    }
}

function updatePlayerInfo() {
    if (!player || !player.getVideoData) return;

    const data = player.getVideoData();
    const titleEl = document.getElementById('audio-title');
    const artistEl = document.getElementById('audio-artist');
    const miniTitleEl = document.getElementById('mini-audio-title');
    const miniArtistEl = document.getElementById('mini-audio-artist');

    if (data) {
        const title = data.title || 'Unknown Signal';
        const artist = data.author || 'Deep Space';

        // Update Title with Marquee Check
        if (titleEl) {
            titleEl.innerText = title;
            titleEl.classList.remove('audio-marquee');

            // Check for overflow after a micro-task to allow layout
            setTimeout(() => {
                if (titleEl.scrollWidth > titleEl.offsetWidth) {
                    titleEl.innerHTML = `<span>${title}</span><span style="padding-left: 40px;">${title}</span>`;
                    titleEl.classList.add('audio-marquee');
                }
            }, 0);
        }

        // Update Artist with Marquee Check
        if (artistEl) {
            artistEl.innerText = artist;
            artistEl.classList.remove('audio-marquee');

            setTimeout(() => {
                if (artistEl.scrollWidth > artistEl.offsetWidth) {
                    artistEl.innerHTML = `<span>${artist}</span><span style="padding-left: 40px;">${artist}</span>`;
                    artistEl.classList.add('audio-marquee');
                }
            }, 0);
        }

        if (miniTitleEl) {
            miniTitleEl.innerText = title;
            miniTitleEl.classList.remove('audio-marquee');
            setTimeout(() => {
                if (miniTitleEl.scrollWidth > miniTitleEl.offsetWidth) {
                    miniTitleEl.innerHTML = `<span>${title}</span><span style="padding-left: 40px;">${title}</span>`;
                    miniTitleEl.classList.add('audio-marquee');
                }
            }, 0);
        }

        if (miniArtistEl) {
            miniArtistEl.innerText = artist;
            miniArtistEl.classList.remove('audio-marquee');
            setTimeout(() => {
                if (miniArtistEl.scrollWidth > miniArtistEl.offsetWidth) {
                    miniArtistEl.innerHTML = `<span>${artist}</span><span style="padding-left: 40px;">${artist}</span>`;
                    miniArtistEl.classList.add('audio-marquee');
                }
            }, 0);
        }
    }
}

function updateProgress() {
    if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        const fill = document.getElementById('audio-progress-fill');
        const miniFill = document.getElementById('mini-audio-progress-fill');

        if (fill) fill.style.width = `${percent}%`;
        if (miniFill) miniFill.style.width = `${percent}%`;

        const curTimeEl = document.getElementById('audio-current-time');
        const durTimeEl = document.getElementById('audio-duration');

        if (curTimeEl) curTimeEl.innerText = formatTime(currentTime);
        if (durTimeEl) durTimeEl.innerText = formatTime(duration);
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// EQUALIZER ANIMATION (Simulated Pro-Visualization)
let eqAnimationId;
const eqBars = [];
const barStates = []; // For smoothing

function createEqualizer() {
    const eqContainer = document.getElementById('equalizer');
    if (!eqContainer) return;

    eqContainer.innerHTML = '';
    eqBars.length = 0;
    barStates.length = 0;

    for (let i = 0; i < 24; i++) {
        const bar = document.createElement('div');
        bar.className = 'equalizer-bar';
        eqContainer.appendChild(bar);
        eqBars.push(bar);
        barStates.push(0); // Initial height
    }
}

function animateEqualizer() {
    if (player && player.getPlayerState() === YT.PlayerState.PLAYING) {
        const time = Date.now() / 1000;

        eqBars.forEach((bar, i) => {
            let targetHeight = 4;

            // Group bars into frequency bands (Bass, Mids, Highs)
            if (i < 6) { // Bass
                // Low frequency, high power
                targetHeight = 25 + Math.sin(time * 4 + i) * 15 + Math.random() * 40;
            } else if (i < 16) { // Mids
                // Mid frequency, mid power
                targetHeight = 15 + Math.sin(time * 7 + i * 0.5) * 20 + Math.random() * 50;
            } else { // Highs
                // High frequency, low power, high jitter
                targetHeight = 10 + Math.sin(time * 12 + i * 0.2) * 10 + Math.random() * 60;
            }

            // Smooth the transition (Lerping)
            barStates[i] += (targetHeight - barStates[i]) * 0.2;
            bar.style.height = `${Math.max(4, barStates[i])}%`;
        });
    } else {
        // Gently flatline
        eqBars.forEach((bar, i) => {
            barStates[i] += (4 - barStates[i]) * 0.1;
            bar.style.height = `${barStates[i]}%`;
        });
    }

    eqAnimationId = requestAnimationFrame(animateEqualizer);
}

function startEqualizer() {
    if (!eqAnimationId) {
        animateEqualizer();
    }
}

function stopEqualizer() {
    // We let the animation loop handle the flatlining naturally
}

// CONTROLS
document.addEventListener('DOMContentLoaded', () => {
    // Inject YT API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    const playPauseBtn = document.getElementById('audio-play-pause');
    const nextBtn = document.getElementById('audio-next');
    const prevBtn = document.getElementById('audio-prev');
    const muteBtn = document.getElementById('audio-mute');

    const miniPlayPauseBtn = document.getElementById('mini-audio-play-pause');
    const miniNextBtn = document.getElementById('mini-audio-next');
    const miniPrevBtn = document.getElementById('mini-audio-prev');
    const miniCloseBtn = document.getElementById('mini-player-close');

    const togglePlay = () => {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
            if (isMuted) {
                player.unMute();
                isMuted = false;
                if (muteBtn) muteBtn.classList.remove('is-muted');
            }
        }
    };

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    if (miniPlayPauseBtn) miniPlayPauseBtn.addEventListener('click', togglePlay);

    if (nextBtn) nextBtn.addEventListener('click', () => player.nextVideo());
    if (miniNextBtn) miniNextBtn.addEventListener('click', () => player.nextVideo());

    if (prevBtn) prevBtn.addEventListener('click', () => player.previousVideo());
    if (miniPrevBtn) miniPrevBtn.addEventListener('click', () => player.previousVideo());

    if (miniCloseBtn) {
        miniCloseBtn.addEventListener('click', () => {
            document.getElementById('mini-player').classList.remove('is-visible');
        });
    }

    if (muteBtn) {
        // Initial state
        muteBtn.classList.add('is-muted');
        muteBtn.classList.add('mute-pulse');

        // Remove pulse after 10 seconds (stops after a while)
        setTimeout(() => {
            muteBtn.classList.remove('mute-pulse');
        }, 10000);

        muteBtn.addEventListener('click', () => {
            muteBtn.classList.remove('mute-pulse'); // Stop pulse on interaction
            if (player.isMuted()) {
                player.unMute();
                isMuted = false;
                muteBtn.classList.remove('is-muted');
            } else {
                player.mute();
                isMuted = true;
                muteBtn.classList.add('is-muted');
            }
        });
    }
});

/**
 * EXPOSED UTILITIES
 */
window.setMiniPlayerVisibility = (visible) => {
    const miniPlayer = document.getElementById('mini-player');
    if (!miniPlayer) return;
    if (visible) {
        miniPlayer.classList.add('is-visible');
    } else {
        miniPlayer.classList.remove('is-visible');
    }
};
