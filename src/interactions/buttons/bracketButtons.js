const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder
} = require("discord.js")

async function bracketButtons(interaction){

 // ===============================
 // SETUP RACE (ALL IN ONE MODAL)
 // ===============================

 if(interaction.customId === "setup_race"){

  const modal = new ModalBuilder()
   .setCustomId("setup_race_modal")
   .setTitle("Setup Race")

  const name = new TextInputBuilder()
   .setCustomId("race_name_input")
   .setLabel("Race Name")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const price = new TextInputBuilder()
   .setCustomId("race_price_input")
   .setLabel("Registration Price (0 = Gratis)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const lap = new TextInputBuilder()
   .setCustomId("lap_input")
   .setLabel("Lap (1 / 2 / 3)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const slot = new TextInputBuilder()
   .setCustomId("slot_input")
   .setLabel("Player Slot")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const time = new TextInputBuilder()
   .setCustomId("race_time_input")
   .setLabel("Race Time (Example: 20:00)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  modal.addComponents(
   new ActionRowBuilder().addComponents(name),
   new ActionRowBuilder().addComponents(price),
   new ActionRowBuilder().addComponents(lap),
   new ActionRowBuilder().addComponents(slot),
   new ActionRowBuilder().addComponents(time)
  )

  await interaction.showModal(modal)

 }

}

module.exports = { bracketButtons }
