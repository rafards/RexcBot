const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")
const { EmbedBuilder } = require("discord.js")

async function updatePanel(interaction){

 const message = interaction.message

 if(!message){
  console.log("Panel message not found from interaction")
  return
 }

 const embed = createBracketEmbed(raceState)

 let nextStep = "race_name"

 if(raceState.raceName && !raceState.raceType) nextStep = "registration"
 else if(raceState.raceType && !raceState.slot) nextStep = "slot"
 else if(raceState.slot && !raceState.time) nextStep = "race_time"

 const row = getSetupButton(nextStep)

 await message.edit({
  embeds: [embed],
  components: [row]
 })

}
async function handleBracketModals(interaction){

 // ===============================
 // RACE NAME
 // ===============================

 if(interaction.customId === "race_name_modal"){

 const raceName = interaction.fields.getTextInputValue("race_name_input")

 raceState.raceName = raceName

 await updatePanel(interaction)

 await interaction.reply({
  content:`🏁 Race name set to **${raceName}**`,
  ephemeral:true
 })

}

 // ===============================
 // REGISTRATION
 // ===============================

 if(interaction.customId === "registration_modal"){

 const type = interaction.fields.getTextInputValue("race_type_input")
 const price = interaction.fields.getTextInputValue("race_price_input")

 raceState.raceType = type
 raceState.racePrice = Number(price)

 await updatePanel(interaction)

 await interaction.reply({
  content:`📋 Registration set: **${type}** | Price: **${price}**`,
  ephemeral:true
 })

}

 // ===============================
 // SLOT
 // ===============================

 if(interaction.customId === "slot_modal"){

 const slot = interaction.fields.getTextInputValue("slot_input")

 raceState.slot = Number(slot)

 await updatePanel(interaction)

 await interaction.reply({
  content:`👥 Player slot set to **${slot}**`,
  ephemeral:true
 })

}

 // ===============================
 // RACE TIME
 // ===============================

 if(interaction.customId === "race_time_modal"){

 const time = interaction.fields.getTextInputValue("race_time_input")

 raceState.time = time

 await updatePanel(interaction)

 await interaction.reply({
  content:`⏰ Race time set to **${time}**`,
  ephemeral:true
 })

}

 // ===============================
// PLAYER REGISTER
// ===============================

if(interaction.customId === "player_register_modal"){

 const name = interaction.fields.getTextInputValue("player_name")
 const ign = interaction.fields.getTextInputValue("player_ign")

 raceState.players.push({
  id: interaction.user.id,
  username: interaction.user.username,
  name,
  ign
 })

 await interaction.reply({
  content:`✅ Registered as **${name}** (${ign})`,
  ephemeral:true
 })

}

}

module.exports = { handleBracketModals }
