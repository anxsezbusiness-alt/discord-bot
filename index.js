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
    ChannelType,
    PermissionsBitField
} = require('discord.js');
const cron = require('node-cron');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- KONFIGURATION ---
// Stelle sicher, dass diese Namen EXAKT so in Railway bei "Variables" stehen!
const SELL_CHANNEL_ID = process.env.SELL_CHANNEL_ID; 
const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID;

const activeUploads = new Map();
const itemStats = new Map();

// --- REFRESH FUNKTION ---
async function refreshPanels() {
    console.log(`[${new Date().toLocaleTimeString()}] 🔄 Starte Refresh...`);

    // 1. SELL PANEL (latest-goods)
    try {
        const sellChan = await client.channels.fetch(SELL_CHANNEL_ID);
        if (sellChan) {
            const msgs = await sellChan.messages.fetch({ limit: 50 });
            const oldPanels = msgs.filter(m => m.author.id === client.user.id && m.embeds[0]?.title === "📦 SELL YOUR PIECE");
            for (const m of oldPanels.values()) await m.delete().catch(() => {});

            const embed = new EmbedBuilder()
                .setTitle("📦 SELL YOUR PIECE")
                .setDescription("Klicke unten, um dein Piece anzubieten.")
                .setColor("#000000");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("start_upload").setLabel("SELL PIECE").setStyle(ButtonStyle.Primary)
            );

            await sellChan.send({ embeds: [embed], components: [row] });
            console.log("✅ Sell-Panel aktualisiert.");
        }
    } catch (err) {
        console.error("❌ Fehler im Sell-Channel: ID falsch oder keine Rechte!", err.message);
    }

    // 2. TEAM PANEL (find-crew)
    try {
        const teamChan = await client.channels.fetch(TEAM_CHANNEL_ID);
        if (teamChan) {
            const msgs = await teamChan.messages.fetch({ limit: 50 });
            const oldPanels = msgs.filter(m => m.author.id === client.user.id && m.embeds[0]?.title === "🤝 FIND A TEAM");
            for (const m of oldPanels.values()) await m.delete().catch(() => {});

            const embed = new EmbedBuilder()
                .setTitle("🤝 FIND A TEAM")
                .setDescription("Suche hier nach Partnern.")
                .setColor("#2ecc71");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("start_teamup").setLabel("TEAM-UP").setStyle(ButtonStyle.Success)
            );

            await teamChan.send({ embeds: [embed], components: [row] });
            console.log("✅ Team-Panel aktualisiert.");
        }
    } catch (err) {
        console.error("❌ Fehler im Team-Channel: ID falsch oder keine Rechte!", err.message);
    }
}

// --- EVENTS ---
client.once("ready", async () => {
    console.log(`🚀 ${client.user.tag} ist online und bereit!`);
    
    // Panels sofort beim Start senden
    await refreshPanels();

    // Alle 5 Minuten Refresh
    cron.schedule('*/5 * * * *', async () => {
        await refreshPanels();
    });
});

client.on("interactionCreate", async interaction => {
    // Buttons für Modals
    if (interaction.isButton()) {
        if (interaction.customId === "start_upload") {
            const modal = new ModalBuilder().setCustomId("upload_modal").setTitle("Piece Details");
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("title").setLabel("Name").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("price").setLabel("Preis").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("url").setLabel("Link (Vinted/Web)").setStyle(TextInputStyle.Short).setRequired(true))
            );
            return interaction.showModal(modal);
        }
        if (interaction.customId === "start_teamup") {
            const modal = new ModalBuilder().setCustomId("team_modal").setTitle("Team Suche");
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("desc").setLabel("Deine Suche").setStyle(TextInputStyle.Paragraph).setRequired(true)
            ));
            return interaction.showModal(modal);
        }
    }

    // Modal Submits
    if (interaction.isModalSubmit()) {
        if (interaction.customId === "upload_modal") {
            activeUploads.set(interaction.user.id, {
                title: interaction.fields.getTextInputValue("title"),
                price: interaction.fields.getTextInputValue("price"),
                url: interaction.fields.getTextInputValue("url"),
                imageUrl: null
            });
            return interaction.reply({ content: "⚠️ Bitte lade jetzt ein Foto hoch und schreibe danach `done`.", ephemeral: true });
        }
        if (interaction.customId === "team_modal") {
            const embed = new EmbedBuilder()
                .setTitle("🤝 TEAM-UP GESUCH")
                .setDescription(interaction.fields.getTextInputValue("desc"))
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setColor("#2ecc71")
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: "Gesuch gepostet!", ephemeral: true });
        }
    }

    // Item Aktionen (SOLD, FAV, OFFER)
    if (interaction.isButton()) {
        const parts = interaction.customId.split("_");
        if (parts.length < 3) return;
        const [action, itemId, sellerId] = parts;

        if (action === "sold") {
            if (interaction.user.id !== sellerId) return interaction.reply({ content: "Nur der Verkäufer kann das!", ephemeral: true });
            await interaction.message.delete().catch(() => {});
            return interaction.reply({ content: "Item entfernt.", ephemeral: true });
        }

        if (action === "fav") {
            if (interaction.user.id === sellerId) return interaction.reply({ content: "Eigenes Item!", ephemeral: true });
            
            let favChan = interaction.guild.channels.cache.find(c => c.name === `favs-${interaction.user.username.toLowerCase()}`);
            if (!favChan) {
                favChan = await interaction.guild.channels.create({
                    name: `favs-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                    ]
                });
            }
            const copy = EmbedBuilder.from(interaction.message.embeds[0]);
            await favChan.send({ content: "⭐ Gespeichert:", embeds: [copy] });
            return interaction.reply({ content: "In Favoriten gespeichert!", ephemeral: true });
        }

        if (action === "offer") {
            if (interaction.user.id === sellerId) return interaction.reply({ content: "Eigenes Item!", ephemeral: true });
            const modal = new ModalBuilder().setCustomId(`moffer_${itemId}_${sellerId}`).setTitle("Angebot");
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("oprice").setLabel("Dein Preisangebot").setStyle(TextInputStyle.Short).setRequired(true)
            ));
            return interaction.showModal(modal);
        }
    }
});

// --- UPLOAD LOGIK ---
client.on("messageCreate", async message => {
    if (message.author.bot || !activeUploads.has(message.author.id)) return;
    const data = activeUploads.get(message.author.id);

    if (message.attachments.size > 0 && !data.imageUrl) {
        data.imageUrl = message.attachments.first().url;
        await message.delete().catch(() => {});
    }

    if (message.content.toLowerCase() === "done") {
        await message.delete().catch(() => {});
        const itemId = Date.now().toString();
        const embed = new EmbedBuilder()
            .setTitle(`📦 ${data.title}`)
            .addFields(
                { name: "💰 Preis", value: data.price, inline: true },
                { name: "👤 Seller", value: `<@${message.author.id}>`, inline: true }
            )
            .setColor("#ffffff");
        if (data.imageUrl) embed.setImage(data.imageUrl);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel("VINTED").setStyle(ButtonStyle.Link).setURL(data.url),
            new ButtonBuilder().setCustomId(`fav_${itemId}_${message.author.id}`).setLabel("❤️ Fav").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`offer_${itemId}_${message.author.id}`).setLabel("📩 Offer").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`sold_${itemId}_${message.author.id}`).setLabel("SOLD").setStyle(ButtonStyle.Danger)
        );

        const chan = await client.channels.fetch(SELL_CHANNEL_ID);
        await chan.send({ embeds: [embed], components: [row] });
        activeUploads.delete(message.author.id);
    }
});

client.login(process.env.TOKEN);