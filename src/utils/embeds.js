const { EmbedBuilder } = require("discord.js")

function createBracketEmbed(data){

 return new EmbedBuilder()
  .setTitle("🏁 SSR BRACKET RACE")
  .addFields(
   {
    name:"Race Name",
    value: data.raceName ? data.raceName : "Not Set"
   },
   {
    name:"Registration",
    value: data.raceType ? `${data.raceType} | ${data.racePrice || 0}` : "Not Set"
   },
   {
    name:"Lap",
    value: data.lap ? String(data.lap) : "Not Set"
   },
   {
    name:"Slots",
    value: data.slot ? String(data.slot) : "Not Set"
   },
   {
    name:"Race Start",
    value: data.time ? data.time : "Not Set"
   }
  )

}

module.exports = { createBracketEmbed }
