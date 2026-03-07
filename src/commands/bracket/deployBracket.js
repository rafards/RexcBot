const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")
const { getSetupButton } = require("../../utils/bracketButtons")

async function deployBracket(message){

 const embed = createBracketEmbed(bracketData)

 const row = getSetupButton("race_name")

 await message.channel.send({
  embeds:[embed],
  components:[row]
 })

}

module.exports = { deployBracket }
