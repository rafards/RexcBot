function generate(players) {

  const matches = [];

  for (let i = 0; i < players.length; i += 2) {

    matches.push({
      p1: players[i],
      p2: players[i + 1],
      winner: null
    });

  }

  return matches;

}

module.exports = generate;
