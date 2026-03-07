const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")
const { EmbedBuilder } = require("discord.js")
const { updateRegistrationPanels } = require("../../utils/updateRegistrationPanels")

async function updatePanel(interaction){

 const message = interaction.message

 if(!message) return

 // buat embed baru dari state
 const embed = createBracketEmbed(raceState)

 let nextStep

if(!raceState.raceName){

 nextStep = "race_name"

}
else if(raceState.racePrice === null){

 nextStep = "registration"

}
else if(!raceState.lap){

 nextStep = "lap"

}
else if(!raceState.slot){

 nextStep = "slot"

}
else if(!raceState.time){

 nextStep = "race_time"

}
else{

 nextStep = "deploy"

}

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

 await interaction.deferUpdate()

}

 // ===============================
 // REGISTRATION
 // ===============================

 if(interaction.customId === "registration_modal"){

 const price = interaction.fields.getTextInputValue("race_price_input")

 raceState.racePrice = Number(price)

 await updatePanel(interaction)

 await interaction.deferUpdate()

}

 // ===============================
 // LAPS
 // ===============================

 if(interaction.customId === "lap_modal"){

 const lap = interaction.fields.getTextInputValue("lap_input")

 raceState.lap = Number(lap)

 await updatePanel(interaction)

 await interaction.deferUpdate()

}

 // ===============================
 // SLOT
 // ===============================

 if(interaction.customId === "slot_modal"){

 const slot = interaction.fields.getTextInputValue("slot_input")

 raceState.slot = Number(slot)

 await updatePanel(interaction)

 await interaction.deferUpdate()

}

 // ===============================
 // RACE TIME
 // ===============================

 if(interaction.customId === "race_time_modal"){

 const time = interaction.fields.getTextInputValue("race_time_input")

 raceState.time = time

 await updatePanel(interaction)

 await interaction.deferUpdate()

}

 // ===============================
// PLAYER REGISTER
// ===============================

if(interaction.customId === "ign_modal"){

 const ign = interaction.fields.getTextInputValue("ign_input")

 // cek kalau sudah join
 if(raceState.players.find(p => p.id === interaction.user.id)){

  return interaction.reply({
   content:"❌ You already joined",
   
  })

 }

 // simpan player
 raceState.players.push({
  id: interaction.user.id,
  ign
 })

 const playerCount = raceState.players.length

 await updateRegistrationPanels(interaction)

 await interaction.reply({
  content:`✅ Joined as ${ign}`,
  
 })

}

}

module.exports = { handleBracketModals }
