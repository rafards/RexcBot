const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

function buildRoundDescription(){

 let description = ""

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 raceState.matches.forEach((match,i)=>{

  const p1 = match.player1?.ign || "BYE"
  const p2 = match.player2?.ign || "BYE"

  const live = i===activeIndex && !match.winner

  const label = live
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  description += `${label}\n`
  description += `${p1} vs ${p2}\n`

  if(match.winner){
   description += `🏆 ${match.winner.ign}\n`
  }

  description += "\n"

 })

 if(raceState.oddPlayer){

  const num = raceState.matches.length + 1

  description += `Match ${num}\n`
  description += `${raceState.oddPlayer.ign} vs TBD\n`
  description += `(wait loser Match 1)\n\n`

 }

 return description

}

function buildAdminPanel(){

 const activeMatch = raceState.matches.find(m=>!m.winner)

 if(!activeMatch){

  const champion = raceState.matches[0]?.winner

  if(champion){

   return {
    embed:new EmbedBuilder()
     .setTitle("🏆 TOURNAMENT FINISHED")
     .setDescription(`Winner: ${champion.ign}`),
    components:[]
   }

  }

  return {
   embed:new EmbedBuilder()
    .setTitle("Match Finished")
    .setDescription("Waiting next round"),
   components:[]
  }

 }

 const p1 = activeMatch.player1?.ign || "BYE"
 const p2 = activeMatch.player2?.ign || "BYE"

 const embed = new EmbedBuilder()
  .setTitle("⚔ MATCH CURRENT")
  .setDescription(`${p1} vs ${p2}`)

 const btn1 = new ButtonBuilder()
  .setCustomId(`winner_${raceState.matches.indexOf(activeMatch)}_1`)
  .setLabel(p1)
  .setStyle(ButtonStyle.Primary)

 const btn2 = new ButtonBuilder()
  .setCustomId(`winner_${raceState.matches.indexOf(activeMatch)}_2`)
  .setLabel(p2)
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(btn1,btn2)

 return {
  embed,
  components:[row]
 }

}

async function startBracketPanels(client){

 const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId)
 const adminChannel = await client.channels.fetch(raceState.adminListChannelId)

 const playerPanel = await playerChannel.messages.fetch(raceState.playerPanelId)

 const baseEmbed = playerPanel.embeds[0]

 const newEmbed = EmbedBuilder.from(baseEmbed)
  .setDescription(
   baseEmbed.description + "\n\n" +
   `🏁 ROUND ${raceState.currentRound}\n\n` +
   buildRoundDescription()
  )

 await playerPanel.edit({
  embeds:[newEmbed],
  components:[]
 })

 const adminData = buildAdminPanel()

 const adminMsg = await adminChannel.send({
  embeds:[adminData.embed],
  components:adminData.components
 })

 raceState.adminMatchPanelId = adminMsg.id

}

async function updateBracketPanel(client){

 const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId)
 const adminChannel = await client.channels.fetch(raceState.adminListChannelId)

 const playerPanel = await playerChannel.messages.fetch(raceState.playerPanelId)
 const adminPanel = await adminChannel.messages.fetch(raceState.adminMatchPanelId)

 const embed = playerPanel.embeds[0]

 const newEmbed = EmbedBuilder.from(embed)
  .setDescription(
   embed.description.split("🏁 ROUND")[0] +
   `🏁 ROUND ${raceState.currentRound}\n\n` +
   buildRoundDescription()
  )

 await playerPanel.edit({
  embeds:[newEmbed],
  components:[]
 })

 const adminData = buildAdminPanel()

 await adminPanel.edit({
  embeds:[adminData.embed],
  components:adminData.components
 })

}

module.exports = {
 startBracketPanels,
 updateBracketPanel
}
