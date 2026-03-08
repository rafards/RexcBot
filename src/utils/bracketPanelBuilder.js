const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

// ===============================
// BUILD PLAYER BRACKET
// ===============================

function buildPlayerBracket(){

 let description = ""

 const activeIndex = raceState.matches.findIndex(m => !m.winner)

 raceState.matches.forEach((match,i)=>{

  const p1 = match.player1?.ign || "BYE"
  const p2 = match.player2?.ign || "BYE"

  const isLive = i === activeIndex && !match.winner

  const label = isLive
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  const winner = match.winner ? `🏆 ${match.winner.ign}` : ""

  description += `${label}\n`
  description += `${p1} vs ${p2}\n`

  if(winner){
   description += `${winner}\n`
  }

  description += `\n`

 })


 // ===============================
 // SHOW BYE MATCH
 // ===============================

 if(raceState.oddPlayer){

  const matchNumber = raceState.matches.length + 1

  description += `Match ${matchNumber}\n`
  description += `${raceState.oddPlayer.ign} vs TBD\n`
  description += `(wait loser Match 1)\n\n`

 }

 return new EmbedBuilder()
  .setTitle(`🏁 ROUND ${raceState.currentRound}`)
  .setDescription(description || "Waiting match...")

}


 // ===============================
 // SHOW BYE MATCH (PLAYER GANJIL)
 // ===============================

 if(raceState.oddPlayer){

  const matchNumber = raceState.matches.length + 1

  description += `Match ${matchNumber}\n`
  description += `${raceState.oddPlayer.ign} vs TBD\n`
  description += `(wait loser Match 1)\n\n`

 }

 return new EmbedBuilder()
  .setTitle(`🏁 ROUND ${raceState.currentRound}`)
  .setDescription(description || "Waiting match...")

}


// ===============================
// BUILD ADMIN PANEL
// ===============================

function buildAdminPanel(){

 const activeMatch = raceState.matches.find(m=>!m.winner)

 if(!activeMatch){

 const champion = raceState.matches[0]?.winner

 if(champion){

  return{
   embed:new EmbedBuilder()
    .setTitle("🏆 TOURNAMENT FINISHED")
    .setDescription(`Winner: ${champion.ign}`),
   components:[]
  }

 }

 return{
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


// ===============================
// SEND PANELS
// ===============================

async function sendBracketPanel(interaction){

 const playerChannel = interaction.guild.channels.cache.find(
  c => c.name === "info-race"
 )

 const adminChannel = interaction.guild.channels.cache.find(
  c => c.name === "setup-bot"
 )

 const playerEmbed = buildPlayerBracket()

 const adminPanel = buildAdminPanel()

 const playerMsg = await playerChannel.send({
  embeds:[playerEmbed]
 })

 const adminMsg = await adminChannel.send({
  embeds:[adminPanel.embed],
  components:adminPanel.components
 })

 raceState.bracketPanelId = playerMsg.id
 raceState.bracketChannelId = playerChannel.id

 raceState.adminMatchPanelId = adminMsg.id

}


// ===============================
// UPDATE PANELS
// ===============================

async function updateBracketPanel(client){

 const playerChannel = await client.channels.fetch(raceState.bracketChannelId)
 const adminChannel = await client.channels.fetch(raceState.panelChannelId)

 const playerPanel = await playerChannel.messages.fetch(raceState.bracketPanelId)
 const adminPanel = await adminChannel.messages.fetch(raceState.adminMatchPanelId)

 const playerEmbed = buildPlayerBracket()

 const adminData = buildAdminPanel()

 await playerPanel.edit({
  embeds:[playerEmbed]
 })

 await adminPanel.edit({
  embeds:[adminData.embed],
  components:adminData.components
 })

}

module.exports = {
 sendBracketPanel,
 updateBracketPanel
}
