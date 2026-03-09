const { raceState } = require("../../data/raceState")
const { generateNextRound } = require("../../utils/nextRoundGenerator")
const { updateBracketPanel } = require("../../utils/bracketPanelBuilder")
const { updateRegistrationPanels } = require("../../utils/updateRegistrationPanels")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { sendRoundPanel } = require("../../utils/bracketPanelBuilder")

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


 // =========================
 // SAVE RESULT
 // =========================

 match.winner = winner
 match.loser = loser

 // =========================
// COUNT WIN / LOSE
// =========================

if(winner){

 if(!winner.winCount) winner.winCount = 0
 winner.winCount++

}

if(loser){

 if(!loser.loseCount) loser.loseCount = 0
 loser.loseCount++

}

 if(loser){
  raceState.losers.push(loser)
 }

 // update player list realtime
 await updateRegistrationPanels(interaction)

 // =========================
 // BYE SYSTEM
 // =========================

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

 await updateBracketPanel(interaction.client)

 const finished = raceState.currentMatchIndex >= raceState.matches.length

 if(!finished) return


 // ===============================
 // ROUND FINISHED
 // ===============================

 const nextMatches = generateNextRound(raceState.matches)

if(!nextMatches || nextMatches.length === 0){

 const resetButton = new ButtonBuilder()
  .setCustomId("reset_tournament")
  .setLabel("Reset Tournament")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(resetButton)

 await interaction.channel.send({
  components:[row]
 })

 return
}

raceState.roundHistory.push({
 round: raceState.currentRound,
 matches: raceState.matches.map((m,i)=>({
  index:i+1,
  p1:m.player1?.ign,
  p2:m.player2?.ign,
  winner:m.winner?.ign || null
 }))
})

raceState.matches = nextMatches
raceState.currentRound++
raceState.currentMatchIndex = 0

await sendRoundPanel(interaction.client)
await updateBracketPanel(interaction.client)

}

module.exports = { winnerButton }
