const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

function buildRoundEmbed(){

 let description = ""

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 raceState.matches.forEach((match,i)=>{

  const p1 = match.player1?.ign || "BYE"
  const p2 = match.player2?.ign || "BYE"

  const live = i===activeIndex && !match.winner

  const title = live
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  description += `${title}\n`
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

 return new EmbedBuilder()
  .setTitle(`🏁 ROUND ${raceState.currentRound}`)
  .setDescription(description || "Waiting match...")

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

async function sendRoundPanel(client){

 const playerChannel = await client.channels.fetch(raceState.playerPanelChannelId)

 const embed = buildRoundEmbed()

 await playerChannel.send({
  embeds:[embed]
 })

}

async function updateBracketPanel(client){

 const adminChannel = await client.channels.fetch(raceState.panelChannelId)

 const adminPanel = await adminChannel.messages.fetch(raceState.adminMatchPanelId)

 const adminData = buildAdminPanel()

 await adminPanel.edit({
  embeds:[adminData.embed],
  components:adminData.components
 })

}

function buildFullTournamentEmbed(){

 let description = ""

 description += "──────────────\n\n"

 raceState.roundHistory.forEach(round => {

  description += `🏁 ROUND ${round.round}\n\n`

  round.matches.forEach(m => {

   description += `Match ${m.index}\n`
   description += `${m.p1} vs ${m.p2}\n`

   if(m.winner){
    description += `🏆 ${m.winner}\n`
   }

   description += "\n"

  })

 })

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 raceState.matches.forEach((match,i)=>{

  const p1 = match.player1?.ign || "BYE"
  const p2 = match.player2?.ign || "BYE"

  const live = i===activeIndex && !match.winner

  const label = live
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  description += `${label}\n`
  description += `${p1} vs ${p2}\n\n`

 })

 return description
}

module.exports = {
 sendRoundPanel,
 updateBracketPanel
}
