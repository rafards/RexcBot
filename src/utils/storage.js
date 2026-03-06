const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../data/bracketConfig.json");
const playersPath = path.join(__dirname, "../../data/bracketPlayers.json");
const matchesPath = path.join(__dirname, "../../data/bracketMatches.json");

function read(file) {
  return JSON.parse(fs.readFileSync(file));
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {

  // CONFIG
  getConfig() {
    return read(configPath);
  },

  saveConfig(data) {
    write(configPath, data);
  },

  // PLAYERS
  getPlayers() {
    return read(playersPath);
  },

  savePlayers(data) {
    write(playersPath, data);
  },

  // MATCHES
  getMatches() {
    return read(matchesPath);
  },

  saveMatches(data) {
    write(matchesPath, data);
  }

};
