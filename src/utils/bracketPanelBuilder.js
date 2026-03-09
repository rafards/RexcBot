function buildFullTournamentEmbed(){

 let description = ""

 description += "──────────────\n\n"

 raceState.roundHistory.forEach(round => {

  description += `🏁 ROUND ${round.round}\n\n`

  round.matches.forEach(m => {

   description += `Match ${m.index}\n`
   description += `${m.p1} vs ${m.p2}\n`

   if(m.winner){
    description += `🏆 ${m.winner}\n`
   }

   description += "\n"

  })

 })

 const activeIndex = raceState.matches.findIndex(m=>!m.winner)

 raceState.matches.forEach((match,i)=>{

  const p1 = match.player1?.ign || "BYE"
  const p2 = match.player2?.ign || "BYE"

  const live = i===activeIndex && !match.winner

  const label = live
   ? `➡ Match ${i+1} 🔴 LIVE`
   : `Match ${i+1}`

  description += `${label}\n`
  description += `${p1} vs ${p2}\n\n`

 })

 return description
}
