const { EmbedBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

function buildBracketEmbed(){

 let text=""

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 raceState.matches.forEach((m,i)=>{

  const p1 = m.player1?.ign || "BYE"
  const p2 = m.player2?.ign || "BYE"

  const live = i===activeIndex && !m.winner

  const title = live
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  text += `${title}\n`
  text += `${p1} vs ${p2}\n`

  if(m.winner){
   text += `🏆 ${m.winner.ign}\n`
  }

  text += "\n"

 })

 return new EmbedBuilder()
  .setTitle("🏁 TOURNAMENT BRACKET")
  .setDescription(`🏁 ROUND ${raceState.currentRound}\n\n${text}`)
}

async function sendBracketPanel(client){

 const channel = await client.channels.fetch(raceState.playerPanelChannelId)

 const embed = buildBracketEmbed()

 const msg = await channel.send({
  embeds:[embed]
 })

 raceState.bracketMessageId = msg.id
}

async function updateBracketPanel(client){

 const channel = await client.channels.fetch(raceState.playerPanelChannelId)

 const msg = await channel.messages.fetch(raceState.bracketMessageId)

 const embed = buildBracketEmbed()

 await msg.edit({
  embeds:[embed]
 })

}

module.exports={
 sendBracketPanel,
 updateBracketPanel
}
