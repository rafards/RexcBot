function shufflePlayers(players){

 for(let i = players.length - 1; i > 0; i--){

  const j = Math.floor(Math.random() * (i + 1))

  const temp = players[i]
  players[i] = players[j]
  players[j] = temp

 }

 return players

}



function generateBracket(players){

 const shuffled = shufflePlayers([...players])

 const matches = []

 for(let i = 0; i < shuffled.length; i += 2){

  const p1 = shuffled[i]
  const p2 = shuffled[i + 1]

  matches.push({
   player1: p1,
   player2: p2,
   winner: null
  })

 }

 return matches

}

module.exports = { generateBracket }
