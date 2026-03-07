const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder
} = require("discord.js")

function createTimeModal() {

 const modal = new ModalBuilder()
  .setCustomId("set_time_modal")
  .setTitle("Set Race Time")

 const timeInput = new TextInputBuilder()
  .setCustomId("time_input")
  .setLabel("Race Time")
  .setStyle(TextInputStyle.Short)
  .setPlaceholder("Example: 20:00 / 21:30")
  .setRequired(true)

 const row = new ActionRowBuilder().addComponents(timeInput)

 modal.addComponents(row)

 return modal
}

module.exports = { createTimeModal }
