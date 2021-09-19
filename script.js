const routineItems = [];
let timeBetweenItems = [];

const addButton = document.querySelector("#add-button");
addButton.addEventListener("click", renderTemplateItem);

const stopButton = document.querySelector("#stop-button");
stopButton.addEventListener("click", stopRoutine);

const itemsContainer = document.querySelector("#items-container");
const infoMessage = document.querySelector("#info-message");

const totalTime = document.querySelector("#total-time");
const totalPoints = document.querySelector("#total-points");

let totalTimeAvailable = 24 * 60;
let earnedPoints = 0;

const state = {
  readyForAdd: true,
};

function blockAddItems() {
  state.readyForAdd = false;
}

function freeAddItems() {
  state.readyForAdd = true;
}

function renderTemplateItem() {
  function removeInfoMessage() {
    infoMessage.innerHTML = "";
  }

  if (state.readyForAdd) {
    removeInfoMessage();
    renderRoutineItems();

    itemsContainer.innerHTML += `
    <li>
      <div class="form">
        <form action="" onsubmit="handleFormSubmit(event)">
          <button class="add-item-button">Adicionar</button>                
          <div class="input-container">

            <div class="input-group">
              <input type="number" step="0.01" placeholder="0h,00min" id="input-time-first" />
              <span> - </span>
              <input type="number" step="0.01" placeholder="0h,00min" id="input-time-last" />
            </div>

            <span> | </span>

            <div class="input-group">
              <input type="text" placeholder="Atividade" id="input-description" />
            </div>

            <span> | </span>

            <div class="input-group">
              <input type="number" placeholder="0 pontos" id="input-points" />
            </div>

            <div class="input-group">
              <input type="checkbox" name="input-check" id="input-check" />
            </div>

          </div>
        </form>
      </div>
    </li>`;

    blockAddItems();
  } else {
    alert("Preencha o item selecionado antes de adicionar outros");
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  handleDataCapture();
}

function modifySelection(index) {
  routineItems[index].checked = !routineItems[index].checked;
  calculateEarnedPoints();
  renderTotalPoints();
}

function formatTimeItem(timeItem) {
  const timeItemVector = String(timeItem).split(".");

  if (timeItemVector.length > 1) {
    timeItemVector[0] =
      timeItemVector[0].length === 1
        ? "0" + timeItemVector[0]
        : "" + timeItemVector[0];

    timeItemVector[1] += timeItemVector[1].length === 1 ? "0" : "";

    return timeItemVector[0] + " h : " + timeItemVector[1] + " m";
  } else {
    timeItemVector[0] =
      timeItemVector[0].length === 1
        ? "0" + timeItemVector[0]
        : "" + timeItemVector[0];

    return (timeItemVector[0] += " h : 00 m");
  }
}

function renderTotalPoints() {
  totalPoints.innerHTML = earnedPoints + " Pontos";
}

function parseNumberTime(totalMinutes) {
  const hours = parseInt(totalMinutes / 60);
  const minutes =
    (Math.ceil(totalMinutes * 100) - Math.ceil(hours * 100) * 60) / 10000;

  return hours + minutes;
}

function renderTotalTime() {
  totalTime.innerHTML = formatTimeItem(parseNumberTime(totalTimeAvailable));
}

function calculateEarnedPoints() {
  earnedPoints = 0;
  routineItems.forEach(({ points, checked }) => {
    if (checked) {
      earnedPoints += points;
    }
  });
}

function calculateTimeBetweenItems() {
  timeBetweenItems = [];

  for (let i = 0; i < routineItems.length - 1; i++) {
    timeBetweenItems.push(
      formatTimeItem(
        parseNumberTime(
          parseToMinutes(
            trueTimeDifference(
              routineItems[i + 1].firstTime,
              routineItems[i].lastTime
            )
          )
        )
      )
    );
  }
}

function parseToMinutes(time) {
  hours = parseInt(time);
  minutes = time * 100 - hours * 100;

  return minutes + hours * 60;
}

function trueTimeDifference(lastTime, initialTime) {
  const last = Number(lastTime);
  const init = Number(initialTime);

  return (
    (Math.ceil(Number((last * 100).toFixed(2))) -
      Math.ceil(Number((init * 100).toFixed(2)))) /
    100
  );
}

function renderRoutineItems() {
  itemsContainer.innerHTML = "";

  routineItems.forEach((item, index) => {
    const inputCheckItem = item.checked
      ? `<input type="checkbox" checked id="${index}" onchange="modifySelection(${index})" />`
      : `<input type="checkbox" id="${index}" onchange="modifySelection(${index})" />`;

    const betweenTime = timeBetweenItems[index]
      ? "-" + timeBetweenItems[index] + "-"
      : "";

    const firstTimeItem = formatTimeItem(item.firstTime);
    const lastTimeItem = formatTimeItem(item.lastTime);

    itemsContainer.innerHTML += `
    <li style="margin-left: 6.85rem;">
      <div class="form">
        <form action="" onsubmit="handleFormSubmit(event)">
          <div class="input-container">

            <div class="input-group">
              <input type="text" value="${firstTimeItem}" disabled />
              <span> - </span>
              <input type="text" value="${lastTimeItem}" disabled />
            </div>

            <span> | </span>

            <div class="input-group">
              <input type="text" value="${item.description}" disabled />
            </div>

            <span> | </span>

            <div class="input-group">
              <input type="text" value="${item.points} pontos" disabled />
            </div>

            <div class="input-group">
              ${inputCheckItem}
            </div>
          </div>
        </form>
      </div>
      <div class="time-item-available">${betweenTime}<div/>
    </li>`;
  });

  renderTotalPoints();
  renderTotalTime();
  freeAddItems();
}

function handleDataCapture() {
  const inputTimeFirst = document.querySelector("#input-time-first");
  const inputTimeLast = document.querySelector("#input-time-last");
  const inputDescription = document.querySelector("#input-description");
  const inputPoints = document.querySelector("#input-points");
  const inputCheck = document.querySelector("#input-check");

  if (
    inputTimeFirst.value === "" ||
    inputTimeLast.value === "" ||
    inputDescription.value.trim() === ""
  ) {
    alert("Preencha todos os campos");
  } else {
    routineItems.push({
      firstTime: Number(inputTimeFirst.value),
      lastTime: Number(inputTimeLast.value),
      description: inputDescription.value,
      points: Number(inputPoints.value),
      checked: inputCheck.checked,
    });

    totalTimeAvailable -= parseToMinutes(
      trueTimeDifference(inputTimeLast.value, inputTimeFirst.value)
    );

    calculateEarnedPoints();
    calculateTimeBetweenItems();
    renderRoutineItems();
  }
}

function getProductivity() {
  const numberOfItems = routineItems.length;
  let sumOfCheckedItems = 0;

  routineItems.forEach(({ checked }) => {
    if (checked) {
      sumOfCheckedItems++;
    }
  });

  return ((sumOfCheckedItems / numberOfItems) * 100).toFixed(2);
}

function stopRoutine() {
  if (routineItems.length === 0) {
    alert("Adicione pelo menos um item para encerrar a rotina");
  } else {
    itemsContainer.innerHTML = `
    <div id="final-card">
      <p>-Pontuação total: ${earnedPoints} Pontos</p>
      <p>-Rendimento: ${getProductivity()}%</p>
      <a href="../initial-page/index.html" id="comeback-button">Voltar à página inicial</a>
    </div>
    `;
  }
}