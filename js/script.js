const inputs = document.querySelector(".inputs"),
hintTag = document.querySelector(".hint span"),
guessLeft = document.querySelector(".guess-left span"),
wrongLetter = document.querySelector(".wrong-letter span"),
resetBtn = document.querySelector(".skip-btn"),
typingInput = document.querySelector(".typing-input"),
resultsImage = document.querySelector(".game-modal .content img"),
resultsMessage = document.querySelector(".message"),
resultsPoints = document.querySelector(".points"),
resultsPTag = document.querySelector(".game-modal .content p"),
userTotalPoints = document.querySelector(".userPoints"),
totalPointsResults = document.querySelector(".totalPoints");

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGMzECGi-HQfR0g-eoh8nb78GtKpvWJxM",
  authDomain: "magic-maker-hackathon.firebaseapp.com",
  projectId: "magic-maker-hackathon",
  storageBucket: "magic-maker-hackathon.appspot.com",
  messagingSenderId: "248456820360",
  appId: "1:248456820360:web:8b1b4ae7b24a041af5d13d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import {getDatabase, ref, get, set, child, update, remove} 
from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const db = getDatabase();

let word, maxGuesses, incorrectLetters = [], correctLetters = [], timer, countdown, points, participantEmail;

var userName = document.getElementById("name");
var userEmail = document.getElementById("email");

var start = document.getElementsByClassName("startBtn")[0];
var next = document.getElementsByClassName("next-btn")[0];
var back = document.getElementsByClassName("goBack")[0];
var leaderboardBtn = document.getElementsByClassName("leaderboard-btn")[0];
// var leaderboardBtn2 = document.getElementsByClassName("leaderboard-btn")[1];

function sanitizeEmail(email) {
    // Replace "@" with "_at_" and "." with "dot"
    return email.replace(/@/g, '_at_').replace(/\./g, 'dot');
}

function AddParticipantDetails(event) {
    event.preventDefault();
    participantEmail = userEmail.value;
    const sanitizedEmail = sanitizeEmail(userEmail.value);
    const participantRef = ref(db, "The Participants/" + sanitizedEmail);

    get(participantRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
            } else {
                // Email doesn't exist, add new participant
                set(participantRef, {
                    ParticipantName: userName.value,
                    ParticipantEmail: userEmail.value,
                    ParticipantTotalPoints: 0
                })
                .catch((error) => {
                    alert("Unsuccessful, error: " + error);
                });
            }
        })
        .catch((error) => {
            console.error("Error checking email existence: " + error);
        });
}

function updateTotalPoints(userEmail, newPoints) {
    const userRef = ref(db, "The Participants/" + sanitizeEmail(userEmail));

    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                // User exists, update total points
                const currentPoints = snapshot.val().ParticipantTotalPoints;
                const updatedPoints = currentPoints + newPoints;

                // Update the total points in the database
                update(userRef, {
                    ParticipantTotalPoints: updatedPoints
                })
                .catch((error) => {
                    console.error("Error updating total points: " + error);
                });
            }
        })
        .catch((error) => {
            console.error("Error checking user existence: " + error);
        });
}

function getTotalPoints(userEmail) {
    const userRef = ref(db, "The Participants/" + sanitizeEmail(userEmail));

    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                userTotalPoints.innerHTML = `Total Points: <b>${snapshot.val().ParticipantTotalPoints}</b>`;
                let totalPointsVal = snapshot.val().ParticipantTotalPoints + points;
                totalPointsResults.innerText = `Total points: ${totalPointsVal}`;
            }
        })
        .catch((error) => {
            console.error("Error checking user existence: " + error);
        });
}

let students = [];

function getAllData() {
    const dbref = ref(db);
    

    get(child(dbref, "The Participants"))
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                students.push(childSnapshot.val());
            });

            // Sort students array in ascending order based on points
            students.sort((a, b) => b.ParticipantTotalPoints - a.ParticipantTotalPoints);

            // console.log(students);
        })
        .catch((error) => {
            console.error("Error fetching data: " + error);
        });
}

getAllData();

function updateLeaderboard(event) {
    event.preventDefault();
    const leaderboardList = document.getElementById("leaderboard-list");
    // getAllData();

    // Clear existing leaderboard content
    leaderboardList.innerHTML = "";

    // Assuming you have the sorted `students` array available
    const top5 = students.slice(0, 5);

    top5.forEach((participant, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="participant-rank">${index + 1}</span>
            <span class="trophy">${index === 0 ? '🏆' : ''}</span>
            <span class="participant-name">${participant.ParticipantName}</span>
            <span class="participant-score">${participant.ParticipantTotalPoints}</span>
        `;
        leaderboardList.appendChild(listItem);
    });
}





function results(timesUp, victory) {
    if (timesUp && !victory){
        resultsImage.src = 'images/lost.gif';
        resultsMessage.innerText = `Time's Up`;
        points = -10;
        resultsPoints.innerText = `${points} points`;
        resultsPTag.innerHTML = `The correct word was: <b>${word.toUpperCase()}</b>`;
        updateTotalPoints(participantEmail, points);
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
        updateTotalPoints(participantEmail, points);
        showContentResults();
    } 
}

function skip(event) {
    clearInterval(timer);
    resultsImage.src = 'images/lost.gif';
    resultsMessage.innerText = `Skipped Level!`;
    points = -10;
    resultsPoints.innerText = `${points} points`;
    resultsPTag.innerHTML = `The correct word was: <b>${word.toUpperCase()}</b>`;
    updateTotalPoints(participantEmail, points);
    showContentResults();
}

function showContent2(event) {
    event.preventDefault();
    getTotalPoints(participantEmail);
    randomWord();
    document.querySelector('.wrapper').style.display = 'block';
    document.querySelector('.content-1').style.display = 'none';
    document.querySelector('.content-2').style.display = 'block';
    document.querySelector('.results').style.display = 'none';
    document.querySelector('.final').style.display = 'none';
    document.querySelector('.wrapper').style.width = '430px';
}

function goBackToGame(event) {
    event.preventDefault();
    // getTotalPoints(participantEmail);
    randomWord();
    document.querySelector('.wrapper').style.display = 'block';
    document.querySelector('.content-1').style.display = 'none';
    document.querySelector('.content-2').style.display = 'block';
    document.querySelector('.results').style.display = 'none';
    document.querySelector('.final').style.display = 'none';
    document.querySelector('.wrapper').style.width = '430px';
}

function showContentResults() {
    getTotalPoints(participantEmail);
    document.querySelector('.wrapper').style.display = 'none';
    document.querySelector('.results').style.display = 'block';
    document.querySelector('.final').style.display = 'none';
}

function showLeaderboard() {
    document.querySelector('.wrapper').style.display = 'none';
    document.querySelector('.results').style.display = 'none';
    document.querySelector('.final').style.display = 'flex';
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
            resultsMessage.innerText = `Ran out of guesses!`;
            points = -10;
            resultsPoints.innerText = `${points} points`;
            resultsPTag.innerHTML = `The correct word was: <b>${word.toUpperCase()}</b>`;
            updateTotalPoints(participantEmail, points);
            showContentResults();
        }
    }, 100);
}


// ... Existing imports and configurations ...

// New function for name and email input validation
function validateNameAndEmail() {
    const userName = document.getElementById("name").value;
    const userEmail = document.getElementById("email").value;

    // Check if name and email are not empty
    if (!userName || !userEmail) {
        alert("Please provide both name and email.");
        return false;
    }

    // Check if the email contains @ and .
    if (!userEmail.includes("@") || !userEmail.includes(".")) {
        alert("Please provide a valid email address.");
        return false;
    }

    // Add any additional validation logic as needed

    return true;
}

// ... Existing code continues ...





// ... Existing code ...

// Modify the event listener for the Start button
start.addEventListener("click", function (event) {
    event.preventDefault();

    // Call the validation function before proceeding
    if (!validateNameAndEmail()) {
        return;
    }

    AddParticipantDetails(event);
    showContent2(event);
});

// ... Existing code continues ...

next.addEventListener("click", showContent2);
back.addEventListener("click", goBackToGame);
resetBtn.addEventListener("click", skip);
typingInput.addEventListener("input", initGame);
inputs.addEventListener("click", () => typingInput.focus());
document.addEventListener("keydown", () => typingInput.focus());
// Ensure that the event is properly bound to the button
// document.querySelector('.content-1 p span button').addEventListener('click', leaderboard);
leaderboardBtn.addEventListener("click", function(event) {
    updateLeaderboard(event);
    showLeaderboard();
});



