const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")
const { raceState } = require("../../data/raceState")

async function lapSelect(interaction){

 const lap = interaction.values[0]

 raceState.lap = Number(lap)

 const embed = createBracketEmbed(raceState)

 const row = getSetupButton("slot")

 await interaction.update({
  embeds:[embed],
  components:[row]
 })

}

module.exports = { lapSelect }
