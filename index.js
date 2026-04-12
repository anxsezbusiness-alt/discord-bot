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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const SELL_CHANNEL_ID = process.env.SELL_CHANNEL_ID;
const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID;
const VIP_ROLE_NAME = 'VIP'; // 👈 HIER DEINE VIP ROLLE

const activeUploads = new Map();

function getImageAttachment(message) {
    return message.attachments.find(attachment =>
        attachment.contentType?.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp)$/i.test(attachment.name || '')
    );
}

// 🔥 DEAL ERKENNUNG
function isGoodDeal(data) {
    const text = `${data.title} ${data.price}`.toLowerCase();

    return (
        text.includes('%') ||
        text.includes('steal') ||
        text.includes('cheap') ||
        text.includes('billig') ||
        text.includes('rabatt') ||
        text.includes('discount') ||
        text.includes('sale')
    );
}

async function deleteFavoriteCopies(guild, itemId) {
    const favoriteChannels = guild.channels.cache.filter(channel =>
        channel.type === ChannelType.GuildText && channel.name.startsWith('favs-')
    );

    for (const channel of favoriteChannels.values()) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const copies = messages.filter(message =>
                message.author.id === client.user.id &&
                message.embeds[0]?.data?.footer?.text === `Item-ID: ${itemId}`
            );

            for (const copy of copies.values()) {
                await copy.delete().catch(() => {});
            }
        } catch (error) {
            console.error(`Fehler beim Löschen der Favoriten in ${channel.name}:`, error.message);
        }
    }
}

async function refreshPanels() {
    console.log(`[${new Date().toLocaleTimeString()}] Panels werden aktualisiert...`);

    try {
        const sellChan = await client.channels.fetch(SELL_CHANNEL_ID);
        if (sellChan) {
            const msgs = await sellChan.messages.fetch({ limit: 50 });
            const oldPanels = msgs.filter(
                message =>
                    message.author.id === client.user.id &&
                    message.embeds[0]?.title === '📦 SELL YOUR PIECE'
            );

            for (const message of oldPanels.values()) {
                await message.delete().catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setTitle('📦 SELL YOUR PIECE')
                .setDescription('Klicke unten auf den Button, um dein Item zum Verkauf anzubieten.')
                .setColor('#000000');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_upload')
                    .setLabel('SELL PIECE')
                    .setStyle(ButtonStyle.Primary)
            );

            await sellChan.send({ embeds: [embed], components: [row] });
        }
    } catch (err) {
        console.error('Fehler Sell-Channel:', err.message);
    }

    try {
        const teamChan = await client.channels.fetch(TEAM_CHANNEL_ID);
        if (teamChan) {
            const msgs = await teamChan.messages.fetch({ limit: 50 });
            const oldPanels = msgs.filter(
                message =>
                    message.author.id === client.user.id &&
                    message.embeds[0]?.title === '🤝 FIND A TEAM'
            );

            for (const message of oldPanels.values()) {
                await message.delete().catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setTitle('🤝 FIND A TEAM')
                .setDescription('Suche hier nach Partnern für deine Projekte.')
                .setColor('#2ecc71');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_teamup')
                    .setLabel('TEAM-UP')
                    .setStyle(ButtonStyle.Success)
            );

            await teamChan.send({ embeds: [embed], components: [row] });
        }
    } catch (err) {
        console.error('Fehler Team-Channel:', err.message);
    }
}

client.once('ready', async () => {
    console.log(`${client.user.tag} ist online!`);
    await refreshPanels();
    cron.schedule('*/5 * * * *', async () => {
        await refreshPanels();
    });
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'start_upload') {
            const modal = new ModalBuilder().setCustomId('upload_modal').setTitle('Piece Details');

            const pieceInput = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Piece')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const priceInput = new TextInputBuilder()
                .setCustomId('price')
                .setLabel('Preis')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const urlInput = new TextInputBuilder()
                .setCustomId('url')
                .setLabel('Vinted Link')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(pieceInput),
                new ActionRowBuilder().addComponents(priceInput),
                new ActionRowBuilder().addComponents(urlInput)
            );

            return interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'upload_modal') {
            activeUploads.set(interaction.user.id, {
                title: interaction.fields.getTextInputValue('title'),
                price: interaction.fields.getTextInputValue('price'),
                url: interaction.fields.getTextInputValue('url'),
                imageUrl: null
            });

            return interaction.reply({
                content: 'Bitte lade jetzt ein Foto hoch und schreibe danach `done`.',
                ephemeral: true
            });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !activeUploads.has(message.author.id)) return;

    const data = activeUploads.get(message.author.id);
    const imageAttachment = getImageAttachment(message);

    if (imageAttachment) {
        data.imageUrl = imageAttachment.url;
        await message.delete().catch(() => {});
    }

    if (message.content.toLowerCase() === 'done') {
        await message.delete().catch(() => {});

        const itemId = Date.now().toString();
        const embed = new EmbedBuilder()
            .setTitle(`📦 ${data.title}`)
            .addFields(
                { name: '💰 Preis', value: data.price, inline: true },
                { name: '👤 Verkäufer', value: `<@${message.author.id}>`, inline: true }
            )
            .setColor('#ffffff')
            .setFooter({ text: `Item-ID: ${itemId}` });

        if (data.imageUrl) embed.setImage(data.imageUrl);

        const chan = await client.channels.fetch(SELL_CHANNEL_ID);
        const sentMessage = await chan.send({ embeds: [embed] });

        // 🔥 VIP SYSTEM
        if (isGoodDeal(data)) {
            const vipRole = message.guild.roles.cache.find(r => r.name === VIP_ROLE_NAME);

            if (vipRole) {
                await chan.send({
                    content: `<@&${vipRole.id}> 🔥 Stark reduziertes Piece!`,
                    embeds: [embed]
                });
            }
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('VINTED').setStyle(ButtonStyle.Link).setURL(data.url),
            new ButtonBuilder().setLabel('Zum Post').setStyle(ButtonStyle.Link).setURL(sentMessage.url)
        );

        await sentMessage.edit({ components: [row] });
        activeUploads.delete(message.author.id);
    }
});

client.login(process.env.TOKEN);