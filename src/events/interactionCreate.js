const join = require("../features/bracket/interactions/join");
const leave = require("../features/bracket/interactions/leave");
const shuffle = require("../features/bracket/interactions/shuffle");
const startRace = require("../features/bracket/interactions/startRace");
const setWinner = require("../features/bracket/interactions/setWinner");

module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;

    const id = interaction.customId;

    if (id === "join") return join(interaction, client);
    if (id === "leave") return leave(interaction, client);
    if (id === "shuffle") return shuffle(interaction, client);
    if (id === "start_race") return startRace(interaction, client);
    if (id === "win_p1") return setWinner(interaction, client, 1);
    if (id === "win_p2") return setWinner(interaction, client, 2);

  });

};
