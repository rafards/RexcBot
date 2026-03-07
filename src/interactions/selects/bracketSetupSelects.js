const { bracketData } = require("../../systems/bracketSystem")
const { createBracketEmbed } = require("../../utils/embeds")
const { getSetupButton } = require("../../utils/bracketButtons")

async function lapSelect(interaction){

 const lap = interaction.values[0]

 bracketData.lap = lap
 bracketData.step = "slots"

 const embed = createBracketEmbed(bracketData)
 const row = getSetupButton("slots")

 await interaction.update({
  embeds:[embed],
  components:[row]
 })

}

module.exports = { lapSelect }
