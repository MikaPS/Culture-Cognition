import "./style.css";
// import map from "assets/map.jpg";
import { gsap } from "gsap";

interface Investment {
  name: string;
  text: string;
  risk: number;
  time: number;
  payout: number;
  cost: number;
  symbol: string;
  id: number;
}

const app: HTMLDivElement = document.querySelector("#app")!;
const dialougeApp: HTMLDivElement = document.querySelector("#dialougeApp")!;
const dayApp: HTMLDivElement = document.querySelector("#dayApp")!;

const gameName = "Culture&Cognition";
document.title = gameName;

// window height and width
const width = window.innerWidth;
const height = window.innerHeight;

// Original params
let money = 100;
let day = 0;

// get data from json
let companiesData: Array<{ symbol: string; sentence: string }> = [];
let companiesNames: string[] = [];

fetch("./data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json(); // Parse JSON data
  })
  .then((data) => {
    companiesNames = Object.keys(data);
    companiesData = Object.values(data);
  })
  .catch((error) => console.error("Error fetching JSON data:", error));

const pinSymbols = ["", "📍", "📍", "📍", "📍", "📍", "📍"];
const pinSucess = [0, 0, 0, 0, 0, 0, 0, 0];

const risk_investment = [40, 100]; // % of success
const time_investment = [1, 5];
const payout_investment = [20, 100];
const cost_investment = [10, 80];

let numRiskyChoices = 0; // used for analysis
let numWaitChoices = 0;

let currentCost = 0;
const currentPayout: number[] = [];
const currentDayOptions: number[] = [];
let currentPinID = 0;

const openInvestments: Investment[] = [];
const openInvestmentsID: number[] = [];

// Randomizes the investment, risk, and time
function investmentCreator(): Investment {
  const randInvestmentIndex = Math.floor(Math.random() * companiesData.length);
  const randRisk =
    Math.floor(Math.random() * (risk_investment[1] - risk_investment[0] + 1)) +
    risk_investment[0];
  const randTime =
    Math.floor(Math.random() * (time_investment[1] - time_investment[0] + 1)) +
    time_investment[0];
  const randPayout =
    Math.floor(
      Math.random() * (payout_investment[1] - payout_investment[0] + 1)
    ) + payout_investment[0];
  const randCost =
    Math.floor(Math.random() * (cost_investment[1] - cost_investment[0] + 1)) +
    cost_investment[0];
  const investment: Investment = {
    name: companiesNames[randInvestmentIndex],
    text: companiesData[randInvestmentIndex].sentence,
    risk: randRisk,
    time: randTime,
    payout: randPayout,
    cost: randCost,
    symbol: companiesData[randInvestmentIndex].symbol,
    id: currentPinID,
  };
  console.log(
    "current pin: " + currentPinID + " investment id: " + investment.id
  );

  return investment;
}

function dialougeAnimation() {
  // Clear map
  app.innerHTML = "";
  // Elements for the background
  const globe = document.createElement("span");
  globe.textContent = "🌎";
  globe.style.position = "absolute";
  globe.style.top = `${height * 1.5}px`;
  globe.style.left = `${width / 2}px`;
  gsap.to(globe, {
    rotation: 720,
    scale: 90,
    duration: 1,
    ease: "power1.inOut",
  });
  dialougeApp.append(globe);

  const pin = document.createElement("span");
  pin.textContent = "📍";
  pin.style.position = "absolute";
  pin.style.top = `${310}px`;
  pin.style.left = `${300}px`;
  gsap.to(pin, { scale: 20, duration: 2, ease: "power2.inOut" }); // animation
  dialougeApp.append(pin);
}

// function confirmedPurchase(envelope: SVGTSpanElement) {
//   envelope.
// }

function uiTextDialouge(heightOffset: number) {
  // image of envelope
  // const env_img = document.createElement("img");
  // env_img.src = "assets/envelope_front.png";
  // env_img.width = 300;
  // env_img.style.position = "absolute";
  // env_img.style.left = `${700}px`;
  // env_img.style.top = `${0 + heightOffset}px`;
  // dialougeApp.append(env_img);

  const rectangle = document.createElement("span");
  rectangle.className = "rectangle"; // Defined in the CSS
  rectangle.style.setProperty("--rect-top", `${50 + heightOffset}px`);

  const envelope = document.createElement("span");
  envelope.innerHTML = "📨";
  envelope.style.fontSize = "100px";
  envelope.style.position = "absolute";
  envelope.style.top = `${0 + heightOffset}px`;
  envelope.style.left = `${500}px`;

  const investment = investmentCreator();
  if (heightOffset == 0) {
    currentCost = investment.cost;
    currentPayout[0] = investment.risk;
    currentDayOptions[0] = investment.time;
  } else {
    currentPayout[1] = investment.risk;
    currentDayOptions[1] = investment.time;
  }

  const text = document.createElement("span");
  const relativePos = rectangle.getBoundingClientRect();
  text.textContent = investment.text;
  text.style.position = "absolute";
  text.style.top = `${relativePos.top + 30}px`;
  text.style.left = `${relativePos.left + 5}px`;

  const symbol = document.createElement("span");
  symbol.textContent = investment.symbol;
  symbol.style.position = "absolute";
  symbol.style.top = `${relativePos.top + 10}px`;
  symbol.style.right = `${relativePos.right + 20}px`;

  const next = document.createElement("span");
  next.textContent = "⏭️";
  next.style.position = "absolute";
  next.style.bottom = `${relativePos.bottom + 5}px`;
  next.style.left = `${relativePos.left + 5}px`;
  next.addEventListener("click", () => {
    text.innerText = `The success of my business is ${investment.risk}%\nYou'll get ${investment.payout}$ in ${investment.time} days\nWill you invest in me?`;
    next.remove();
    rectangle.appendChild(yes);
    rectangle.appendChild(no);
  });

  const yes = document.createElement("span");
  yes.textContent = `👍 (cost: ${currentCost})`;
  yes.style.position = "absolute";
  yes.style.top = `${relativePos.top + 100}px`;
  yes.style.left = `${relativePos.left + 5}px`;
  yes.addEventListener("click", () => {
    yes.remove();
    no.remove();
    if (money >= investment.cost) {
      money -= investment.cost;
      companiesData.splice(investment.id, 1);
      companiesNames.splice(investment.id, 1);
      openInvestments.push(investment);
      openInvestmentsID.push(currentPinID);

      // If we are choosing the risky option, add to list
      // console.log(currentPayout[0], currentPayout[1], investment.risk);
      if (investment.risk == currentPayout[0]) {
        if (currentPayout[0] < currentPayout[1]) {
          numRiskyChoices += 1;
        }
      }
      if (investment.risk == currentPayout[1]) {
        if (currentPayout[1] < currentPayout[0]) {
          numRiskyChoices += 1;
        }
      }
      // If we are choosing the option that takes more time, add to list
      if (investment.time == currentDayOptions[0]) {
        if (currentDayOptions[0] > currentDayOptions[1]) {
          numWaitChoices += 1;
        }
      }
      if (investment.time == currentDayOptions[1]) {
        if (currentDayOptions[1] > currentDayOptions[0]) {
          numWaitChoices += 1;
        }
      }

      pinSymbols[currentPinID] = investment.symbol;
    }

    // console.log(numRiskyChoices, numWaitChoices);
    dialougeApp.innerHTML = "";
    newDay();
  });

  const no = document.createElement("span");
  no.textContent = "👎";
  no.style.position = "absolute";
  no.style.top = `${relativePos.top + 100}px`;
  no.style.left = `${relativePos.left + 250}px`;
  no.addEventListener("click", () => {
    yes.remove();
    no.remove();
    dialougeApp.innerHTML = "";
    newDay();
  });
  rectangle.appendChild(symbol);
  rectangle.appendChild(text);
  rectangle.appendChild(next);
  dialougeApp.append(rectangle);
  dialougeApp.append(envelope);
}

function newDay() {
  app.innerHTML = "";
  day += 1;

  const container = document.createElement("span");
  // container.style.position = "relative"; // Make it the reference point for absolute children
  container.style.display = "inline-block"; // To wrap content tightly

  const wave = document.createElement("img");
  wave.src = "assets/blue_wave.png";
  wave.style.position = "absolute";
  wave.style.left = "10px";
  wave.style.top = "100px";
  wave.style.width = `${width * 0.7}px`;
  wave.style.height = `${height * 0.4}px`;
  wave.style.transform = "rotate(-20deg)";

  const airplane = document.createElement("img");
  airplane.src = "assets/airplane_bg.png";
  airplane.style.position = "absolute";
  airplane.style.left = "80px";
  airplane.style.top = "45px";
  airplane.style.width = `${width * 0.55}px`;
  // airplane.style.height = `${height * 0.4}px`;
  // airplane.style.transform = "rotate(20deg)";

  // dayApp.append(wave);
  dayApp.append(airplane);

  const paper = document.createElement("img");
  paper.src = "assets/paper_clouds.png";
  paper.style.position = "absolute";
  paper.style.left = "200px";
  paper.style.top = "10px";
  paper.style.width = "auto";
  paper.style.height = height * 0.9 + "px";
  container.appendChild(paper);

  // Wait for the image to load before placing the text
  paper.onload = () => {
    // Create the text element
    const text = document.createElement("span");
    text.innerText = `Day: ${day}\nMoney: ${money}\nAny payments:\n\t${newPayments}`;
    text.style.position = "absolute";
    text.style.top = "150px";
    text.style.left = "250px";
    container.appendChild(text);
  };

  // const paper = document.createElement("img");
  // paper.src = "assets/paper_clouds.png";
  // paper.style.position = "absolute";
  // const bg = document.createElement("span");
  // bg.className = "new_day_rect"; // Defined in the CSS
  // const text = document.createElement("span");
  const relativePos = container.getBoundingClientRect();
  const closedInvestments: Investment[] = checkIfInvestmentSucceeded();

  let newPayments = "";
  closedInvestments.forEach((investment) => {
    newPayments += `${investment.name} got you ${investment.payout}`;
  });
  openInvestments.forEach((investment) => {
    newPayments += `You need to wait ${investment.time} days to see the payout\nof ${investment.symbol}${investment.name}${investment.symbol}\n`;
  });
  dayApp.append(container);

  const yes = document.createElement("span");
  yes.textContent = `👍`;
  yes.style.position = "absolute";
  yes.style.top = `${relativePos.top + 70}px`;
  yes.style.left = `${relativePos.left + 5}px`;
  yes.addEventListener("click", () => {
    dayApp.innerHTML = "";
    loadGameScene();
  });
  dayApp.append(yes);

  // end game condition
  if (money <= 0 || day >= 5) {
    endGame();
  }
}

function checkIfInvestmentSucceeded() {
  const closedInvestments: Investment[] = [];
  for (let i = 0; i < openInvestments.length; i++) {
    const investment = openInvestments[i];
    // openInvestments.forEach((investment) => {
    investment.time -= 1;
    if (investment.time == 0) {
      const randRisk =
        Math.floor(
          Math.random() * (risk_investment[1] - risk_investment[0] + 1)
        ) + risk_investment[0];
      if (randRisk <= investment.risk) {
        money += investment.payout;
        closedInvestments.push(investment);
        pinSucess[investment.id] = 1;
      } else {
        pinSucess[investment.id] = 2;
      }
      const index = openInvestments.findIndex(
        (item) => item.name === investment.name
      );
      if (index !== -1) openInvestments.splice(index, 1);
    }
  }
  return closedInvestments;
}

// Generates a place the player can go to
function pinCreator(
  top: number,
  left: number,
  emoji: string,
  id: number,
  isSuccess: number
): HTMLElement {
  const text = document.createElement("span");
  text.textContent = emoji;
  text.style.position = "absolute";
  text.style.top = `${top}px`;
  text.style.left = `${left}px`;
  text.style.fontSize = "20px";
  // add color around it depends if it was successful
  text.style.display = "inline-block"; // Makes the span behave like a block element
  text.style.padding = "5px"; // Adds padding around the text
  // text.style.border = "2px solid #3498db"; // Blue border around the text
  text.style.borderRadius = "5px"; // Optional: rounded corners
  if (isSuccess == 0) {
    text.style.backgroundColor = "#f0f8ff";
  } else if (isSuccess == 1) {
    text.style.backgroundColor = "#34d111";
  } else {
    text.style.backgroundColor = "#d1112a";
  }

  if (emoji == "📍") {
    text.addEventListener("click", () => {
      currentPinID = id;

      dialougeAnimation();
      uiTextDialouge(0);
      uiTextDialouge(200);
      console.log(currentPinID);
    });
  }
  app.append(text);
  return text;
}

// newDay();
function loadGameScene() {
  app.innerHTML = "";

  const img = document.createElement("img");
  img.src = "assets/map.png";
  img.style.position = "absolute";
  img.style.top = `${height * 0.001}px`;
  img.style.left = `${width * 0.1}px`;
  img.style.width = `${width * 0.9}px`;
  img.style.transform = "rotate(10deg)";

  app.appendChild(img);
  pinCreator(height * 0.67, width * 0.22, pinSymbols[1], 1, pinSucess[1]);
  pinCreator(height * 0.5, width * 0.7, pinSymbols[2], 2, pinSucess[2]);
  pinCreator(height * 0.9, width * 0.42, pinSymbols[3], 3, pinSucess[3]);
  pinCreator(height * 0.9, width * 0.7, pinSymbols[4], 4, pinSucess[4]);
  pinCreator(height * 0.38, width * 0.4, pinSymbols[5], 5, pinSucess[5]);
  pinCreator(height * 0.7, width * 0.55, pinSymbols[6], 6, pinSucess[6]);
}

function endGame() {
  dayApp.innerHTML = "";
  app.innerHTML = "";
  dialougeApp.innerHTML = "";

  // img.style.transform = "rotate(10deg)";

  const closedInvestments: Investment[] = checkIfInvestmentSucceeded();
  // const bg = document.createElement("div");
  // bg.className = "new_day_rect"; // Defined in the CSS
  // const container = document.createElement("span");

  let newPayments = "";

  openInvestments.forEach((investment) => {
    const randRisk =
      Math.floor(
        Math.random() * (risk_investment[1] - risk_investment[0] + 1)
      ) + risk_investment[0];
    if (randRisk <= investment.risk) {
      money += investment.payout;
      closedInvestments.push(investment);
      pinSucess[investment.id] = 1;
    } else {
      pinSucess[investment.id] = 2;
    }
    const index = openInvestments.findIndex(
      (item) => item.name === investment.name
    );
    if (index !== -1) openInvestments.splice(index, 1);
  });

  closedInvestments.forEach((investment) => {
    newPayments += `${investment.name} got you ${investment.payout}`;
  });
  // info about the game progress
  const img = document.createElement("img");
  img.src = "assets/end_letter1.png";
  img.style.position = "absolute";
  img.style.top = `${height * 0.05}px`;
  img.style.left = `${width * 0.05}px`;
  img.style.width = `${width * 0.45}px`;
  img.style.height = `${height * 0.7}px`;
  const text = document.createElement("span");
  text.style.display = "inline-block";
  text.innerText = `Day: ${day}\nMoney:${money}\nAny payments:${newPayments}\n\nOut of ${day} days,\n\tyou chose the risker option ${numRiskyChoices} times\n\tand took the long-term reward ${numWaitChoices} times`;
  text.style.position = "absolute";
  text.style.top = `${height * 0.13}px`;
  text.style.left = `${width * 0.12}px`;

  // info about the resources
  const img1 = document.createElement("img");
  img1.src = "assets/end_letter1.png";
  img1.style.position = "absolute";
  img1.style.top = `${height * 0.05}px`;
  img1.style.left = `${width * 0.05}px`;
  img1.style.width = `${width * 0.45}px`;
  img1.style.height = `${height * 0.7}px`;
  const text1 = document.createElement("span");
  text1.style.display = "inline-block";
  text1.innerText = `Day: ${day}\nMoney:${money}\nAny payments:${newPayments}\n\nOut of ${day} days,\n\tyou chose the risker option ${numRiskyChoices} times\n\tand took the long-term reward ${numWaitChoices} times`;
  text1.style.position = "absolute";
  text1.style.top = `${height * 0.13}px`;
  text1.style.left = `${width * 0.12}px`;

  dayApp.append(img);
  dayApp.append(text);
}

function startScreen() {
  app.innerHTML = "";
  const text = document.createElement("span");
  text.textContent = "Culture & Cognition";
  text.style.position = "absolute";
  text.style.top = `${height * 0.05}px`;
  text.style.left = `${width * 0.35}px`;
  text.style.fontFamily = "Londrina, sans-serif";
  text.style.fontSize = "60px";

  const instructions = document.createElement("span");
  instructions.innerHTML =
    "You're an expert investor, and the faith of multiple companies is in your hands!<br>In 10 days, you'll need to make as much money as possible by going around the world and supporting companies.<br><br>Do not fear, each company will have a description with their success rate and cost.<br><br>Click the thumbs up emoji when you're ready to start!";
  const yes = document.createElement("span");
  yes.textContent = `👍`;
  yes.style.position = "absolute";
  yes.style.top = `${height * 0.7}px`;
  yes.style.left = `${width * 0.5}px`;
  yes.addEventListener("click", () => {
    loadGameScene();
  });
  app.append(yes);
  app.append(instructions);
  app.append(text);
}
startScreen();
// endGame();
