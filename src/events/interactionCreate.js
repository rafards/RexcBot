const { client } = require("../index")

const { registrationButton } = require("../interactions/buttons/registrationButton")
const { handleBracketModals } = require("../interactions/modals/bracketModals")

client.on("interactionCreate", async interaction => {

 if(interaction.isButton()){

  if(interaction.customId === "set_registration"){
   registrationButton(interaction)
  }

 }

 if(interaction.isModalSubmit()){
  handleBracketModals(interaction)
 }

})
