const raceState = {
 slots: null
}

async function slotSubmit(interaction) {

 if (!interaction.isModalSubmit()) return
 if (interaction.customId !== "set_slot_modal") return

 const slots = interaction.fields.getTextInputValue("slot_input")

 raceState.slots = Number(slots)

 await interaction.reply({
  content: `✅ Player slot set to **${slots}**`,
  ephemeral: true
 })

}

module.exports = { slotSubmit, raceState }
