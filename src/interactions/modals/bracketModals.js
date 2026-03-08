const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")
const { updateRegistrationPanels } = require("../../utils/updateRegistrationPanels")

// ===============================
// UPDATE SETUP PANEL
// ===============================

async function updatePanel(interaction){

 const message = interaction.message
 if(!message) return

 const embed = createBracketEmbed(raceState)

 let nextStep

 if(!raceState.raceName){
  nextStep = "setup_race"
 }
 else{
  nextStep = "deploy"
 }

 const row = getSetupButton(nextStep)

 await message.edit({
  embeds:[embed],
  components:[row]
 })

}

// ===============================
// HANDLE MODALS
// ===============================

async function handleBracketModals(interaction){

 // ===============================
 // SETUP RACE MODAL
 // ===============================

 if(interaction.customId === "setup_race_modal"){

  const raceName = interaction.fields.getTextInputValue("race_name_input")
  const price = interaction.fields.getTextInputValue("race_price_input")
  const lap = interaction.fields.getTextInputValue("lap_input")
  const slot = interaction.fields.getTextInputValue("slot_input")
  const time = interaction.fields.getTextInputValue("race_time_input")

  raceState.raceName = raceName
  raceState.racePrice = Number(price)
  raceState.lap = Number(lap)
  raceState.slot = Number(slot)
  raceState.time = time

  await updatePanel(interaction)

  await interaction.deferUpdate()

 }

 // ===============================
 // PLAYER REGISTER
 // ===============================

 if(interaction.customId === "ign_modal"){

  const ign = interaction.fields.getTextInputValue("ign_input")

  // cek jika sudah join
  if(raceState.players.find(p => p.id === interaction.user.id)){
   return interaction.reply({
    content:"❌ You already joined",
    ephemeral:true
   })
  }

  // simpan player
  raceState.players.push({
   id: interaction.user.id,
   ign
  })

  // update panel player/admin
  await updateRegistrationPanels(interaction)

  // jika slot penuh → generate bracket
  if(raceState.players.length >= raceState.slot){

   raceState.registrationOpen = false

   const { generateBracket } = require("../../systems/bracketEngine")

   await generateBracket(interaction)
  }

  await interaction.reply({
   content:`✅ Joined as ${ign}`,
   ephemeral:true
  })

 }

}

module.exports = { handleBracketModals }
