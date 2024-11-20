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
interface CountryData {
  companiesData: Array<{ symbol: string; sentence: string }>;
  companiesNames: string[];
}
const countriesData: { [continent: string]: CountryData } = {};

fetch("assets/data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    const getCountryData = (continentData: {
      [key: string]: { symbol: string; sentence: string };
    }) => {
      const countryData: CountryData = {
        companiesData: [],
        companiesNames: [],
      };

      for (const companyName in continentData) {
        const { symbol, sentence } = continentData[companyName];
        countryData.companiesNames.push(companyName);
        countryData.companiesData.push({ symbol, sentence });
      }

      return countryData;
    };
    for (const continent in data) {
      countriesData[continent] = getCountryData(data[continent]);
    }
  })
  .catch((error) => console.error("Error fetching JSON data:", error));

const numOfPins = 10;
const pinSymbols = Array(numOfPins + 1).fill("📍");
pinSymbols[0] = "";
const pinSucess = Array(numOfPins + 1).fill(0);

const risk_investment = [40, 90]; // % of success
const time_investment = [1, 5];
const payout_investment = [20, 100];
const cost_investment = [10, 70];

let numRiskyChoices = 0; // used for analysis
let numWaitChoices = 0;
let numAversion = 0;

let currentCost = 0;
const currentPayout: number[] = [];
const currentDayOptions: number[] = [];
let currentPinID = 0;
let currentContinent = "";

const openInvestments: Investment[] = [];
const openInvestmentsID: number[] = [];

function applyButtonStyle(text: HTMLElement, top: number, left: number) {
  const buttonStyle = {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    padding: "5px",
    borderRadius: "5px",
    border: "2px solid #3498db",
    backgroundColor: "#f0f8ff",
  };
  Object.assign(text.style, buttonStyle);
}

// Randomizes the investment, risk, and time
function investmentCreator(continent: string): Investment {
  const randInvestmentIndex = Math.floor(
    Math.random() * countriesData[continent]["companiesData"].length
  );
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
    name: countriesData[continent]["companiesNames"][randInvestmentIndex],
    text: countriesData[continent]["companiesData"][randInvestmentIndex]
      .sentence,
    risk: randRisk,
    time: randTime,
    payout: randPayout,
    cost: randCost,
    symbol:
      countriesData[continent]["companiesData"][randInvestmentIndex].symbol,
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
    scale: width * 0.066,
    duration: 1,
    ease: "power1.inOut",
  });
  dialougeApp.append(globe);

  const pin = document.createElement("span");
  pin.textContent = "📍";
  pin.style.position = "absolute";
  pin.style.top = `${height * 0.45}px`;
  pin.style.left = `${width * 0.25}px`;
  gsap.to(pin, { scale: width * 0.015, duration: 2, ease: "power2.inOut" }); // animation
  dialougeApp.append(pin);
}

function uiTextDialouge(heightOffset: number) {
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
  rectangle.style.setProperty("--rect-top", `${60 + heightOffset}px`);
  rectangle.style.setProperty("--rect-left", `${width * 0.6}px`);

  const envelope = document.createElement("span");
  envelope.innerHTML = "📨";
  envelope.style.fontSize = "100px";
  envelope.style.position = "absolute";
  envelope.style.top = `${10 + heightOffset}px`;
  envelope.style.left = `${width * 0.45}px`;

  const investment = investmentCreator(currentContinent);
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

  const moneyText = document.createElement("span");
  moneyText.innerHTML = `&nbsp;&nbsp;Money: ${money}&nbsp;&nbsp;`;
  Object.assign(moneyText.style, {
    position: "absolute",
    top: `${relativePos.top + 3}px`,
    right: `${relativePos.right + 3}px`,
    borderRadius: "3px",
    border: "2px solid #1cba4b",
    backgroundColor: "#91edac",
    padding: "1px",
  });

  const name = document.createElement("span");
  name.innerHTML = `&nbsp;&nbsp;${investment.name}&nbsp;&nbsp;`;
  Object.assign(name.style, {
    position: "absolute",
    top: `${relativePos.top + 3}px`,
    left: `${relativePos.left + 3}px`,
    borderRadius: "3px",
    border: "2px solid #70452a",
    backgroundColor: "#e0b79d",
    padding: "1px",
  });

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
  applyButtonStyle(yes, relativePos.top + 100, relativePos.left + 5);
  yes.addEventListener("click", () => {
    yes.remove();
    no.remove();
    console.log("money: ", money, " cost: ", currentCost);
    if (money >= currentCost) {
      const audioPlayer = new Audio();
      audioPlayer.loop = false;
      audioPlayer.volume = 0.8;
      audioPlayer.src = "assets/music/coin-pickup-98269.mp3";
      audioPlayer.play();

      money -= currentCost;
      countriesData[currentContinent]["companiesData"].splice(investment.id, 1);
      countriesData[currentContinent]["companiesNames"].splice(
        investment.id,
        1
      );
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
      dialougeApp.innerHTML = "";
      newDay();
    } else {
      const audioPlayer = new Audio();
      audioPlayer.loop = false;
      audioPlayer.volume = 0.8;
      audioPlayer.src = "assets/music/error-8-206492.mp3";
      audioPlayer.play();

      gsap.to(moneyText, {
        scale: 2, // Scale up to 3 times the original size
        duration: 0.5,
        ease: "power1.inOut",
        onComplete: function () {
          // Now reset it back to normal size (scale = 1)
          gsap.to(moneyText, {
            scale: 1, // Scale back to original size
            duration: 0.5,
            ease: "power1.inOut",
            // onComplete: function () {
            //   moneyText.style.backgroundColor = "#91edac";
            // },
          });
        },
      });

      setTimeout(function () {
        dialougeApp.innerHTML = "";
        newDay();
      }, 1500);
    }
  });

  const no = document.createElement("span");
  no.textContent = "👎";
  applyButtonStyle(no, relativePos.top + 100, relativePos.left + 250);
  no.addEventListener("click", () => {
    numAversion += 1;
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
  dialougeApp.appendChild(moneyText);
}

function newDay() {
  app.innerHTML = "";
  day += 1;

  const container = document.createElement("span");
  // container.style.position = "relative"; // Make it the reference point for absolute children
  container.style.display = "inline-block"; // To wrap content tightly

  const airplane = document.createElement("img");
  airplane.src = "assets/airplane_bg.png";
  airplane.style.position = "absolute";
  airplane.style.left = `${width * 0.05}px`;
  airplane.style.top = `${height * 0.08}px`;
  airplane.style.width = `${width * 0.55}px`;
  // airplane.style.height = `${height * 0.4}px`;
  // airplane.style.transform = "rotate(20deg)";

  // dayApp.append(wave);
  dayApp.append(airplane);

  const paper = document.createElement("img");
  paper.src = "assets/paper_clouds.png";
  paper.style.position = "absolute";
  paper.style.left = `${width * 0.15}px`;
  paper.style.top = `${height * 0.01}px`;
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
    text.style.top = `${height * 0.2}px`;
    text.style.left = `${width * 0.18}px`;
    container.appendChild(text);
  };

  const closedInvestments: Investment[] = checkIfInvestmentSucceeded();
  let newPayments = "";
  closedInvestments.forEach((investment) => {
    newPayments += `${investment.symbol}${investment.name}${investment.symbol} got you ${investment.payout}\n`;
    const audioPlayer = new Audio();
    audioPlayer.loop = false;
    audioPlayer.volume = 0.8;
    audioPlayer.src = "assets/music/coin-257878.mp3";
    audioPlayer.play();
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
  if (money <= 0 || day >= 7) {
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
  isSuccess: number,
  continent: string
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
      currentContinent = continent;
      dialougeAnimation();
      uiTextDialouge(0);
      uiTextDialouge(200);
      console.log(currentPinID, " continent: ", currentContinent);
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

  const heights = [0.67, 0.45, 0.9, 0.9, 0.38, 0.7, 0.75, 0.55, 0.48, 0.9];
  const widths = [0.22, 0.72, 0.42, 0.7, 0.4, 0.55, 0.32, 0.62, 0.5, 0.57];
  const continents = [
    "North America",
    "Asia",
    "South America",
    "Australia",
    "Europe",
    "Africa",
    "North America",
    "Asia",
    "Europe",
    "Africa",
  ];
  for (let i = 1; i <= numOfPins; i += 1) {
    pinCreator(
      height * heights[i - 1],
      width * widths[i - 1],
      pinSymbols[i],
      i,
      pinSucess[i],
      continents[i - 1]
    );
  }
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
  let textCount = 0;
  const img = document.createElement("img");
  img.src = "assets/start_screen.png";
  img.style.position = "absolute";
  img.style.top = `${height * 0.001}px`;
  img.style.left = `${width * 0.001}px`;
  img.style.width = `${width}px`;

  const title = document.createElement("span");
  title.textContent = "Choice Summary";
  Object.assign(title.style, {
    position: "absolute",
    top: `${height * 0.08}px`,
    left: "50%",
    fontFamily: "Londrina, sans-serif",
    transform: "translate(-50%, 0%)",
    fontSize: "80px",
  });

  const text = document.createElement("span");
  text.style.display = "inline-block";
  text.innerText = `Day: ${day}\nMoney: ${money}\nAny payments:\n${newPayments}\n\nOut of ${day} days,\n\tyou chose the risker option ${numRiskyChoices} times\n\tyou chose to not invest ${numAversion}\n\tand chose the long-term investment ${numWaitChoices} times
                    `;
  text.style.position = "absolute";
  text.style.top = "25%";
  text.style.left = "15%";
  text.className = "text-box";
  text.style.setProperty("--width", `${width * 0.4}px`);

  const text1 = document.createElement("span");
  text1.style.display = "inline-block";
  text1.innerText = `Risk taking depends a lot on culture and risk perception.\nWhether your country has access to the market,\nwhether your country values individualism or collectivism,\nand whether your country is rich\ncan all impact the actions you will take as an individual.\n\nLook at the results that you got and look at the following passages to see if this simulation correctly aligned with your personal beliefs and the country you’re from.`;
  text1.style.position = "absolute";
  text1.style.top = "25%";
  text1.style.left = "42%";
  text1.className = "text-box";
  text1.style.setProperty("--width", `${width * 0.4}px`);

  const next = document.createElement("span");
  next.textContent = "⏭️";
  Object.assign(next.style, {
    position: "absolute",
    top: "80%",
    left: "90%",
    fontFamily: "Londrina, sans-serif",
    transform: "translate(-50%, 0%)",
    fontSize: "80px",
  });
  next.addEventListener("click", () => {
    textCount += 1;
    if (textCount == 1) {
      text.innerText = `Amir et al. (2020) was the biggest inspiration for this game, who found that across all countries, participants were more likely to choose the risky option as the stake size increased. However, countries that are not integrated in the marker were the least risk-seeking population. People are unsure when the next time they will receive food, so they prefer to stick with the safe option.
                        `;
      title.innerText = `Article ${textCount} `;
      text1.innerText = "";
      text.style.setProperty("--width", `${width * 0.58}px`);
    } else if (textCount == 2) {
      text.innerText = `Ko et al. (2004) that Korean shoppers felt that it was more risky in regards to disapproval of the products by their friends and family, while American shoppers were worried about losing money, time. Korea is an interconnected country so their reputation is important to them, while America is a more individualistic country, so the American users will need to deal with the loss after a bad purchase by themselves.
                        `;
      title.innerText = `Article ${textCount} `;
    } else if (textCount == 3) {
      text.innerText = `Rieger et al. (2015) discovered that richer countries and those with a higher uncertainty avoidance index are risk averse in terms of gains but risk seeking in losses. Moreover, individualistic countries are less risk-averse in both gains and losses compared to collectivist countries. Again, people who are more financially secure do not fear being risk-seeking in terms of losses, and collectivistic countries have more support for their in-group members, so people can be more risk-seeking.
                        `;
      title.innerText = `Article ${textCount} `;
    } else if (textCount == 4) {
      text.innerText = `Almansour et al. (2023) found 5 factors that impact investment decisions: herding behviors (following others’ decisions), disposition (holding onto lost investments for long periods of time), blue chip stocks (bias towards well-established companies), overconfidence, and risk perception.
                        `;
      title.innerText = `Article ${textCount} `;
    } else if (textCount == 5) {
      text.innerText = `Wang et al. (2017) found that individualism, socical status, masculinity, and uncertainty avoidance increase the degree of loss aversion across cultures. More specifically, Eastern European participants have the highest loss aversion on average, whereas African participants have the lowest.
                        `;
      title.innerText = `Article ${textCount} `;
    } else if (textCount == 6) {
      // Restart game!
      pinSymbols.fill("📍");
      pinSymbols[0] = "";
      pinSucess.fill(0);

      numRiskyChoices = 0;
      numWaitChoices = 0;
      numAversion = 0;

      currentCost = 0;
      currentPayout.length = 0;
      currentDayOptions.length = 0;
      currentPinID = 0;
      currentContinent = "";

      openInvestments.length = 0;
      openInvestmentsID.length = 0;
      dayApp.innerHTML = "";
      startScreen();
    }
  });

  dayApp.appendChild(img);
  dayApp.appendChild(text);
  dayApp.appendChild(text1);
  dayApp.appendChild(title);
  dayApp.appendChild(next);
}

function startScreen() {
  app.innerHTML = "";

  const img = document.createElement("img");
  img.src = "assets/start_screen.png";
  img.style.position = "absolute";
  img.style.top = `${height * 0.001}px`;
  img.style.left = `${width * 0.001}px`;
  img.style.width = `${width}px`;

  const text = document.createElement("span");
  text.textContent = "Culture & Cognition";
  text.style.position = "absolute";
  text.style.top = `${height * 0.08}px`;
  text.style.left = "50%";
  text.style.transform = "translate(-50%, 0%)";
  text.style.fontFamily = "Londrina, sans-serif";
  text.style.fontSize = "80px";

  const instructions = document.createElement("span");
  instructions.innerHTML =
    "You're an investor, and the faith of multiple companies is in your hands!<br>In 7 days, you'll need to make as much money as possible by going around the world and supporting companies.<br><br>Do not fear, each company will have a description with their success rate and cost.<br><br>Click the thumbs up emoji when you're ready to start!";
  instructions.style.position = "absolute";
  instructions.style.top = `${height * 0.4}px`;
  instructions.style.textAlign = "center";
  instructions.style.left = "50%";
  instructions.style.transform = "translate(-50%, 0%)";

  const yes = document.createElement("span");
  yes.textContent = `👍`;
  yes.style.position = "absolute";
  yes.style.top = `${height * 0.8}px`;
  yes.style.left = "50%";
  yes.style.padding = "5px";
  yes.style.borderRadius = "5px";
  yes.style.border = "2px solid #3498db";
  yes.style.backgroundColor = "#f0f8ff";
  yes.style.fontSize = "30px";

  yes.addEventListener("click", () => {
    music();
    loadGameScene();
  });
  app.appendChild(img);
  app.appendChild(yes);
  app.appendChild(instructions);
  app.appendChild(text);
}
startScreen();

function music() {
  const tracks = [
    "assets/music/BoogieWonderland.wav",
    "assets/music/BourbonBlues.wav",
    "assets/music/CoolCatCaper.wav",
    "assets/music/JukeJointJive.wav",
    "assets/music/SwinginSafari.wav",
    "assets/music/VelvetVoyage.wav",
  ];

  let currentTrackIndex = 0;
  const audioPlayer = new Audio();
  audioPlayer.loop = false;
  audioPlayer.volume = 0.5;

  function playCurrentTrack() {
    audioPlayer.src = tracks[currentTrackIndex];
    audioPlayer.play().catch((error) => {
      console.log("Error playing track:", error);
    });
  }

  // Event listener for when a track ends
  audioPlayer.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    playCurrentTrack();
  });

  playCurrentTrack();
}
