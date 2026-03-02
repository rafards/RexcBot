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

/* ============================= */
/* ====== GLOBAL STORAGE ======= */
/* ============================= */

const activeRequests = new Map();
let totalProcessed = 0;
let panelMessageId = null;

/* ============================= */

client.once("clientReady", () => {
  console.log(`🚀 Enterprise System Online: ${client.user.tag}`);
});

/* ============================= */
/* ===== DEPLOY PANEL CMD ====== */
/* ============================= */

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!deploypanel") return;

  if (!message.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
    return message.reply("❌ Tidak memiliki izin.");
  }

  if (panelMessageId) {
    return message.reply("⚠ Panel sudah terdeploy.");
  }

  const embed = new EmbedBuilder()
    .setColor("#0F172A")
    .setTitle("🛡 Nickname Management System • Enterprise")
    .setDescription(
      "> Secure • Verified • Professional\n\n" +
      "Sistem perubahan nickname dengan approval resmi.\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "📌 Policy",
        value:
          "• Maksimal 32 karakter\n" +
          "• Tidak mengandung unsur terlarang\n" +
          "• Mengikuti peraturan server\n\n"
      },
      {
        name: "📊 Live Statistics",
        value:
          `Members: ${message.guild.memberCount}\n` +
          `Active Requests: ${activeRequests.size}\n` +
          `Total Processed: ${totalProcessed}`
      }
    )
    .setImage("https://i.imgur.com/b1f3T4V.png")
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setFooter({
      text: "KEJAWEN TEAM -",
      iconURL: message.guild.iconURL({ dynamic: true })
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_request_modal")
      .setLabel("Submit Nickname Request")
      .setEmoji("🚀")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
        .setLabel("Server Rules")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.com/channels/1309489516641259571/1309514003709562953") // Ganti jika mau link rules
  );

  const sent = await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  panelMessageId = sent.id;
  await message.delete().catch(() => null);
});

/* ============================= */
/* ===== INTERACTION HANDLER ==== */
/* ============================= */

client.on(Events.InteractionCreate, async (interaction) => {
  try {

    /* ===== OPEN MODAL ===== */

    if (interaction.isButton() && interaction.customId === "open_request_modal") {

      if (activeRequests.has(interaction.user.id)) {
        return interaction.reply({
          content: "⚠ Kamu masih memiliki request aktif.",
          ephemeral: true
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

    /* ===== SUBMIT REQUEST ===== */

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "nickname_modal"
    ) {
      const nickname = interaction.fields.getTextInputValue("nickname_input");

      const duplicate = interaction.guild.members.cache.find(
        m => m.nickname === nickname
      );
      if (duplicate) {
        return interaction.reply({
          content: "❌ Nickname sudah digunakan member lain.",
          ephemeral: true
        });
      }

      activeRequests.set(interaction.user.id, {
        nickname: nickname,
        requestedAt: Date.now()
      });

      const approvalChannel = await interaction.guild.channels.fetch(
        process.env.APPROVAL_CHANNEL_ID
      );

      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("📌 Nickname Approval Request")
        .addFields(
          { name: "Requester", value: `<@${interaction.user.id}>` },
          { name: "Requested Nickname", value: nickname }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${interaction.user.id}`)
          .setLabel("Approve")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${interaction.user.id}`)
          .setLabel("Reject")
          .setStyle(ButtonStyle.Danger)
      );

      await approvalChannel.send({ embeds: [embed], components: [row] });

      return interaction.reply({
        content: "✅ Request berhasil dikirim ke staff.",
        ephemeral: true
      });
    }

    /* ===== APPROVE ===== */

    if (interaction.isButton() && interaction.customId.startsWith("approve_")) {

      if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
        return interaction.reply({ content: "❌ Tidak memiliki izin.", ephemeral: true });
      }
    
      const userId = interaction.customId.split("_")[1];
      const requestData = activeRequests.get(userId);
    
      if (!requestData) {
        return interaction.reply({ content: "⚠ Request sudah tidak aktif.", ephemeral: true });
      }
    
      const { nickname, requestedAt } = requestData;
      const member = await interaction.guild.members.fetch(userId);
    
      // Hitung waktu proses
      const processTime = Math.floor((Date.now() - requestedAt) / 1000);
    
      // Generate Approval ID
      const approvalId = `APP-${Date.now().toString().slice(-6)}`;
    
      // Ganti nickname
      await member.setNickname(nickname);
    
      activeRequests.delete(userId);
      totalProcessed++;
    
      const now = new Date();
      const formattedDate = now.toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    
      const ultraEmbed = new EmbedBuilder()
        .setColor("#16A34A")
        .setTitle("🏆 NICKNAME APPROVED • ENTERPRISE CONFIRMATION")
        .setDescription(
          "> Verified • Logged • Successfully Executed\n\n" +
          "━━━━━━━━━━━━━━━━━━━━"
        )
        .addFields(
          {
            name: "👤 Requester",
            value: `<@${userId}>`,
            inline: true
          },
          {
            name: "📝 New Nickname",
            value: `**${nickname}**`,
            inline: true
          },
          {
            name: "🛡 Approved By",
            value: `<@${interaction.user.id}>`,
            inline: true
          },
          {
            name: "🆔 Approval ID",
            value: `\`${approvalId}\``,
            inline: true
          },
          {
            name: "⏱ Processing Time",
            value: `${processTime} seconds`,
            inline: true
          },
          {
            name: "📅 Updated At",
            value: formattedDate,
            inline: false
          }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "KEJAWEN TEAM • Enterprise Infrastructure System",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
    
      await interaction.update({
        content: null,
        embeds: [ultraEmbed],
        components: []
      });
    }

    /* ===== REJECT ===== */

    if (interaction.isButton() && interaction.customId.startsWith("reject_")) {

      if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
        return interaction.reply({ content: "❌ Tidak memiliki izin.", ephemeral: true });
      }

      const userId = interaction.customId.split("_")[1];

      const modal = new ModalBuilder()
        .setCustomId(`reject_modal_${userId}`)
        .setTitle("Reject Reason");

      const input = new TextInputBuilder()
        .setCustomId("reject_reason")
        .setLabel("Alasan Penolakan")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    /* ===== REJECT MODAL SUBMIT ===== */

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId.startsWith("reject_modal_")
    ) {

      const userId = interaction.customId.split("_")[2];
      const reason = interaction.fields.getTextInputValue("reject_reason");

      activeRequests.delete(userId);
      totalProcessed++;

      return interaction.reply({
        content:
          `❌ Request ditolak.\n\nAlasan:\n${reason}\n\n📅 ${new Date().toLocaleString("id-ID")}`,
        ephemeral: true
      });
    }

  } catch (err) {
    console.error("SYSTEM ERROR:", err);
  }
});

client.login(process.env.TOKEN);
