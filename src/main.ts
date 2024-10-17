import "./style.css";
// import map from "assets/map.jpg";

interface Investment {
  name: string;
  risk: number;
  time: number;
  payout: number;
  cost: number;
}

const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = "Culture&Cognition";
document.title = gameName;

// window height and width
const width = window.innerWidth;
const height = window.innerHeight;

// Original params
let money = 100;
let day = 0;
const dialouge = ["hi! i'm here", "hi im a different person"];
const risk_investment = [40, 100]; // % of success
const time_investment = [1, 5];
const payout_investment = [20, 100];
const cost_investment = [10, 80];

const openInvestments: Investment[] = [];

const img = document.createElement("img");
document.body.appendChild(img);
img.src = "assets/map.jpg";

// Randomizes the investment, risk, and time
function investmentCreator(): Investment {
  const randInvestmentIndex = Math.floor(Math.random() * dialouge.length);
  const randRisk =
    Math.floor(Math.random() * (risk_investment[1] - risk_investment[0] + 1)) +
    risk_investment[0];
  const randTime =
    Math.floor(Math.random() * (time_investment[1] - time_investment[0] + 1)) +
    time_investment[0];
  const randPayout =
    Math.floor(
      Math.random() * (payout_investment[1] - payout_investment[0] + 1),
    ) + payout_investment[0];
  const randCost =
    Math.floor(Math.random() * (cost_investment[1] - cost_investment[0] + 1)) +
    cost_investment[0];
  const investment: Investment = {
    name: dialouge[randInvestmentIndex],
    risk: randRisk,
    time: randTime,
    payout: randPayout,
    cost: randCost,
  };

  return investment;
}

function uiTextDialouge() {
  const rectangle = document.createElement("div");
  rectangle.className = "rectangle"; // Defined in the CSS

  const investment = investmentCreator();

  const text = document.createElement("span");
  const relativePos = rectangle.getBoundingClientRect();
  text.textContent = investment.name;
  text.style.position = "absolute";
  text.style.top = `${relativePos.top + 5}px`;
  text.style.left = `${relativePos.left + 5}px`;

  const next = document.createElement("span");
  next.textContent = "⏭️";
  next.style.position = "absolute";
  next.style.top = `${relativePos.top + 50}px`;
  next.style.left = `${relativePos.left + 5}px`;
  next.addEventListener("click", () => {
    text.innerText = `The success of my business is ${investment.risk}%\nThe time for the profit to appear is ${investment.time} days\nWill you invest in me?`;
    next.remove();
    rectangle.appendChild(yes);
    rectangle.appendChild(no);
  });

  const yes = document.createElement("span");
  yes.textContent = `👍 (cost: ${investment.cost}`;
  yes.style.position = "absolute";
  yes.style.top = `${relativePos.top + 70}px`;
  yes.style.left = `${relativePos.left + 5}px`;
  yes.addEventListener("click", () => {
    openInvestments.push(investment);
    yes.remove();
    no.remove();
    money -= investment.cost;
    newDay();
  });

  const no = document.createElement("span");
  no.textContent = "👎";
  no.style.position = "absolute";
  no.style.top = `${relativePos.top + 70}px`;
  no.style.left = `${relativePos.left + 50}px`;
  no.addEventListener("click", () => {
    yes.remove();
    no.remove();
    newDay();
  });

  rectangle.appendChild(text);
  rectangle.appendChild(next);
  app.append(rectangle);
}

function newDay() {
  day += 1;
  const bg = document.createElement("div");
  bg.className = "new_day_rect"; // Defined in the CSS
  const text = document.createElement("span");
  const relativePos = bg.getBoundingClientRect();
  const closedInvestments: Investment[] = checkIfInvestmentSucceeded();

  let newPayments = "";
  closedInvestments.forEach((investment) => {
    newPayments += `${investment.name} got you ${investment.payout}`;
  });
  text.innerText = `Day: ${day}\nMoney:${money}\nAny payments:${newPayments}`;

  text.style.position = "absolute";
  text.style.top = `${relativePos.top + 5}px`;
  text.style.left = `${relativePos.left + 5}px`;
  bg.appendChild(text);
  app.append(bg);
}

function checkIfInvestmentSucceeded() {
  const closedInvestments: Investment[] = [];
  openInvestments.forEach((investment) => {
    investment.time -= 1;
    if (investment.time == 0) {
      const randRisk =
        Math.floor(
          Math.random() * (risk_investment[1] - risk_investment[0] + 1),
        ) + risk_investment[0];
      if (randRisk <= investment.risk) {
        money += investment.payout;
        closedInvestments.push(investment);
      }
      const index = openInvestments.findIndex(
        (item) => item.name === investment.name,
      );
      if (index !== -1) openInvestments.splice(index, 1);
    }
  });
  return closedInvestments;
}

// Generates a place the player can go to
function pinCreator(top: number, left: number): HTMLElement {
  const text = document.createElement("span");
  text.textContent = "📍";
  text.style.position = "absolute";
  text.style.top = `${top}px`;
  text.style.left = `${left}px`;
  text.addEventListener("click", () => uiTextDialouge());
  app.append(text);
  return text;
}

newDay();
pinCreator(height * 0.5, width * 0.3);
pinCreator(height * 0.5, width * 0.7);
pinCreator(height * 0.1, width * 0.4);

app.append(img);
// app.append(pin);
