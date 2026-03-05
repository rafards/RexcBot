const fs = require("fs");
const path = require("path");

const statePath = path.join(__dirname, "../data/bracketState.json");

function loadState() {
  if (!fs.existsSync(statePath)) {
    return null;
  }

  const data = fs.readFileSync(statePath, "utf8");
  return JSON.parse(data);
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function resetState() {
  const defaultState = {
    maxSlot: null,
    participants: [],
    rounds: [],
    currentRound: 0,
    currentMatchIndex: 0,
    status: "idle",
    messageId: null,
    channelId: null
  };

  saveState(defaultState);
  return defaultState;
}

module.exports = {
  loadState,
  saveState,
  resetState
};
