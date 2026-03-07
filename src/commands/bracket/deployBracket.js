const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")

async function deployBracket(message){

 const embed = createBracketEmbed(bracketData)

 await message.channel.send({
  embeds: [embed]
 })

}

module.exports = { deployBracket }
