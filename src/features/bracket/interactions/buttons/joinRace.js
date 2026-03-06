const bracketRegister = require("../../features/bracket/bracketRegister");

module.exports = async (interaction) => {

  bracketRegister.join(interaction);

};
