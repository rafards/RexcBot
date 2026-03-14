const { raceState } = require("../../data/raceState")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { updateBracketPanel } = require("../../utils/bracketPanelBuilder")

async function selectChampionButton(interaction){

 // stop jika champion sudah dipilih
 if(raceState.p1 && raceState.p2 && raceState.p3){
  return interaction.reply({
   content:"Champion sudah ditentukan.",
   ephemeral:true
  })
 }

 // ===============================
 // SELECT P1
 // ===============================

 if(interaction.customId.startsWith("select_p1_")){

  const index = parseInt(interaction.customId.split("_")[2])

  const player = raceState.roundRobinPlayers[index]

  raceState.p1 = player

  const remaining = raceState.roundRobinPlayers.filter(p=>p.id !== player.id)

  const buttons = remaining.map((p,i)=>
   new ButtonBuilder()
    .setCustomId(`select_p2_${i}`)
    .setLabel(p.ign)
    .setStyle(ButtonStyle.Primary)
  )

  const row = new ActionRowBuilder().addComponents(buttons)

  return interaction.update({
   embeds:[{
    title:"Select 2nd Place (P2)"
   }],
   components:[row]
  })

 }

 // ===============================
 // SELECT P2
 // ===============================

 if(interaction.customId.startsWith("select_p2_")){

  const index = parseInt(interaction.customId.split("_")[2])

  const remaining = raceState.roundRobinPlayers.filter(p=>p.id !== raceState.p1.id)

  raceState.p2 = remaining[index]

  raceState.p3 = remaining.find(p=>p.id !== raceState.p2.id)

  const playerChannel = await interaction.client.channels.fetch(
   raceState.playerPanelChannelId
  )

  await playerChannel.send({
   embeds:[{
    title:"🏆 TOURNAMENT RESULT",
    description:
`🥇 ${raceState.p1.ign}
🥈 ${raceState.p2.ign}
🥉 ${raceState.p3.ign}`,
    color:0xFFD700
   }]
  })

  // ===============================
  // RESET BUTTON (ANTI DUPLICATE)
  // ===============================

  if(!raceState.resetMessageId){

   const resetButton = new ButtonBuilder()
    .setCustomId("reset_tournament")
    .setLabel("Reset Tournament")
    .setStyle(ButtonStyle.Danger)

   const row = new ActionRowBuilder().addComponents(resetButton)

   const msg = await interaction.channel.send({
    components:[row]
   })

   raceState.resetMessageId = msg.id
  }

  await interaction.deferUpdate()

  await updateBracketPanel(interaction.client)

 }

}

module.exports = { selectChampionButton }
