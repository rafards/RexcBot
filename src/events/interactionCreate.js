const { client } = require("../index")

const { bracketButtons } = require("../interactions/buttons/bracketButtons")
const { handleBracketModals } = require("../interactions/modals/bracketModals")
const { winnerButton } = require("../interactions/buttons/winnerButton")
const { raceState } = require("../data/raceState")
const { createBracketEmbed } = require("../utils/embeds")
const { getSetupButton } = require("../utils/bracketButtons")
const { deployRegistrationButton } = require("../interactions/buttons/deployRegistrationButton")
const { joinButton } = require("../interactions/buttons/joinButton")

client.on("interactionCreate", async interaction => {

 // ===============================
 // BUTTON
 // ===============================

 if(interaction.isButton()){

  if(interaction.customId.startsWith("winner_")){
   return winnerButton(interaction)
  }

  await deployRegistrationButton(interaction)
  await joinButton(interaction)

  return bracketButtons(interaction)

 }

 // ===============================
 // MODAL
 // ===============================

 if(interaction.isModalSubmit()){

  return handleBracketModals(interaction)

 }

})
