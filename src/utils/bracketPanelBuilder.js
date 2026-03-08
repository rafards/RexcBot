const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

// ===============================
// BUILD EMBED
// ===============================

function buildBracketEmbed(){

 let description = ""

 raceState.matches.forEach((match,i)=>{

  const p1 = match.player1?.ign || "BYE"
  const p2 = match.player2?.ign || "BYE"

  const winner = match.winner ? `🏆 ${match.winner.ign}` : ""

  description += `Match ${i+1}\n`
  description += `${p1} vs ${p2}\n`

  if(winner){
   description += `${winner}\n`
  }

  description += `\n`

 })

 return new EmbedBuilder()
  .setTitle(`🏁 ROUND ${raceState.currentRound}`)
  .setDescription(description || "Waiting match...")
}


// ===============================
// BUILD BUTTONS (ONLY ACTIVE MATCH)
// ===============================

function buildMatchButtons(){

 const matchIndex = raceState.currentMatchIndex
 const match = raceState.matches[matchIndex]

 if(!match) return []

 const p1 = match.player1?.ign || "BYE"
 const p2 = match.player2?.ign || "BYE"

 const btn1 = new ButtonBuilder()
  .setCustomId(`winner_${matchIndex}_1`)
  .setLabel(p1)
  .setStyle(ButtonStyle.Primary)

 const btn2 = new ButtonBuilder()
  .setCustomId(`winner_${matchIndex}_2`)
  .setLabel(p2)
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(btn1,btn2)

 return [row]

}


// ===============================
// SEND PANEL
// ===============================

async function sendBracketPanel(interaction){

 const embed = buildBracketEmbed()
 const rows = buildMatchButtons()

 const panel = await interaction.channel.send({
  embeds:[embed],
  components:rows
 })

 raceState.bracketPanelId = panel.id
 raceState.bracketChannelId = interaction.channel.id

}


// ===============================
// UPDATE PANEL
// ===============================

async function updateBracketPanel(client){

 const channel = await client.channels.fetch(raceState.bracketChannelId)
 const panel = await channel.messages.fetch(raceState.bracketPanelId)

 const embed = buildBracketEmbed()
 const rows = buildMatchButtons()

 await panel.edit({
  embeds:[embed],
  components:rows
 })

}

module.exports = {
 sendBracketPanel,
 updateBracketPanel,
 buildBracketEmbed
}
