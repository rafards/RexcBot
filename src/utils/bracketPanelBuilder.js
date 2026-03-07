const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../data/raceState")

async function sendBracketPanel(interaction){

 let description = ""

 const rows = []

 raceState.matches.forEach((match,i)=>{

  description += `Match ${i+1}\n`
  description += `${match.player1.ign} vs ${match.player2.ign}\n\n`

  const btn1 = new ButtonBuilder()
   .setCustomId(`winner_${i}_1`)
   .setLabel(match.player1.ign)
   .setStyle(ButtonStyle.Primary)

  const btn2 = new ButtonBuilder()
   .setCustomId(`winner_${i}_2`)
   .setLabel(match.player2.ign)
   .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder().addComponents(btn1,btn2)

  rows.push(row)

 })

 const embed = new EmbedBuilder()
  .setTitle(`🏁 ROUND ${raceState.currentRound}`)
  .setDescription(description)

 const panel = await interaction.channel.send({
  embeds:[embed],
  components:rows
 })

 raceState.bracketPanelId = panel.id

}

module.exports = { sendBracketPanel }
