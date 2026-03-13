const { client } = require("../index")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
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
const { updateBracketPanel } = require("../utils/bracketPanelBuilder")
const { selectChampionButton } = require("../interactions/buttons/selectChampionButton")

client.on("interactionCreate", async interaction => {

 // ===============================
// SELECT MENU
// ===============================

if(interaction.isStringSelectMenu()){

 if(interaction.customId === "select_lucky_loser"){

  const index = parseInt(interaction.values[0])

  if(isNaN(index)){
   return interaction.reply({
    content:"No lucky loser available.",
    ephemeral:true
   })
  }

  const lucky = raceState.luckyLoserCandidates[index]

  if(!lucky){
   return interaction.reply({
    content:"Invalid lucky loser.",
    ephemeral:true
   })
  }

  if(lucky.id === raceState.waitingPlayer?.id){
   return interaction.reply({
    content:"Lucky loser cannot be the same as waiting player.",
    ephemeral:true
   })
  }

  const waitingMatch = raceState.matches.find(
   m => m.player1 === raceState.waitingPlayer && m.player2 === null
  )

  if(waitingMatch){
   waitingMatch.player2 = lucky
  }

  raceState.luckyLoserMode = false
  raceState.luckyLoserCandidates = []

  await interaction.deferUpdate()

  return updateBracketPanel(interaction.client)

 }

}

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

 if(interaction.customId === "fill_test_players"){
  return fillTestPlayersButton(interaction)
 }

 if(interaction.customId === "reset_tournament"){
  return resetTournamentButton(interaction)
 }

 if(
  interaction.customId.startsWith("select_p1_") ||
  interaction.customId.startsWith("select_p2_")
 ){
  return selectChampionButton(interaction)
 }

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
