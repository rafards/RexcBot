const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder,
 StringSelectMenuBuilder
} = require("discord.js")

async function bracketButtons(interaction){

 // ===============================
 // SET RACE NAME
 // ===============================

 if(interaction.customId === "set_race_name"){

  const modal = new ModalBuilder()
   .setCustomId("race_name_modal")
   .setTitle("Set Race Name")

  const raceInput = new TextInputBuilder()
   .setCustomId("race_name_input")
   .setLabel("Race Name")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(raceInput)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // SET REGISTRATION
 // ===============================

 if(interaction.customId === "set_registration"){

 const modal = new ModalBuilder()
  .setCustomId("registration_modal")
  .setTitle("Registration Price")

 const priceInput = new TextInputBuilder()
  .setCustomId("race_price_input")
  .setLabel("Registration Price (0 = Gratis)")
  .setStyle(TextInputStyle.Short)
  .setRequired(true)

 const row = new ActionRowBuilder().addComponents(priceInput)

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

 const lapInput = new TextInputBuilder()
  .setCustomId("lap_input")
  .setLabel("Total Lap (1 / 2 / 3)")
  .setStyle(TextInputStyle.Short)
  .setRequired(true)

 const row = new ActionRowBuilder().addComponents(lapInput)

 modal.addComponents(row)

 await interaction.showModal(modal)

}

 // ===============================
 // SET PLAYER SLOT
 // ===============================

 if(interaction.customId === "set_slot"){

  const modal = new ModalBuilder()
   .setCustomId("slot_modal")
   .setTitle("Set Player Slot")

  const slotInput = new TextInputBuilder()
   .setCustomId("slot_input")
   .setLabel("Total Player Slot")
   .setStyle(TextInputStyle.Short)
   .setPlaceholder("Example: 8 / 16")
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(slotInput)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // SET RACE TIME
 // ===============================

 if(interaction.customId === "set_race_time"){

  const modal = new ModalBuilder()
   .setCustomId("race_time_modal")
   .setTitle("Set Race Time")

  const timeInput = new TextInputBuilder()
   .setCustomId("race_time_input")
   .setLabel("Race Time")
   .setStyle(TextInputStyle.Short)
   .setPlaceholder("Example: 20:00")
   .setRequired(true)

  const row = new ActionRowBuilder().addComponents(timeInput)

  modal.addComponents(row)

  await interaction.showModal(modal)

 }

 // ===============================
 // DEPLOY RACE
 // ===============================

 if(interaction.customId === "deploy_race"){

  await interaction.reply({
   content:"🚀 Race system deployed.\nBracket will be generated after players filled.",
   ephemeral:true
  })

 }

}

module.exports = { bracketButtons }
