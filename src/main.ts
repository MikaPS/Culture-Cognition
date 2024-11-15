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

  const instructions = document.createElement("span");
  instructions.style.display = "inline-block";
  instructions.style.textAlign = "left";
  instructions.innerText =
    "You're going to read about two companies.\nEach has a different descriptions and statistics, and you can only invest in one.\nChoose carefully between the two, or do nothing.";
  instructions.style.position = "absolute";
  instructions.style.top = `${height * 0.01}px`;
  instructions.style.left = `${width * 0.01}px`;
  dialougeApp.appendChild(instructions);

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

  const name = document.createElement("span");
  name.innerHTML = `&nbsp;&nbsp;${investment.name}&nbsp;&nbsp;`;
  name.style.position = "absolute";
  name.style.top = `${relativePos.top + 3}px`;
  name.style.left = `${relativePos.left + 3}px`;
  name.style.borderRadius = "3px";
  name.style.border = "2px solid #70452a";
  name.style.backgroundColor = "#e0b79d";
  name.style.padding = "1px";

  const symbol = document.createElement("span");
  symbol.textContent = investment.symbol;
  symbol.style.position = "absolute";
  symbol.style.top = `${relativePos.top + 3}px`;
  symbol.style.right = `${relativePos.right + 3}px`;
  symbol.style.borderRadius = "3px";
  symbol.style.border = "2px solid #70452a";
  symbol.style.backgroundColor = "#e0b79d";
  symbol.style.padding = "1px";

  const next = document.createElement("span");
  next.textContent = "⏭️";
  next.style.position = "absolute";
  next.style.bottom = `${relativePos.bottom + 5}px`;
  next.style.left = `${relativePos.left + 5}px`;
  next.style.padding = "5px";
  next.style.borderRadius = "5px";
  next.style.border = "2px solid #3498db";
  next.style.backgroundColor = "#f0f8ff";
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
  yes.style.padding = "5px";
  yes.style.borderRadius = "5px";
  yes.style.border = "2px solid #3498db";
  yes.style.backgroundColor = "#f0f8ff";
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
  no.style.padding = "5px";
  no.style.borderRadius = "5px";
  no.style.border = "2px solid #3498db";
  no.style.backgroundColor = "#f0f8ff";
  no.addEventListener("click", () => {
    yes.remove();
    no.remove();
    dialougeApp.innerHTML = "";
    newDay();
  });
  rectangle.appendChild(name);
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
    text.className = "text-box";
    text.style.setProperty("--width", `${width * 0.25}px`);
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
  // const relativePos = container.getBoundingClientRect();
  const closedInvestments: Investment[] = checkIfInvestmentSucceeded();

  let newPayments = "";
  closedInvestments.forEach((investment) => {
    newPayments += `${investment.symbol}${investment.name}${investment.symbol} got you ${investment.payout}\n`;
  });
  openInvestments.forEach((investment) => {
    newPayments += `You need to wait ${investment.time} days to see the payout of\n\t${investment.symbol}${investment.name}${investment.symbol}\n`;
  });

  const yes = document.createElement("span");
  yes.textContent = `Move to the next day: 👍`;
  yes.style.position = "absolute";
  yes.style.top = `${height * 0.7}px`;
  yes.style.left = `${width * 0.22}px`;
  yes.addEventListener("click", () => {
    dayApp.innerHTML = "";
    loadGameScene();
  });
  container.appendChild(yes);
  dayApp.append(container);

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
  text.style.display = "inline-block";
  text.style.padding = "5px";
  text.style.borderRadius = "5px";
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

  const instructions = document.createElement("span");
  instructions.style.display = "inline-block";
  instructions.style.textAlign = "left";
  instructions.innerText =
    "Click on a pin to make an investment decision.\nSymbols matching the investments you supported will show on the board later on.\nGreen highlights show successful investments, and reds failures.";
  instructions.style.position = "absolute";
  instructions.style.top = `${height * 0.01}px`;
  instructions.style.left = `${width * 0.01}px`;

  const img = document.createElement("img");
  img.src = "assets/map.png";
  img.style.position = "absolute";
  img.style.top = `${height * 0.001}px`;
  img.style.left = `${width * 0.1}px`;
  img.style.width = `${width * 0.9}px`;
  img.style.transform = "rotate(10deg)";

  app.appendChild(img);
  app.appendChild(instructions);

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

  const closedInvestments: Investment[] = checkIfInvestmentSucceeded();

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
    newPayments += `${investment.symbol}${investment.name}${investment.symbol} got you ${investment.payout}$\n`;
  });
  // info about the game progress
  const img = document.createElement("img");
  img.src = "assets/end_letter1.png";
  img.style.position = "absolute";
  img.style.top = `${height * 0.01}px`;
  img.style.left = `${width * 0.01}px`;
  img.style.width = `${width * 0.41}px`;
  img.style.height = `${height * 0.7}px`;
  const text = document.createElement("span");
  text.style.display = "inline-block";
  text.innerText = `Day: ${day}\nMoney: ${money}\nAny payments: ${newPayments}\n\nOut of ${day} days,\n\tyou chose the risker option ${numRiskyChoices} times\n\tand took the long-term reward ${numWaitChoices} times`;
  text.style.position = "absolute";
  text.style.top = `${height * 0.08}px`;
  text.style.left = `${width * 0.07}px`;

  // info about the resources
  const img1 = document.createElement("img");
  img1.src = "assets/end_letter2.png";
  img1.style.position = "absolute";
  img1.style.top = `${height * 0.01}px`;
  img1.style.left = `${width * 0.4}px`;
  img1.style.width = `${width * 0.49}px`;
  img1.style.height = `${height * 0.7}px`;
  const text1 = document.createElement("span");
  text1.className = "text-box";
  text1.style.setProperty("--width", `${width * 0.35}px`);
  text1.innerText = `Amir et al. (2020) was the biggest inspiration for this game, who found that across all countries, participants were more likely to choose the risky option as the stake size increased. However, countries that are not integrated in the marker were the least risk-seeking population. People are unsure when the next time they will receive food, so they prefer to stick with the safe option.
                  \nKo et al. (2004) that Korean shoppers felt that it was more risky in regards to disapproval of the products by their friends and family, while American shoppers were worried about losing money, time. Korea is an interconnected country so their reputation is important to them, while America is a more individualistic country, so the American users will need to deal with the loss after a bad purchase by themselves. 
  `;
  text1.style.position = "absolute";
  text1.style.top = `${height * 0.08}px`;
  text1.style.left = `${width * 0.46}px`;

  const img3 = document.createElement("img");
  img3.src = "assets/end_letter1.png";
  img3.style.position = "absolute";
  img3.style.top = `${height * 0.75}px`;
  img3.style.left = `${width * 0.4}px`;
  img3.style.width = `${width * 0.5}px`;
  img3.style.height = `${height * 0.9}px`;
  const text3 = document.createElement("span");
  text3.className = "text-box";
  text3.style.setProperty("--width", `${width * 0.35}px`);
  text3.innerText = `Rieger et al. (2015) discovered that richer countries and those with a higher uncertainty avoidance index are risk averse in terms of gains but risk seeking in losses. Moreover, individualistic countries are less risk-averse in both gains and losses compared to collectivist countries. Again, people who are more financially secure do not fear being risk-seeking in terms of losses, and collectivistic countries have more support for their in-group members, so people can be more risk-seeking.
                  \nAlmansour et al. (2023) found 5 factors that impact investment decisions: herding behviors (following others’ decisions), disposition (holding onto lost investments for long periods of time), blue chip stocks (bias towards well-established companies), overconfidence, and risk perception. 
                  \nWang et al. (2017) found that individualism, socical status, masculinity, and uncertainty avoidance increase the degree of loss aversion across cultures. More specifically, Eastern European participants have the highest loss aversion on average, whereas African participants have the lowest.
`;
  text3.style.position = "absolute";
  text3.style.top = `${height * 0.82}px`;
  text3.style.left = `${width * 0.46}px`;

  // info about the resources
  const img2 = document.createElement("img");
  img2.src = "assets/end_letter3.png";
  img2.style.position = "absolute";
  img2.style.top = `${height * 0.75}px`;
  img2.style.left = `${width * 0.01}px`;
  img2.style.width = `${width * 0.41}px`;
  img2.style.height = `${height * 0.65}px`;
  const text2 = document.createElement("span");
  text2.className = "text-box";
  text2.style.setProperty("--width", `${width * 0.25}px`);
  text2.innerText = `Risk taking depends a lot on culture and risk perception.\nWhether your country has access to the market,\nwhether your country values individualism or collectivism,\nand whether your country is rich\ncan all impact the actions you will take as an individual.\n\nLook at the results that you got and look at the following passages to see if this simulation correctly aligned with your personal beliefs and the country you’re from.`;
  text2.style.position = "absolute";
  text2.style.top = `${height * 0.82}px`;
  text2.style.left = `${width * 0.08}px`;

  dayApp.append(img);
  dayApp.append(text);

  dayApp.append(img1);
  dayApp.append(text1);

  dayApp.append(img2);
  dayApp.append(text2);

  dayApp.append(img3);
  dayApp.append(text3);
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
  yes.style.padding = "5px";
  yes.style.borderRadius = "5px";
  yes.style.border = "2px solid #3498db";
  yes.style.backgroundColor = "#f0f8ff";

  yes.addEventListener("click", () => {
    loadGameScene();
  });
  app.append(yes);
  app.append(instructions);
  app.append(text);
}
startScreen();
// endGame();
