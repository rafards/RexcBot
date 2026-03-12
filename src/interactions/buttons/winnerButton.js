const { raceState } = require("../../data/raceState")
const { generateNextRound } = require("../../utils/nextRoundGenerator")
const { updateBracketPanel } = require("../../utils/bracketPanelBuilder")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

async function winnerButton(interaction){

 if(!interaction.customId.startsWith("winner_")) return

 const parts = interaction.customId.split("_")

 const matchIndex = parseInt(parts[1])
 const playerIndex = parseInt(parts[2])

 const match = raceState.matches[matchIndex]

 if(!match){
  return interaction.reply({
   content:"Match tidak ditemukan",
   ephemeral:true
  })
 }

 if(match.winner){
  return interaction.reply({
   content:"Winner already set",
   ephemeral:true
  })
 }

 const winner = playerIndex===1 ? match.player1 : match.player2
 const loser  = playerIndex===1 ? match.player2 : match.player1

 match.winner = winner
 match.loser = loser

 if(loser){
  raceState.losers.push(loser)

  if(raceState.currentRound > 1){
   raceState.luckyLoserCandidates.push(loser)
  }
 }

 if(matchIndex === 0 && raceState.oddPlayer){

  raceState.matches.push({
   player1: raceState.oddPlayer,
   player2: loser,
   winner:null,
   loser:null
  })

  raceState.oddPlayer = null
 }

 await interaction.deferUpdate()

 raceState.currentMatchIndex++

 // ===============================
// SAVE MATCH RESULT TO HISTORY
// ===============================

if(!raceState.roundHistory[raceState.currentRound-1]){

 raceState.roundHistory[raceState.currentRound-1] = {
  round: raceState.currentRound,
  matches:[]
 }

}

raceState.roundHistory[raceState.currentRound-1].matches.push({
 index: matchIndex+1,
 p1: match.player1?.ign,
 p2: match.player2?.ign,
 winner: winner?.ign || null
})

 await updateBracketPanel(interaction.client)
 
 const finished = raceState.matches.every(m=>m.winner)

 if(finished && raceState.roundRobinMode){

  const players = raceState.roundRobinPlayers

  const buttons = players.map((p,i)=>
  new ButtonBuilder()
   .setCustomId(`select_p1_${i}`)
   .setLabel(p.ign)
   .setStyle(ButtonStyle.Primary)
  )

  const row = new ActionRowBuilder().addComponents(buttons)

  await interaction.channel.send({
   embeds:[{
    title:"🏁 Round Robin Finished",
    description:"Select Champion (P1)"
   }],
   components:[row]
  })

  return
 }

 if(!finished) return

 const winners = [...new Set(
  raceState.matches.map(m=>m.winner).filter(Boolean)
 )]

 if(winners.length === 1){
 return
 }

 // ===============================
// ROUND ROBIN (3 PLAYER)
// ===============================

if(winners.length === 3){

 raceState.roundRobinMode = true
 raceState.roundRobinPlayers = winners

}

// ===============================
// LUCKY LOSER
// ===============================

if(!raceState.roundRobinMode && raceState.currentRound > 1 && winners.length % 2 !== 0){

 const waitingPlayer = winners.pop()

 raceState.waitingPlayer = waitingPlayer
 raceState.luckyLoserMode = true

}

 // ===============================
 // ROUND ROBIN FINISHED
 // ===============================

 if(raceState.roundRobinMode){

  const players = raceState.roundRobinPlayers

  const embed = {
   title:"🏁 Round Robin Finished",
   description:"Select Champion",
   color:0xFFD700
  }

  const buttons = players.map((p,i)=>({
   type:2,
   style:1,
   label:p.ign,
   custom_id:`select_p1_${i}`
  }))

  await interaction.channel.send({
    embeds:[embed],
    components:[{
    type:1,
    components:buttons
   }]
  })

  return
 }

 const nextMatches = generateNextRound(winners)

 if(!nextMatches || nextMatches.length === 0){

 // ===============================
 // ANNOUNCE CHAMPION
 // ===============================

 const playerChannel = await interaction.client.channels.fetch(raceState.playerPanelChannelId)

 await playerChannel.send({
  embeds:[
   {
    title:"🏆 TOURNAMENT FINISHED",
    description:`Chamion: **${winner.ign}**`,
    color:0xFFD700
   }
  ]
 })

 const resetButton = new ButtonBuilder()
  .setCustomId("reset_tournament")
  .setLabel("Reset Tournament")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(resetButton)

 const resetMsg = await interaction.channel.send({
  components:[row]
 })

 raceState.resetMessageId = resetMsg.id

 return
 }

 raceState.matches = nextMatches
 raceState.currentRound++
 raceState.currentMatchIndex = 0

 raceState.luckyLoserCandidates = []
 raceState.luckyLoserMode = false
 raceState.waitingPlayer = null

 await updateBracketPanel(interaction.client)

}

module.exports = { winnerButton }
