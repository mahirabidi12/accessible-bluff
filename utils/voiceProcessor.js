const gameState = {}; 

function processVoiceCommand(command, playerId) {
    command = command.toLowerCase();

    if (command.includes("play")) {
        let card = command.split("play ")[1];
        return `Playing ${card}`;
    } 
    else if (command.includes("bluff")) {
        let bluffCard = command.split("bluff with ")[1];
        return `Bluffing with ${bluffCard}`;
    } 
    else if (command.includes("challenge")) {
        return "Challenging the last player!";
    } 
    else if (command.includes("pass")) {
        return "You passed the turn.";
    } 
    else if (command.includes("game status")) {
        return "Fetching current game status...";
    } 
    else {
        return "Invalid command. Try again.";
    }
}

module.exports = { processVoiceCommand };
