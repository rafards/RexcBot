const { client } = require("../index")

const { registrationButton } = require("../interactions/buttons/registrationButton")
const { bracketButtons } = require("../interactions/buttons/bracketButtons")
const { handleBracketModals } = require("../interactions/modals/bracketModals")

client.on("interactionCreate", async interaction => {

 // ===============================
 // BUTTON HANDLER
 // ===============================

 if(interaction.isButton()){

  await bracketButtons(interaction)
  await registrationButton(interaction)

 }

 // ===============================
 // MODAL HANDLER
 // ===============================

 if(interaction.isModalSubmit()){

  await handleBracketModals(interaction)

 }

})
