const { client } = require("../index")
const { handleBracketButtons } = require("../interactions/buttons/bracketButtons")
const { handleBracketModals } = require("../interactions/modals/bracketModals")

client.on("interactionCreate", async interaction => {

 if(interaction.isButton()){

  handleBracketButtons(interaction)

 }

 if(interaction.isModalSubmit()){

  handleBracketModals(interaction)

 }

})
