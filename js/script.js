const inputs = document.querySelector(".inputs"),
hintTag = document.querySelector(".hint span"),
guessLeft = document.querySelector(".guess-left span"),
wrongLetter = document.querySelector(".wrong-letter span"),
resetBtn = document.querySelector(".skip-btn"),
typingInput = document.querySelector(".typing-input"),
resultsImage = document.querySelector(".game-modal .content img"),
resultsMessage = document.querySelector(".message"),
resultsPoints = document.querySelector(".points"),
resultsPTag = document.querySelector(".game-modal .content p");


let word, maxGuesses, incorrectLetters = [], correctLetters = [], timer, countdown, points;

function results(timesUp, victory) {
    if (timesUp && !victory){
        resultsImage.src = 'images/lost.gif';
        resultsMessage.innerText = `Time's Up`;
        resultsPoints.innerText = '-10 points';
        resultsPTag.innerHTML = `The correct word was: <b>${word.toUpperCase()}</b>`;
        showContentResults();
    } else if (victory && !timesUp) {
        resultsImage.src = 'images/victory.gif';
        resultsMessage.innerText = `Congratulations!`;
        if (word.length >= 5) {
            points = 15-( 8-maxGuesses )
        } else {
            points = 15 - ( 6-maxGuesses )
        }
        resultsPoints.innerText = `+${points} points`;
        resultsPTag.innerHTML = `You found the word: <b>${word.toUpperCase()}</b>`;
        showContentResults();
    } 
}

function leaderboard(event) {
    const leaderboardData = [
        { name: "Mushfiq", score: 150 },
        { name: "Jesey", score: 120 },
        { name: "Towhid", score: 100 },
        { name: "Hemel", score: 90 },
        { name: "Gadiel", score: 80 },
        { name: "Imran", score: 75 },
        { name: "Riyad", score: 70 },
        // Add more participants as needed
    ];

    leaderboardData.sort((a, b) => b.score - a.score);

    const top5 = leaderboardData.slice(0, 5);

    const leaderboardList = document.getElementById("leaderboard-list");

    top5.forEach((participant, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="participant-rank">${index + 1}</span>
            <span class="trophy">${index === 0 ? '🏆' : ''}</span>
            <span class="participant-name">${participant.name}</span>
            <span class="participant-score">${participant.score}</span>
        `;
        leaderboardList.appendChild(listItem);
    });
}

function skip(event) {
    clearInterval(timer);
    resultsImage.src = 'images/lost.gif';
    resultsMessage.innerText = `Skipped Level!`;
    resultsPoints.innerText = '-10 points';
    resultsPTag.innerHTML = `The correct word was: <b>${word.toUpperCase()}</b>`;
    showContentResults();
}

function showContent2(event) {
    event.preventDefault();
    randomWord();
    document.querySelector('.wrapper').style.display = 'block';
    document.querySelector('.content-1').style.display = 'none';
    document.querySelector('.content-2').style.display = 'block';
    document.querySelector('.results').style.display = 'none';
    document.querySelector('.wrapper').style.width = '430px';
}

function showContentResults() {
    document.querySelector('.wrapper').style.display = 'none';
    document.querySelector('.results').style.display = 'block';
}

function randomWord() {
    clearInterval(timer); // Clear any existing timer
    countdown = 10; // Reset countdown for each level

    let ranItem = wordList[Math.floor(Math.random() * wordList.length)];
    word = ranItem.word;
    maxGuesses = word.length >= 5 ? 8 : 6;
    correctLetters = [];
    incorrectLetters = [];
    hintTag.innerText = ranItem.hint;
    guessLeft.innerText = maxGuesses;
    wrongLetter.innerText = incorrectLetters;

    let html = "";
    for (let i = 0; i < word.length; i++) {
        html += `<input type="text" disabled>`;
        inputs.innerHTML = html;
    }
    startTimer();
}

function startTimer() {
    timer = setInterval(function () {
        countdown--;
        document.getElementById("countdown").innerText = countdown;

        if (countdown <= 0) {
            clearInterval(timer);
            results(true, false);
        }
    }, 1000);
}


function initGame(e) {
    let key = e.target.value.toLowerCase();
    if(key.match(/^[A-Za-z]+$/) && !incorrectLetters.includes(` ${key}`) && !correctLetters.includes(key)) {
        if(word.includes(key)) {
            for (let i = 0; i < word.length; i++) {
                if(word[i] == key) {
                    correctLetters += key;
                    inputs.querySelectorAll("input")[i].value = key;
                }
            }
        } else {
            maxGuesses--;
            incorrectLetters.push(` ${key}`);
        }
        guessLeft.innerText = maxGuesses;
        wrongLetter.innerText = incorrectLetters;
    }
    typingInput.value = "";

    setTimeout(() => {
        if(correctLetters.length === word.length) {
            clearInterval(timer);
            results(false, true);
        } else if(maxGuesses < 1) {
            clearInterval(timer);
            resultsImage.src = 'images/lost.gif';
            resultsMessage.innerText = `Game Over!`;
            resultsPoints.innerText = '-10 points';
            resultsPTag.innerHTML = `The correct word was: <b>${word.toUpperCase()}</b>`;
            showContentResults();
        }
    }, 100);
}

resetBtn.addEventListener("click", skip);
typingInput.addEventListener("input", initGame);
inputs.addEventListener("click", () => typingInput.focus());
document.addEventListener("keydown", () => typingInput.focus());
// Ensure that the event is properly bound to the button
document.querySelector('.content-1 p span button').addEventListener('click', leaderboard);


