/*importing databases namely the array of translations of the english letters to persian
and the array of words or sentences in different languages and levels*/
import keyTranslations from "./dataBase/keyTranslations.js";
import texts_bank from "./dataBase/texts_bank.js";
//getting required elements from the DOM
let lettersContainer = document.querySelector(".letter-parent");
let mistakesCounterEl = document.querySelector(".mistakes");
let timerEl = document.querySelector(".timer");
let keyBoardImageEl = document.querySelector(".keyboard-img");
let wpmResultEl = document.querySelector(".wpm-result");
let accuracyResultEl = document.querySelector(".accuracy-result");
let timeSpentResultEl = document.querySelector(".time-spent");
let modalCloserBtn = document.querySelectorAll(".modal-close");
let mistakesResultEl = document.querySelector(".mistakes-result");
let modalOverlays = document.querySelectorAll(".modal-overlay");
let languageSelectInp = document.querySelector(".language-option");
let levelSelectInp = document.querySelector(".level-option");
let resetBtn = document.querySelector(".restart-button");
// required variables for the game logic
let currentCharIndex = 0;
let userMistakesCount = 0;
let isTimerON = false;
let gameDuration = 10;
let currentLanguage = "english";
let currentLevel = "easy";
let startTime;
let currentTextConfigs;
let timerInterval;
let charNodes;
let resultsChart = null;
// invalid key array which will get ignored when a is pressed
const invalidKeys =
	"F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12  Escape Tab CapsLock Shift Control Alt Meta ArrowLeft ArrowRight ArrowDown ArrowUp Enter Unidentified Backspace ContextMenu PageDown PageUp End Home Delete PrintScreen".split(
		" "
	);
//-------------------------------------------------------------
//functions which are related to the rendering a random text from the texts bank=>
// a function to make random numbers accurding to the length of the array
function randomNumberHandler(e) {
	let randomNumber = Math.floor(Math.random() * e);
	return randomNumber;
}
// a function to render random texts from the texts bank
function randomTextRenderer() {
	currentTextConfigs = texts_bank[currentLanguage][currentLevel];
	let randomTexts =
		currentTextConfigs.words[
			randomNumberHandler(currentTextConfigs.words.length)
		];
	let splitedLetters = randomTexts.split("");
	lettersContainer.innerHTML = handleRandomTexts(splitedLetters).join("");
	handleFirstLettersFocus();
}
// a function to focus on the first letter at the start of the game
function handleFirstLettersFocus() {
	charNodes = document.querySelectorAll(".letters");
	if (charNodes.length > 0) {
		charNodes[0].classList.add("focused");
		handleKeyBoardImageUpdater(charNodes[currentCharIndex].innerHTML);
	}
}
// a function to assign the random letters into the container
function handleRandomTexts(letters) {
	let randomTextsContainer = letters.map((e) => {
		if (e == " ") {
			console.log("space found");
			return `<span class='space letters'>${e}</span>`;
		} else {
			return `<span class="letters">${e}</span>`;
		}
	});
	return randomTextsContainer;
}
//-------------------------------------------------------------------------
// functions in relation to the key presses and checking there states=>
// a function to handle the key presses and check if they are correct or wrong
function handleKeyPress(pressedkey) {
	handleCurrentLetter("none");
	if (pressedkey == charNodes[currentCharIndex].innerHTML) {
		handleCurrentLetter("correct");
		currentCharIndex++;
		if (currentCharIndex != charNodes.length) {
			handleCurrentLetter("focus");
			handleKeyBoardImageUpdater(charNodes[currentCharIndex].innerHTML);
		} else {
			handleEndModal("result");
			resetGame();
		}
	} else {
		userMistakesCount++;
		mistakesCounterEl.innerHTML = userMistakesCount;
		handleCurrentLetter("wrong");
	}
}
// a function to handle letters state (correct,wrong,focused)
function handleCurrentLetter(state = "none") {
	if (state == "none") {
		charNodes[currentCharIndex].classList.remove("focused", "wrong");
	} else if (state == "correct") {
		charNodes[currentCharIndex].style.color = "green";
	} else if (state == "focus") {
		charNodes[currentCharIndex].classList.add("focused");
	} else {
		charNodes[currentCharIndex].classList.add("wrong");
	}
}
//-------------------------------------------------------------------------------------------------
//functions which are interrelated to the last part of the game handling time computing results and demonstrating them=>
// a function to handle the timer and its interval
function timerHandler() {
	timerInterval ? clearInterval(timerInterval) : null;
	startTime = Date.now();
	let endTime = startTime + gameDuration * 1000;
	timerInterval = setInterval(() => {
		let remained = Math.round((endTime - Date.now()) / 1000);
		if (remained <= 0) {
			clearInterval(timerInterval);
			handleEndModal("faild");
			resetGame();
		}
		timerEl.innerHTML = handleRemainingTimeFormatter(remained);
	}, 1000);
}
// a function to format the remaining time to minutes and seconds
function handleRemainingTimeFormatter(second) {
	let minutes = Math.floor(second / 60);
	let seconds = second % 60;
	let formatedTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
	return formatedTime;
}

// a function for showing the end modal and handling the results
function handleEndModal(modal) {
	modal == "result"
		? modalOverlays[0].classList.add("active")
		: modalOverlays[1].classList.add("active");
	let results = handleResultsComputer();
	handleResultsRenderer(results);
	handleChartRenderer(results.wpm, results.accuracy, userMistakesCount);
}
// a function wich render the results in the modal
function handleResultsRenderer(results) {
	wpmResultEl.innerHTML = handleInvalidResultsChecker(results.wpm);
	accuracyResultEl.innerHTML = handleInvalidResultsChecker(results.accuracy);
	timeSpentResultEl.innerHTML = results.timeSpent;
	mistakesResultEl.innerHTML = userMistakesCount;
}
// a function computing the results to be shown in the modal
function handleResultsComputer() {
	let timeSpent = (Date.now() - startTime) / 1000;
	let correct = charNodes.length - userMistakesCount;
	let accuracy = ((correct / charNodes.length) * 100).toFixed(1);
	let wpm = Math.round(correct / 5 / (timeSpent / 60));
	return { wpm, accuracy, timeSpent };
}

// a function for handling and drawing the results chart
function handleChartRenderer(wpm, accuracy, mistakes) {
	let chartResult = document.getElementById("resultsChart").getContext("2d");
	resultsChart ? resultsChart.destroy() : null;
	resultsChart = new Chart(chartResult, {
		type: "pie",
		data: {
			labels: ["WPM", "Accuracy", "Mistakes"],
			datasets: [
				{
					label: "Performance",
					data: [wpm, accuracy, mistakes],
					backgroundColor: [
						"rgb(13, 56, 143)",
						"rgb(19, 136, 77)",
						"rgb(107, 14, 37)",
					],
					borderColor: [
						"rgba(26, 95, 228, 1)",
						"rgba(0, 210, 106, 1)",
						"rgba(255, 51, 102, 1)",
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: true,
					grid: {
						color: "rgba(255, 255, 255, 0.1)",
					},
					ticks: {
						color: "#e6e9f0",
					},
				},
				x: {
					grid: {
						color: "rgba(255, 255, 255, 0.1)",
					},
					ticks: {
						color: "#e6e9f0",
					},
				},
			},
			plugins: {
				legend: {
					labels: {
						color: "#e6e9f0",
					},
				},
			},
		},
	});
}
// a function which check if the results are valid or not
function handleInvalidResultsChecker(unit) {
	return unit < 0 ? 0 : unit;
}
//-----------------------------------------------------------------------------
// other functions which are related to different parts of the game (updating keyboard image and resetting the game)=>
// function for finding and updating the keyboard image
function handleKeyBoardImageUpdater(key) {
	let imageName = keyTranslations[key] || key;
	let img = new Image();
	img.src = `./assets/keyboard-images/${imageName}.jpg`;
	img.onload = function () {
		keyBoardImageEl.setAttribute(
			"src",
			`./assets/keyboard-images/${imageName}.jpg`
		);
	};

	img.onerror = function () {
		keyBoardImageEl.setAttribute("src", "./assets/keyboard-images/none.jpg");
	};
}
// a function for initializing the game again
function resetGame() {
	clearInterval(timerInterval);
	currentCharIndex = 0;
	userMistakesCount = 0;
	isTimerON = false;
	mistakesCounterEl.innerHTML = "0";
	timerEl.innerHTML = "0s";
	randomTextRenderer();
}
//---------------------------------------------------------------------------------
//eventLIsteners for different elements (key presses and changes of either level or language)=>
// an event listener for the key presses
document.addEventListener("keyup", (e) => {
	let clickedKey = e.key;
	if (!isTimerON) {
		isTimerON = true;
		timerHandler();
	}
	if (!invalidKeys.includes(clickedKey)) {
		e.preventDefault();
		handleKeyPress(clickedKey);
	}
});
// event listeners for the changes of language
languageSelectInp.addEventListener("change", (e) => {
	currentLanguage = e.target.value;
	resetGame();
});
// event listeners for the changes of level
levelSelectInp.addEventListener("change", (e) => {
	currentLevel = e.target.value;
	gameDuration = texts_bank[currentLanguage][currentLevel].duration;
	resetGame();
});
// setting eventListeners for modals closers
modalCloserBtn.forEach((e) => {
	e.addEventListener("click", () => {
		modalOverlays.forEach((e) => {
			e.classList.remove("active");
		});
	});
});
// an event listener interrelated to the reset button
resetBtn.addEventListener("click", () => {
	resetGame();
});
//------------------------------------------------------------------------------
// initializing the game for the first time and rendering a random text=>
randomTextRenderer();
//----------------------------------------------------Created By Amir.Mahdi-Sultani------------------------------------------------------------------------------
