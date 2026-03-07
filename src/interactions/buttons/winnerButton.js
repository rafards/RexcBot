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
   content:"Winner already set.",
   ephemeral:true
  })
 }

 const winner = playerIndex === 1 ? match.player1 : match.player2

 match.winner = winner

 await interaction.reply({
  content:`🏆 Winner: **${winner.name}**`
 })

 // cek apakah semua match selesai
 const finished = raceState.matches.every(m => m.winner)

 if(finished){

  const winners = raceState.matches.map(m => m.winner)

  // jika tinggal 1 → tournament selesai
  if(winners.length === 1){

   return interaction.followUp({
    content:`🏆 TOURNAMENT WINNER: **${winners[0].name}**`
   })

  }

  // generate round berikutnya
  raceState.matches = generateNextRound(raceState.matches)

  raceState.currentRound++

  let text = ""

  raceState.matches.forEach((m,i)=>{

   text += `Match ${i+1}\n`
   text += `${m.player1.name} vs ${m.player2.name}\n\n`

  })

  await interaction.followUp({

   content:`⚔️ ROUND ${raceState.currentRound}\n\n${text}`

  })

 }

}

module.exports = { winnerButton }
