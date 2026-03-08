const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")
const { updateRegistrationPanels } = require("../../utils/updateRegistrationPanels")

// ===============================
// OPEN NEXT MODAL (WIZARD FLOW)
// ===============================

async function openNextModal(interaction, step){

 if(step === "registration"){

  const modal = new ModalBuilder()
   .setCustomId("registration_modal")
   .setTitle("Race Setup • Step 2/5")

  const input = new TextInputBuilder()
   .setCustomId("race_price_input")
   .setLabel("Price (0 = Gratis)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(input))

  return interaction.showModal(modal)
 }

 if(step === "lap"){

  const modal = new ModalBuilder()
   .setCustomId("lap_modal")
   .setTitle("Race Setup • Step 3/5")

  const input = new TextInputBuilder()
   .setCustomId("lap_input")
   .setLabel("Lap (1 / 2 / 3)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(input))

  return interaction.showModal(modal)
 }

 if(step === "slot"){

  const modal = new ModalBuilder()
   .setCustomId("slot_modal")
   .setTitle("Race Setup • Step 4/5")

  const input = new TextInputBuilder()
   .setCustomId("slot_input")
   .setLabel("Total Player")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(input))

  return interaction.showModal(modal)
 }

 if(step === "race_time"){

  const modal = new ModalBuilder()
   .setCustomId("race_time_modal")
   .setTitle("Race Setup • Step 5/5")

  const input = new TextInputBuilder()
   .setCustomId("race_time_input")
   .setLabel("Race Time (Example: 20:00)")
   .setStyle(TextInputStyle.Short)
   .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(input))

  return interaction.showModal(modal)
 }

}

// ===============================
// UPDATE PANEL
// ===============================

async function updatePanel(interaction){

 const message = interaction.message
 if(!message) return

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

// ===============================
// HANDLE MODALS
// ===============================

async function handleBracketModals(interaction){

 // ===============================
 // RACE NAME
 // ===============================

 if(interaction.customId === "race_name_modal"){

  const raceName = interaction.fields.getTextInputValue("race_name_input")

  raceState.raceName = raceName

  await updatePanel(interaction)

  await interaction.deferUpdate()

  await openNextModal(interaction,"registration")
 }

 // ===============================
 // REGISTRATION
 // ===============================

 if(interaction.customId === "registration_modal"){

  const price = interaction.fields.getTextInputValue("race_price_input")

  raceState.racePrice = Number(price)

  await updatePanel(interaction)

  await interaction.deferUpdate()

  await openNextModal(interaction,"lap")
 }

 // ===============================
 // LAPS
 // ===============================

 if(interaction.customId === "lap_modal"){

  const lap = interaction.fields.getTextInputValue("lap_input")

  raceState.lap = Number(lap)

  await updatePanel(interaction)

  await interaction.deferUpdate()

  await openNextModal(interaction,"slot")
 }

 // ===============================
 // SLOT
 // ===============================

 if(interaction.customId === "slot_modal"){

  const slot = interaction.fields.getTextInputValue("slot_input")

  raceState.slot = Number(slot)

  await updatePanel(interaction)

  await interaction.deferUpdate()

  await openNextModal(interaction,"race_time")
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

  if(raceState.players.find(p => p.id === interaction.user.id)){
   return interaction.reply({
    content:"❌ You already joined",
    ephemeral:true
   })
  }

  raceState.players.push({
   id: interaction.user.id,
   ign
  })

  await updateRegistrationPanels(interaction)

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
