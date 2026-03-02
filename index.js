require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials,
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
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

/* ===============================
   📦 STORAGE (Memory Based)
================================= */
const pendingRequests = new Map();

/* ===============================
   🚀 READY EVENT (v14+ FIXED)
================================= */
client.once("clientReady", () => {
    console.log(`✅ Bot Online sebagai ${client.user.tag}`);
});

/* ===============================
   🧠 FORMAT WAKTU WIB
================================= */
function getWIBTime() {
    return new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

/* ===============================
   🎮 INTERACTION HANDLER
================================= */
client.on(Events.InteractionCreate, async (interaction) => {
    try {

        /* ===============================
           📌 SLASH COMMAND /panelnick
        ================================= */
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName === "panelnick") {

                const embed = new EmbedBuilder()
                    .setColor("#5865F2") // Discord Blurple Premium
                    .setTitle("🎟 Nickname Management System")
                    .setDescription(
                        "━━━━━━━━━━━━━━━━━━\n\n" +
                        "Ubah nickname server Anda melalui sistem approval resmi.\n\n" +
                        "• Request akan ditinjau oleh Staff\n" +
                        "• Maksimal 32 karakter\n" +
                        "• Gunakan nama sesuai peraturan server\n\n" +
                        "━━━━━━━━━━━━━━━━━━"
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
                    .setImage("https://i.imgur.com/8Km9tLL.png") // Ganti dengan banner custom kamu
                    .setFooter({
                        text: "KEJAWEN TEAM • Nickname Enterprise System",
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("open_request_modal")
                    .setLabel("Request Nickname")
                    .setEmoji("✏️")
                    .setStyle(ButtonStyle.Primary)
            );
        
            return interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
        }

        /* ===============================
           📥 BUTTON OPEN MODAL
        ================================= */
        if (interaction.isButton() && interaction.customId === "open_request_modal") {

            if (pendingRequests.has(interaction.user.id)) {

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("cancel_request")
                        .setLabel("Batalkan Request")
                        .setStyle(ButtonStyle.Danger)
                );

                return interaction.reply({
                    content: "⚠️ Kamu masih memiliki request aktif.",
                    components: [row],
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId("nickname_modal")
                .setTitle("Request Nickname Baru");

            const nicknameInput = new TextInputBuilder()
                .setCustomId("nickname_input")
                .setLabel("Masukkan nickname baru")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(32);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nicknameInput)
            );

            return interaction.showModal(modal);
        }

        /* ===============================
           ❌ CANCEL REQUEST
        ================================= */
        if (interaction.isButton() && interaction.customId === "cancel_request") {

            pendingRequests.delete(interaction.user.id);

            return interaction.update({
                content: "✅ Request berhasil dibatalkan.",
                components: []
            });
        }

        /* ===============================
           📨 MODAL SUBMIT REQUEST
        ================================= */
        if (
            interaction.type === InteractionType.ModalSubmit &&
            interaction.customId === "nickname_modal"
        ) {
            const nickname = interaction.fields.getTextInputValue("nickname_input");

            pendingRequests.set(interaction.user.id, nickname);

            const approvalChannel = await client.channels.fetch(process.env.APPROVAL_CHANNEL_ID);

            const avatarURL = interaction.user.displayAvatarURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("📩 Request Nickname Baru")
                .setThumbnail(avatarURL)
                .addFields(
                    { name: "👤 User", value: `<@${interaction.user.id}>`, inline: true },
                    { name: "🎮 Nickname Diminta", value: `\`${nickname}\``, inline: true },
                    { name: "🕒 Waktu Request", value: getWIBTime() }
                )
                .setFooter({
                    text: `User ID: ${interaction.user.id}`,
                    iconURL: avatarURL
                })
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

            await approvalChannel.send({
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: "✅ Request berhasil dikirim ke staff. Tunggu persetujuan.",
                ephemeral: true
            });
        }

        /* ===============================
           ✅ APPROVE BUTTON
        ================================= */
        if (interaction.isButton() && interaction.customId.startsWith("approve_")) {

            if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Kamu tidak memiliki izin.",
                    ephemeral: true
                });
            }

            const userId = interaction.customId.split("_")[1];
            const nickname = pendingRequests.get(userId);

            if (!nickname) {
                return interaction.reply({
                    content: "⚠️ Request sudah tidak tersedia.",
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(userId);
            await member.setNickname(nickname);

            pendingRequests.delete(userId);

            const user = await client.users.fetch(userId);
            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("✅ Nickname Berhasil Diperbarui")
                .setThumbnail(avatarURL)
                .addFields(
                    { name: "👤 User", value: `<@${userId}>`, inline: true },
                    { name: "🎮 Nickname Baru", value: `\`${nickname}\``, inline: true },
                    { name: "🛡 Disetujui Oleh", value: `<@${interaction.user.id}>` },
                    { name: "🕒 Waktu", value: getWIBTime() }
                )
                .setFooter({
                    text: `User ID: ${userId}`,
                    iconURL: avatarURL
                })
                .setTimestamp();

            return interaction.update({
                embeds: [embed],
                components: []
            });
        }

        /* ===============================
           ❌ REJECT BUTTON (OPEN MODAL)
        ================================= */
        if (interaction.isButton() && interaction.customId.startsWith("reject_")) {

            if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Kamu tidak memiliki izin.",
                    ephemeral: true
                });
            }

            const userId = interaction.customId.split("_")[1];

            const modal = new ModalBuilder()
                .setCustomId(`reject_modal_${userId}`)
                .setTitle("Alasan Penolakan");

            const reasonInput = new TextInputBuilder()
                .setCustomId("reject_reason")
                .setLabel("Masukkan alasan penolakan")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(reasonInput)
            );

            return interaction.showModal(modal);
        }

        /* ===============================
           ❌ REJECT MODAL SUBMIT
        ================================= */
        if (
            interaction.type === InteractionType.ModalSubmit &&
            interaction.customId.startsWith("reject_modal_")
        ) {
            const userId = interaction.customId.split("_")[2];
            const reason = interaction.fields.getTextInputValue("reject_reason");

            const nickname = pendingRequests.get(userId);
            pendingRequests.delete(userId);

            const user = await client.users.fetch(userId);
            const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Request Nickname Ditolak")
                .setThumbnail(avatarURL)
                .addFields(
                    { name: "👤 User", value: `<@${userId}>`, inline: true },
                    { name: "🎮 Nickname Diminta", value: `\`${nickname}\``, inline: true },
                    { name: "🛡 Ditolak Oleh", value: `<@${interaction.user.id}>` },
                    { name: "📝 Alasan", value: reason },
                    { name: "🕒 Waktu", value: getWIBTime() }
                )
                .setFooter({
                    text: `User ID: ${userId}`,
                    iconURL: avatarURL
                })
                .setTimestamp();

            return interaction.update({
                embeds: [embed],
                components: []
            });
        }

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
});

client.login(process.env.TOKEN);
