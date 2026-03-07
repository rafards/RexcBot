const { raceState } = require("../../data/raceState")

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

}

module.exports = { winnerButton }
