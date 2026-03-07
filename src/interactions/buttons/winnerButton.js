const { raceState } = require("../../data/raceState")
const { generateNextRound } = require("../../utils/nextRoundGenerator")

async function winnerButton(interaction){

 if(!interaction.customId.startsWith("winner_")) return

 const parts = interaction.customId.split("_")

 const matchIndex = parseInt(parts[1])
 const playerIndex = parseInt(parts[2])

 const match = raceState.matches[matchIndex]

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

 raceState.losers.push(loser)

 await interaction.reply({
  content:`🏆 Winner: ${winner.ign}`
 })

 const finished = raceState.matches.every(m=>m.winner)

 if(!finished) return

 const winners = raceState.matches.map(m=>m.winner)

 if(winners.length === 1){

  return interaction.followUp({
   content:`🏆 TOURNAMENT WINNER: ${winners[0].ign}`
  })

 }

 raceState.matches = generateNextRound(raceState.matches)
 raceState.currentRound++

 let text=""

 raceState.matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "BYE"
  const p2 = m.player2?.ign || "BYE"

  text += `Match ${i+1}\n${p1} vs ${p2}\n\n`

 })

 await interaction.followUp({
  content:`⚔️ ROUND ${raceState.currentRound}\n\n${text}`
 })

}

module.exports = { winnerButton }
