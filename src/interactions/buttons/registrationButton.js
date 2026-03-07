const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder
} = require("discord.js")

async function registrationButton(interaction){

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

module.exports = { registrationButton }
