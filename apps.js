//time element (clock)
function updateTime() {
    const now = new Date();
    const dateText = document.querySelector("#dateElement");
    const timeText = document.querySelector("#timeElement");

    const date = now.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    dateText.textContent = date;
    timeText.textContent = `${hours}:${minutes}`;
}

setInterval(updateTime, 1000);
updateTime();

// Pomodoro countdown
const countdownTimer = document.getElementById("countdownTimer");
const button = document.getElementById("bigButton");
const resetButton = document.getElementById("resetButton");
const progressBar = document.getElementById("progressBar");
const timerStatus = document.getElementById("timerStatus");
const sessionCountText = document.getElementById("sessionCount");
const modeButtons = document.querySelectorAll(".modeButton");
const whiteNoiseAudio = document.getElementById("whiteNoiseAudio");
const brownNoiseAudio = document.getElementById("brownNoiseAudio");
const pinkNoiseAudio = document.getElementById("pinkNoiseAudio");
const rainSoundAudio = document.getElementById("rainSoundAudio");
const birdSoundAudio = document.getElementById("birdSoundAudio");
const keyboardSoundAudio = document.getElementById("keyboardSoundAudio");
const timerCompleteAudio = document.getElementById("timerCompleteAudio");
const soundButtons = document.querySelectorAll(".sound-button");
const volumeSliders = document.querySelectorAll(".volumeSlider");
const streakCount = document.getElementById("streakCount");
const bestStreakCount = document.getElementById("bestStreakCount");
const totalSessionsCount = document.getElementById("totalSessionsCount");
const todaySessionsCount = document.getElementById("todaySessionsCount");
const focusDurationInput = document.getElementById("focusDuration");
const shortBreakDurationInput = document.getElementById("shortBreakDuration");
const longBreakDurationInput = document.getElementById("longBreakDuration");
const settingsButton = document.getElementById("settingsButton");
const statsButton = document.getElementById("statsButton");
const customButton = document.getElementById("customButton");
const backgroundButtons = document.querySelectorAll(".backgroundButton");



const soundAudios = {
    white: whiteNoiseAudio,
    brown: brownNoiseAudio,
    pink: pinkNoiseAudio,
    rain: rainSoundAudio,
    birds: birdSoundAudio,
    keyboard: keyboardSoundAudio
};

const backgrounds = {
    space: "url(https://wallpapercave.com/wp/wp14437838.jpg)",
    mountains: "url(https://images.wallpaperscraft.com/image/single/mountains_peaks_dusk_168351_3840x2400.jpg)",
    lake: "url(https://4kwallpapers.com/images/wallpapers/sunset-lake-purple-pink-sky-scenery-8k-3840x2160-92.jpg)",
    cybercity: "url(https://plus.unsplash.com/premium_photo-1733259750830-4cc0bd8d3979?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHVycGxlJTIwY2l0eXxlbnwwfHwwfHx8MA%3D%3D)",
    forest: "url(https://images.wallpapersden.com/image/download/purple-winter-forest_bGpmbGqUmZqaraWkpJRmbmdlrWZlbWU.jpg)",
    "night city": "url(https://images8.alphacoders.com/138/thumb-1920-1389287.jpg)"
};

const backgroundStorageKey = "pomodoroBackground";

const modes = {
    focus: { label: "Focus", seconds: focusDurationInput.value * 60, ready: "Ready to focus" },
    shortBreak: { label: "Short break", seconds: shortBreakDurationInput.value * 60, ready: "Ready for a short break" },
    longBreak: { label: "Long break", seconds: longBreakDurationInput.value * 60, ready: "Ready for a long break" }
};

let currentMode = "focus";
let totalSeconds = modes[currentMode].seconds;
let countdown = totalSeconds;
const progressStorageKey = "pomodoroProgress";
let progress = loadProgress();
let isRunning = false;
let timer = null;

function applyBackground(backgroundName) {
    const background = backgrounds[backgroundName] ? backgroundName : "space";
    document.body.style.backgroundImage = backgrounds[background];
    backgroundButtons.forEach((backgroundButton) => {
        const isActive = backgroundButton.dataset.background === background;
        backgroundButton.classList.toggle("active", isActive);
        backgroundButton.setAttribute("aria-pressed", String(isActive));
    });
    localStorage.setItem(backgroundStorageKey, background);
}

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function loadProgress() {
    try {
        const savedProgress = JSON.parse(localStorage.getItem(progressStorageKey));
        return {
            totalSessions: Number(savedProgress?.totalSessions) || 0,
            currentStreak: Number(savedProgress?.currentStreak) || 0,
            bestStreak: Number(savedProgress?.bestStreak) || 0,
            lastSessionDate: savedProgress?.lastSessionDate || "",
            dailySessions: savedProgress?.dailySessions || {}
        };
    } catch {
        return { totalSessions: 0, currentStreak: 0, bestStreak: 0, lastSessionDate: "", dailySessions: {} };
    }
}

function saveProgress() {
    localStorage.setItem(progressStorageKey, JSON.stringify(progress));
}

function updateProgressDisplay() {
    const today = getDateKey();
    streakCount.textContent = progress.currentStreak;
    bestStreakCount.textContent = progress.bestStreak;
    totalSessionsCount.textContent = progress.totalSessions;
    todaySessionsCount.textContent = progress.dailySessions[today] || 0;
    sessionCountText.textContent = `${progress.totalSessions} focus session${progress.totalSessions === 1 ? "" : "s"} completed`;
}

function recordFocusSession() {
    const today = getDateKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    progress.totalSessions += 1;
    progress.dailySessions[today] = (progress.dailySessions[today] || 0) + 1;
    progress.currentStreak = progress.lastSessionDate === yesterdayKey
        ? progress.currentStreak + 1
        : progress.lastSessionDate === today
            ? progress.currentStreak
            : 1;
    progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
    progress.lastSessionDate = today;
    saveProgress();
    updateProgressDisplay();
}

function formatCountdown(totalSecondsLeft) {
    const minutes = String(Math.floor(totalSecondsLeft / 60)).padStart(2, "0");
    const seconds = String(totalSecondsLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function pauseCountdown() {
    if (!isRunning) {
        return;
    }

    clearInterval(timer);
    timer = null;
    isRunning = false;
    button.textContent = "Resume";
    timerStatus.textContent = "Paused";
}

function renderTimer() {
    countdownTimer.textContent = formatCountdown(countdown);
    progressBar.style.width = `${(countdown / totalSeconds) * 100}%`;
    document.title = `${formatCountdown(countdown)} - ${modes[currentMode].label}`;
}

function selectMode(modeName) {
    if (isRunning || !modes[modeName]) {
        return;
    }

    currentMode = modeName;
    totalSeconds = modes[currentMode].seconds;
    countdown = totalSeconds;
    modeButtons.forEach((modeButton) => {
        const isActive = modeButton.dataset.mode === currentMode;
        modeButton.classList.toggle("active", isActive);
        modeButton.setAttribute("aria-pressed", String(isActive));
    });
    button.textContent = "Start";
    timerStatus.textContent = modes[currentMode].ready;
    renderTimer();
}

function finishCountdown() {
    clearInterval(timer);
    timer = null;
    isRunning = false;

    timerCompleteAudio.currentTime = 0;
    timerCompleteAudio.play().catch(() => {});

    if (currentMode === "focus") {
        recordFocusSession();
    }

    const nextMode = currentMode === "focus"
        ? progress.totalSessions % 4 === 0 ? "longBreak" : "shortBreak"
        : "focus";
    currentMode = nextMode;
    totalSeconds = modes[currentMode].seconds;
    countdown = totalSeconds;
    modeButtons.forEach((modeButton) => {
        const isActive = modeButton.dataset.mode === currentMode;
        modeButton.classList.toggle("active", isActive);
        modeButton.setAttribute("aria-pressed", String(isActive));
    });
    button.textContent = "Start";
    timerStatus.textContent = `${modes[currentMode].label} ready`;
    renderTimer();
}

function startCountdown() {
    if (isRunning) {
        pauseCountdown();
        return;
    }

    if (countdown === 0) {
        countdown = totalSeconds;
        renderTimer();
    }

    isRunning = true;
    button.textContent = "Pause";
    timerStatus.textContent = `${modes[currentMode].label} in progress`;

    timer = setInterval(() => {
        if (countdown > 0) {
            countdown -= 1;
            renderTimer();
        } else {
            finishCountdown();
        }
    }, 1000);
}

function resetCountdown() {
    clearInterval(timer);
    timer = null;
    isRunning = false;
    countdown = totalSeconds;
    button.textContent = "Start";
    timerStatus.textContent = modes[currentMode].ready;
    renderTimer();
}

modeButtons.forEach((modeButton) => {
    modeButton.setAttribute("aria-pressed", String(modeButton.classList.contains("active")));
    modeButton.addEventListener("click", () => selectMode(modeButton.dataset.mode));
});

renderTimer();
updateProgressDisplay();
button.addEventListener("click", startCountdown);
resetButton.addEventListener("click", resetCountdown);

function setupExpandablePanel(buttonElement, panelClass) {
    const panel = buttonElement.parentElement.querySelector(`.${panelClass}`);
    const closeButton = panel.querySelector(".windowCloseButton");
    panel.hidden = true;

    buttonElement.addEventListener("click", () => {
        const isExpanded = buttonElement.getAttribute("aria-expanded") === "true";
        buttonElement.setAttribute("aria-expanded", String(!isExpanded));
        panel.hidden = isExpanded;
    });

    closeButton.addEventListener("click", () => {
        buttonElement.setAttribute("aria-expanded", "false");
        panel.hidden = true;
    });
}

setupExpandablePanel(settingsButton, "settingsMenu");
setupExpandablePanel(statsButton, "statsMenu");
setupExpandablePanel(customButton, "customMenu");

document.querySelector(".soundControls").querySelector(".windowCloseButton").addEventListener("click", () => {
    document.querySelector(".soundControls").open = false;
});

backgroundButtons.forEach((backgroundButton) => {
    backgroundButton.addEventListener("click", () => {
        applyBackground(backgroundButton.dataset.background);
    });
});

applyBackground(localStorage.getItem(backgroundStorageKey) || "space");

soundButtons.forEach((soundButton) => {
    soundButton.addEventListener("click", async () => {
        const audio = soundAudios[soundButton.dataset.sound];

        if (audio.paused) {
            try {
                await audio.play();
                soundButton.textContent = "Pause";
                soundButton.setAttribute("aria-pressed", "true");
            } catch {
                soundButton.textContent = "Play";
            }
            return;
        }

        audio.pause();
        soundButton.textContent = "Play";
        soundButton.setAttribute("aria-pressed", "false");
    });
});

volumeSliders.forEach((volumeSlider) => {
    const audio = soundAudios[volumeSlider.dataset.sound];
    audio.volume = Number(volumeSlider.value);

    volumeSlider.addEventListener("input", () => {
        audio.volume = Number(volumeSlider.value);
    });
});

