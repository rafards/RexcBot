const {
 ModalBuilder,
 TextInputBuilder,
 TextInputStyle,
 ActionRowBuilder
} = require("discord.js")

function createSlotModal() {

 const modal = new ModalBuilder()
  .setCustomId("set_slot_modal")
  .setTitle("Set Player Slot")

 const slotInput = new TextInputBuilder()
  .setCustomId("slot_input")
  .setLabel("Total Player Slot")
  .setStyle(TextInputStyle.Short)
  .setPlaceholder("Example: 8 / 16")
  .setRequired(true)

 const row = new ActionRowBuilder().addComponents(slotInput)

 modal.addComponents(row)

 return modal
}

module.exports = { createSlotModal }
