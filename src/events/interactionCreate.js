const { client } = require("../index")

const { bracketButtons } = require("../interactions/buttons/bracketButtons")
const { handleBracketModals } = require("../interactions/modals/bracketModals")
const { winnerButton } = require("../interactions/buttons/winnerButton")
const { raceState } = require("../data/raceState")
const { createBracketEmbed } = require("../utils/embeds")
const { getSetupButton } = require("../utils/bracketButtons")
const { deployRegistrationButton } = require("../interactions/buttons/deployRegistrationButton")
const { playerButton } = require("../interactions/buttons/playerButton")
const { fillTestPlayersButton } = require("../interactions/buttons/fillTestPlayersButton")
const { resetTournamentButton } = require("../interactions/buttons/resetTournamentButton")

client.on("interactionCreate", async interaction => {

 // ===============================
 // BUTTON
 // ===============================

 if(interaction.isButton()){

 if(interaction.customId === "deploy_registration"){
  return deployRegistrationButton(interaction)
 }

 if(interaction.customId === "join_race" || interaction.customId === "leave_race"){
  return playerButton(interaction)
 }

 await resetTournamentButton(interaction)
 await fillTestPlayersButton(interaction)

 if(interaction.customId.startsWith("winner_")){
  return winnerButton(interaction)
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
