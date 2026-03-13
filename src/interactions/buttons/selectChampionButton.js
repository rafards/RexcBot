const { raceState } = require("../../data/raceState")
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")

async function selectChampionButton(interaction){

 // ===============================
 // SELECT P1
 // ===============================

 if(interaction.customId.startsWith("select_p1_")){

  const index = parseInt(interaction.customId.split("_")[2])
  const player = raceState.roundRobinPlayers[index]

  raceState.p1 = player

  const remaining = raceState.roundRobinPlayers.filter(p=>p!==player)

  const buttons = remaining.map((p,i)=>({
   type:2,
   style:1,
   label:p.ign,
   custom_id:`select_p2_${i}`
  }))

  if(buttons.length === 0){
   return interaction.reply({
    content:"No players available",
    ephemeral:true
   })
  }

  return interaction.update({
   embeds:[{
    title:"Select 2nd Place (P2)"
   }],
   components:[{
    type:1,
    components:buttons
   }]
  })

 }

 // ===============================
 // SELECT P2
 // ===============================

 if(interaction.customId.startsWith("select_p2_")){

  const index = parseInt(interaction.customId.split("_")[2])

  const remaining = raceState.roundRobinPlayers.filter(p=>p!==raceState.p1)

  raceState.p2 = remaining[index]
  raceState.p3 = remaining.find(p=>p!==raceState.p2)

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

  await interaction.update({
   embeds:[{
    title:"Result Locked"
   }],
   components:[]
  })

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

}

module.exports = { selectChampionButton }
