const { raceState } = require("../../data/raceState")
const { generateNextRound } = require("../../utils/nextRoundGenerator")
const { updateBracketPanel } = require("../../utils/bracketPanelBuilder")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

// ===============================
// RESET BUTTON HELPER
// ===============================

async function sendResetButton(interaction){

 if(raceState.resetMessageId) return

 const resetButton = new ButtonBuilder()
  .setCustomId("reset_tournament")
  .setLabel("Reset Tournament")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(resetButton)

 const resetMsg = await interaction.channel.send({
  components:[row]
 })

 raceState.resetMessageId = resetMsg.id
}

// ===============================
// CALCULATE TOP 3
// ===============================

function calculateTop3(){

 const lastRound = raceState.roundHistory[raceState.roundHistory.length-1]
 if(!lastRound) return null

 const finalMatch = lastRound.matches[lastRound.matches.length-1]

 const champion = finalMatch.winner

 const runnerUp = finalMatch.p1 === champion
  ? finalMatch.p2
  : finalMatch.p1

 const previousRound = raceState.roundHistory[raceState.roundHistory.length-2]

 let thirdPlace = null

 if(previousRound){

  const semifinalLosers = previousRound.matches
   .map(m=>{
    if(!m.winner) return null
    return m.p1 === m.winner ? m.p2 : m.p1
   })
   .filter(Boolean)

  thirdPlace = semifinalLosers[0] || null
 }

 return {
  champion,
  runnerUp,
  thirdPlace
 }

}

// ===============================
// WINNER BUTTON
// ===============================

async function winnerButton(interaction){

 if(!interaction.customId.startsWith("winner_")) return

 const parts = interaction.customId.split("_")

 const matchIndex = parseInt(parts[1])
 const playerIndex = parseInt(parts[2])

 const match = raceState.matches.find((m,i)=>i === matchIndex)

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

 // ===============================
 // SAVE LOSER
 // ===============================

 if(loser){

  raceState.losers.push(loser)

  if(raceState.currentRound > 1){

   const exists = raceState.luckyLoserCandidates.find(p=>p.id === loser.id)

   if(!exists){
    raceState.luckyLoserCandidates.push(loser)
   }

  }

 }

 // ===============================
 // HANDLE ODD PLAYER
 // ===============================

 if(matchIndex === 0 && raceState.oddPlayer){

  const waitingMatch = raceState.matches.find(
   m => m.player1 === raceState.oddPlayer && m.player2 === null
  )

  if(waitingMatch){
   waitingMatch.player2 = loser
  }

  raceState.oddPlayer = null
 }

 await interaction.deferUpdate()

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
  p2: match.player2 ? match.player2.ign : "Loser Match 1",
  winner: winner?.ign || null
 })

 await updateBracketPanel(interaction.client)

 const finished = raceState.matches.every(m=>m.winner)

 // ===============================
 // CHECK LUCKY LOSER TRIGGER
 // ===============================

 if(
  raceState.currentRound > 1 &&
  raceState.matches.some(m => m.player2 === null)
 ){

  const remainingMatches = raceState.matches.filter(m=>!m.winner)

  if(remainingMatches.length === 1){

   raceState.waitingPlayer = remainingMatches[0].player1
   raceState.luckyLoserMode = true

   await updateBracketPanel(interaction.client)
   return
  }

 }

 if(!finished) return

 // ===============================
 // AUTO LUCKY LOSER TRIGGER
 // ===============================

 const waitingMatch = raceState.matches.find(m=>m.player2 === null)

 if(
  raceState.currentRound > 1 &&
  waitingMatch
 ){

  const remainingMatches = raceState.matches.filter(m=>!m.winner)

  if(remainingMatches.length === 1){

   raceState.waitingPlayer = waitingMatch.player1
   raceState.luckyLoserMode = true

   await updateBracketPanel(interaction.client)
   return
  }

 }

 // ===============================
 // GET ROUND WINNERS
 // ===============================

 const winners = raceState.matches
  .map(m=>m.winner)
  .filter(Boolean)

 // ===============================
 // TOURNAMENT FINISHED
 // ===============================

 if(winners.length === 1){

  const result = calculateTop3()

  const playerChannel = await interaction.client.channels.fetch(
   raceState.playerPanelChannelId
  )

  await playerChannel.send({
   embeds:[{
    title:"🏆 TOURNAMENT RESULT",
    description:
`🥇 ${result?.champion || winners[0].ign}
🥈 ${result?.runnerUp || "TBD"}
🥉 ${result?.thirdPlace || "TBD"}`,
    color:0xFFD700
   }]
  })

  await sendResetButton(interaction)

  return
 }

 // ===============================
 // ROUND ROBIN (3 PLAYER)
 // ===============================

 if(winners.length === 3){

  raceState.roundRobinMode = true
  raceState.roundRobinPlayers = winners

  const nextMatches = generateNextRound(winners)

  raceState.matches = nextMatches
  raceState.currentMatchIndex = 0

  await updateBracketPanel(interaction.client)

  return
 }

 // ===============================
 // LUCKY LOSER (GANJIL)
 // ===============================

 if(
  raceState.currentRound > 1 &&
  winners.length >= 5 &&
  winners.length % 2 !== 0
 ){

  const waitingPlayer = winners.pop()

  raceState.waitingPlayer = waitingPlayer
  raceState.luckyLoserMode = true

  return
 }

 // ===============================
 // NEXT ROUND
 // ===============================

 const nextMatches = generateNextRound(winners)

 if(!nextMatches || nextMatches.length === 0){

  const playerChannel = await interaction.client.channels.fetch(
   raceState.playerPanelChannelId
  )

  await playerChannel.send({
   embeds:[
    {
     title:"🏆 TOURNAMENT RESULT",
     description:`🥇 ${winners[0].ign}`,
     color:0xFFD700
    }
   ]
  })

  await sendResetButton(interaction)

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
