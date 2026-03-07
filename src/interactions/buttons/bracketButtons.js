const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder,
 StringSelectMenuBuilder
} = require("discord.js")

async function bracketButtons(interaction){

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

 if(interaction.customId === "set_registration"){

  const modal = new ModalBuilder()
   .setCustomId("registration_modal")
   .setTitle("Registration Setup")

  const typeInput = new TextInputBuilder()
   .setCustomId("race_type_input")
   .setLabel("Type (Gratis / Berbayar)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const priceInput = new TextInputBuilder()
   .setCustomId("race_price_input")
   .setLabel("Price (Isi 0 jika Gratis)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  const row1 = new ActionRowBuilder().addComponents(typeInput)
  const row2 = new ActionRowBuilder().addComponents(priceInput)

  modal.addComponents(row1,row2)

  await interaction.showModal(modal)

 }

 if(interaction.customId === "set_lap"){

  const menu = new StringSelectMenuBuilder()
   .setCustomId("lap_select")
   .setPlaceholder("Select Lap")
   .addOptions([
    { label:"1 Lap", value:"1" },
    { label:"2 Lap", value:"2" },
    { label:"3 Lap", value:"3" }
   ])

  const row = new ActionRowBuilder().addComponents(menu)

  await interaction.reply({
   content:"Select race lap",
   components:[row],
   ephemeral:true
  })

 }

}

module.exports = { bracketButtons }
