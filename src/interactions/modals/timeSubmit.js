const raceState = {
 time: null
}

async function timeSubmit(interaction) {

 if (!interaction.isModalSubmit()) return
 if (interaction.customId !== "set_time_modal") return

 const time = interaction.fields.getTextInputValue("time_input")

 raceState.time = time

 await interaction.reply({
  content: `⏰ Race time set to **${time}**`,
  ephemeral: true
 })

}

module.exports = { timeSubmit, raceState }
