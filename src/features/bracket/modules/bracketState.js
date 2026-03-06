const fs = require("fs");

const path = "./data/bracketState.json";

function load() {

  if (!fs.existsSync(path)) return null;

  return JSON.parse(fs.readFileSync(path));

}

function save(data) {

  fs.writeFileSync(path, JSON.stringify(data, null, 2));

}

module.exports = { load, save };
