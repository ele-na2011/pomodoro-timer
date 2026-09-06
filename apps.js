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
const soundButtons = document.querySelectorAll(".sound-button");
const volumeSliders = document.querySelectorAll(".volumeSlider");

const soundAudios = {
    white: whiteNoiseAudio,
    brown: brownNoiseAudio
};

const modes = {
    focus: { label: "Focus", seconds: 25 * 60, ready: "Ready to focus" },
    shortBreak: { label: "Short break", seconds: 5 * 60, ready: "Ready for a short break" },
    longBreak: { label: "Long break", seconds: 15 * 60, ready: "Ready for a long break" }
};

let currentMode = "focus";
let totalSeconds = modes[currentMode].seconds;
let countdown = totalSeconds;
let completedSessions = 0;
let isRunning = false;
let timer = null;

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

    if (currentMode === "focus") {
        completedSessions += 1;
        sessionCountText.textContent = `${completedSessions} focus session${completedSessions === 1 ? "" : "s"} completed`;
    }

    const nextMode = currentMode === "focus"
        ? completedSessions % 4 === 0 ? "longBreak" : "shortBreak"
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
button.addEventListener("click", startCountdown);
resetButton.addEventListener("click", resetCountdown);

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

