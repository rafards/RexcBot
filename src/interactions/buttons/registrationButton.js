const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder
} = require("discord.js")

const { raceState } = require("../../data/raceState")

async function registrationButton(interaction){

 if(interaction.customId !== "register_player") return

 // cek slot
 if(raceState.slot && raceState.players.length >= raceState.slot){

  return interaction.reply({
   content:"❌ Player slot already full.",
   ephemeral:true
  })

 }

 // cek sudah register
 const already = raceState.players.find(p => p.id === interaction.user.id)

 if(already){

  return interaction.reply({
   content:"⚠️ You already registered.",
   ephemeral:true
  })

 }

 const modal = new ModalBuilder()
  .setCustomId("player_register_modal")
  .setTitle("Player Registration")

 const nameInput = new TextInputBuilder()
  .setCustomId("player_name")
  .setLabel("Player Name")
  .setStyle(TextInputStyle.Short)
  .setRequired(true)

 const ignInput = new TextInputBuilder()
  .setCustomId("player_ign")
  .setLabel("In Game Name")
  .setStyle(TextInputStyle.Short)
  .setRequired(true)

 const row1 = new ActionRowBuilder().addComponents(nameInput)
 const row2 = new ActionRowBuilder().addComponents(ignInput)

 modal.addComponents(row1,row2)

 await interaction.showModal(modal)

}

module.exports = { registrationButton }
