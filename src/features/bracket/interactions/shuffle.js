const { load, save } = require("../modules/bracketState");
const shuffle = require("../modules/bracketShuffle");

module.exports = async (interaction) => {

  const state = load();

  state.participants = shuffle(state.participants);

  save(state);

  interaction.reply({
    content: "Players shuffled",
    ephemeral: true
  });

};
