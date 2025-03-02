let pos;
let whosTurn;
let newGame;
let lastGameCardCount = 0;
let lastGameBluffText = "Nothing";
let listenNodeInserted = true; 
const socket = io();
const audioFilesAddress = 'http://' + location.host + '/';
let numberOfPlayers;

//AUDIO FILES HANDLING
const audioRaiseTime = new Audio(audioFilesAddress + 'rise-time.mp3');
const audioCardsShuffling = new Audio(audioFilesAddress + 'cards-shuffling.mp3');
const audioCardsPlaced = new Audio(audioFilesAddress + 'cards-placed.mp3');
const audioCardsRaised = new Audio(audioFilesAddress + 'cards-raised.mp3');

// DOM ELEMENT REFERENCE STATING
const playedContainer = document.getElementById('container_played');
const cardContainer = document.getElementById('card-container');



//UTILITY
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
  const valueMap = {
    'A': 1,
    'J': 11,
    'Q': 12,
    'K': 13
  };
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

//PLACE FOR EVENT LISTENING
cardContainer.addEventListener("DOMNodeInserted", () => {
  if (listenNodeInserted) {
    const card = cardContainer.lastElementChild;
    const cardId = card.id;

    ['click', 'keydown'].forEach(evt => {
      card.addEventListener(evt, (event) => {
        if (evt === 'click' || (evt === 'keydown' && event.keyCode === 13)) {
          card.selected = !card.selected;
          const message = card.selected ? `${cardId} Selected` : `${cardId} Removed`;
          const title = card.selected ? 'Selected' : 'Unselected';
          const backgroundColor = card.selected ? "#81ea74" : "#b963ee";

          notifyScreenReader(message);
          card.setAttribute('title', title);
          card.style.backgroundColor = backgroundColor;
        }
      });
    });
  }
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const passBtn = document.getElementById("pass-btn");
  const raiseBtn = document.getElementById("raise-btn");
  const placeBtn = document.getElementById("place-btn");

  const actions = {
    ';': { btn: passBtn, message: "Pass not possible", action: () => passBtn.click() },
    'f': { btn: raiseBtn, message: "Raise not possible", action: () => raiseBtn.click() },
    'j': { btn: placeBtn, message: "Place not possible", action: () => placeBtn.click() },
    '[': { action: () => cardContainer.firstChild.focus() },
    ']': { action: () => cardContainer.lastChild.focus() },
    '.': { action: () => {
      const selectedCards = Array.from(cardContainer.children)
        .filter(card => card.selected)
        .map(card => card.textContent).join(" ");
      notifyScreenReader(`Selected cards : ${selectedCards}`);
    }},
    'z': { action: () => {
      let turnMessage = `Current Player : ${whosTurn + 1}`;
      if (pos === whosTurn) {
        turnMessage = "Your turn!";
      }
      const lastGameInfo = playedContainer.children.length === 0 ?
        `Nothing played! ${turnMessage}` :
        `Last played ${lastGameCardCount} cards as ${lastGameBluffText} Total played cards : ${playedContainer.children.length} ${turnMessage}`;
      notifyScreenReader(lastGameInfo);
    }},
    '0': { action: () => {
      let cardsInfo = "Cards in hand : ";
      if (cardContainer.children.length > 0) {
        let currentCard = cardContainer.children[0].textContent.slice(1);
        let cardCount = 1;
        for (let i = 1; i < cardContainer.children.length; i++) {
          if (cardContainer.children[i].textContent.slice(1) === currentCard) {
            cardCount++;
          } else {
            cardsInfo += `${cardCount},${currentCard}, `;
            currentCard = cardContainer.children[i].textContent.slice(1);
            cardCount = 1;
          }
        }
        cardsInfo += `${cardCount}-${currentCard}.`;
      }
      notifyScreenReader(cardsInfo);
    }}
  };

  if (actions[key]) {
    const action = actions[key];
    if (action.btn && action.btn.disabled) {
      notifyScreenReader(action.message);
    } else {
      action.action();
    }
  }
})






//SOCKETS
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
  const player = document.getElementById(`user${pos}`);
  player.innerHTML = 'You';
  notifyScreenReader(`You are in position : ${index + 1}`, "polite");
});

socket.on('STOC-SHUFFLING', () => {
  notifyScreenReader("Card is shuffling!");
  startShufflingEffect();
});

socket.on('STOC-DRAW-CARDS', (subpartition) => {
  cardContainer.innerHTML = '';
  subpartition.forEach((card) => {
    const newCard = document.createElement('div');
    newCard.className = 'col-4 col-sm-2 col-lg-1 offset-lg-0 cards ';
    newCard.id = card.suit + card.value;
    newCard.setAttribute('tabindex', '1');
    newCard.setAttribute('role', 'button');
    newCard.setAttribute('title', 'Unselected');
    newCard.selected = false;
    newCard.style.backgroundColor = "#b963ee";
    newCard.style.fontSize = "xxx-large";
    newCard.style.textAlign = "center";
    newCard.textContent = card.suit + card.value;
    cardContainer.appendChild(newCard);
  });
  listenNodeInserted = false;
  sortCards('card-container');
  listenNodeInserted = true;
  notifyScreenReader("Cards received!", "assertive");
});


socket.on('error', (error) => {
  console.error('Socket error:', error);
  notifyScreenReader('An error occurred. Please try again.', 'assertive');
});
