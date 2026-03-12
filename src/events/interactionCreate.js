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
const { updateBracketPanel } = require("../utils/bracketPanelBuilder")

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

 if(interaction.customId === "fill_test_players"){
  return fillTestPlayersButton(interaction)
 }

 if(interaction.customId === "reset_tournament"){
  return resetTournamentButton(interaction)
 }

 // ===============================
 // SELECT MENU
 // ===============================
 
 if(interaction.isStringSelectMenu()){
 
  if(interaction.customId === "select_lucky_loser"){
 
   const index = parseInt(interaction.values[0])
 
   const lucky = raceState.luckyLoserCandidates[index]
 
   raceState.matches.push({
    player1: raceState.waitingPlayer,
    player2: lucky,
    winner:null,
    loser:null
   })
 
   raceState.luckyLoserMode = false
   raceState.luckyLoserCandidates = []
 
   await interaction.deferUpdate()
 
   return updateBracketPanel(interaction.client)
 
  }
 
 }

 if(interaction.customId.startsWith("select_p1_")){

 const index = parseInt(interaction.customId.split("_")[2])
 const player = raceState.roundRobinPlayers[index]

 raceState.p1 = player

 const remaining = raceState.roundRobinPlayers.filter(p=>p!==player)

 const buttons = remaining.map((p,i)=>({
  type:2,
  style:1,
  label:p.ign,
  custom_id:`select_p2_${i}`
 }))

 await interaction.update({
  embeds:[{
   title:"Select 2nd Place (P2)"
  }],
  components:[{
   type:1,
   components:buttons
  }]
 })

 return
 }

 if(interaction.customId.startsWith("select_p2_")){

  const index = parseInt(interaction.customId.split("_")[2])

  const remaining = raceState.roundRobinPlayers.filter(p=>p!==raceState.p1)

  raceState.p2 = remaining[index]

  raceState.p3 = remaining.find(p=>p!==raceState.p2)

  const playerChannel = await interaction.client.channels.fetch(raceState.playerPanelChannelId)

  await playerChannel.send({
   embeds:[{
    title:"🏆 TOURNAMENT RESULT",
    description:
   `🥇 ${raceState.p1.ign}
   🥈 ${raceState.p2.ign}
   🥉 ${raceState.p3.ign}`,
    color:0xFFD700
   }]
  })

  await interaction.update({
   embeds:[{
    title:"Result Locked"
   }],
   components:[]
  })

  return
 }

 if(interaction.customId.startsWith("winner_")){
  return winnerButton(interaction)
 }

 if(interaction.customId.startsWith("lucky_")){

  const index = parseInt(interaction.customId.split("_")[1])

  const lucky = raceState.luckyLoserCandidates[index]

  raceState.matches.push({
   player1: raceState.waitingPlayer,
   player2: lucky,
   winner:null,
   loser:null
  })

  raceState.luckyLoserMode = false
  raceState.luckyLoserCandidates = []

  await interaction.deferUpdate()

  return updateBracketPanel(interaction.client)
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
