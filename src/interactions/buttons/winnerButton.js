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

 await updateBracketPanel(interaction.client)

 // ===============================
// SAVE MATCH RESULT TO HISTORY
// ===============================

if(!raceState.roundHistory[raceState.currentRound-1]){

 raceState.roundHistory.push({
  round: raceState.currentRound,
  matches:[]
 })

}

raceState.roundHistory[raceState.currentRound-1].matches.push({
 index: matchIndex+1,
 p1: match.player1?.ign,
 p2: match.player2?.ign,
 winner: winner?.ign || null
})

 const finished = raceState.matches.every(m=>m.winner)

 if(!finished) return

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

 raceState.matches = nextMatches
 raceState.currentRound++
 raceState.currentMatchIndex = 0

 await updateBracketPanel(interaction.client)

}

module.exports = { winnerButton }
