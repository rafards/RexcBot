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

 // =========================
 // SAVE RESULT
 // =========================

 match.winner = winner
 match.loser = loser

 if(loser){
  raceState.losers.push(loser)
 }

 // =========================
 // BYE SYSTEM
 // =========================
 // jika ada player ganjil, dia akan melawan loser match1

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

 // pindah ke match berikutnya
 raceState.currentMatchIndex++

 // update panel
 await updateBracketPanel(interaction.client)

 const finished = raceState.currentMatchIndex >= raceState.matches.length

 if(!finished) return


 // ===============================
 // ROUND FINISHED
 // ===============================

 const nextMatches = generateNextRound(raceState.matches)

 if(!nextMatches || nextMatches.length === 0){

  const champion = raceState.matches[0]?.winner

  const resetButton = new ButtonBuilder()
   .setCustomId("reset_tournament")
   .setLabel("Reset Tournament")
   .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder().addComponents(resetButton)

  await interaction.channel.send({
   content:`🏆 TOURNAMENT WINNER: ${champion?.ign || "Unknown"}`,
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
