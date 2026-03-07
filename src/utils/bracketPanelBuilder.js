const { EmbedBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

function buildBracketText(){

 let text=""

 raceState.matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "BYE"
  const p2 = m.player2?.ign || "BYE"

  let status=""

  if(m.winner){
   status=`🏆 Winner: ${m.winner.ign}`
  }

  text += `Match ${i+1}\n`
  text += `${p1} vs ${p2}\n`
  text += `${status}\n\n`

 })

 return text

}

function buildBracketEmbed(){

 return new EmbedBuilder()
  .setTitle(`🏁 ${raceState.raceName}`)
  .setDescription(`ROUND ${raceState.currentRound}`)
  .addFields({
   name:"Matches",
   value:buildBracketText()
  })

}

module.exports = { buildBracketEmbed }
