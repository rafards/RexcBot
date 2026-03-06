const { load, save } = require("../modules/bracketState");

module.exports = async (interaction, client, player) => {

  const state = load();

  const match = state.matches[state.currentMatch];

  const winner = player === 1 ? match.p1 : match.p2;

  match.winner = winner;

  state.currentMatch++;

  save(state);

  interaction.reply(`Winner: <@${winner}>`);

};
