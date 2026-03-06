const { load } = require("../modules/bracketState");

module.exports = async (interaction) => {

  const state = load();

  const match = state.matches[state.currentMatch];

  interaction.reply(`Race Start: <@${match.p1}> vs <@${match.p2}>`);

};
