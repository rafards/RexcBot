const { load, save } = require("../modules/bracketState");

module.exports = async (interaction) => {

  const state = load();

  if (!state.participants.includes(interaction.user.id)) {

    state.participants.push(interaction.user.id);

    save(state);

  }

  interaction.reply({
    content: "Joined tournament",
    ephemeral: true
  });

};
