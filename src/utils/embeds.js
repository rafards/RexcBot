const { EmbedBuilder } = require("discord.js")

function formatRupiah(value){

 if(!value || value === 0) return "Gratis"

 return "Rp" + Number(value).toLocaleString("id-ID")

}

// ===============================
// SETUP PROGRESS
// ===============================

function getProgress(data){

 let step = 0

 if(data.raceName) step++
 if(data.racePrice !== null) step++
 if(data.lap) step++
 if(data.slot) step++
 if(data.time) step++

 const total = 5

 const bars = "■".repeat(step) + "□".repeat(total-step)

 return {
  step,
  total,
  bars
 }

}

// ===============================
// EMBED BUILDER
// ===============================

function createBracketEmbed(data){

 const progress = getProgress(data)

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
   },
   {
    name:"Setup Progress",
    value:`${progress.bars}\n${progress.step}/${progress.total} Completed`
   }
  )

}

module.exports = { createBracketEmbed }
