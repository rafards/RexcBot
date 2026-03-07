const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { createBracketEmbed } = require("../../utils/embeds")
const { bracketData } = require("../../systems/bracketSystem")

async function deployBracket(message){

 const embed = createBracketEmbed(bracketData)

 const row = new ActionRowBuilder().addComponents(

  new ButtonBuilder()
   .setCustomId("set_race_name")
   .setLabel("Set Race Name")
   .setStyle(ButtonStyle.Primary)

 )

 await message.channel.send({
  embeds:[embed],
  components:[row]
 })

}

module.exports = { deployBracket }
