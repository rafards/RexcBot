const { load, save } = require("../modules/bracketState");

module.exports = async (interaction) => {

  const state = load();

  state.participants = state.participants.filter(
    id => id !== interaction.user.id
  );

  save(state);

  interaction.reply({
    content: "You left the tournament",
    ephemeral: true
  });

};
