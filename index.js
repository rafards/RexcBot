require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  InteractionType
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const activeRequests = new Map();
const processingRequests = new Set();
const cooldowns = new Map();
const userReplies = new Map();

let totalProcessed = 0;

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

/* ================= READY ================= */

client.once("clientReady", () => {
  console.log(`🚀 Sistem Manajemen Aktif: ${client.user.tag}`);
});

/* ================= PANEL ================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!panel") return;

  if (!message.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
    return message.reply("❌ Anda tidak memiliki izin untuk menggunakan perintah ini.");
  }

  const embed = new EmbedBuilder()
    .setColor("#0f172a")
    .setTitle("🛡 Sistem Manajemen Perubahan Nama")
    .setDescription(
      "━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "Aman • Terverifikasi • Profesional\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "📜 Ketentuan",
        value:
          "• Maksimal 32 karakter\n" +
          "• Tidak mengandung unsur terlarang\n" +
          "• Wajib mengikuti peraturan server\n"
      },
      {
        name: "📊 Statistik Sistem",
        value:
          `Jumlah Anggota: ${message.guild.memberCount}\n` +
          `Permintaan Aktif: ${activeRequests.size}\n` +
          `Total Diproses: ${totalProcessed}`
      }
    )
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setFooter({
      text: "KEJAWEN TEAM • Sistem Internal",
      iconURL: message.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_request_modal")
      .setLabel("Ajukan Perubahan Nama")
      .setEmoji("📨")
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

    /* ================= OPEN MODAL ================= */

    if (interaction.isButton() && interaction.customId === "open_request_modal") {

      if (processingRequests.has(interaction.user.id)) {
        return interaction.reply({ content: "⏳ Permintaan Anda sedang diproses...", ephemeral: true });
      }

      if (activeRequests.has(interaction.user.id)) {
        return interaction.reply({ content: "⚠ Anda masih memiliki permintaan aktif.", ephemeral: true });
      }

      const cooldown = cooldowns.get(interaction.user.id);
      if (cooldown && Date.now() < cooldown) {
        const remaining = Math.ceil((cooldown - Date.now()) / (1000 * 60 * 60 * 24));
        return interaction.reply({
          content: `⛔ Anda dapat mengajukan kembali dalam ${remaining} hari.`,
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("nickname_modal")
        .setTitle("Formulir Perubahan Nama");

      const input = new TextInputBuilder()
        .setCustomId("nickname_input")
        .setLabel("Masukkan nama baru")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(32)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    /* ================= SUBMIT ================= */

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "nickname_modal"
    ) {

      processingRequests.add(interaction.user.id);

      await interaction.reply({
        content: "⏳ Permintaan sedang dikirim...",
        ephemeral: true
      });

      const nickname = interaction.fields.getTextInputValue("nickname_input");

      activeRequests.set(interaction.user.id, {
        nickname,
        requestedAt: Date.now(),
        approvalMessageId: null
      });

      const approvalChannel = await interaction.guild.channels.fetch(
        process.env.APPROVAL_CHANNEL_ID
      );

      const embed = new EmbedBuilder()
        .setColor("#F1C40F")
        .setAuthor({
          name: "📌 PERMINTAAN PERUBAHAN NAMA",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setDescription("```yaml\nStatus: MENUNGGU PERSETUJUAN\n```")
        .addFields(
          { name: "👤 Pemohon", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📝 Nama yang Diajukan", value: `\`${nickname}\``, inline: true },
          { name: "📅 Tanggal Pengajuan", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "KEJAWEN TEAM • Antrian Persetujuan",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${interaction.user.id}`)
          .setLabel("Setujui")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${interaction.user.id}`)
          .setLabel("Tolak")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)
      );

      const sent = await approvalChannel.send({ embeds: [embed], components: [row] });

      activeRequests.get(interaction.user.id).approvalMessageId = sent.id;

      await interaction.editReply({
        content: "✅ Permintaan berhasil dikirim dan sedang menunggu persetujuan staf.",
        components: []
      });

      userReplies.set(interaction.user.id, interaction);
      processingRequests.delete(interaction.user.id);
    }

    /* ================= APPROVE ================= */

    if (interaction.isButton() && interaction.customId.startsWith("approve_")) {

      await interaction.deferUpdate();
    
      const userId = interaction.customId.split("_")[1];
      const requestData = activeRequests.get(userId);
      if (!requestData) return;
    
      const member = await interaction.guild.members.fetch(userId);
      await member.setNickname(requestData.nickname);
    
      cooldowns.set(userId, Date.now() + ONE_WEEK);
    
      const processTime = Math.floor((Date.now() - requestData.requestedAt) / 1000);

      activeRequests.delete(userId);
      totalProcessed++;
    
      const embed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setAuthor({
          name: "✅ PERMINTAAN DISETUJUI",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setDescription("```fix\nPerubahan nama berhasil diterapkan\n```")
        .addFields(
          { name: "👤 Pemohon", value: `<@${userId}>`, inline: true },
          { name: "📝 Nama Baru", value: `\`${requestData.nickname}\``, inline: true },
          { name: "🛡 Disetujui Oleh", value: `<@${interaction.user.id}>`, inline: true },
          { name: "⏱ Waktu Proses", value: `${processTime} detik`, inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "KEJAWEN TEAM • Sistem Internal",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
    
      await interaction.editReply({
        embeds: [embed],
        components: []
      });
    }

    /* ================= REJECT ================= */

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId.startsWith("reject_modal_")
    ) {
    
      const userId = interaction.customId.split("_")[2];
      const reason = interaction.fields.getTextInputValue("reject_reason");

      const requestData = activeRequests.get(userId);
      const processTime = requestData
        ? Math.floor((Date.now() - requestData.requestedAt) / 1000)
        : 0;

      activeRequests.delete(userId);
      totalProcessed++;
    
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
    
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor("#E74C3C")
            .setAuthor({
              name: "❌ PERMINTAAN DITOLAK",
              iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setDescription("```diff\n- Permintaan perubahan nama ditolak\n```")
            .addFields(
              { name: "👤 Pemohon", value: `<@${userId}>`, inline: true },
              { name: "🛡 Ditinjau Oleh", value: `<@${interaction.user.id}>`, inline: true },
              { name: "⏱ Waktu Proses", value: `${processTime} detik`, inline: true },
              { name: "📄 Alasan Penolakan", value: reason }
            )
            .setThumbnail(member?.user.displayAvatarURL({ dynamic: true }) || null)
            .setFooter({
              text: "KEJAWEN TEAM • Sistem Internal",
              iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp()
        ],
        components: []
      });
    }

  } catch (err) {
    console.error("Terjadi kesalahan pada sistem:", err);
  }
});

client.login(process.env.TOKEN);
