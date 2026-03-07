const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder
} = require("discord.js")

async function bracketButtons(interaction){

 // ===============================
 // SET RACE NAME
 // ===============================

 if(interaction.customId === "set_race_name"){

  const modal = new ModalBuilder()
   .setCustomId("race_name_modal")
   .setTitle("Set Race Name")

  const input = new TextInputBuilder()
   .setCustomId("race_name_input")
   .setLabel("Race Name")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(input)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // SET REGISTRATION PRICE
 // ===============================

 if(interaction.customId === "set_registration"){

  const modal = new ModalBuilder()
   .setCustomId("registration_modal")
   .setTitle("Registration Price")

  const input = new TextInputBuilder()
   .setCustomId("race_price_input")
   .setLabel("Price (0 = Gratis)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(input)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // SET LAP
 // ===============================

 if(interaction.customId === "set_lap"){

  const modal = new ModalBuilder()
   .setCustomId("lap_modal")
   .setTitle("Set Lap")

  const input = new TextInputBuilder()
   .setCustomId("lap_input")
   .setLabel("Lap (1 / 2 / 3)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(input)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // SET SLOT
 // ===============================

 if(interaction.customId === "set_slot"){

  const modal = new ModalBuilder()
   .setCustomId("slot_modal")
   .setTitle("Set Player Slot")

  const input = new TextInputBuilder()
   .setCustomId("slot_input")
   .setLabel("Total Player")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(input)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // SET TIME
 // ===============================

 if(interaction.customId === "set_race_time"){

  const modal = new ModalBuilder()
   .setCustomId("race_time_modal")
   .setTitle("Set Race Time")

  const input = new TextInputBuilder()
   .setCustomId("race_time_input")
   .setLabel("Race Time (Example: 20:00)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(input)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

}

module.exports = { bracketButtons }
