let pos, whosTurn, newGame, numberOfPlayers;
let lastGameCardCount = 0;
let lastGameBluffText = "Nothing";
let listenNodeInserted = true;

const socket = io();
const audioFilesAddress = 'http://' + location.host + '/';

const audioRaiseTime = new Audio(audioFilesAddress + 'rise-time.mp3');
const audioCardsShuffling = new Audio(audioFilesAddress + 'cards-shuffling.mp3');
const audioCardsPlaced = new Audio(audioFilesAddress + 'cards-placed.mp3');
const audioCardsRaised = new Audio(audioFilesAddress + 'cards-raised.mp3');

const playedContainer = document.getElementById('container_played');
const cardContainer = document.getElementById('card-container');

function notifyScreenReader(text, priority = "polite") {
  const el = document.createElement("div");
  const id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority);
  document.body.appendChild(el);

  setTimeout(() => {
    document.getElementById(id).innerHTML = text;
  }, 1000);

  setTimeout(() => {
    document.body.removeChild(document.getElementById(id));
  }, 10000);
}

function getCardValue(item) {
  const valueMap = { 'A': 1, 'J': 11, 'Q': 12, 'K': 13 };
  return valueMap[item] || parseInt(item);
}

function sortCards(containerId) {
  const container = document.getElementById(containerId);
  const cards = Array.from(container.children);

  cards.sort((a, b) => getCardValue(a.textContent.slice(1)) - getCardValue(b.textContent.slice(1)));

  container.innerHTML = "";
  cards.forEach(card => container.appendChild(card));
}

function startShufflingEffect() {
  cardContainer.innerHTML = `
    <div class="loading-animation"></div>
    <div class="text-element col-12">Card is shuffling</div>
  `;

  setTimeout(() => {
    cardContainer.innerHTML = '';
    audioCardsShuffling.play();
  }, 3000);
}

cardContainer.addEventListener("DOMNodeInserted", () => {
  if (listenNodeInserted) {
    const card = cardContainer.lastElementChild;

    ['click', 'keydown'].forEach(evt => {
      card.addEventListener(evt, (event) => {
        if (evt === 'click' || (evt === 'keydown' && event.keyCode === 13)) {
          card.selected = !card.selected;
          const message = card.selected ? `${card.id} Selected` : `${card.id} Removed`;
          const backgroundColor = card.selected ? "#81ea74" : "#b963ee";

          notifyScreenReader(message);
          card.setAttribute('title', card.selected ? 'Selected' : 'Unselected');
          card.style.backgroundColor = backgroundColor;
        }
      });
    });
  }
});

socket.on('STOC-SET-NUMBER-OF-PLAYERS', (total) => {
  numberOfPlayers = total;
  const playerContainer = document.getElementById('player-container');
  playerContainer.innerHTML = '';

  for (let i = 0; i < numberOfPlayers; i++) {
    playerContainer.innerHTML += `<div class="user p-1" tabindex="0"><i class="far fa-user"></i><span id="user${i}">user${i + 1}</span></div>`;
  }
});

socket.on('STOC-SET-POSITION', (index) => {
  pos = index;
  document.getElementById(`user${pos}`).innerHTML = 'You';
  notifyScreenReader(`You are in position : ${index + 1}`, "polite");
});

socket.on('STOC-SHUFFLING', () => {
  notifyScreenReader("Card is shuffling!");
  startShufflingEffect();
});
