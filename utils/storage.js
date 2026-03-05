const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/bracket.json");

function loadState() {
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

function saveState(state) {
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

function resetState() {
  return {
    status: "idle",
    maxSlot: 0,
    participants: [],
    rounds: [],
    currentRound: 0,
    currentMatchIndex: 0,
    messageId: null,
    channelId: null
  };
}

module.exports = { loadState, saveState, resetState };
