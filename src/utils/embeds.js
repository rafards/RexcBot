const { EmbedBuilder } = require("discord.js")

function formatRupiah(value){

 if(!value || value === 0) return "Gratis"

 return "Rp" + Number(value).toLocaleString("id-ID")

}

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
    value: data.racePrice !== null ? formatRupiah(data.racePrice) : "Not Set"
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
