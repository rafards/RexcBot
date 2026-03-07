const { client } = require("../index")

const { registrationButton } = require("../interactions/buttons/registrationButton")
const { bracketButtons } = require("../interactions/buttons/bracketButtons")
const { handleBracketModals } = require("../interactions/modals/bracketModals")
const { deployRaceButton } = require("../interactions/buttons/deployRaceButton")
const { winnerButton } = require("../interactions/buttons/winnerButton")
const { raceState } = require("../data/raceState")
const { createBracketEmbed } = require("../utils/embeds")
const { getSetupButton } = require("../utils/bracketButtons")
const { lapSelect } = require("../interactions/selects/bracketSetupSelects")

client.on("interactionCreate", async interaction => {

 // ===============================
 // BUTTON
 // ===============================

 if(interaction.isButton()){

  if(interaction.customId === "register_player"){
   return registrationButton(interaction)
  }

  if(interaction.customId.startsWith("winner_")){
   return winnerButton(interaction)
  }

  if(interaction.customId === "deploy_race"){
   return deployRaceButton(interaction)
  }

  return bracketButtons(interaction)

 }

 // ===============================
 // MODAL
 // ===============================

 if(interaction.isModalSubmit()){

  return handleBracketModals(interaction)

 }

})
