const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  InteractionType,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {

  const activeRequests = new Map();
  const processingRequests = new Set();
  const cooldowns = new Map();
  const userReplies = new Map();

  let totalProcessed = 0;
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  /* ================= PANEL ================= */

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content !== "!panel") return;

    if (!message.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
      return message.reply("❌ Tidak memiliki izin.");
    }

    const embed = new EmbedBuilder()
      .setColor("#0f172a")
      .setTitle("🛡 Nickname Management System")
      .setDescription(
        "━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "Secure • Verified • Professional\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━"
      )
      .addFields(
        {
          name: "📜 Rules",
          value:
            "• Maksimal 32 karakter\n" +
            "• Tidak mengandung unsur terlarang\n" +
            "• Mengikuti peraturan server\n"
        },
        {
          name: "📊 Live Statistics",
          value:
            `Members: ${message.guild.memberCount}\n` +
            `Active Requests: ${activeRequests.size}\n` +
            `Total Processed: ${totalProcessed}`
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_request_modal")
        .setLabel("Submit Nickname Request")
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    await message.delete().catch(() => null);
  });

  /* ================= INTERACTION ================= */

  client.on(Events.InteractionCreate, async (interaction) => {

    try {

      // ===== OPEN MODAL =====
      if (interaction.isButton() && interaction.customId === "open_request_modal") {

        if (processingRequests.has(interaction.user.id)) {
          return interaction.reply({ content: "⏳ Request sedang diproses...", flags: MessageFlags.Ephemeral });
        }

        if (activeRequests.has(interaction.user.id)) {
          return interaction.reply({ content: "⚠ Kamu masih memiliki request aktif.", flags: MessageFlags.Ephemeral });
        }

        const cooldown = cooldowns.get(interaction.user.id);
        if (cooldown && Date.now() < cooldown) {
          const remaining = Math.ceil((cooldown - Date.now()) / (1000 * 60 * 60 * 24));
          return interaction.reply({
            content: `⛔ Kamu bisa mengajukan lagi dalam ${remaining} hari.`,
            flags: MessageFlags.Ephemeral
          });
        }

        const modal = new ModalBuilder()
          .setCustomId("nickname_modal")
          .setTitle("Nickname Request");

        const input = new TextInputBuilder()
          .setCustomId("nickname_input")
          .setLabel("Masukkan nickname baru")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(32)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }

      // ===== SUBMIT =====
      if (
        interaction.type === InteractionType.ModalSubmit &&
        interaction.customId === "nickname_modal"
      ) {

        processingRequests.add(interaction.user.id);

        await interaction.reply({
          content: "⏳ Processing request...",
          flags: MessageFlags.Ephemeral
        });

        const nickname = interaction.fields.getTextInputValue("nickname_input");

        activeRequests.set(interaction.user.id, {
          nickname,
          requestedAt: Date.now()
        });

        processingRequests.delete(interaction.user.id);
      }

    } catch (err) {
      console.error("Error di nicknameSystem:", err);
    }

  });

};
