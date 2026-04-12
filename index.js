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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Konfiguration über Railway Environment Variables
const SELL_CHANNEL_ID = process.env.SELL_CHANNEL_ID;
const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID;

const activeUploads = new Map();
const itemStats = new Map(); // itemId -> { favCount: 0, favUsers: [] }

// --- PANELS REFRESH BEIM START ---
async function refreshPanels() {
    try {
        const sellChan = await client.channels.fetch(SELL_CHANNEL_ID).catch(() => null);
        if (sellChan) {
            const msgs = await sellChan.messages.fetch({ limit: 20 }).catch(() => null);
            if (msgs) {
                const old = msgs.filter(m => m.author.id === client.user.id && m.embeds[0]?.title === "📦 SELL YOUR PIECE");
                for (const m of old.values()) await m.delete().catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setTitle("📦 SELL YOUR PIECE")
                .setDescription("Klicke auf den Button unten, um dein Piece zum Verkauf anzubieten.")
                .setColor("#000000");
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("start_upload").setLabel("SELL PIECE").setStyle(ButtonStyle.Primary)
            );
            await sellChan.send({ embeds: [embed], components: [row] });
        }

        const teamChan = await client.channels.fetch(TEAM_CHANNEL_ID).catch(() => null);
        if (teamChan) {
            const msgs = await teamChan.messages.fetch({ limit: 20 }).catch(() => null);
            if (msgs) {
                const old = msgs.filter(m => m.author.id === client.user.id && m.embeds[0]?.title === "🤝 FIND A TEAM");
                for (const m of old.values()) await m.delete().catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setTitle("🤝 FIND A TEAM")
                .setDescription("Suche hier nach Partnern für deine Resell-Projekte.")
                .setColor("#2ecc71");
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("start_teamup").setLabel("TEAM-UP").setStyle(ButtonStyle.Success)
            );
            await teamChan.send({ embeds: [embed], components: [row] });
        }
    } catch (err) {
        console.error("Fehler beim Refresh der Panels:", err);
    }
}

client.once("ready", () => {
    console.log(`✅ Bot ${client.user.tag} ist online!`);
    refreshPanels();
});

// --- INTERACTION HANDLER ---
client.on("interactionCreate", async interaction => {
    
    // MODALS ÖFFNEN
    if (interaction.isButton()) {
        if (interaction.customId === "start_upload") {
            const modal = new ModalBuilder().setCustomId("upload_modal").setTitle("Piece Details");
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("title").setLabel("Name des Pieces").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("price").setLabel("Preis").setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("url").setLabel("Link (Vinted/Web)").setStyle(TextInputStyle.Short).setRequired(true))
            );
            return interaction.showModal(modal);
        }

        if (interaction.customId === "start_teamup") {
            const modal = new ModalBuilder().setCustomId("team_modal").setTitle("Team Suche");
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("desc").setLabel("Deine Suche/Angebot").setStyle(TextInputStyle.Paragraph).setRequired(true)
            ));
            return interaction.showModal(modal);
        }
    }

    // MODAL SUBMITS
    if (interaction.isModalSubmit()) {
        if (interaction.customId === "upload_modal") {
            activeUploads.set(interaction.user.id, {
                title: interaction.fields.getTextInputValue("title"),
                price: interaction.fields.getTextInputValue("price"),
                url: interaction.fields.getTextInputValue("url"),
                imageUrl: null
            });
            return interaction.reply({ content: "⚠️ Bitte lade jetzt **das Foto** hoch und schreibe danach `done` in diesen Kanal.", ephemeral: true });
        }

        if (interaction.customId === "team_modal") {
            const embed = new EmbedBuilder()
                .setTitle("🤝 TEAM-UP GESUCH")
                .setDescription(interaction.fields.getTextInputValue("desc"))
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setColor("#2ecc71")
                .setTimestamp();
            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: "Dein Team-Gesuch wurde gepostet!", ephemeral: true });
        }
    }

    // ITEM AKTIONEN (SOLD, FAV, OFFER, STATS)
    if (interaction.isButton()) {
        const parts = interaction.customId.split("_");
        if (parts.length < 3) return;
        const [action, itemId, sellerId] = parts;
        const isSeller = interaction.user.id === sellerId;

        // VERKÄUFER-AKTIONEN
        if (action === "sold") {
            if (!isSeller) return interaction.reply({ content: "❌ Nur der Verkäufer kann dieses Item löschen.", ephemeral: true });
            await interaction.message.delete().catch(() => {});
            return interaction.reply({ content: "✅ Item erfolgreich gelöscht.", ephemeral: true });
        }

        if (action === "stats") {
            if (!isSeller) return interaction.reply({ content: "❌ Nur der Verkäufer kann die Favoriten sehen.", ephemeral: true });
            const stats = itemStats.get(itemId) || { favCount: 0 };
            return interaction.reply({ content: `📊 Dieses Piece wurde von **${stats.favCount} Usern** favorisiert.`, ephemeral: true });
        }

        // KÄUFER-AKTIONEN
        if (action === "fav") {
            if (isSeller) return interaction.reply({ content: "❌ Du kannst dein eigenes Piece nicht favorisieren.", ephemeral: true });
            
            let stats = itemStats.get(itemId) || { favCount: 0, favUsers: [] };
            if (stats.favUsers.includes(interaction.user.id)) return interaction.reply({ content: "Schon favorisiert!", ephemeral: true });
            
            stats.favCount++;
            stats.favUsers.push(interaction.user.id);
            itemStats.set(itemId, stats);

            // Favoriten Kanal Logik
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
            await favChan.send({ content: "⭐ Dein gespeichertes Piece:", embeds: [copy] });
            return interaction.reply({ content: "❤️ Zu deinen Favoriten hinzugefügt!", ephemeral: true });
        }

        if (action === "offer") {
            if (isSeller) return interaction.reply({ content: "❌ Du kannst dir selbst kein Angebot machen.", ephemeral: true });
            const modal = new ModalBuilder().setCustomId(`moffer_${itemId}_${sellerId}`).setTitle("Angebot senden");
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("oprice").setLabel("Dein Preisangebot").setStyle(TextInputStyle.Short).setRequired(true)
            ));
            return interaction.showModal(modal);
        }
    }

    // OFFER SUBMIT & VERHANDLUNG
    if (interaction.isModalSubmit() && interaction.customId.startsWith("moffer")) {
        const [, itemId, sellerId] = interaction.customId.split("_");
        const offerPrice = interaction.fields.getTextInputValue("oprice");

        const channel = await interaction.guild.channels.create({
            name: `🤝-offer-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: sellerId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`acc_${channel.id}`).setLabel("Annehmen").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`dec_${channel.id}`).setLabel("Ablehnen").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ 
            content: `<@${sellerId}>! <@${interaction.user.id}> bietet **${offerPrice}**.\nNimm an für 60 Min. Chat oder lehne ab.`, 
            components: [row] 
        });
        return interaction.reply({ content: `✅ Verhandlungschannel erstellt: <#${channel.id}>`, ephemeral: true });
    }

    // ACCEPT/DECLINE LOGIK
    if (interaction.isButton() && (interaction.customId.startsWith("acc") || interaction.customId.startsWith("dec"))) {
        const [action, chanId] = interaction.customId.split("_");
        const chan = interaction.guild.channels.cache.get(chanId);
        if (action === "acc") {
            await interaction.reply("✅ Angenommen! Ihr habt 60 Minuten Zeit.");
            setTimeout(() => chan?.delete().catch(() => {}), 3600000);
        } else {
            await interaction.reply("❌ Abgelehnt. Kanal wird gelöscht.");
            setTimeout(() => chan?.delete().catch(() => {}), 5000);
        }
    }
});

// --- UPLOAD LOGIK (FOTOS & DONE) ---
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (activeUploads.has(message.author.id)) {
        const data = activeUploads.get(message.author.id);

        // Bild erkennen und Nachricht löschen
        if (message.attachments.size > 0 && !data.imageUrl) {
            data.imageUrl = message.attachments.first().url;
            await message.delete().catch(() => {});
        }

        // Abschluss
        if (message.content.toLowerCase() === "done") {
            await message.delete().catch(() => {});
            const itemId = Date.now().toString();
            
            const embed = new EmbedBuilder()
                .setTitle(`📦 ${data.title}`)
                .setColor("#ffffff")
                .addFields(
                    { name: "💰 Preis", value: data.price, inline: true },
                    { name: "👤 Verkäufer", value: `<@${message.author.id}>`, inline: true }
                )
                .setTimestamp();
            
            if (data.imageUrl) embed.setImage(data.imageUrl);

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel("VINTED").setStyle(ButtonStyle.Link).setURL(data.url),
                new ButtonBuilder().setCustomId(`fav_${itemId}_${message.author.id}`).setLabel("❤️ Fav").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`offer_${itemId}_${message.author.id}`).setLabel("📩 Offer").setStyle(ButtonStyle.Success)
            );
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`sold_${itemId}_${message.author.id}`).setLabel("SOLD").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`stats_${itemId}_${message.author.id}`).setLabel("📊 Stats").setStyle(ButtonStyle.Secondary)
            );

            const chan = await client.channels.fetch(SELL_CHANNEL_ID);
            await chan.send({ embeds: [embed], components: [row1, row2] });
            activeUploads.delete(message.author.id);
        }
    }
});

// LOGIN (Railway Variable)
client.login(process.env.TOKEN);