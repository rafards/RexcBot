const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const { raceState } = require("../../data/raceState")

async function deployRegistrationButton(interaction){

 if(interaction.customId !== "deploy_registration") return

 const playerChannel = interaction.guild.channels.cache.find(
  c => c.name === "info-race"
 )

 if(!playerChannel){
  return interaction.reply({
   content:"❌ Channel info-race tidak ditemukan",
   ephemeral:true
  })
 }

 raceState.registrationOpen = true

}

module.exports = { deployRegistrationButton }
