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

//countdown timer
const countdownTimer = document.getElementById("countdownTimer");
const button = document.getElementById("bigButton");
const whiteNoiseButton = document.getElementById("whiteNoiseButton");
const whiteNoiseAudio = document.getElementById("whiteNoiseAudio");

const totalSeconds = 25 * 60;
let countdown = totalSeconds;
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
}

function startCountdown() {
    if (isRunning) {
        pauseCountdown();
        return;
    }

    if (countdown === 0) {
        countdown = totalSeconds;
        countdownTimer.textContent = formatCountdown(countdown);
    }

    isRunning = true;
    button.textContent = "Pause";

    timer = setInterval(() => {
        if (countdown > 0) {
            countdown -= 1;
            countdownTimer.textContent = formatCountdown(countdown);
        } else {
            clearInterval(timer);
            timer = null;
            isRunning = false;
            button.textContent = "Start";
            countdownTimer.textContent = "Done!";
        }
    }, 1000);
}

countdownTimer.textContent = formatCountdown(countdown);
button.addEventListener("click", startCountdown);

whiteNoiseButton.addEventListener("click", () => {
    if (whiteNoiseAudio.paused) {
        whiteNoiseAudio.play();
        whiteNoiseButton.textContent = "Pause White Noise";
    } else {
        whiteNoiseAudio.pause();
        whiteNoiseButton.textContent = "White Noise";
    }
});


