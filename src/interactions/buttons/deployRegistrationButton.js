const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")

async function deployRegistrationButton(interaction){

 if(interaction.customId !== "deploy_registration") return

 await interaction.deferUpdate()

 raceState.registrationOpen = true

}

module.exports = { deployRegistrationButton }
