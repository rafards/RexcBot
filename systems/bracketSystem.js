const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Events,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {

  let bracket = {
    format: null,
    pairing: null,
    maxSlot: 8,
    participants: [],
    matches: [],
    round: 1,
    status: "setup",
    channelId: null
  };

  /* ================= COMMAND ================= */

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content !== "!bracket") return;

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Hanya admin yang bisa membuka panel bracket.");
    }

    const embed = new EmbedBuilder()
      .setColor("#0ea5e9")
      .setTitle("🏁 Bracket Control Panel")
      .setDescription(
        `Format: ${bracket.format ?? "Belum dipilih"}\n` +
        `Pairing: ${bracket.pairing ?? "Belum dipilih"}\n` +
        `Max Slot: ${bracket.maxSlot}\n` +
        `Status: ${bracket.status}`
      );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("set_format")
        .setLabel("Pilih Format")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("set_pairing")
        .setLabel("Pilih Pairing")
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_registration")
        .setLabel("Buka Pendaftaran")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("start_bracket")
        .setLabel("Start Bracket")
        .setStyle(ButtonStyle.Danger)
    );

    await message.reply({
      embeds: [embed],
      components: [row1, row2],
      flags: MessageFlags.Ephemeral
    });

    await message.delete().catch(() => null);
  });

  /* ================= INTERACTION ================= */

  client.on(Events.InteractionCreate, async (interaction) => {

    try {

      /* ===== FORMAT SELECT ===== */

      if (interaction.isButton() && interaction.customId === "set_format") {

        const menu = new StringSelectMenuBuilder()
          .setCustomId("format_select")
          .setPlaceholder("Pilih format bracket")
          .addOptions([
            { label: "Single Elimination", value: "single" },
            { label: "Time Attack", value: "time" }
          ]);

        return interaction.reply({
          components: [new ActionRowBuilder().addComponents(menu)],
          flags: MessageFlags.Ephemeral
        });
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "format_select") {
        bracket.format = interaction.values[0];
        return interaction.update({ content: `✅ Format dipilih: ${bracket.format}`, components: [] });
      }

      /* ===== PAIRING SELECT ===== */

      if (interaction.isButton() && interaction.customId === "set_pairing") {

        const menu = new StringSelectMenuBuilder()
          .setCustomId("pairing_select")
          .setPlaceholder("Pilih sistem pairing")
          .addOptions([
            { label: "Otomatis", value: "auto" },
            { label: "Manual", value: "manual" }
          ]);

        return interaction.reply({
          components: [new ActionRowBuilder().addComponents(menu)],
          flags: MessageFlags.Ephemeral
        });
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "pairing_select") {
        bracket.pairing = interaction.values[0];
        return interaction.update({ content: `✅ Pairing dipilih: ${bracket.pairing}`, components: [] });
      }

      /* ===== OPEN REGISTRATION ===== */

      if (interaction.isButton() && interaction.customId === "open_registration") {

        bracket.status = "open";
        bracket.participants = [];
        bracket.channelId = interaction.channel.id;

        const embed = new EmbedBuilder()
          .setColor("#22c55e")
          .setTitle("🏁 BRACKET STATIC SHIFT RACING")
          .setDescription(`Slot: 0 / ${bracket.maxSlot}`);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("join_bracket")
            .setLabel("JOIN")
            .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });

        return interaction.reply({
          content: "✅ Pendaftaran dibuka.",
          flags: MessageFlags.Ephemeral
        });
      }

      /* ===== JOIN ===== */

      if (interaction.isButton() && interaction.customId === "join_bracket") {

        if (bracket.status !== "open") {
          return interaction.reply({ content: "❌ Pendaftaran belum dibuka.", flags: MessageFlags.Ephemeral });
        }

        if (bracket.participants.includes(interaction.user.id)) {
          return interaction.reply({ content: "⚠ Kamu sudah terdaftar.", flags: MessageFlags.Ephemeral });
        }

        if (bracket.participants.length >= bracket.maxSlot) {
          return interaction.reply({ content: "❌ Slot penuh.", flags: MessageFlags.Ephemeral });
        }

        bracket.participants.push(interaction.user.id);

        return interaction.reply({
          content: "✅ Berhasil join bracket!",
          flags: MessageFlags.Ephemeral
        });
      }

      /* ===== START BRACKET ===== */

      if (interaction.isButton() && interaction.customId === "start_bracket") {

        if (bracket.participants.length < 2) {
          return interaction.reply({ content: "❌ Minimal 2 peserta.", flags: MessageFlags.Ephemeral });
        }

        bracket.status = "running";

        if (bracket.pairing === "auto") {
          bracket.participants.sort(() => Math.random() - 0.5);
        }

        const matches = [];
        for (let i = 0; i < bracket.participants.length; i += 2) {
          if (bracket.participants[i + 1]) {
            matches.push([
              bracket.participants[i],
              bracket.participants[i + 1]
            ]);
          }
        }

        bracket.matches = matches;

        const embed = new EmbedBuilder()
          .setColor("#f97316")
          .setTitle("🏁 ROUND 1");

        matches.forEach((match, index) => {
          embed.addFields({
            name: `Match ${index + 1}`,
            value: `<@${match[0]}> vs <@${match[1]}>`
          });
        });

        await interaction.channel.send({ embeds: [embed] });

        return interaction.reply({
          content: "🚀 Bracket dimulai!",
          flags: MessageFlags.Ephemeral
        });
      }

    } catch (err) {
      console.error("Error di bracketSystem:", err);
    }

  });

};
