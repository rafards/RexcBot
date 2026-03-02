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
    PermissionsBitField
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const activeRequests = new Map();

client.once("clientReady", () => {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);
});


// =============================
// DEPLOY PANEL (PREFIX COMMAND)
// =============================
client.on("messageCreate", async (message) => {
    if (message.content !== "!deploypanel") return;
    if (!message.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) return;

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🎟 Nickname Management System")
        .setDescription(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "Ubah nickname server Anda melalui sistem approval resmi.\n\n" +
            "• Request akan ditinjau oleh Staff\n" +
            "• Maksimal 32 karakter\n" +
            "• Gunakan nama sesuai peraturan server\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        )
        .setImage("https://i.imgur.com/b1f3T4V.png") // Ganti banner
        .setFooter({
            text: "KEJAWEN TEAM • Nickname Enterprise System",
            iconURL: message.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("open_request_modal")
            .setLabel("Request Nickname")
            .setEmoji("✏️")
            .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({
        embeds: [embed],
        components: [row]
    });

    await message.delete(); // Hapus command agar clean
});


// =============================
// INTERACTION HANDLER
// =============================
client.on("interactionCreate", async (interaction) => {

    // ================= BUTTON OPEN MODAL
    if (interaction.isButton() && interaction.customId === "open_request_modal") {

        if (activeRequests.has(interaction.user.id)) {
            return interaction.reply({
                content: "❌ Kamu masih memiliki request aktif.",
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("nickname_request_modal")
            .setTitle("Request Nickname");

        const nicknameInput = new TextInputBuilder()
            .setCustomId("nickname_input")
            .setLabel("Masukkan nickname baru")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(32)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(nicknameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    // ================= MODAL SUBMIT
    if (interaction.isModalSubmit() && interaction.customId === "nickname_request_modal") {

        const nickname = interaction.fields.getTextInputValue("nickname_input");

        activeRequests.set(interaction.user.id, nickname);

        const embed = new EmbedBuilder()
            .setColor("#FEE75C")
            .setTitle("📥 Nickname Request")
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "User", value: `${interaction.user}`, inline: true },
                { name: "Requested Name", value: nickname, inline: true }
            )
            .setFooter({
                text: "Menunggu approval staff",
                iconURL: interaction.guild.iconURL({ dynamic: true })
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

        await interaction.reply({
            content: "✅ Request berhasil dikirim.",
            ephemeral: true
        });

        interaction.channel.send({
            embeds: [embed],
            components: [row]
        });
    }

    // ================= APPROVE / REJECT
    if (interaction.isButton()) {

        if (!interaction.member.roles.cache.has(process.env.APPROVER_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Hanya staff yang dapat melakukan aksi ini.",
                ephemeral: true
            });
        }

        const [action, userId] = interaction.customId.split("_");
        const member = await interaction.guild.members.fetch(userId).catch(() => null);

        if (!member) return;

        const nickname = activeRequests.get(userId);

        const now = new Date().toLocaleString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        if (action === "approve") {

            await member.setNickname(nickname).catch(() => null);
            activeRequests.delete(userId);

            const embed = new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("✅ Nickname Approved")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `**Nickname berhasil diganti menjadi:**\n` +
                    `\`${nickname}\`\n\n` +
                    `• Request oleh: ${member}\n` +
                    `• Disetujui oleh: ${interaction.user}\n` +
                    `• Waktu: ${now}`
                )
                .setFooter({
                    text: "KEJAWEN TEAM • Nickname Enterprise System",
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.update({
                embeds: [embed],
                components: []
            });
        }

        if (action === "reject") {

            activeRequests.delete(userId);

            const embed = new EmbedBuilder()
                .setColor("#ED4245")
                .setTitle("❌ Nickname Ditolak")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `Request nickname dari ${member} telah ditolak.\n\n` +
                    `• Ditolak oleh: ${interaction.user}\n` +
                    `• Waktu: ${now}`
                )
                .setFooter({
                    text: "KEJAWEN TEAM • Nickname Enterprise System",
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.update({
                embeds: [embed],
                components: []
            });
        }
    }
});

client.login(process.env.TOKEN);
