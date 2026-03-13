const { raceState } = require("../../data/raceState")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

async function selectChampionButton(interaction){

 if(!interaction.customId.startsWith("select_p1_")) return

 const index = parseInt(interaction.customId.split("_")[2])
 const champion = raceState.roundRobinPlayers[index]

 if(!champion) return

 await interaction.deferUpdate()

 const playerChannel = await interaction.client.channels.fetch(
  raceState.playerPanelChannelId
 )

 // ===============================
 // ANNOUNCE RESULT
 // ===============================

 await playerChannel.send({
  embeds:[
   {
    title:"🏆 TOURNAMENT RESULT",
    description:`Champion: **${champion.ign}**`,
    color:0xFFD700
   }
  ]
 })

 // ===============================
 // RESET BUTTON
 // ===============================

 const resetButton = new ButtonBuilder()
  .setCustomId("reset_tournament")
  .setLabel("Reset Tournament")
  .setStyle(ButtonStyle.Danger)

 const row = new ActionRowBuilder().addComponents(resetButton)

 const resetMsg = await interaction.channel.send({
  components:[row]
 })

 raceState.resetMessageId = resetMsg.id

}

module.exports = { selectChampionButton }
