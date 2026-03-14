const { raceState } = require("../../data/raceState")
const { updateRegistrationPanels } = require("../../utils/updateRegistrationPanels")
const { generateBracket } = require("../../systems/bracketSystem")

async function fillTestPlayersButton(interaction){

 if(interaction.customId !== "fill_test_players") return

 await interaction.deferUpdate()

 const remaining = raceState.slot - raceState.players.length

 if(remaining <= 0) return

 // ===============================
 // GENERATE BOT PLAYERS
 // ===============================

 for(let i=0;i<remaining;i++){

  const num = raceState.players.length + 1

  raceState.players.push({
   id:`bot_${num}`,
   ign:`BOT-${num}`
  })

 }

 // ===============================
 // HIDE FILL BUTTON
 // ===============================

 if(raceState.players.length >= raceState.slot){

  const msg = interaction.message

  await msg.edit({
   components:[]
  })

 }

 // ===============================
 // UPDATE REGISTRATION PANEL
 // ===============================

 await updateRegistrationPanels(interaction)

 // ===============================
 // START BRACKET
 // ===============================

 if(raceState.players.length >= raceState.slot){

  raceState.registrationOpen = false

  await generateBracket(interaction)

 }

}

module.exports = { fillTestPlayersButton }
