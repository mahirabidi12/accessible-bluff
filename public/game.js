var socket = io();
var myPosition = null;

socket.on('STO1C-SET-POSITION', (position) => {
  myPosition = position;
  console.log("My assigned position:", myPosition);
});

socket.on('STOC-AI-HINT', (hintMessage) => {
  displayHint(hintMessage);
});

function placeCard(selectedCards, bluffText, remainingCards) {
  socket.emit('CTOS-PLACE-CARD', selectedCards, bluffText, remainingCards);
}

function displayHint(hintMessage) {
  const hintBox = document.getElementById('ai-hint-box');
  hintBox.innerText = `AI Suggestion: ${hintMessage}`;
  hintBox.style.display = 'block';

  setTimeout(() => {
    hintBox.style.display = 'none';
  }, 5000);
}
