const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionsBitField,
    AttachmentBuilder
} = require('discord.js');
const cron = require('node-cron');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const TIMEZONE = process.env.BOT_TIMEZONE || 'Europe/Berlin';

// --- CONFIG ---
const SELL_CHANNEL_ID = process.env.SELL_CHANNEL_ID || '1492261103315587354';
const TEAM_CHANNEL_ID = process.env.TEAM_CHANNEL_ID || null;
const SALES_CHANNEL_ID = process.env.SALES_CHANNEL_ID || '1492593772884660224';
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID || '1492255500434407630';
const TUTORIAL_CHANNEL_ID = process.env.TUTORIAL_CHANNEL_ID || null;
const INFO_CHANNEL_ID = process.env.INFO_CHANNEL_ID || null;

const VIP_SOURCE_CHANNEL_ID = process.env.VIP_SOURCE_CHANNEL_ID || '1492261103315587354';
const VIP_ALERT_CHANNEL_ID = process.env.VIP_ALERT_CHANNEL_ID || '1492261194487037952';
const VIP_ROLE_ID = process.env.VIP_ROLE_ID || null;
const VIP_ROLE_NAME = process.env.VIP_ROLE_NAME || 'VIP';
const VIP_MAX_PRICE_EUR = Number(process.env.VIP_MAX_PRICE_EUR || 35);
const LATEST_GOODS_CHANNEL_ID = process.env.LATEST_GOODS_CHANNEL_ID || SELL_CHANNEL_ID;

const MOCKUP_CHANNEL_ID = process.env.MOCKUP_CHANNEL_ID || '1500527497345761533';
const MOCKUP_REPORT_CHANNEL_ID = process.env.MOCKUP_REPORT_CHANNEL_ID || '1492261750110949509';
const MOCKUP_STORE_PATH = path.join(__dirname, 'mockup-submissions.json');
const MOCKUP_PANEL_TITLE = 'TEILE DEIN MOCKUP FUER VELOO ARCHIVE';
const MOCKUP_VOTE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MOCKUP_WEEKLY_CRON = process.env.MOCKUP_WEEKLY_CRON || '0 0 * * 1';
const OUTFIT_CHANNEL_ID = process.env.OUTFIT_CHANNEL_ID || '1500934646265810965';
const OUTFIT_PANEL_TITLE = 'POSTE DEINEN FIT';
const OUTFIT_DAILY_CRON = process.env.OUTFIT_DAILY_CRON || '0 0 * * *';
const ISO_CHANNEL_ID = process.env.ISO_CHANNEL_ID || '1492913251577626724';
const ISO_PANEL_TITLE = 'SUCHE / ISO';
const COOPERATION_CHANNEL_ID = process.env.COOPERATION_CHANNEL_ID || '1500941631606624396';
const CREATOR_CHANNEL_ID = process.env.CREATOR_CHANNEL_ID || '1501550981421207562';
const CREATOR_REVIEW_CHANNEL_ID = process.env.CREATOR_REVIEW_CHANNEL_ID || '1492261750110949509';
const MONTHLY_ACTIVITY_CHANNEL_ID = process.env.MONTHLY_ACTIVITY_CHANNEL_ID || '1500944487357223092';
const MONTHLY_ACTIVITY_CRON = process.env.MONTHLY_ACTIVITY_CRON || '0 0 1 * *';
const COMMUNITY_COOKED_CHANNEL_ID = process.env.COMMUNITY_COOKED_CHANNEL_ID || '1501207095092183201';
const COMMUNITY_COOKED_CRON = process.env.COMMUNITY_COOKED_CRON || '0 0 1 * *';
const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID || '1492261145078272230';
const REACTION_ROLE_CHANNEL_ID = process.env.REACTION_ROLE_CHANNEL_ID || '1492255500434407631';
const MODERATOR_ROLE_ID = process.env.MODERATOR_ROLE_ID || null;
const MODERATOR_ROLE_NAME = process.env.MODERATOR_ROLE_NAME || '𝘔𝘰𝘥𝘦𝘳𝘢𝘵𝘰𝘳';
const TIKTOK_URL = process.env.TIKTOK_URL || 'https://www.tiktok.com/@velooarchive';
const SECONDARY_TIKTOK_LABEL = process.env.SECONDARY_TIKTOK_LABEL || 'LCV Vintage TikTok';
const SECONDARY_TIKTOK_URL = process.env.SECONDARY_TIKTOK_URL || 'https://www.tiktok.com/@lcv_vintage';
const INSTAGRAM_HANDLE = process.env.INSTAGRAM_HANDLE || '@velooarchive';
const INSTAGRAM_URL = process.env.INSTAGRAM_URL || 'https://www.instagram.com/velooarchive/';
const WHATSAPP_CHANNEL_URL = process.env.WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8Qc1zEAKW5GYGaSJ3N';
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'velooarchive@gmail.com';
const MAIN_REPLY_COOLDOWN_MS = Number(process.env.MAIN_REPLY_COOLDOWN_MS || 30000);
const TRUSTED_SELLER_ROLE_ID = process.env.TRUSTED_SELLER_ROLE_ID || null;
const TRUSTED_SELLER_ROLE_NAME = process.env.TRUSTED_SELLER_ROLE_NAME || '𝐓𝐫𝐮𝐬𝐭𝐞𝐝𝐒𝐞𝐥𝐥𝐞𝐫';
const TRUSTED_SELLER_MIN_SALES = Number(process.env.TRUSTED_SELLER_MIN_SALES || 5);
const OWNER_ROLE_ID = process.env.OWNER_ROLE_ID || null;
const OWNER_ROLE_NAME = process.env.OWNER_ROLE_NAME || '𝘖𝘸𝘯𝘦𝘳';
const CONTENT_CREATOR_ROLE_ID = process.env.CONTENT_CREATOR_ROLE_ID || null;
const CONTENT_CREATOR_ROLE_NAME = process.env.CONTENT_CREATOR_ROLE_NAME || '𝐂𝐎𝐍𝐓𝐄𝐍𝐓 𝐂𝐑𝐄𝐀𝐓𝐎𝐑';
const EFFECTIVE_MODERATOR_ROLE_NAME = process.env.MODERATOR_ROLE_NAME || '𝘔𝘰𝘥𝘦𝘳𝘢𝘵𝘰𝘳';
const EFFECTIVE_TRUSTED_SELLER_ROLE_NAME = process.env.TRUSTED_SELLER_ROLE_NAME || '𝐓𝐫𝐮𝐬𝐭𝐞𝐝𝐒𝐞𝐥𝐥𝐞𝐫';
const SELL_PANEL_TITLE = 'VELOO ARCHIVE / MARKT';
const TEAM_PANEL_TITLE = 'VELOO ARCHIVE / TEAMFINDER';
const WELCOME_PANEL_TITLE = 'WILLKOMMEN BEI VELOO ARCHIVE';
const ROLE_PANEL_TITLE = 'VELOO&YESTERA / ROLLEN';
const RULES_PANEL_TITLE = '📜 VELOO&YESTERA REGELN';
const COOPERATION_PANEL_TITLE = '🤝 COOPERATIONS';
const CREATOR_PANEL_TITLE = '🎥 CREATOR BEWERBUNG';
const DEFAULT_MODERATOR_ROLE_NAME = process.env.MODERATOR_ROLE_NAME || '𝘔𝘰𝘥𝘦𝘳𝘢𝘵𝘰𝘳';
const DEFAULT_TRUSTED_SELLER_ROLE_NAME = process.env.TRUSTED_SELLER_ROLE_NAME || '𝐓𝐫𝐮𝐬𝐭𝐞𝐝𝐒𝐞𝐥𝐥𝐞𝐫';
const DEFAULT_REACTION_ROLE_OPTIONS = [
    {
        value: 'role_vintage',
        roleName: '𝑽𝒊𝒏𝒕𝒂𝒈𝒆',
        label: 'Vintage',
        description: 'Fuer Vintage Content'
    },
    {
        value: 'role_vintage_resell',
        roleName: '𝑽𝒊𝒏𝒕𝒂𝒈𝒆𝑹𝒆𝒔𝒆𝒍𝒍',
        label: 'VintageResell',
        description: 'Fuer Sales und Resell'
    },
    {
        value: 'role_mockups',
        roleName: '𝑴𝒐𝒄𝒌𝒖𝒑𝒔',
        label: 'Mockups',
        description: 'Fuer Design-Ideen'
    },
    {
        value: 'role_fits',
        roleName: '𝑭𝒊𝒕𝒔',
        label: 'Fits',
        description: 'Fuer Fit-Posts'
    },
    {
        value: 'role_brand_member',
        roleName: '𝑩𝒓𝒂𝒏𝒅𝑴𝑬𝑴𝑩𝑬𝑹',
        label: 'BrandMEMBER',
        description: 'Fuer Brand Updates'
    }
];

// TODO: Add restock / repost reminder flow.

const activeUploads = new Map();
const alertedVipMessages = new Set();
const forwardedBrandMessages = new Set();
const mainChannelReplyCooldowns = new Map();
let mockupStore = loadMockupStore();

const BRAND_CHANNEL_CONFIGS = [
    { label: 'Nike', keywords: ['nike'], channelId: '1500936023688085515' },
    { label: 'Adidas', keywords: ['adidas'], channelId: '1500936048593735830' },
    { label: 'Carhartt', keywords: ['carhartt'], channelId: '1500936090792759356' },
    { label: 'Stussy', keywords: ['stussy'], channelId: '1500936134425968881' },
    { label: 'Ralph Lauren', keywords: ['ralph lauren', 'ralph-lauren'], channelId: '1500936158853599404' },
    { label: 'Stone Island', keywords: ['stone island', 'stone-island'], channelId: '1500936182274719984' },
    { label: 'CP Company', keywords: ['cp company', 'cp-company'], channelId: '1500936223026450602' },
    { label: "Arc'teryx", keywords: ['arc teryx', 'arcteryx'], channelId: '1500936244815990844' },
    { label: 'Moncler', keywords: ['moncler'], channelId: '1500936265732718703' },
    { label: 'The North Face', keywords: ['the north face', 'the-north-face', 'tnf'], channelId: '1500936286830067764' },
    { label: 'Palm Angels', keywords: ['palm angels', 'palm-angels'], channelId: '1500936303854883008' },
    { label: 'Trapstar', keywords: ['trapstar'], channelId: '1500936321902837902' },
    { label: 'Chrome Hearts', keywords: ['chrome hearts', 'chrome-hearts'], channelId: '1500936350252142602' },
    { label: 'Burberry', keywords: ['burberry'], channelId: '1500936376940630016' },
    { label: 'Gucci', keywords: ['gucci'], channelId: '1500936401150283898' },
    { label: 'Prada', keywords: ['prada'], channelId: '1500936434897387642' },
    { label: 'Louis Vuitton', keywords: ['louis vuitton', 'louis-vuitton'], channelId: '1500936451318354067' },
    { label: 'Dior', keywords: ['dior'], channelId: '1500936474827297120' },
    { label: 'Off-White', keywords: ['off-white', 'off white'], channelId: '1500936495891222528' },
    { label: 'New Balance', keywords: ['new balance', 'new-balance'], channelId: '1500936510634070016' },
    { label: 'Chanel', keywords: ['chanel'], channelId: '1500936529978327140' },
    { label: 'Loewe', keywords: ['loewe'], channelId: '1500936553063780462' },
    { label: 'Fendi', keywords: ['fendi'], channelId: '1500936586588717148' },
    { label: 'Celine', keywords: ['celine'], channelId: '1500936616209023036' },
    { label: 'Coach', keywords: ['coach'], channelId: '1500936649356345486' },
    { label: 'Fear of God', keywords: ['fear of god', 'fear-of-god'], channelId: '1500936674098548806' },
    { label: 'Miu Miu', keywords: ['miu miu'], channelId: '1500936696089542686' },
    { label: 'Moncler', keywords: ['moncler'], channelId: '1500936732890235041' },
    { label: 'Vivienne Westwood', keywords: ['vivienne westwood', 'vivienne-westwood'], channelId: '1500936760044159287' },
    { label: 'Supreme', keywords: ['supreme'], channelId: '1500936788632539397' }
];

const REACTION_ROLE_OPTIONS = [
    {
        value: 'role_vintage',
        roleName: '𝑽𝒊𝒏𝒕𝒂𝒈𝒆',
        label: 'Vintage',
        description: 'Fuer Vintage Content und Finds'
    },
    {
        value: 'role_vintage_resell',
        roleName: '𝑽𝒊𝒏𝒕𝒂𝒈𝒆𝑹𝒆𝒔𝒆𝒍𝒍',
        label: 'VintageResell',
        description: 'Fuer Sales, Snipes und Resell'
    },
    {
        value: 'role_mockups',
        roleName: '𝑴𝒐𝒄𝒌𝒖𝒑𝒔',
        label: 'Mockups',
        description: 'Fuer Mockups und Design-Ideen'
    },
    {
        value: 'role_fits',
        roleName: '𝑭𝒊𝒕𝒔',
        label: 'Fits',
        description: 'Fuer Fit-Posts und Daily Wins'
    },
    {
        value: 'role_brand_member',
        roleName: '𝑩𝒓𝒂𝒏𝒅𝑴𝑬𝑴𝑩𝑬𝑹',
        label: 'BrandMEMBER',
        description: 'Fuer VELOO&YESTERA Brand Updates'
    }
];

const EFFECTIVE_REACTION_ROLE_OPTIONS = [
    {
        value: 'role_vintage',
        roleName: '𝑽𝒊𝒏𝒕𝒂𝒈𝒆',
        label: 'Vintage',
        description: 'Fuer Vintage Content'
    },
    {
        value: 'role_vintage_resell',
        roleName: '𝑽𝒊𝒏𝒕𝒂𝒈𝒆𝑹𝒆𝒔𝒆𝒍𝒍',
        label: 'VintageResell',
        description: 'Fuer Sales und Resell'
    },
    {
        value: 'role_mockups',
        roleName: '𝑴𝒐𝒄𝒌𝒖𝒑𝒔',
        label: 'Mockups',
        description: 'Fuer Design-Ideen'
    },
    {
        value: 'role_fits',
        roleName: '𝑭𝒊𝒕𝒔',
        label: 'Fits',
        description: 'Fuer Fit-Posts'
    },
    {
        value: 'role_brand_member',
        roleName: '𝑩𝒓𝒂𝒏𝒅𝑴𝑬𝑴𝑩𝑬𝑹',
        label: 'BrandMEMBER',
        description: 'Fuer Brand Updates'
    }
];

const ITEM_MIRROR_CHANNEL_IDS = [...new Set([
    SELL_CHANNEL_ID,
    ...BRAND_CHANNEL_CONFIGS.map(config => config.channelId)
])];

const BRAND_KEYWORDS = [
    'nike',
    'adidas',
    'stussy',
    'supreme',
    'carhartt',
    'ralph lauren',
    'stone island',
    'cp company',
    'arc teryx',
    'arcteryx',
    'moncler',
    'the north face',
    'tnf',
    'palm angels',
    'trapstar',
    'chrome hearts',
    'burberry',
    'gucci',
    'prada',
    'louis vuitton',
    'dior',
    'off-white',
    'off white',
    'yeezy',
    'new balance',
    'chanel',
    'loewe',
    'fendi',
    'celine',
    'coach',
    'fear of god',
    'miu miu',
    'vivienne westwood'
];

const ACTIVITY_POINTS = {
    join_server: 1,
    message_post: 1,
    teamup_post: 2,
    sell_upload: 4,
    sale_completed: 5,
    favorite_saved: 1,
    offer_sent: 2,
    mockup_upload: 4,
    mockup_like: 1,
    mockup_report: 1,
    iso_post: 2,
    outfit_upload: 4,
    outfit_like: 1
};

const ACTIVITY_LABELS = {
    join_server: 'Beitritte',
    message_post: 'Nachrichten',
    teamup_post: 'Team-Ups',
    sell_upload: 'Uploads',
    sale_completed: 'Verkaeufe',
    favorite_saved: 'Favoriten',
    offer_sent: 'Angebote',
    mockup_upload: 'Mockups',
    mockup_like: 'Mockup-Likes',
    mockup_report: 'Meldungen',
    iso_post: 'ISO',
    outfit_upload: 'Fits',
    outfit_like: 'Fit-Likes'
};

function createEmptyMockupStore() {
    return {
        submissions: {},
        announcedVoteWeeks: [],
        outfitSubmissions: {},
        announcedOutfitDates: [],
        listedItems: {},
        creatorApplications: {},
        activityByMonth: {},
        announcedActivityMonths: [],
        monthlyActivityWinners: {},
        announcedCommunityCookedMonths: [],
        communityCookedHistory: {}
    };
}

function loadMockupStore() {
    try {
        if (!fs.existsSync(MOCKUP_STORE_PATH)) {
            return createEmptyMockupStore();
        }

        const raw = fs.readFileSync(MOCKUP_STORE_PATH, 'utf8');
        const parsed = JSON.parse(raw);

        return {
            submissions: parsed.submissions && typeof parsed.submissions === 'object' ? parsed.submissions : {},
            announcedVoteWeeks: Array.isArray(parsed.announcedVoteWeeks) ? parsed.announcedVoteWeeks : [],
            outfitSubmissions: parsed.outfitSubmissions && typeof parsed.outfitSubmissions === 'object' ? parsed.outfitSubmissions : {},
            announcedOutfitDates: Array.isArray(parsed.announcedOutfitDates) ? parsed.announcedOutfitDates : [],
            listedItems: parsed.listedItems && typeof parsed.listedItems === 'object' ? parsed.listedItems : {},
            creatorApplications:
                parsed.creatorApplications && typeof parsed.creatorApplications === 'object'
                    ? parsed.creatorApplications
                    : {},
            activityByMonth: parsed.activityByMonth && typeof parsed.activityByMonth === 'object' ? parsed.activityByMonth : {},
            announcedActivityMonths: Array.isArray(parsed.announcedActivityMonths) ? parsed.announcedActivityMonths : [],
            monthlyActivityWinners:
                parsed.monthlyActivityWinners && typeof parsed.monthlyActivityWinners === 'object'
                    ? parsed.monthlyActivityWinners
                    : {},
            announcedCommunityCookedMonths: Array.isArray(parsed.announcedCommunityCookedMonths)
                ? parsed.announcedCommunityCookedMonths
                : [],
            communityCookedHistory:
                parsed.communityCookedHistory && typeof parsed.communityCookedHistory === 'object'
                    ? parsed.communityCookedHistory
                    : {}
        };
    } catch (error) {
        console.error('Mockup store could not be loaded:', error.message);
        return createEmptyMockupStore();
    }
}

function saveMockupStore() {
    try {
        fs.writeFileSync(MOCKUP_STORE_PATH, JSON.stringify(mockupStore, null, 2), 'utf8');
    } catch (error) {
        console.error('Mockup store could not be saved:', error.message);
    }
}

function getEmbedFooterText(embed) {
    return embed?.footer?.text || embed?.data?.footer?.text || '';
}

function normalizeSearchText(text) {
    return (text || '')
        .toLowerCase()
        .replace(/['\u2019]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getMonthKey(date = new Date()) {
    const { year, month } = getBerlinDateParts(date);
    return `${year}-${String(month).padStart(2, '0')}`;
}

function getPreviousMonthKey(date = new Date()) {
    let { year, month } = getBerlinDateParts(date);
    month -= 1;

    if (month === 0) {
        month = 12;
        year -= 1;
    }

    return `${year}-${String(month).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey) {
    return new Intl.DateTimeFormat('de-DE', {
        timeZone: TIMEZONE,
        month: 'long',
        year: 'numeric'
    }).format(new Date(`${monthKey}-01T00:00:00.000Z`));
}

function getActivityDisplayName(activityEntry, userId) {
    return activityEntry?.displayName || `<@${userId}>`;
}

function containsAnyKeyword(text, keywords) {
    return keywords.some(keyword => text.includes(normalizeSearchText(keyword)));
}

function summarizeActivityBreakdown(breakdown = {}) {
    const orderedEntries = Object.entries(breakdown)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6);

    if (!orderedEntries.length) {
        return 'Keine Details vorhanden.';
    }

    return orderedEntries
        .map(([activityKey, count]) => `${ACTIVITY_LABELS[activityKey] || activityKey}: ${count}`)
        .join('\n');
}

function recordUserActivity(userId, activityKey, options = {}) {
    if (!userId || !activityKey) {
        return;
    }

    const now = new Date();
    const monthKey = getMonthKey(now);
    const monthBucket = mockupStore.activityByMonth[monthKey] || {};
    const existingEntry = monthBucket[userId] || {
        userId,
        displayName: options.displayName || null,
        points: 0,
        totalActions: 0,
        breakdown: {},
        lastActivityAt: null,
        cooldowns: {}
    };

    const increment = Math.max(1, Number(options.increment || 1));
    const pointsPerAction = ACTIVITY_POINTS[activityKey] || 1;
    const cooldownMs = Math.max(0, Number(options.cooldownMs || 0));

    existingEntry.displayName = options.displayName || existingEntry.displayName || userId;
    existingEntry.cooldowns = existingEntry.cooldowns && typeof existingEntry.cooldowns === 'object'
        ? existingEntry.cooldowns
        : {};

    if (cooldownMs > 0) {
        const lastCooldownAt = new Date(existingEntry.cooldowns[activityKey] || 0).getTime();
        if (Number.isFinite(lastCooldownAt) && now.getTime() - lastCooldownAt < cooldownMs) {
            return;
        }

        existingEntry.cooldowns[activityKey] = now.toISOString();
    }

    existingEntry.points += pointsPerAction * increment;
    existingEntry.totalActions += increment;
    existingEntry.breakdown[activityKey] = (existingEntry.breakdown[activityKey] || 0) + increment;
    existingEntry.lastActivityAt = now.toISOString();

    monthBucket[userId] = existingEntry;
    mockupStore.activityByMonth[monthKey] = monthBucket;
    saveMockupStore();
}

function pickMostActiveMember(monthBucket) {
    return Object.entries(monthBucket).sort((left, right) => {
        const [, leftEntry] = left;
        const [, rightEntry] = right;

        if (rightEntry.points !== leftEntry.points) {
            return rightEntry.points - leftEntry.points;
        }

        if (rightEntry.totalActions !== leftEntry.totalActions) {
            return rightEntry.totalActions - leftEntry.totalActions;
        }

        return new Date(rightEntry.lastActivityAt || 0).getTime() - new Date(leftEntry.lastActivityAt || 0).getTime();
    });
}

function buildMonthlyActivityEmbeds(monthKey, sortedEntries) {
    const [winnerUserId, winnerEntry] = sortedEntries[0];
    const leaderboard = sortedEntries
        .slice(0, 3)
        .map(([userId, entry], index) =>
            `${index + 1}. <@${userId}> - ${entry.points} Punkte (${entry.totalActions} Aktionen)`
        )
        .join('\n');

    const summaryEmbed = new EmbedBuilder()
        .setTitle('Aktivstes Mitglied')
        .setDescription(
            `<@${winnerUserId}> war im ${formatMonthLabel(monthKey)} die aktivste Person auf dem Server.\n` +
            'Gewertet werden Uploads, Likes, Sales, Team-Ups und regelmaessige Chat-Aktivitaet.'
        )
        .addFields(
            { name: 'Punkte', value: String(winnerEntry.points), inline: true },
            { name: 'Aktionen', value: String(winnerEntry.totalActions), inline: true },
            { name: 'Name', value: getActivityDisplayName(winnerEntry, winnerUserId), inline: true },
            { name: 'Top Aktivitaeten', value: summarizeActivityBreakdown(winnerEntry.breakdown), inline: false },
            { name: 'Top 3', value: leaderboard, inline: false }
        )
        .setColor('#f1c40f')
        .setFooter({ text: `Aktivster Monat: ${monthKey}` })
        .setTimestamp();

    return [summaryEmbed];
}

function getListedItem(itemId) {
    const listedItem = mockupStore.listedItems[itemId];
    if (!listedItem) {
        return null;
    }

    if (!Array.isArray(listedItem.favoriteUserIds)) {
        listedItem.favoriteUserIds = [];
    }

    if (!Array.isArray(listedItem.offerUserIds)) {
        listedItem.offerUserIds = [];
    }

    if (typeof listedItem.reservedAt === 'undefined') {
        listedItem.reservedAt = null;
    }

    return listedItem;
}

function getCommunityCookedScore(listedItem) {
    const favoriteCount = listedItem.favoriteUserIds?.length || 0;
    const offerCount = listedItem.offerUserIds?.length || 0;
    const soldBonus = listedItem.soldAt ? 4 : 0;
    return favoriteCount * 3 + offerCount * 2 + soldBonus;
}

function pickCommunityCookedItems(items) {
    return [...items].sort((left, right) => {
        const scoreDifference = getCommunityCookedScore(right) - getCommunityCookedScore(left);
        if (scoreDifference !== 0) {
            return scoreDifference;
        }

        const favoriteDifference = (right.favoriteUserIds?.length || 0) - (left.favoriteUserIds?.length || 0);
        if (favoriteDifference !== 0) {
            return favoriteDifference;
        }

        const offerDifference = (right.offerUserIds?.length || 0) - (left.offerUserIds?.length || 0);
        if (offerDifference !== 0) {
            return offerDifference;
        }

        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });
}

function buildCommunityCookedEmbeds(monthKey, topItems) {
    const summaryLines = topItems.map((item, index) =>
        `${index + 1}. **${item.brand} ${item.title}** - ${getCommunityCookedScore(item)} Score`
    );

    const summaryEmbed = buildPanelEmbed({
        title: 'COMMUNITY COOKED THIS',
        description:
            `Die staerksten Community-Pieces aus ${formatMonthLabel(monthKey)}.\n\n` +
            summaryLines.join('\n'),
        color: '#c8b79c',
        footerText: `VELOO ARCHIVE // COMMUNITY COOKED // ${monthKey}`
    });

    const itemEmbeds = topItems.map((item, index) => {
        const itemEmbed = buildPanelEmbed({
            title: `LOOK ${index + 1} / ${item.brand} ${item.title}`.trim(),
            description: item.soldAt
                ? 'Dieses Piece wurde verkauft und hat den Monat trotzdem gecookt.'
                : 'Community-Favorit aus dem letzten Monat.',
            color: item.soldAt ? '#b78656' : '#d8cdbf',
            fields: [
                { name: 'PREIS', value: item.price || 'Unbekannt', inline: true },
                { name: 'GROESSE', value: item.size || 'Unbekannt', inline: true },
                { name: 'VERKAEUFER', value: `<@${item.sellerId}>`, inline: true },
                { name: 'FAVORITEN', value: String(item.favoriteUserIds?.length || 0), inline: true },
                { name: 'ANGEBOTE', value: String(item.offerUserIds?.length || 0), inline: true },
                { name: 'PUNKTE', value: String(getCommunityCookedScore(item)), inline: true }
            ],
            footerText: `VELOO ARCHIVE // Item-ID: ${item.itemId}`
        });

        if (item.previewImageUrl) {
            itemEmbed.setImage(item.previewImageUrl);
        }

        return itemEmbed;
    });

    return [summaryEmbed, ...itemEmbeds];
}

function buildCommunityCookedRows(topItems) {
    return topItems
        .filter(item => item.messageUrl)
        .slice(0, 3)
        .map((item, index) =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(`LOOK ${index + 1} OEFFNEN`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(item.messageUrl)
            )
        );
}

function getDateKey(date = new Date()) {
    const { year, month, day } = getBerlinDateParts(date);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getPreviousDateKey(date = new Date()) {
    const currentDate = new Date(`${getDateKey(date)}T00:00:00.000Z`);
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    return currentDate.toISOString().slice(0, 10);
}

function getMessageBrandSearchText(message) {
    const embedText = (message.embeds || [])
        .map(embed => {
            const fieldText = (embed.fields || [])
                .map(field => `${field.name} ${field.value}`)
                .join(' ');

            return [
                embed.title || '',
                embed.description || '',
                fieldText,
                getEmbedFooterText(embed)
            ].join(' ');
        })
        .join(' ');

    return normalizeSearchText(`${message.content || ''} ${embedText}`);
}

function getMatchingBrandConfigs(message) {
    const searchableText = getMessageBrandSearchText(message);
    if (!searchableText) {
        return [];
    }

    return BRAND_CHANNEL_CONFIGS.filter(config =>
        config.keywords.some(keyword => searchableText.includes(normalizeSearchText(keyword)))
    );
}

function cloneMessageEmbedsWithResolvedImages(message) {
    const attachmentUrlsByName = new Map(
        [...message.attachments.values()].map(attachment => [attachment.name, attachment.url])
    );

    return message.embeds.map(embed => {
        const clonedEmbed = EmbedBuilder.from(embed);
        const imageUrl = embed.image?.url || embed.data?.image?.url || '';
        const thumbnailUrl = embed.thumbnail?.url || embed.data?.thumbnail?.url || '';

        if (imageUrl.startsWith('attachment://')) {
            const attachmentName = imageUrl.replace('attachment://', '');
            const replacementAttachment = attachmentUrlsByName.get(attachmentName) || message.attachments.first()?.url;
            if (replacementAttachment) {
                clonedEmbed.setImage(replacementAttachment);
            }
        }

        if (thumbnailUrl.startsWith('attachment://')) {
            const attachmentName = thumbnailUrl.replace('attachment://', '');
            const replacementAttachment = attachmentUrlsByName.get(attachmentName) || message.attachments.first()?.url;
            if (replacementAttachment) {
                clonedEmbed.setThumbnail(replacementAttachment);
            }
        }

        return clonedEmbed;
    });
}

function cloneMessageComponents(message) {
    if (!message.components?.length) {
        return [];
    }

    return message.components.map(row => {
        const clonedRow = new ActionRowBuilder();
        const buttons = row.components.map(component =>
            new ButtonBuilder(component.toJSON ? component.toJSON() : component.data || component)
        );
        clonedRow.addComponents(buttons);
        return clonedRow;
    });
}

function buildBrandForwardPayload(message) {
    const embeds = cloneMessageEmbedsWithResolvedImages(message);
    const components = cloneMessageComponents(message);

    if (embeds.length) {
        return { embeds, components };
    }

    const fallbackEmbed = new EmbedBuilder()
        .setTitle('Latest-Goods Hinweis')
        .setDescription(message.content || 'Neuer Post in latest-goods.')
        .setColor('#5865f2');

    const firstImage = getImageAttachments(message)[0];
    if (firstImage?.url) {
        fallbackEmbed.setImage(firstImage.url);
    }

    return {
        embeds: [fallbackEmbed],
        components: components.length
            ? components
            : [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Original oeffnen')
                        .setStyle(ButtonStyle.Link)
                        .setURL(message.url)
                )
            ]
    };
}

async function forwardLatestGoodsToBrandChannels(message) {
    if (message.channelId !== LATEST_GOODS_CHANNEL_ID) {
        return;
    }

    if (!message.guild || forwardedBrandMessages.has(message.id)) {
        return;
    }

    const matchingBrands = getMatchingBrandConfigs(message);
    if (!matchingBrands.length) {
        return;
    }

    const vipMention = await resolveVipMention(message.guild);
    const payload = buildBrandForwardPayload(message);

    for (const brandConfig of matchingBrands) {
        const brandChannel = await client.channels.fetch(brandConfig.channelId).catch(() => null);
        if (!brandChannel) {
            continue;
        }

        await brandChannel.send({
            content: `${vipMention} Neues ${brandConfig.label}-Piece wurde in latest-goods gepostet.`,
            embeds: payload.embeds,
            components: payload.components
        }).catch(error => {
            console.error(`Brand forward failed for ${brandConfig.label}:`, error.message);
        });
    }

    forwardedBrandMessages.add(message.id);
}

function getImageAttachments(message) {
    if (!message.attachments || message.attachments.size === 0) {
        return [];
    }

    return [...message.attachments.values()].filter(attachment =>
        attachment.contentType?.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|bmp)$/i.test(attachment.name || '')
    );
}

function sanitizeFileName(fileName) {
    const base = fileName || 'image.jpg';
    return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function buildImageFileFromAttachment(attachment, prefix = 'image', index = 0) {
    if (!attachment?.url) {
        return null;
    }

    try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = `${prefix}-${index + 1}-${sanitizeFileName(attachment.name || 'image.jpg')}`;

        return new AttachmentBuilder(buffer, { name: safeName });
    } catch (error) {
        console.error('Image could not be downloaded:', error.message);
        return null;
    }
}

async function buildImageFilesFromAttachments(attachments, prefix) {
    const files = [];

    for (let index = 0; index < attachments.length; index += 1) {
        const file = await buildImageFileFromAttachment(attachments[index], prefix, index);
        if (!file) {
            return [];
        }

        files.push(file);
    }

    return files;
}

function extractPrices(text) {
    const matches = [...text.matchAll(/(\d+(?:[.,]\d{1,2})?)/g)];
    return matches.map(match => Number(match[1].replace(',', '.'))).filter(Number.isFinite);
}

function getVipPieceData(message) {
    const embed = message.embeds?.[0];
    if (!embed) {
        return null;
    }

    const footerText = getEmbedFooterText(embed);
    if (!footerText.includes('Item-ID:')) {
        return null;
    }

    const title = embed.title || '';
    const description = embed.description || '';
    const fieldText = (embed.fields || [])
        .map(field => `${field.name} ${field.value}`)
        .join(' ');

    const combinedText = `${title} ${description} ${fieldText}`.toLowerCase();
    const brand = BRAND_KEYWORDS.find(keyword => combinedText.includes(keyword));
    const prices = extractPrices(fieldText);
    const currentPrice = prices.length ? Math.min(...prices) : null;

    return {
        embed,
        brand,
        currentPrice
    };
}

async function resolveVipMention(guild) {
    if (VIP_ROLE_ID) {
        return `<@&${VIP_ROLE_ID}>`;
    }

    const roleByName = guild.roles.cache.find(role => role.name === VIP_ROLE_NAME);
    if (roleByName) {
        return `<@&${roleByName.id}>`;
    }

    return `@${VIP_ROLE_NAME}`;
}

async function resolveModeratorMention(guild) {
    if (MODERATOR_ROLE_ID) {
        return `<@&${MODERATOR_ROLE_ID}>`;
    }

    const roleByName = guild.roles.cache.find(role => role.name === DEFAULT_MODERATOR_ROLE_NAME);
    if (roleByName) {
        return `<@&${roleByName.id}>`;
    }

    return `@${DEFAULT_MODERATOR_ROLE_NAME}`;
}

function findRoleByIdOrName(guild, roleId, roleName) {
    if (!guild?.roles?.cache) {
        return null;
    }

    if (roleId && guild.roles.cache.has(roleId)) {
        return guild.roles.cache.get(roleId);
    }

    return guild.roles.cache.find(role => role.name === roleName) || null;
}

function getReactionRoleConfigs() {
    return DEFAULT_REACTION_ROLE_OPTIONS.map(option => ({
        ...option,
        roleId: process.env[`REACTION_ROLE_ID_${option.value.toUpperCase()}`] || null
    }));
}

function buildReactionRoleSelectMenu() {
    return new StringSelectMenuBuilder()
        .setCustomId('reaction_roles_select')
        .setPlaceholder('Wähle deine Rollen aus')
        .setMinValues(0)
        .setMaxValues(DEFAULT_REACTION_ROLE_OPTIONS.length)
        .addOptions(
            DEFAULT_REACTION_ROLE_OPTIONS.map(option => ({
                label: option.label,
                description: option.description,
                value: option.value
            }))
        );
}

function buildReactionRoleRows() {
    return [
        new ActionRowBuilder().addComponents(buildReactionRoleSelectMenu())
    ];
}

function memberHasVipRole(member) {
    if (!member?.roles?.cache) {
        return false;
    }

    if (VIP_ROLE_ID && member.roles.cache.has(VIP_ROLE_ID)) {
        return true;
    }

    return member.roles.cache.some(role => role.name === VIP_ROLE_NAME);
}

function memberHasRoleByIdOrName(member, roleId, roleName) {
    if (!member?.roles?.cache) {
        return false;
    }

    if (roleId && member.roles.cache.has(roleId)) {
        return true;
    }

    return member.roles.cache.some(role => role.name === roleName);
}

function memberHasOwnerRole(member) {
    return memberHasRoleByIdOrName(member, OWNER_ROLE_ID, OWNER_ROLE_NAME);
}

function memberCanReviewCreatorApplication(member) {
    return (
        memberHasOwnerRole(member) ||
        memberHasRoleByIdOrName(member, MODERATOR_ROLE_ID, EFFECTIVE_MODERATOR_ROLE_NAME)
    );
}

function getChannelMention(channelId, fallbackText) {
    return channelId ? `<#${channelId}>` : fallbackText;
}

function getMemberDisplayName(member, user) {
    return member?.displayName || user?.globalName || user?.username || 'Member';
}

function buildVipHighlightField() {
    return {
        name: 'VIP Vorteil',
        value: 'Dieser Post wurde mit VIP hervorgehoben.',
        inline: false
    };
}

function buildInfoReplyPayload(interaction, content) {
    const payload = { content };

    if (typeof interaction.inGuild === 'function' && interaction.inGuild()) {
        payload.ephemeral = true;
    }

    return payload;
}

function getBerlinHour(date = new Date()) {
    return Number(
        new Intl.DateTimeFormat('en-GB', {
            timeZone: TIMEZONE,
            hour: '2-digit',
            hour12: false
        }).format(date)
    );
}

function getCurrentPanelTheme(date = new Date()) {
    const hour = getBerlinHour(date);

    if (hour >= 5 && hour < 11) {
        return {
            mode: 'morning',
            market: '#d6c3a5',
            team: '#b9c7b0',
            mockup: '#c9b299',
            fit: '#aebbc7',
            roles: '#d3cec4',
            iso: '#c7b8aa',
            welcome: '#d7d0c4'
        };
    }

    if (hour >= 11 && hour < 17) {
        return {
            mode: 'day',
            market: '#e1d6c6',
            team: '#c6d1c2',
            mockup: '#d8c0a8',
            fit: '#bac6d2',
            roles: '#ddd7ce',
            iso: '#d1c3b7',
            welcome: '#e0dad1'
        };
    }

    if (hour >= 17 && hour < 22) {
        return {
            mode: 'dusk',
            market: '#b78f65',
            team: '#8fa286',
            mockup: '#a98669',
            fit: '#7f91a6',
            roles: '#b3a692',
            iso: '#a88b76',
            welcome: '#b9ab98'
        };
    }

    return {
        mode: 'night',
        market: '#5b6673',
        team: '#546057',
        mockup: '#66594e',
        fit: '#4f5e70',
        roles: '#67635f',
        iso: '#62564e',
        welcome: '#5e5b58'
    };
}

function buildPanelEmbed({ title, description, color, fields = [], footerText }) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: footerText || 'VELOO ARCHIVE // INTERACTIVE PANEL' })
        .setTimestamp();

    if (fields.length) {
        embed.addFields(fields);
    }

    return embed;
}

function buildWelcomeComponents() {
    const guideRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('welcome_rules')
            .setLabel('📜 REGELN')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('welcome_tutorials')
            .setLabel('🧭 ANLEITUNG')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('welcome_sell')
            .setLabel('🛒 VERKAUF')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('welcome_mockup')
            .setLabel('🎨 MOCKUP')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('welcome_outfit')
            .setLabel('🔥 FIT')
            .setStyle(ButtonStyle.Secondary)
    );

    const linkRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('TIKTOK')
            .setStyle(ButtonStyle.Link)
            .setURL(TIKTOK_URL),
        new ButtonBuilder()
            .setLabel('LCV')
            .setStyle(ButtonStyle.Link)
            .setURL(SECONDARY_TIKTOK_URL),
        new ButtonBuilder()
            .setLabel('INSTA')
            .setStyle(ButtonStyle.Link)
            .setURL(INSTAGRAM_URL),
        new ButtonBuilder()
            .setLabel('WHATSAPP')
            .setStyle(ButtonStyle.Link)
            .setURL(WHATSAPP_CHANNEL_URL)
    );

    return [guideRow, linkRow];
}

function buildWelcomeGuideText(topicKey) {
    if (topicKey === 'welcome_rules') {
        return (
            `Bitte starte mit ${getChannelMention(RULES_CHANNEL_ID, 'dem Regeln-Bereich')}.\n` +
            `Danach helfen dir ${getChannelMention(TUTORIAL_CHANNEL_ID, 'die Tutorials')} beim Einstieg.`
        );
    }

    if (topicKey === 'welcome_tutorials') {
        return (
            'Schneller Start:\n' +
            '01. Regeln lesen\n' +
            '02. Tutorials checken\n' +
            '03. Passenden Panel-Button nutzen\n' +
            '04. Bild mit `done` senden, wenn der Bot es verlangt'
        );
    }

    if (topicKey === 'welcome_sell') {
        return (
            `Verkaufen kannst du ueber ${getChannelMention(SELL_CHANNEL_ID, '`sell-your-piece`')}.\n` +
            'Button klicken, Daten eintragen und danach genau 1 Bild mit `done` senden.'
        );
    }

    if (topicKey === 'welcome_mockup') {
        return (
            `Mockups postest du in ${getChannelMention(MOCKUP_CHANNEL_ID, '`mockups`')}.\n` +
            'Du gibst Art und Namen an und sendest danach 1 bis 3 Bilder mit `done`.'
        );
    }

    if (topicKey === 'welcome_outfit') {
        return (
            `Fits postest du in ${getChannelMention(OUTFIT_CHANNEL_ID, '`fits`')}.\n` +
            'Dort laedt jeder genau 1 Bild hoch und die Community votet taeglich.'
        );
    }

    return null;
}

function buildPanelInfoText(topicKey) {
    if (topicKey === 'sell_panel_info') {
        return (
            'Verkauf:\n' +
            '01. Daten eintragen\n' +
            '02. 1 Bild + `done`\n' +
            '03. Listing geht live'
        );
    }

    if (topicKey === 'sell_panel_vip') {
        return 'VIP-Listings werden im Feed deutlich sichtbarer hervorgehoben und wirken premiumer als normale Posts.';
    }

    if (topicKey === 'team_panel_info') {
        return (
            'Team-Up:\n' +
            '01. Team-Up klicken\n' +
            '02. Kurz beschreiben\n' +
            '03. Gesuch wird gepostet'
        );
    }

    if (topicKey === 'mockup_panel_info') {
        return (
            'Mockup:\n' +
            '01. Art + Name eintragen\n' +
            '02. 1 bis 3 Bilder + `done`\n' +
            '03. Voting 7 Tage'
        );
    }

    if (topicKey === 'outfit_panel_info') {
        return (
            'Fit:\n' +
            '01. Fit kurz eintragen\n' +
            '02. 1 Bild + `done`\n' +
            '03. Voting bis Mitternacht'
        );
    }

    if (topicKey === 'iso_panel_info') {
        return (
            'ISO:\n' +
            '01. Piece, Groesse und Budget eintragen\n' +
            '02. Der Bot postet dein Gesuch direkt im ISO-Channel'
        );
    }

    return null;
}

function isMainReplyOnCooldown(userId, topicKey) {
    const cooldownKey = `${userId}:${topicKey}`;
    const lastReplyAt = mainChannelReplyCooldowns.get(cooldownKey) || 0;
    const now = Date.now();

    if (now - lastReplyAt < MAIN_REPLY_COOLDOWN_MS) {
        return true;
    }

    mainChannelReplyCooldowns.set(cooldownKey, now);
    return false;
}

function buildMainChannelReply(topicKey) {
    if (topicKey === 'question') {
        return (
            'Wenn du eine Frage hast, schreib sie einfach direkt hier in den Chat.\n' +
            `Fuer Start und Infos schau auch in ${getChannelMention(RULES_CHANNEL_ID, 'den Regeln-Bereich')}, ` +
            `${getChannelMention(TUTORIAL_CHANNEL_ID, 'den Guide-Bereich')} und ` +
            `${getChannelMention(INFO_CHANNEL_ID, 'den Info-Bereich')}.`
        );
    }

    if (topicKey === 'socials') {
        return (
            `Unsere Socials:\n` +
            `VELOO TikTok: ${TIKTOK_URL}\n` +
            `${SECONDARY_TIKTOK_LABEL}: ${SECONDARY_TIKTOK_URL}\n` +
            `Instagram: ${INSTAGRAM_HANDLE} - ${INSTAGRAM_URL}\n` +
            `WhatsApp Channel: ${WHATSAPP_CHANNEL_URL}\n` +
            `Business-Mail: ${BUSINESS_EMAIL}`
        );
    }

    if (topicKey === 'contact') {
        return (
            `Fuer Collabs, Business oder Kontakt:\nMail: ${BUSINESS_EMAIL}\n` +
            `VELOO TikTok: ${TIKTOK_URL}\n` +
            `${SECONDARY_TIKTOK_LABEL}: ${SECONDARY_TIKTOK_URL}\n` +
            `Instagram: ${INSTAGRAM_HANDLE} - ${INSTAGRAM_URL}\n` +
            `WhatsApp Channel: ${WHATSAPP_CHANNEL_URL}`
        );
    }

    if (topicKey === 'sell') {
        return (
            `Wenn du ein Piece posten oder verkaufen willst, nutze ${getChannelMention(SELL_CHANNEL_ID, '`verkauf`')}.\n` +
            'Dort klickst du auf das Panel und laedst danach dein Bild mit `done` hoch.'
        );
    }

    if (topicKey === 'latest_goods') {
        return (
            `${getChannelMention(LATEST_GOODS_CHANNEL_ID, '`latest-goods`')} ist fuer neue Pieces und aktuelle Posts.\n` +
            'Wenn eine Brand erkannt wird, leitet der Bot den Post automatisch in den passenden Brand-Channel weiter.'
        );
    }

    if (topicKey === 'mockup') {
        return (
            `Mockups kannst du in ${getChannelMention(MOCKUP_CHANNEL_ID, '`mockups`')} posten.\n` +
            'Dort gibt es ein Panel, Voting und jede Woche einen Gewinner.'
        );
    }

    if (topicKey === 'outfit') {
        return (
            `Deinen Fit kannst du in ${getChannelMention(OUTFIT_CHANNEL_ID, '`fits`')} posten.\n` +
            'Dort gibt es das Daily Voting und jeden Tag einen Gewinner.'
        );
    }

    if (topicKey === 'iso') {
        return (
            `Gesuche postest du in ${getChannelMention(ISO_CHANNEL_ID, '`iso`')}.\n` +
            'Dort kannst du direkt eintragen, wonach du suchst.'
        );
    }

    if (topicKey === 'team') {
        return TEAM_CHANNEL_ID
            ? `Wenn du Leute fuer Projekte suchst, nutze ${getChannelMention(TEAM_CHANNEL_ID, '`team-up`')}.`
            : 'Der Team-Up-Bereich ist aktuell nicht gesetzt.';
    }

    if (topicKey === 'vip') {
        return (
            `VIP lohnt sich, weil deine Posts extra hervorgehoben werden.\n` +
            'VIP-Listings, VIP-Fits und VIP-Mockups bekommen mehr Aufmerksamkeit im Feed.'
        );
    }

    if (topicKey === 'rules') {
        return (
            `Alles Wichtige findest du hier:\n` +
            `Regeln: ${getChannelMention(RULES_CHANNEL_ID, 'Regeln')}\n` +
            `Tutorials: ${getChannelMention(TUTORIAL_CHANNEL_ID, 'Tutorials')}\n` +
            `Infos: ${getChannelMention(INFO_CHANNEL_ID, 'Infos')}`
        );
    }

    return null;
}

async function handleMainChannelAutoReply(message) {
    if (!message.guild || message.channelId !== MAIN_CHANNEL_ID) {
        return;
    }

    const normalizedContent = normalizeSearchText(message.content);
    if (!normalizedContent) {
        return;
    }

    const modRequested = /(^|\s)(mods?|moderator|moderation)(\s|$|[?!.,])/i.test(message.content);
    if (modRequested) {
        if (isMainReplyOnCooldown(message.author.id, 'mods')) {
            return;
        }

        const moderatorMention = await resolveModeratorMention(message.guild);
        await message.reply({
            content: `${moderatorMention} <@${message.author.id}> braucht Hilfe im Main-Channel.`
        }).catch(() => {});
        return;
    }

    const topics = [
        {
            key: 'socials',
            keywords: ['tiktok', 'tik tok', 'insta', 'instagram', 'socials', 'social media', 'whatsapp', 'whatsapp channel', 'channel', 'lcv', 'lcv vintage', 'yestra']
        },
        {
            key: 'contact',
            keywords: ['mail', 'email', 'e-mail', 'business', 'kontakt', 'contact', 'collab', 'kooperation', 'whatsapp', 'erreichen']
        },
        {
            key: 'question',
            keywords: ['ich habe eine frage', 'frage', 'hilfe', 'help', 'support', 'kann mir jemand helfen']
        },
        {
            key: 'sell',
            keywords: ['verkaufen', 'sell', 'piece posten', 'listing', 'vinted link', 'sale']
        },
        {
            key: 'latest_goods',
            keywords: ['latest goods', 'latest-goods', 'neue pieces', 'finds', 'latest']
        },
        {
            key: 'mockup',
            keywords: ['mockup', 'archive idee', 'design idee', 'veloo archive']
        },
        {
            key: 'outfit',
            keywords: ['fit posten', 'outfit', 'fit', 'daily win']
        },
        {
            key: 'iso',
            keywords: ['iso', 'looking for', 'suche', 'gesuch', 'searching for', 'wtb']
        },
        {
            key: 'team',
            keywords: ['team', 'partner', 'projekt', 'project', 'team up', 'team-up']
        },
        {
            key: 'vip',
            keywords: ['vip', 'highlight', 'hervorgehoben']
        },
        {
            key: 'rules',
            keywords: ['regeln', 'tutorial', 'tutorials', 'infos', 'info', 'wie funktioniert der server', 'wo finde ich']
        }
    ];

    const matchedTopic = topics.find(topic => containsAnyKeyword(normalizedContent, topic.keywords));
    if (!matchedTopic) {
        return;
    }

    if (isMainReplyOnCooldown(message.author.id, matchedTopic.key)) {
        return;
    }

    const replyContent = buildMainChannelReply(matchedTopic.key);
    if (!replyContent) {
        return;
    }

    await message.reply({ content: replyContent }).catch(() => {});
}

function buildWelcomeEmbeds(member) {
    const displayName = getMemberDisplayName(member, member.user);
    const panelTheme = getCurrentPanelTheme();

    const welcomeEmbed = buildPanelEmbed({
        title: WELCOME_PANEL_TITLE,
        description: `Hey ${displayName}, willkommen bei ${member.guild.name}.`,
        color: panelTheme.welcome,
        fields: [
            {
                name: 'START',
                value:
                    `${getChannelMention(RULES_CHANNEL_ID, 'Regeln')}\n` +
                    `${getChannelMention(TUTORIAL_CHANNEL_ID, 'Tutorials')}\n` +
                    `${getChannelMention(INFO_CHANNEL_ID, 'Infos')}`,
                inline: false
            },
            {
                name: 'BEREICHE',
                value:
                    `${getChannelMention(SELL_CHANNEL_ID, '`sell`')}\n` +
                    `${getChannelMention(MOCKUP_CHANNEL_ID, '`mockups`')}\n` +
                    `${getChannelMention(OUTFIT_CHANNEL_ID, '`fits`')}\n` +
                    `${getChannelMention(ISO_CHANNEL_ID, '`iso`')}\n` +
                    `${getChannelMention(REACTION_ROLE_CHANNEL_ID, '`roles`')}`,
                inline: false
            },
            {
                name: 'SOCIALS',
                value:
                    `TikTok: ${TIKTOK_URL}\n` +
                    `${SECONDARY_TIKTOK_LABEL}: ${SECONDARY_TIKTOK_URL}\n` +
                    `WhatsApp: ${WHATSAPP_CHANNEL_URL}`,
                inline: false
            }
        ],
        footerText: 'VELOO ARCHIVE // WILLKOMMEN'
    })
        .setThumbnail(member.user.displayAvatarURL());

    const guideEmbed = buildPanelEmbed({
        title: 'SO STARTEST DU',
        description: 'Regeln checken, Rollen waehlen, loslegen.',
        color: panelTheme.roles,
        fields: [
            {
                name: 'VIP',
                value: 'Mehr Sichtbarkeit fuer Listings, Fits und Mockups.',
                inline: false
            },
            {
                name: 'HILFE',
                value: 'Fragen im Main-Channel oder einfach `mods` schreiben.',
                inline: false
            }
        ],
        footerText: 'VELOO ARCHIVE // STARTGUIDE'
    });

    return [welcomeEmbed, guideEmbed];
}

async function handleVipDeal(message) {
    if (message.channelId !== VIP_SOURCE_CHANNEL_ID) {
        return;
    }

    if (!message.author || !client.user || message.author.id !== client.user.id) {
        return;
    }

    if (alertedVipMessages.has(message.id)) {
        return;
    }

    const pieceData = getVipPieceData(message);
    if (!pieceData?.brand || pieceData.currentPrice === null) {
        return;
    }

    if (pieceData.currentPrice > VIP_MAX_PRICE_EUR) {
        return;
    }

    const alertChannel = await client.channels.fetch(VIP_ALERT_CHANNEL_ID).catch(() => null);
    if (!alertChannel || !message.guild) {
        return;
    }

    const vipMention = await resolveVipMention(message.guild);
    const alertEmbed = EmbedBuilder.from(pieceData.embed)
        .setColor('#f1c40f')
        .setFooter({
            text: `VIP Hinweis | ${pieceData.brand.toUpperCase()} | ${pieceData.currentPrice} EUR`
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Piece oeffnen')
            .setStyle(ButtonStyle.Link)
            .setURL(message.url)
    );

    await alertChannel.send({
        content: `${vipMention} Brand-Deal erkannt: ${pieceData.brand} fuer ${pieceData.currentPrice} EUR`,
        embeds: [alertEmbed],
        components: [row]
    });

    alertedVipMessages.add(message.id);
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
                getEmbedFooterText(message.embeds[0]) === `Item-ID: ${itemId}`
            );

            for (const copy of copies.values()) {
                await copy.delete().catch(() => {});
            }
        } catch (error) {
            console.error(`Error deleting favorites in ${channel.name}:`, error.message);
        }
    }
}

async function deleteMirroredItemCopies(guild, itemId) {
    for (const channelId of ITEM_MIRROR_CHANNEL_IDS) {
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (!channel || channel.type !== ChannelType.GuildText) {
            continue;
        }

        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const copies = messages.filter(message =>
                message.author.id === client.user.id &&
                getEmbedFooterText(message.embeds[0]) === `Item-ID: ${itemId}`
            );

            for (const copy of copies.values()) {
                await copy.delete().catch(() => {});
            }
        } catch (error) {
            console.error(`Error deleting mirrored items in ${channelId}:`, error.message);
        }
    }
}

function buildSoldComponentsFromMessage(message) {
    if (!message.components?.length) {
        return [];
    }

    return message.components.map(row => {
        const soldRow = new ActionRowBuilder();
        const buttons = row.components.map(component => {
            const button = new ButtonBuilder(component.toJSON ? component.toJSON() : component.data || component);

            if (button.data?.custom_id) {
                button.setDisabled(true);

            if (button.data.custom_id.startsWith('sold_')) {
                    button.setLabel('VERKAUFT');
                }
            }

            return button;
        });

        soldRow.addComponents(buttons);
        return soldRow;
    });
}

function buildSoldEmbedsFromMessage(message) {
    return message.embeds.map((embed, index) => {
        const soldEmbed = EmbedBuilder.from(embed).setColor('#e74c3c');

        if (index === 0) {
            const currentTitle = embed.title || 'Piece';
            const footerText = getEmbedFooterText(embed);
            const titleWithSold = currentTitle.toUpperCase().includes('VERKAUFT')
                ? currentTitle
                : `VERKAUFT | ${currentTitle}`;
            const soldNotice = 'Dieses Piece wurde verkauft.';
            const existingDescription = embed.description || '';

            soldEmbed
                .setTitle(titleWithSold)
                .setDescription(
                    existingDescription.includes(soldNotice)
                        ? existingDescription
                        : [soldNotice, existingDescription].filter(Boolean).join('\n\n')
                )
                .setFooter({
                    text: footerText.includes('VERKAUFT') ? footerText : `${footerText} | VERKAUFT`
                });
        }

        return soldEmbed;
    });
}

async function markMessageAsSold(message) {
    const soldEmbeds = buildSoldEmbedsFromMessage(message);
    const soldComponents = buildSoldComponentsFromMessage(message);

    await message.edit({
        content: '## VERKAUFT\nDieses Piece ist verkauft.',
        embeds: soldEmbeds,
        components: soldComponents
    }).catch(() => {});
}

async function markTrackedItemCopiesAsSold(guild, itemId, clickedMessage) {
    if (clickedMessage) {
        await markMessageAsSold(clickedMessage);
    }

    const channelsToCheck = new Map();

    for (const channelId of ITEM_MIRROR_CHANNEL_IDS) {
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (channel?.type === ChannelType.GuildText) {
            channelsToCheck.set(channel.id, channel);
        }
    }

    const favoriteChannels = guild.channels.cache.filter(channel =>
        channel.type === ChannelType.GuildText && channel.name.startsWith('favs-')
    );

    for (const channel of favoriteChannels.values()) {
        channelsToCheck.set(channel.id, channel);
    }

    for (const channel of channelsToCheck.values()) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const copies = messages.filter(message =>
                message.id !== clickedMessage?.id &&
                message.author.id === client.user.id &&
                getEmbedFooterText(message.embeds[0])?.includes(`Item-ID: ${itemId}`)
            );

            for (const copy of copies.values()) {
                await markMessageAsSold(copy);
            }
        } catch (error) {
            console.error(`Error marking sold in ${channel.id}:`, error.message);
        }
    }
}

function normalizeListingTitle(title = '') {
    return title.replace(/^(SOLD|RESERVED|VERKAUFT|RESERVIERT)\s*\|\s*/i, '').trim();
}

function cleanListingDescription(description = '') {
    return description
        .replace(/^Dieses Piece wurde verkauft\.\s*/i, '')
        .replace(/^Dieses Piece ist gerade reserviert\.\s*/i, '')
        .trim();
}

function getListingUrlFromSource(message, listedItem) {
    if (listedItem?.url) {
        return listedItem.url;
    }

    for (const row of message.components || []) {
        for (const component of row.components || []) {
            if (component.url) {
                return component.url;
            }
        }
    }

    return message.url;
}

function buildListingActionRow(itemId, sellerId, vintedUrl, status = 'active') {
    const isReserved = status === 'reserved';
    const isSold = status === 'sold';

    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('VINTED')
            .setStyle(ButtonStyle.Link)
            .setURL(vintedUrl),
        new ButtonBuilder()
            .setCustomId(`fav_${itemId}_${sellerId}`)
            .setLabel('FAVORIT')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isReserved || isSold),
        new ButtonBuilder()
            .setCustomId(`offer_${itemId}_${sellerId}`)
            .setLabel('ANGEBOT')
            .setStyle(ButtonStyle.Success)
            .setDisabled(isReserved || isSold),
        new ButtonBuilder()
            .setCustomId(`reserved_${itemId}_${sellerId}`)
            .setLabel('RESERVIERT')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isReserved || isSold),
        new ButtonBuilder()
            .setCustomId(`sold_${itemId}_${sellerId}`)
            .setLabel('VERKAUFT')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(isSold)
    );
}

function buildListingEmbedsForStatus(message, status) {
    const statusMeta = {
        active: {
            titlePrefix: '',
            descriptionPrefix: '',
            color: null,
            footerSuffix: ''
        },
        reserved: {
            titlePrefix: 'RESERVIERT | ',
            descriptionPrefix: 'Dieses Piece ist gerade reserviert.',
            color: '#d6a24c',
            footerSuffix: ' | RESERVIERT'
        },
        sold: {
            titlePrefix: 'VERKAUFT | ',
            descriptionPrefix: 'Dieses Piece wurde verkauft.',
            color: '#e74c3c',
            footerSuffix: ' | VERKAUFT'
        }
    }[status];

    return message.embeds.map((embed, index) => {
        const nextEmbed = EmbedBuilder.from(embed);

        if (statusMeta.color) {
            nextEmbed.setColor(statusMeta.color);
        }

        if (index === 0) {
            const baseTitle = normalizeListingTitle(embed.title || 'Piece');
            const baseDescription = cleanListingDescription(embed.description || '');
            const footerText = getEmbedFooterText(embed).replace(/\s+\|\s+(SOLD|RESERVED|VERKAUFT|RESERVIERT)$/i, '');
            const nextDescription = statusMeta.descriptionPrefix
                ? [statusMeta.descriptionPrefix, baseDescription].filter(Boolean).join('\n\n')
                : baseDescription;

            nextEmbed.setTitle(`${statusMeta.titlePrefix}${baseTitle}`.trim());
            if (nextDescription) {
                nextEmbed.setDescription(nextDescription);
            } else {
                delete nextEmbed.data.description;
            }
            nextEmbed.setFooter({
                text: `${footerText}${statusMeta.footerSuffix}`.trim()
            });
        }

        return nextEmbed;
    });
}

async function applyListingStatusToMessage(message, listedItem, status) {
    const customIds = (message.components || []).flatMap(row =>
        (row.components || [])
            .map(component => component.customId || component.data?.custom_id || null)
            .filter(Boolean)
    );
    const sellerIdMatch = customIds
        .map(customId => customId.match(/^[a-z]+_(\d+)_([0-9]+)$/i))
        .find(Boolean);
    const sellerId = listedItem?.sellerId || sellerIdMatch?.[2] || message.interaction?.user?.id;
    const itemIdMatch = getEmbedFooterText(message.embeds[0]).match(/Item-ID:\s*(\d+)/);
    const itemId = listedItem?.itemId || itemIdMatch?.[1] || sellerIdMatch?.[1];
    const listingUrl = getListingUrlFromSource(message, listedItem);

    if (!itemId || !sellerId || !listingUrl) {
        return;
    }

    const contentByStatus = {
        reserved: '## RESERVIERT\nDieses Piece ist gerade reserviert.',
        sold: '## VERKAUFT\nDieses Piece ist verkauft.'
    };

    await message.edit({
        content: contentByStatus[status],
        embeds: buildListingEmbedsForStatus(message, status),
        components: [buildListingActionRow(itemId, sellerId, listingUrl, status)]
    }).catch(() => {});
}

async function markTrackedItemCopiesWithStatus(guild, itemId, clickedMessage, status) {
    const listedItem = getListedItem(itemId);

    if (clickedMessage) {
        await applyListingStatusToMessage(clickedMessage, listedItem, status);
    }

    const channelsToCheck = new Map();

    for (const channelId of ITEM_MIRROR_CHANNEL_IDS) {
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (channel?.type === ChannelType.GuildText) {
            channelsToCheck.set(channel.id, channel);
        }
    }

    const favoriteChannels = guild.channels.cache.filter(channel =>
        channel.type === ChannelType.GuildText && channel.name.startsWith('favs-')
    );

    for (const channel of favoriteChannels.values()) {
        channelsToCheck.set(channel.id, channel);
    }

    for (const channel of channelsToCheck.values()) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const copies = messages.filter(message =>
                message.id !== clickedMessage?.id &&
                message.author.id === client.user.id &&
                getEmbedFooterText(message.embeds[0])?.includes(`Item-ID: ${itemId}`)
            );

            for (const copy of copies.values()) {
                await applyListingStatusToMessage(copy, listedItem, status);
            }
        } catch (error) {
            console.error(`Error marking ${status} in ${channel.id}:`, error.message);
        }
    }
}

async function countUserSales(salesChannel, userId) {
    let count = 0;
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await salesChannel.messages.fetch(options);
        if (!messages.size) {
            break;
        }

        for (const message of messages.values()) {
            if (message.author.id !== client.user.id) {
                continue;
            }

            const footerText = getEmbedFooterText(message.embeds[0]);
            if (footerText === `Sale-User-ID: ${userId}`) {
                count += 1;
            }
        }

        lastId = messages.last().id;
        if (messages.size < 100) {
            break;
        }
    }

    return count;
}

async function collectSalesCounts(salesChannel) {
    const salesCounts = new Map();
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await salesChannel.messages.fetch(options);
        if (!messages.size) {
            break;
        }

        for (const message of messages.values()) {
            if (message.author.id !== client.user.id) {
                continue;
            }

            const footerText = getEmbedFooterText(message.embeds[0]);
            const match = footerText.match(/^Sale-User-ID:\s*(\d+)$/);
            if (!match) {
                continue;
            }

            const sellerId = match[1];
            salesCounts.set(sellerId, (salesCounts.get(sellerId) || 0) + 1);
        }

        lastId = messages.last().id;
        if (messages.size < 100) {
            break;
        }
    }

    return salesCounts;
}

async function syncTrustedSellerRoleForMember(guild, userId, saleCount) {
    const trustedRole = findRoleByIdOrName(guild, TRUSTED_SELLER_ROLE_ID, DEFAULT_TRUSTED_SELLER_ROLE_NAME);
    if (!trustedRole) {
        return false;
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
        return false;
    }

    if (saleCount >= TRUSTED_SELLER_MIN_SALES) {
        if (!member.roles.cache.has(trustedRole.id)) {
            await member.roles.add(trustedRole).catch(() => {});
            return true;
        }

        return false;
    }

    if (member.roles.cache.has(trustedRole.id)) {
        await member.roles.remove(trustedRole).catch(() => {});
        return true;
    }

    return false;
}

async function syncTrustedSellerRoles() {
    const salesChannel = await client.channels.fetch(SALES_CHANNEL_ID).catch(() => null);
    if (!salesChannel?.guild) {
        return;
    }

    const guild = salesChannel.guild;
    const trustedRole = findRoleByIdOrName(guild, TRUSTED_SELLER_ROLE_ID, DEFAULT_TRUSTED_SELLER_ROLE_NAME);
    if (!trustedRole) {
        return;
    }

    const salesCounts = await collectSalesCounts(salesChannel);
    await guild.members.fetch().catch(() => null);

    for (const [sellerId, saleCount] of salesCounts.entries()) {
        if (saleCount >= TRUSTED_SELLER_MIN_SALES) {
            await syncTrustedSellerRoleForMember(guild, sellerId, saleCount);
        }
    }

    for (const member of trustedRole.members.values()) {
        const saleCount = salesCounts.get(member.id) || 0;
        if (saleCount < TRUSTED_SELLER_MIN_SALES) {
            await member.roles.remove(trustedRole).catch(() => {});
        }
    }
}

async function announceSale(sellerId) {
    const salesChannel = await client.channels.fetch(SALES_CHANNEL_ID).catch(() => null);
    if (!salesChannel) {
        return null;
    }

    const previousSales = await countUserSales(salesChannel, sellerId);
    const currentSaleNumber = previousSales + 1;

    const embed = new EmbedBuilder()
        .setTitle('Neuer Sale')
        .setDescription(`<@${sellerId}> hat gerade sein ${currentSaleNumber}. Piece verkauft!`)
        .setColor('#2ecc71')
        .setFooter({ text: `Sale-User-ID: ${sellerId}` })
        .setTimestamp();

    await salesChannel.send({
        content: `<@${sellerId}> hat gerade sein ${currentSaleNumber}. Piece verkauft!`,
        embeds: [embed]
    });

    return currentSaleNumber;
}

function getOrdinalSuffix(number) {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod10 === 1 && mod100 !== 11) return 'st';
    if (mod10 === 2 && mod100 !== 12) return 'nd';
    if (mod10 === 3 && mod100 !== 13) return 'rd';
    return 'th';
}

async function sendTempMessage(channel, content, ms = 7000) {
    const tempMessage = await channel.send({ content }).catch(() => null);
    if (tempMessage) {
        setTimeout(() => {
            tempMessage.delete().catch(() => {});
        }, ms);
    }
}

async function replyToInteraction(interaction, payload) {
    if (interaction.deferred || interaction.replied) {
        return interaction.followUp(payload).catch(() => null);
    }

    return interaction.reply(payload).catch(() => null);
}

async function deletePanelMessages(channel, titles) {
    const titleList = Array.isArray(titles) ? titles : [titles];
    const messages = await channel.messages.fetch({ limit: 50 });
    const oldPanels = messages.filter(message =>
        message.author.id === client.user.id &&
        titleList.includes(message.embeds[0]?.title)
    );

    for (const panel of oldPanels.values()) {
        await panel.delete().catch(() => {});
    }
}

async function sendSellPanel() {
    const sellChannel = await client.channels.fetch(SELL_CHANNEL_ID).catch(() => null);
    if (!sellChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(sellChannel, ['SELL YOUR PIECE', SELL_PANEL_TITLE]);

    const embed = buildPanelEmbed({
        title: SELL_PANEL_TITLE,
        description: '🛒 Piece eintragen, Bild senden, live gehen.',
        color: panelTheme.market,
        fields: [
            {
                name: '📝 ABLAUF',
                value: 'Modal -> 1 Bild + `done`',
                inline: false
            },
            {
                name: '📌 STATUS',
                value: 'Favorit, Angebot, Reserviert, Verkauft',
                inline: false
            }
        ],
        footerText: 'VELOO ARCHIVE // MARKT'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_upload')
            .setLabel('🛒 VERKAUFEN')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('sell_panel_info')
            .setLabel('ℹ️ INFO')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('sell_panel_vip')
            .setLabel('👑 VIP')
            .setStyle(ButtonStyle.Secondary)
    );

    await sellChannel.send({ embeds: [embed], components: [row] });
}

async function sendTeamPanel() {
    if (!TEAM_CHANNEL_ID) {
        return;
    }

    const teamChannel = await client.channels.fetch(TEAM_CHANNEL_ID).catch(() => null);
    if (!teamChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(teamChannel, ['FIND A TEAM', TEAM_PANEL_TITLE]);

    const embed = buildPanelEmbed({
        title: TEAM_PANEL_TITLE,
        description: '🤝 Finde Leute fuer Resell und Projekte.',
        color: panelTheme.team,
        fields: [
            {
                name: '📝 ABLAUF',
                value: 'Button klicken -> Gesuch posten',
                inline: false
            }
        ],
        footerText: 'VELOO ARCHIVE // TEAMFINDER'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_teamup')
            .setLabel('🤝 TEAM SUCHEN')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('team_panel_info')
            .setLabel('ℹ️ INFO')
            .setStyle(ButtonStyle.Secondary)
    );

    await teamChannel.send({ embeds: [embed], components: [row] });
}

async function sendMockupPanel() {
    const mockupChannel = await client.channels.fetch(MOCKUP_CHANNEL_ID).catch(() => null);
    if (!mockupChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(mockupChannel, MOCKUP_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: MOCKUP_PANEL_TITLE,
        description: '🎨 Konzept posten. Voting 7 Tage.',
        color: panelTheme.mockup,
        fields: [
            {
                name: '📝 EINGABE',
                value: 'Art + Name'
            },
            {
                name: '🖼️ UPLOAD',
                value: '1 bis 3 Bilder + `done`'
            }
        ],
        footerText: 'VELOO ARCHIVE // MOCKUP'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_mockup_upload')
            .setLabel('🎨 TEILEN')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('mockup_panel_info')
            .setLabel('ℹ️ INFO')
            .setStyle(ButtonStyle.Secondary)
    );

    await mockupChannel.send({ embeds: [embed], components: [row] });
}

async function sendOutfitPanel() {
    const outfitChannel = await client.channels.fetch(OUTFIT_CHANNEL_ID).catch(() => null);
    if (!outfitChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(outfitChannel, OUTFIT_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: OUTFIT_PANEL_TITLE,
        description: '🔥 1 Fit, 1 Bild, Tagesvoting.',
        color: panelTheme.fit,
        fields: [
            {
                name: '📝 EINGABE',
                value: 'Kurze Fit-Beschreibung'
            },
            {
                name: '🖼️ UPLOAD',
                value: '1 Bild + `done`'
            }
        ],
        footerText: 'VELOO ARCHIVE // FIT'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_outfit_upload')
            .setLabel('🔥 FIT POSTEN')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('outfit_panel_info')
            .setLabel('ℹ️ INFO')
            .setStyle(ButtonStyle.Secondary)
    );

    await outfitChannel.send({ embeds: [embed], components: [row] });
}

async function sendIsoPanel() {
    const isoChannel = await client.channels.fetch(ISO_CHANNEL_ID).catch(() => null);
    if (!isoChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(isoChannel, ISO_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: ISO_PANEL_TITLE,
        description: '🔎 Poste dein Gesuch.',
        color: panelTheme.iso,
        fields: [
            {
                name: '📝 EINGABE',
                value: 'Piece, Groesse, Budget, Name',
                inline: false
            }
        ],
        footerText: 'VELOO ARCHIVE // ISO'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_iso')
            .setLabel('🔎 ISO POSTEN')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('iso_panel_info')
            .setLabel('ℹ️ INFO')
            .setStyle(ButtonStyle.Secondary)
    );

    await isoChannel.send({ embeds: [embed], components: [row] });
}

async function sendReactionRolePanelLegacy() {
    const roleChannel = await client.channels.fetch(REACTION_ROLE_CHANNEL_ID).catch(() => null);
    if (!roleChannel) {
        return;
    }

    await deletePanelMessages(roleChannel, ROLE_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: ROLE_PANEL_TITLE,
        description:
            'Wähle hier die Bereiche aus, die dich interessieren.\n' +
            'Du kannst mehrere Rollen gleichzeitig tragen und deine Auswahl jederzeit ändern.',
        color: '#cfc6b8',
        fields: [
            {
                name: 'ROLLEN',
                value:
                    'Vintage, VintageResell, Mockups, Fits und BrandMEMBER stehen dir direkt zur Auswahl.',
                inline: false
            },
            {
                name: 'AUTO-ROLLE',
                value:
                    `${TRUSTED_SELLER_ROLE_NAME} wird automatisch vergeben, sobald du ${TRUSTED_SELLER_MIN_SALES} Sales erreicht hast.`,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // ROLLEN'
    });

    await roleChannel.send({
        embeds: [embed],
        components: buildReactionRoleRows()
    });
}

async function sendReactionRolePanel() {
    const roleChannel = await client.channels.fetch(REACTION_ROLE_CHANNEL_ID).catch(() => null);
    if (!roleChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(roleChannel, ROLE_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: ROLE_PANEL_TITLE,
        description: '🎭 Waehle deine Rollen aus.',
        color: panelTheme.roles,
        fields: [
            {
                name: '🎯 ROLLEN',
                value: 'Vintage, Resell, Mockups, Fits, BrandMEMBER',
                inline: false
            },
            {
                name: '⭐ AUTO-ROLLE',
                value: `${DEFAULT_TRUSTED_SELLER_ROLE_NAME} ab ${TRUSTED_SELLER_MIN_SALES} Sales.`,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // ROLLEN'
    });

    await roleChannel.send({
        embeds: [embed],
        components: buildReactionRoleRows()
    });
}

function getCreatorApplication(applicationId) {
    return mockupStore.creatorApplications[applicationId] || null;
}

function buildCreatorApplicationReviewRow(applicationId, disabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`creatorapp_accept_${applicationId}`)
            .setLabel('✅ ANNEHMEN')
            .setStyle(ButtonStyle.Success)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId(`creatorapp_decline_${applicationId}`)
            .setLabel('❌ ABLEHNEN')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled)
    );
}

function buildCreatorApplicationReviewEmbed(application) {
    const statusText = {
        pending: 'Offen',
        accepted: 'Angenommen',
        declined: 'Abgelehnt'
    }[application.status || 'pending'];

    const embed = buildPanelEmbed({
        title: '🧾 Neue Creator-Bewerbung',
        description: `<@${application.userId}> hat sich als Creator / Reseller beworben.`,
        color:
            application.status === 'accepted'
                ? '#2ecc71'
                : application.status === 'declined'
                    ? '#e74c3c'
                    : '#f1c40f',
        fields: [
            { name: '👤 Account', value: application.accountHandle, inline: true },
            { name: '🔗 Link', value: application.profileLink, inline: true },
            { name: '🎯 Bereich', value: application.creatorType, inline: true },
            { name: '🎂 Alter', value: application.age, inline: true },
            { name: '⏳ Erfahrung', value: application.experience, inline: false },
            { name: '📌 Status', value: statusText, inline: true }
        ],
        footerText: `Creator-App-ID: ${application.applicationId}`
    }).setTimestamp(new Date(application.createdAt));

    if (application.reviewedBy) {
        embed.addFields({
            name: '🛡️ Geprueft von',
            value: `<@${application.reviewedBy}>`,
            inline: true
        });
    }

    if (application.reviewReason) {
        embed.addFields({
            name: '📝 Grund',
            value: application.reviewReason,
            inline: false
        });
    }

    return embed;
}

function buildApprovedCreatorEmbed(application) {
    return buildPanelEmbed({
        title: '✅ Neuer Content Creator',
        description: `Schaut euch den Account von <@${application.userId}> an und gebt Support.`,
        color: '#2ecc71',
        fields: [
            { name: '👤 @Username', value: application.accountHandle, inline: true },
            { name: '🔗 Link', value: application.profileLink, inline: true },
            { name: '🎯 Bereich', value: application.creatorType, inline: true },
            { name: '🎂 Alter', value: application.age, inline: true },
            { name: '⏳ Erfahrung', value: application.experience, inline: false }
        ],
        footerText: 'VELOO&YESTERA // CONTENT CREATOR'
    });
}

async function updateCreatorApplicationReviewMessage(application) {
    if (!application?.reviewChannelId || !application?.reviewMessageId) {
        return;
    }

    const reviewChannel = await client.channels.fetch(application.reviewChannelId).catch(() => null);
    if (!reviewChannel) {
        return;
    }

    const reviewMessage = await reviewChannel.messages.fetch(application.reviewMessageId).catch(() => null);
    if (!reviewMessage) {
        return;
    }

    const isPending = (application.status || 'pending') === 'pending';
    await reviewMessage.edit({
        embeds: [buildCreatorApplicationReviewEmbed(application)],
        components: [buildCreatorApplicationReviewRow(application.applicationId, !isPending)]
    }).catch(() => {});
}

async function sendCreatorApplicationResultDm(application, accepted, reason = '') {
    const applicant = await client.users.fetch(application.userId).catch(() => null);
    if (!applicant) {
        return;
    }

    const dmText = accepted
        ? `Deine Bewerbung bei VELOO&YESTERA wurde angenommen.\nDein Profil wurde jetzt im Creator-Channel geteilt.`
        : `Deine Bewerbung bei VELOO&YESTERA wurde leider abgelehnt.\nGrund: ${reason || 'Kein Grund angegeben.'}`;

    await applicant.send(dmText).catch(() => {});
}

async function grantContentCreatorRole(guild, userId) {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
        return false;
    }

    const creatorRole = findRoleByIdOrName(guild, CONTENT_CREATOR_ROLE_ID, CONTENT_CREATOR_ROLE_NAME);
    if (!creatorRole) {
        return false;
    }

    if (!member.roles.cache.has(creatorRole.id)) {
        await member.roles.add(creatorRole).catch(() => {});
    }

    return true;
}

async function sendRulesMessage() {
    const rulesChannel = await client.channels.fetch(RULES_CHANNEL_ID).catch(() => null);
    if (!rulesChannel) {
        return;
    }

    await deletePanelMessages(rulesChannel, RULES_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: RULES_PANEL_TITLE,
        description: 'Bitte halte den Server sauber, fair und respektvoll. 🤍',
        color: '#d9cfbf',
        fields: [
            { name: '1️⃣ Respekt', value: 'Kein Hate, kein Beleidigen, kein unnötiger Stress.', inline: false },
            { name: '2️⃣ Kein Spam', value: 'Keine unnötigen Pings, kein Flood und keine Werbung ohne Kontext.', inline: false },
            { name: '3️⃣ Faire Deals', value: 'Keine Fakes, kein Scam und keine irreführenden Angaben bei Pieces.', inline: false },
            { name: '4️⃣ Passende Channels', value: 'Poste Fits, Mockups, ISOs und Sales immer in den richtigen Bereich.', inline: false },
            { name: '5️⃣ Bewerbungen & Reports', value: 'Creator-Bewerbungen und Reports werden vom Mod-Team geprüft.', inline: false },
            { name: '6️⃣ Mods respektieren', value: 'Entscheidungen vom Team bitte akzeptieren und normal klären.', inline: false }
        ],
        footerText: 'VELOO&YESTERA // REGELN'
    });

    await rulesChannel.send({ embeds: [embed] });
}

async function sendCooperationPanel() {
    const cooperationChannel = await client.channels.fetch(COOPERATION_CHANNEL_ID).catch(() => null);
    if (!cooperationChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(cooperationChannel, COOPERATION_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: COOPERATION_PANEL_TITLE,
        description: '🤝 Neue Coops fuer VELOO&YESTERA posten.',
        color: panelTheme.team,
        fields: [
            {
                name: '👑 Zugriff',
                value: `Nur die Rolle ${OWNER_ROLE_NAME} kann dieses Panel benutzen.`,
                inline: false
            },
            {
                name: '📝 Inhalt',
                value: 'Titel, Details und Kontakt direkt per Modal eintragen.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // COOPERATIONS'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_cooperation_post')
            .setLabel('🤝 COOP POSTEN')
            .setStyle(ButtonStyle.Primary)
    );

    await cooperationChannel.send({ embeds: [embed], components: [row] });
}

async function sendCreatorApplicationPanel() {
    const creatorChannel = await client.channels.fetch(CREATOR_CHANNEL_ID).catch(() => null);
    if (!creatorChannel) {
        return;
    }

    const panelTheme = getCurrentPanelTheme();
    await deletePanelMessages(creatorChannel, CREATOR_PANEL_TITLE);

    const embed = buildPanelEmbed({
        title: CREATOR_PANEL_TITLE,
        description: '🎥 Bewirb dich als Creator, Reseller oder aehnliches.',
        color: panelTheme.mockup,
        fields: [
            {
                name: '📌 Was du angibst',
                value: '@username, Link, Bereich, Alter und Erfahrung.',
                inline: false
            },
            {
                name: '🛡️ Review',
                value: 'Deine Bewerbung geht erst an das Mod-Team zur Prüfung.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // CREATOR'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_creator_application')
            .setLabel('📝 JETZT BEWERBEN')
            .setStyle(ButtonStyle.Success)
    );

    await creatorChannel.send({ embeds: [embed], components: [row] });
}

async function refreshPanels() {
    console.log(`[${new Date().toLocaleTimeString('de-DE', { timeZone: TIMEZONE })}] Refreshing panels...`);

    try {
        await sendSellPanel();
    } catch (error) {
        console.error('Sell channel error:', error.message);
    }

    try {
        await sendTeamPanel();
    } catch (error) {
        console.error('Team channel error:', error.message);
    }

    try {
        await sendMockupPanel();
    } catch (error) {
        console.error('Mockup channel error:', error.message);
    }

    try {
        await sendOutfitPanel();
    } catch (error) {
        console.error('Outfit channel error:', error.message);
    }

    try {
        await sendIsoPanel();
    } catch (error) {
        console.error('ISO channel error:', error.message);
    }

    try {
        await sendReactionRolePanel();
    } catch (error) {
        console.error('Reaction role channel error:', error.message);
    }

    try {
        await sendCooperationPanel();
    } catch (error) {
        console.error('Cooperation channel error:', error.message);
    }

    try {
        await sendCreatorApplicationPanel();
    } catch (error) {
        console.error('Creator application channel error:', error.message);
    }
}

function getBerlinDateParts(date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(date);
    const values = Object.fromEntries(
        parts
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );

    return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day)
    };
}

function getWeekKey(date = new Date()) {
    const { year, month, day } = getBerlinDateParts(date);
    const mondayDate = new Date(Date.UTC(year, month - 1, day));
    const weekday = mondayDate.getUTCDay() || 7;
    mondayDate.setUTCDate(mondayDate.getUTCDate() - (weekday - 1));
    return mondayDate.toISOString().slice(0, 10);
}

function getPreviousWeekKey(date = new Date()) {
    const currentWeekDate = new Date(`${getWeekKey(date)}T00:00:00.000Z`);
    currentWeekDate.setUTCDate(currentWeekDate.getUTCDate() - 7);
    return currentWeekDate.toISOString().slice(0, 10);
}

function formatDateTime(dateValue) {
    return new Intl.DateTimeFormat('de-DE', {
        timeZone: TIMEZONE,
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(dateValue));
}

function isMockupVotingOpen(submission) {
    return Date.now() < new Date(submission.voteEndsAt).getTime();
}

function getMockupSubmission(entryId) {
    return mockupStore.submissions[entryId] || null;
}

function buildMockupActionRow(entryId, likeCount, likeDisabled = false, reportDisabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`mockup_like_${entryId}`)
            .setLabel(`LIKEN ${likeCount}`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(likeDisabled),
        new ButtonBuilder()
            .setCustomId(`mockup_report_${entryId}`)
            .setLabel('MELDEN')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(reportDisabled)
    );
}

function buildMockupEmbeds(uploadData, author, entryId, imageFiles, voteEndsAt, isVipCreator = false, creatorName = author.username) {
    const embeds = [];

    const mainEmbed = new EmbedBuilder()
        .setTitle('Veloo Archive Mockup')
        .setDescription('Community-Voting ist 7 Tage offen.')
        .addFields(
            { name: 'Art', value: uploadData.garmentType, inline: true },
            { name: 'Name', value: uploadData.submitterName, inline: true },
            { name: 'Von', value: `<@${author.id}>`, inline: true },
            { name: 'Voting endet', value: formatDateTime(voteEndsAt), inline: false }
        )
        .setColor(isVipCreator ? '#f1c40f' : '#e67e22')
        .setFooter({ text: `Mockup-ID: ${entryId}` })
        .setTimestamp();

    if (isVipCreator) {
        mainEmbed
            .setAuthor({
                name: `VIP Mitglied • ${creatorName}`,
                iconURL: author.displayAvatarURL()
            })
            .addFields(buildVipHighlightField());
    }

    if (imageFiles[0]) {
        mainEmbed.setImage(`attachment://${imageFiles[0].name}`);
    }

    embeds.push(mainEmbed);

    for (let index = 1; index < imageFiles.length; index += 1) {
        embeds.push(
            new EmbedBuilder()
                .setColor(isVipCreator ? '#f8e08e' : '#f4b183')
                .setImage(`attachment://${imageFiles[index].name}`)
                .setFooter({ text: `Weitere Mockup-Ansicht ${index + 1}` })
        );
    }

    return embeds;
}

async function setMockupLikeState(submission, likeDisabled) {
    const channel = await client.channels.fetch(submission.channelId).catch(() => null);
    if (!channel) {
        return;
    }

    const message = await channel.messages.fetch(submission.messageId).catch(() => null);
    if (!message) {
        return;
    }

    await message.edit({
        components: [buildMockupActionRow(submission.entryId, submission.likes.length, likeDisabled, false)]
    }).catch(() => {});
}

async function closeExpiredMockupVotes() {
    let changed = false;

    for (const submission of Object.values(mockupStore.submissions)) {
        if (submission.voteClosed || isMockupVotingOpen(submission)) {
            continue;
        }

        await setMockupLikeState(submission, true);
        submission.voteClosed = true;
        changed = true;
    }

    if (changed) {
        saveMockupStore();
    }
}

function pickWeeklyWinner(submissions) {
    return [...submissions].sort((left, right) => {
        const likeDifference = right.likes.length - left.likes.length;
        if (likeDifference !== 0) {
            return likeDifference;
        }

        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    })[0] || null;
}

function buildWinnerFallbackEmbed(submission) {
    return new EmbedBuilder()
        .setTitle(submission.isVipCreator ? 'VIP Wochensieger Mockup' : 'Wochensieger Mockup')
        .setDescription(`<@${submission.userId}> gewinnt diese Woche mit ${submission.likes.length} Likes.`)
        .addFields(
            { name: 'Art', value: submission.garmentType, inline: true },
            { name: 'Name', value: submission.submitterName, inline: true },
            { name: 'Voting beendet', value: formatDateTime(submission.voteEndsAt), inline: false }
        )
        .setColor('#f1c40f')
        .setFooter({ text: `Mockup-ID: ${submission.entryId}` })
        .setTimestamp();
}

async function buildWinnerEmbeds(submission) {
    const channel = await client.channels.fetch(submission.channelId).catch(() => null);
    if (!channel) {
        return [buildWinnerFallbackEmbed(submission)];
    }

    const message = await channel.messages.fetch(submission.messageId).catch(() => null);
    if (!message || !message.embeds.length) {
        return [buildWinnerFallbackEmbed(submission)];
    }

    return message.embeds.slice(0, 3).map((embed, index) => {
        const winnerEmbed = EmbedBuilder.from(embed).setColor('#f1c40f');

        if (index === 0) {
            winnerEmbed
                .setTitle('Wochensieger Mockup')
                .setDescription(
                    `<@${submission.userId}> gewinnt diese Woche mit ${submission.likes.length} Likes.\n\n` +
                    `Art: ${submission.garmentType}\nName: ${submission.submitterName}`
                )
                .setFooter({ text: `Gewinner | Mockup-ID: ${submission.entryId}` })
                .setTimestamp();
        }

        return winnerEmbed;
    });
}

async function announceWeeklyMockupWinnerIfNeeded(referenceDate = new Date()) {
    const targetVoteWeek = getPreviousWeekKey(referenceDate);
    if (mockupStore.announcedVoteWeeks.includes(targetVoteWeek)) {
        return;
    }

    const candidates = Object.values(mockupStore.submissions).filter(submission =>
        submission.voteWeekKey === targetVoteWeek
    );

    if (!candidates.length) {
        mockupStore.announcedVoteWeeks.push(targetVoteWeek);
        saveMockupStore();
        return;
    }

    await closeExpiredMockupVotes();

    const winner = pickWeeklyWinner(candidates);
    const mockupChannel = await client.channels.fetch(MOCKUP_CHANNEL_ID).catch(() => null);
    if (!winner || !mockupChannel) {
        return;
    }

    const winnerEmbeds = await buildWinnerEmbeds(winner);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Gewinnerpost oeffnen')
            .setStyle(ButtonStyle.Link)
            .setURL(winner.messageUrl)
    );

    try {
        await mockupChannel.send({
            content: `Wochensieger: <@${winner.userId}> mit ${winner.likes.length} Likes.`,
            embeds: winnerEmbeds,
            components: [row]
        });
    } catch (error) {
        console.error('Weekly winner announcement failed:', error.message);
        return;
    }

    const winnerUser = await client.users.fetch(winner.userId).catch(() => null);
    if (winnerUser) {
        await winnerUser.send(
            `Du hast das Veloo Archive Mockup-Voting diese Woche mit ${winner.likes.length} Likes gewonnen.\n` +
            `Dein Gewinner-Post: ${winner.messageUrl}`
        ).catch(error => {
            console.error('Winner DM could not be sent:', error.message);
        });
    }

    mockupStore.announcedVoteWeeks.push(targetVoteWeek);
    saveMockupStore();
}

async function handleMockupLike(interaction, entryId) {
    const submission = getMockupSubmission(entryId);
    if (!submission) {
        return replyToInteraction(interaction, {
            content: 'Dieses Mockup wurde nicht mehr gefunden.',
            ephemeral: true
        });
    }

    if (interaction.user.id === submission.userId) {
        return replyToInteraction(interaction, {
            content: 'Du kannst dein eigenes Mockup nicht liken.',
            ephemeral: true
        });
    }

    if (!isMockupVotingOpen(submission)) {
        submission.voteClosed = true;
        saveMockupStore();
        await interaction.message.edit({
            components: [buildMockupActionRow(entryId, submission.likes.length, true, false)]
        }).catch(() => {});

        return replyToInteraction(interaction, {
            content: 'Das 7-Tage-Voting ist bereits vorbei.',
            ephemeral: true
        });
    }

    if (submission.likes.includes(interaction.user.id)) {
        return replyToInteraction(interaction, {
            content: 'Du hast dieses Mockup bereits gelikt.',
            ephemeral: true
        });
    }

    submission.likes.push(interaction.user.id);
    saveMockupStore();
    recordUserActivity(interaction.user.id, 'mockup_like', {
        displayName: getMemberDisplayName(interaction.member, interaction.user)
    });

    await interaction.message.edit({
        components: [buildMockupActionRow(entryId, submission.likes.length, false, false)]
    }).catch(() => {});

    return replyToInteraction(interaction, {
        content: `Like gespeichert. Aktuelle Likes: ${submission.likes.length}.`,
        ephemeral: true
    });
}

async function handleMockupReportSubmit(interaction, entryId) {
    const submission = getMockupSubmission(entryId);
    if (!submission) {
        return replyToInteraction(interaction, {
            content: 'Dieses Mockup wurde nicht mehr gefunden.',
            ephemeral: true
        });
    }

    if (interaction.user.id === submission.userId) {
        return replyToInteraction(interaction, {
            content: 'Du kannst dein eigenes Mockup nicht melden.',
            ephemeral: true
        });
    }

    if (submission.reports.some(report => report.userId === interaction.user.id)) {
        return replyToInteraction(interaction, {
            content: 'Du hast dieses Mockup bereits gemeldet.',
            ephemeral: true
        });
    }

    const reason = interaction.fields.getTextInputValue('reason');
    submission.reports.push({
        userId: interaction.user.id,
        reason,
        createdAt: new Date().toISOString()
    });
    saveMockupStore();
    recordUserActivity(interaction.user.id, 'mockup_report', {
        displayName: getMemberDisplayName(interaction.member, interaction.user)
    });

    const reportChannel = await client.channels.fetch(MOCKUP_REPORT_CHANNEL_ID).catch(() => null);
    if (!reportChannel) {
        return replyToInteraction(interaction, {
            content: 'Der Mod-Channel konnte nicht erreicht werden.',
            ephemeral: true
        });
    }

    const reportEmbed = new EmbedBuilder()
        .setTitle('Mockup Meldung')
        .setDescription('Ein Community-Mockup wurde zur Pruefung gemeldet.')
        .addFields(
            { name: 'Gemeldet von', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Erstellt von', value: `<@${submission.userId}>`, inline: true },
            { name: 'Eintrag-ID', value: submission.entryId, inline: true },
            { name: 'Art', value: submission.garmentType, inline: true },
            { name: 'Name', value: submission.submitterName, inline: true },
            { name: 'Grund', value: reason, inline: false },
            { name: 'Originalpost', value: submission.messageUrl, inline: false }
        )
        .setColor('#e74c3c')
        .setTimestamp();

    if (submission.previewImageUrl) {
        reportEmbed.setImage(submission.previewImageUrl);
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Gemeldeten Post oeffnen')
            .setStyle(ButtonStyle.Link)
            .setURL(submission.messageUrl)
    );

    await reportChannel.send({
        embeds: [reportEmbed],
        components: [row]
    });

    return replyToInteraction(interaction, {
        content: 'Dein Report wurde an das Mod-Team geschickt.',
        ephemeral: true
    });
}

function getOutfitSubmission(entryId) {
    return mockupStore.outfitSubmissions[entryId] || null;
}

function isOutfitVotingOpen(submission, referenceDate = new Date()) {
    return getDateKey(referenceDate) === submission.contestDateKey;
}

function buildOutfitActionRow(entryId, likeCount, likeDisabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`outfit_like_${entryId}`)
            .setLabel(`LIKEN ${likeCount}`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(likeDisabled)
    );
}

function buildOutfitEmbeds(uploadData, author, entryId, imageFile, isVipCreator = false, creatorName = author.username) {
    const mainEmbed = new EmbedBuilder()
        .setTitle(isVipCreator ? 'VIP Community Fit' : 'Community Fit')
        .setDescription('Likes zaehlen bis Mitternacht.')
        .addFields(
            { name: 'Outfit', value: uploadData.fitDescription, inline: false },
            { name: 'Name', value: uploadData.submitterName, inline: true },
            { name: 'Von', value: `<@${author.id}>`, inline: true }
        )
        .setColor(isVipCreator ? '#f1c40f' : '#3498db')
        .setFooter({ text: `Outfit-ID: ${entryId}` })
        .setImage(`attachment://${imageFile.name}`)
        .setTimestamp();

    if (isVipCreator) {
        mainEmbed
            .setAuthor({
                name: `VIP Fit • ${creatorName}`,
                iconURL: author.displayAvatarURL()
            })
            .addFields(buildVipHighlightField());
    }

    return [mainEmbed];
}

async function setOutfitLikeState(submission, likeDisabled) {
    const channel = await client.channels.fetch(submission.channelId).catch(() => null);
    if (!channel) {
        return;
    }

    const message = await channel.messages.fetch(submission.messageId).catch(() => null);
    if (!message) {
        return;
    }

    await message.edit({
        components: [buildOutfitActionRow(submission.entryId, submission.likes.length, likeDisabled)]
    }).catch(() => {});
}

async function closeExpiredOutfitVotes() {
    let changed = false;

    for (const submission of Object.values(mockupStore.outfitSubmissions)) {
        if (submission.voteClosed || isOutfitVotingOpen(submission)) {
            continue;
        }

        await setOutfitLikeState(submission, true);
        submission.voteClosed = true;
        changed = true;
    }

    if (changed) {
        saveMockupStore();
    }
}

function pickDailyOutfitWinner(submissions) {
    return [...submissions].sort((left, right) => {
        const likeDifference = right.likes.length - left.likes.length;
        if (likeDifference !== 0) {
            return likeDifference;
        }

        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    })[0] || null;
}

function buildOutfitWinnerFallbackEmbed(submission) {
    return new EmbedBuilder()
        .setTitle(submission.isVipCreator ? 'VIP Tagesgewinner Fit' : 'Tagesgewinner Fit')
        .setDescription(`<@${submission.userId}> hat den Tagesgewinn mit ${submission.likes.length} Likes geholt.`)
        .addFields(
            { name: 'Outfit', value: submission.fitDescription, inline: false },
            { name: 'Name', value: submission.submitterName, inline: true },
            { name: 'Tag', value: submission.contestDateKey, inline: true }
        )
        .setColor('#f1c40f')
        .setFooter({ text: `Outfit-ID: ${submission.entryId}` })
        .setTimestamp();
}

async function buildOutfitWinnerEmbeds(submission) {
    const channel = await client.channels.fetch(submission.channelId).catch(() => null);
    if (!channel) {
        return [buildOutfitWinnerFallbackEmbed(submission)];
    }

    const message = await channel.messages.fetch(submission.messageId).catch(() => null);
    if (!message || !message.embeds.length) {
        return [buildOutfitWinnerFallbackEmbed(submission)];
    }

    return message.embeds.slice(0, 2).map((embed, index) => {
        const winnerEmbed = EmbedBuilder.from(embed).setColor('#f1c40f');

        if (index === 0) {
            winnerEmbed
                .setTitle('Tagesgewinner Fit')
                .setDescription(
                    `<@${submission.userId}> hat den Tagesgewinn mit ${submission.likes.length} Likes geholt.\n\n` +
                    `Outfit: ${submission.fitDescription}\nName: ${submission.submitterName}`
                )
                .setTimestamp();
        }

        return winnerEmbed;
    });
}

async function announceDailyOutfitWinnerIfNeeded(referenceDate = new Date()) {
    const targetDateKey = getPreviousDateKey(referenceDate);
    if (mockupStore.announcedOutfitDates.includes(targetDateKey)) {
        return;
    }

    const candidates = Object.values(mockupStore.outfitSubmissions).filter(submission =>
        submission.contestDateKey === targetDateKey
    );

    if (!candidates.length) {
        mockupStore.announcedOutfitDates.push(targetDateKey);
        saveMockupStore();
        return;
    }

    await closeExpiredOutfitVotes();

    const winner = pickDailyOutfitWinner(candidates);
    const outfitChannel = await client.channels.fetch(OUTFIT_CHANNEL_ID).catch(() => null);
    if (!winner || !outfitChannel) {
        return;
    }

    const winnerEmbeds = await buildOutfitWinnerEmbeds(winner);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Gewinnerfit oeffnen')
            .setStyle(ButtonStyle.Link)
            .setURL(winner.messageUrl)
    );

    try {
        await outfitChannel.send({
            content: `Tagesgewinner: <@${winner.userId}> mit ${winner.likes.length} Likes.`,
            embeds: winnerEmbeds,
            components: [row]
        });
    } catch (error) {
        console.error('Daily outfit winner announcement failed:', error.message);
        return;
    }

    mockupStore.announcedOutfitDates.push(targetDateKey);
    saveMockupStore();
}

async function announceMostActiveMemberIfNeeded(referenceDate = new Date()) {
    const targetMonthKey = getPreviousMonthKey(referenceDate);
    if (mockupStore.announcedActivityMonths.includes(targetMonthKey)) {
        return;
    }

    const monthBucket = mockupStore.activityByMonth[targetMonthKey];
    if (!monthBucket || !Object.keys(monthBucket).length) {
        mockupStore.announcedActivityMonths.push(targetMonthKey);
        saveMockupStore();
        return;
    }

    const sortedEntries = pickMostActiveMember(monthBucket);
    if (!sortedEntries.length) {
        mockupStore.announcedActivityMonths.push(targetMonthKey);
        saveMockupStore();
        return;
    }

    const activityChannel = await client.channels.fetch(MONTHLY_ACTIVITY_CHANNEL_ID).catch(() => null);
    if (!activityChannel) {
        return;
    }

    const [winnerUserId, winnerEntry] = sortedEntries[0];
    const embeds = buildMonthlyActivityEmbeds(targetMonthKey, sortedEntries);

    try {
        await activityChannel.send({
            content:
                `Monatsrueckblick fuer ${formatMonthLabel(targetMonthKey)}: ` +
                `<@${winnerUserId}> war die aktivste Person mit ${winnerEntry.points} Punkten.`,
            embeds
        });
    } catch (error) {
        console.error('Monthly activity announcement failed:', error.message);
        return;
    }

    mockupStore.monthlyActivityWinners[targetMonthKey] = {
        userId: winnerUserId,
        displayName: getActivityDisplayName(winnerEntry, winnerUserId),
        points: winnerEntry.points,
        totalActions: winnerEntry.totalActions,
        breakdown: winnerEntry.breakdown,
        announcedAt: new Date().toISOString(),
        leaderboard: sortedEntries.slice(0, 3).map(([userId, entry], index) => ({
            rank: index + 1,
            userId,
            displayName: getActivityDisplayName(entry, userId),
            points: entry.points,
            totalActions: entry.totalActions
        }))
    };
    mockupStore.announcedActivityMonths.push(targetMonthKey);
    saveMockupStore();
}

async function announceCommunityCookedIfNeeded(referenceDate = new Date()) {
    const targetMonthKey = getPreviousMonthKey(referenceDate);
    if (mockupStore.announcedCommunityCookedMonths.includes(targetMonthKey)) {
        return;
    }

    const monthItems = Object.values(mockupStore.listedItems)
        .filter(item => item.monthKey === targetMonthKey)
        .map(item => getListedItem(item.itemId))
        .filter(Boolean)
        .filter(item => getCommunityCookedScore(item) > 0);

    if (!monthItems.length) {
        mockupStore.announcedCommunityCookedMonths.push(targetMonthKey);
        saveMockupStore();
        return;
    }

    const topItems = pickCommunityCookedItems(monthItems).slice(0, 3);
    if (!topItems.length) {
        mockupStore.announcedCommunityCookedMonths.push(targetMonthKey);
        saveMockupStore();
        return;
    }

    const cookedChannel = await client.channels.fetch(COMMUNITY_COOKED_CHANNEL_ID).catch(() => null);
    if (!cookedChannel) {
        return;
    }

    const embeds = buildCommunityCookedEmbeds(targetMonthKey, topItems);
    const rows = buildCommunityCookedRows(topItems);

    try {
        await cookedChannel.send({
            content: `Community Cooked This fuer ${formatMonthLabel(targetMonthKey)} ist da.`,
            embeds,
            components: rows
        });
    } catch (error) {
        console.error('Community Cooked announcement failed:', error.message);
        return;
    }

    mockupStore.communityCookedHistory[targetMonthKey] = {
        announcedAt: new Date().toISOString(),
        items: topItems.map((item, index) => ({
            rank: index + 1,
            itemId: item.itemId,
            brand: item.brand,
            title: item.title,
            sellerId: item.sellerId,
            favoriteCount: item.favoriteUserIds?.length || 0,
            offerCount: item.offerUserIds?.length || 0,
            score: getCommunityCookedScore(item),
            soldAt: item.soldAt || null,
            messageUrl: item.messageUrl || null
        }))
    };
    mockupStore.announcedCommunityCookedMonths.push(targetMonthKey);
    saveMockupStore();
}

async function handleOutfitLike(interaction, entryId) {
    const submission = getOutfitSubmission(entryId);
    if (!submission) {
        return replyToInteraction(interaction, {
            content: 'Dieses Outfit wurde nicht mehr gefunden.',
            ephemeral: true
        });
    }

    if (interaction.user.id === submission.userId) {
        return replyToInteraction(interaction, {
            content: 'Du kannst dein eigenes Outfit nicht liken.',
            ephemeral: true
        });
    }

    if (!isOutfitVotingOpen(submission)) {
        submission.voteClosed = true;
        saveMockupStore();
        await interaction.message.edit({
            components: [buildOutfitActionRow(entryId, submission.likes.length, true)]
        }).catch(() => {});

        return replyToInteraction(interaction, {
            content: 'Das Daily Voting fuer dieses Outfit ist vorbei.',
            ephemeral: true
        });
    }

    if (submission.likes.includes(interaction.user.id)) {
        return replyToInteraction(interaction, {
            content: 'Du hast dieses Outfit bereits gelikt.',
            ephemeral: true
        });
    }

    submission.likes.push(interaction.user.id);
    saveMockupStore();
    recordUserActivity(interaction.user.id, 'outfit_like', {
        displayName: getMemberDisplayName(interaction.member, interaction.user)
    });

    await interaction.message.edit({
        components: [buildOutfitActionRow(entryId, submission.likes.length, false)]
    }).catch(() => {});

    return replyToInteraction(interaction, {
        content: `Like gespeichert. Aktuelle Likes: ${submission.likes.length}.`,
        ephemeral: true
    });
}

async function handleSellUploadMessage(message, uploadData) {
    const content = message.content.trim().toLowerCase();
    const imageAttachments = getImageAttachments(message);

    if (content !== 'done' || imageAttachments.length !== 1 || message.attachments.size !== 1) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> bitte sende genau eine Nachricht mit 1 Bild und dem Text **done**.`,
            6000
        );
        return;
    }

    const imageFiles = await buildImageFilesFromAttachments(imageAttachments, `piece-${message.author.id}`);
    await message.delete().catch(() => {});

    if (imageFiles.length !== 1) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> dein Bild konnte nicht verarbeitet werden. Bitte versuche es nochmal mit **1 Bild + done**.`,
            7000
        );
        return;
    }

    const itemId = Date.now().toString();
    const isVipSeller = memberHasVipRole(message.member);
    const creatorName = getMemberDisplayName(message.member, message.author);

    const embed = new EmbedBuilder()
        .setTitle(`${isVipSeller ? 'VIP ' : ''}${uploadData.brand} ${uploadData.title}`.trim())
        .addFields(
            { name: 'Preis', value: uploadData.price, inline: true },
            { name: 'Groesse', value: uploadData.size, inline: true },
            { name: 'Verkaeufer', value: `<@${message.author.id}>`, inline: true }
        )
        .setColor(isVipSeller ? '#f1c40f' : '#ffffff')
        .setFooter({ text: `Item-ID: ${itemId}` })
        .setImage(`attachment://${imageFiles[0].name}`);

    if (isVipSeller) {
        embed
            .setAuthor({
                name: `VIP Verkaeufer • ${creatorName}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription('Prioritaets-Listing aus dem VIP-Bereich.')
            .addFields(buildVipHighlightField());
    }

    const row = buildListingActionRow(itemId, message.author.id, uploadData.url, 'active');

    const channel = await client.channels.fetch(SELL_CHANNEL_ID).catch(() => null);
    if (!channel) {
        await sendTempMessage(message.channel, 'Der Verkaufs-Channel konnte nicht erreicht werden.', 7000);
        return;
    }

    const sentMessage = await channel.send({
        content: isVipSeller ? 'VIP-LISTING • extra hervorgehoben' : undefined,
        embeds: [embed],
        components: [row],
        files: imageFiles
    });

    mockupStore.listedItems[itemId] = {
        itemId,
        messageId: sentMessage.id,
        messageUrl: sentMessage.url,
        channelId: sentMessage.channelId,
        sellerId: message.author.id,
        title: uploadData.title,
        brand: uploadData.brand,
        price: uploadData.price,
        size: uploadData.size,
        url: uploadData.url,
        isVipSeller,
        createdAt: new Date().toISOString(),
        monthKey: getMonthKey(new Date()),
        favoriteUserIds: [],
        offerUserIds: [],
        reservedAt: null,
        soldAt: null,
        previewImageUrl: sentMessage.attachments.first()?.url || null
    };
    saveMockupStore();

    recordUserActivity(message.author.id, 'sell_upload', {
        displayName: creatorName
    });

    activeUploads.delete(message.author.id);
}

async function handleMockupUploadMessage(message, uploadData) {
    const content = message.content.trim().toLowerCase();
    const imageAttachments = getImageAttachments(message);

    if (
        content !== 'done' ||
        imageAttachments.length < 1 ||
        imageAttachments.length > 3 ||
        imageAttachments.length !== message.attachments.size
    ) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> bitte sende genau eine Nachricht mit 1 bis 3 Bildern und dem Text **done**.`,
            7000
        );
        return;
    }

    const imageFiles = await buildImageFilesFromAttachments(imageAttachments, `mockup-${message.author.id}`);
    await message.delete().catch(() => {});

    if (imageFiles.length !== imageAttachments.length) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> deine Mockup-Bilder konnten nicht verarbeitet werden. Bitte versuche es nochmal mit **1 bis 3 Bildern + done**.`,
            7000
        );
        return;
    }

    const entryId = Date.now().toString();
    const createdAt = new Date().toISOString();
    const voteEndsAt = new Date(Date.now() + MOCKUP_VOTE_WINDOW_MS).toISOString();
    const isVipCreator = memberHasVipRole(message.member);
    const creatorName = getMemberDisplayName(message.member, message.author);
    const embeds = buildMockupEmbeds(uploadData, message.author, entryId, imageFiles, voteEndsAt, isVipCreator, creatorName);

    const channel = await client.channels.fetch(MOCKUP_CHANNEL_ID).catch(() => null);
    if (!channel) {
        await sendTempMessage(message.channel, 'Der Mockup-Channel konnte nicht erreicht werden.', 7000);
        return;
    }

    const sentMessage = await channel.send({
        embeds,
        components: [buildMockupActionRow(entryId, 0, false, false)],
        files: imageFiles
    });

    mockupStore.submissions[entryId] = {
        entryId,
        messageId: sentMessage.id,
        messageUrl: sentMessage.url,
        channelId: sentMessage.channelId,
        userId: message.author.id,
        garmentType: uploadData.garmentType,
        submitterName: uploadData.submitterName,
        isVipCreator,
        createdAt,
        voteEndsAt,
        voteWeekKey: getWeekKey(new Date(voteEndsAt)),
        voteClosed: false,
        likes: [],
        reports: [],
        previewImageUrl: sentMessage.attachments.first()?.url || null
    };
    saveMockupStore();
    recordUserActivity(message.author.id, 'mockup_upload', {
        displayName: creatorName
    });

    activeUploads.delete(message.author.id);

    await sendTempMessage(
        message.channel,
        `<@${message.author.id}> dein Mockup ist live und kann jetzt 7 Tage lang gelikt werden.`,
        5000
    );
}

async function handleOutfitUploadMessage(message, uploadData) {
    const content = message.content.trim().toLowerCase();
    const imageAttachments = getImageAttachments(message);

    if (content !== 'done' || imageAttachments.length !== 1 || message.attachments.size !== 1) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> bitte sende genau eine Nachricht mit 1 Bild und dem Text **done**.`,
            7000
        );
        return;
    }

    const imageFiles = await buildImageFilesFromAttachments(imageAttachments, `outfit-${message.author.id}`);
    await message.delete().catch(() => {});

    if (imageFiles.length !== 1) {
        await sendTempMessage(
            message.channel,
            `<@${message.author.id}> dein Outfit-Bild konnte nicht verarbeitet werden. Bitte versuche es nochmal mit **1 Bild + done**.`,
            7000
        );
        return;
    }

    const entryId = Date.now().toString();
    const createdAt = new Date().toISOString();
    const contestDateKey = getDateKey(new Date());
    const isVipCreator = memberHasVipRole(message.member);
    const creatorName = getMemberDisplayName(message.member, message.author);
    const embeds = buildOutfitEmbeds(uploadData, message.author, entryId, imageFiles[0], isVipCreator, creatorName);

    const channel = await client.channels.fetch(OUTFIT_CHANNEL_ID).catch(() => null);
    if (!channel) {
        await sendTempMessage(message.channel, 'Der Outfit-Channel konnte nicht erreicht werden.', 7000);
        return;
    }

    const sentMessage = await channel.send({
        embeds,
        components: [buildOutfitActionRow(entryId, 0, false)],
        files: imageFiles
    });

    mockupStore.outfitSubmissions[entryId] = {
        entryId,
        messageId: sentMessage.id,
        messageUrl: sentMessage.url,
        channelId: sentMessage.channelId,
        userId: message.author.id,
        fitDescription: uploadData.fitDescription,
        submitterName: uploadData.submitterName,
        isVipCreator,
        createdAt,
        contestDateKey,
        voteClosed: false,
        likes: [],
        previewImageUrl: sentMessage.attachments.first()?.url || null
    };
    saveMockupStore();
    recordUserActivity(message.author.id, 'outfit_upload', {
        displayName: creatorName
    });

    activeUploads.delete(message.author.id);

    await sendTempMessage(
        message.channel,
        `<@${message.author.id}> dein Fit ist live und nimmt jetzt am Daily Voting teil.`,
        5000
    );
}

client.on('guildMemberAdd', async member => {
    if (member.user.bot) {
        return;
    }

    recordUserActivity(member.id, 'join_server', {
        displayName: getMemberDisplayName(member, member.user)
    });

    const welcomeEmbeds = buildWelcomeEmbeds(member);

    await member.send({
        content: `Willkommen auf ${member.guild.name}. Hier ist dein Startguide.`,
        embeds: welcomeEmbeds,
        components: buildWelcomeComponents()
    }).catch(error => {
        console.error(`Welcome DM could not be sent to ${member.user.tag}:`, error.message);
    });
});

client.once('ready', async () => {
    console.log(` ${client.user.tag} is online!`);

    await refreshPanels();
    await sendRulesMessage().catch(error => {
        console.error('Rules message failed on startup:', error.message);
    });
    await closeExpiredMockupVotes().catch(error => {
        console.error('Mockup vote cleanup failed on startup:', error.message);
    });
    await announceWeeklyMockupWinnerIfNeeded().catch(error => {
        console.error('Weekly winner check failed on startup:', error.message);
    });
    await closeExpiredOutfitVotes().catch(error => {
        console.error('Outfit vote cleanup failed on startup:', error.message);
    });
    await announceDailyOutfitWinnerIfNeeded().catch(error => {
        console.error('Daily outfit winner check failed on startup:', error.message);
    });
    await announceMostActiveMemberIfNeeded().catch(error => {
        console.error('Monthly activity winner check failed on startup:', error.message);
    });
    await announceCommunityCookedIfNeeded().catch(error => {
        console.error('Community Cooked check failed on startup:', error.message);
    });
    await syncTrustedSellerRoles().catch(error => {
        console.error('Trusted seller sync failed on startup:', error.message);
    });

    cron.schedule('*/5 * * * *', async () => {
        await refreshPanels();
    }, { timezone: TIMEZONE });

    cron.schedule('0 * * * *', async () => {
        await closeExpiredMockupVotes();
        await closeExpiredOutfitVotes();
    }, { timezone: TIMEZONE });

    cron.schedule('0 4 * * *', async () => {
        await syncTrustedSellerRoles();
    }, { timezone: TIMEZONE });

    cron.schedule(MOCKUP_WEEKLY_CRON, async () => {
        await announceWeeklyMockupWinnerIfNeeded();
    }, { timezone: TIMEZONE });

    cron.schedule(OUTFIT_DAILY_CRON, async () => {
        await announceDailyOutfitWinnerIfNeeded();
    }, { timezone: TIMEZONE });

    cron.schedule(MONTHLY_ACTIVITY_CRON, async () => {
        await announceMostActiveMemberIfNeeded();
    }, { timezone: TIMEZONE });

    cron.schedule(COMMUNITY_COOKED_CRON, async () => {
        await announceCommunityCookedIfNeeded();
    }, { timezone: TIMEZONE });
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'reaction_roles_select') {
                if (!interaction.inGuild()) {
                    return replyToInteraction(interaction, {
                        content: 'Diese Rollen kannst du nur im Server auswaehlen.',
                        ephemeral: true
                    });
                }

                await interaction.guild.roles.fetch().catch(() => null);
                const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
                if (!member) {
                    return replyToInteraction(interaction, {
                        content: 'Dein Mitgliedsprofil konnte nicht geladen werden.',
                        ephemeral: true
                    });
                }

                const selectedValues = new Set(interaction.values);
                const roleConfigs = getReactionRoleConfigs();
                const resolvedRoles = roleConfigs
                    .map(config => ({
                        ...config,
                        role: findRoleByIdOrName(interaction.guild, config.roleId, config.roleName)
                    }))
                    .filter(config => config.role);

                const missingRoles = roleConfigs.filter(config =>
                    !resolvedRoles.some(resolved => resolved.value === config.value)
                );

                const roleIdsToAdd = resolvedRoles
                    .filter(config =>
                        selectedValues.has(config.value) &&
                        !member.roles.cache.has(config.role.id)
                    )
                    .map(config => config.role.id);

                const roleIdsToRemove = resolvedRoles
                    .filter(config =>
                        !selectedValues.has(config.value) &&
                        member.roles.cache.has(config.role.id)
                    )
                    .map(config => config.role.id);

                if (roleIdsToAdd.length) {
                    await member.roles.add(roleIdsToAdd).catch(() => {});
                }

                if (roleIdsToRemove.length) {
                    await member.roles.remove(roleIdsToRemove).catch(() => {});
                }

                const selectedRoleNames = resolvedRoles
                    .filter(config => selectedValues.has(config.value))
                    .map(config => config.roleName);

                let content = selectedRoleNames.length
                    ? `Deine Rollen wurden aktualisiert: ${selectedRoleNames.join(', ')}`
                    : 'Deine auswählbaren Rollen wurden entfernt.';

                if (missingRoles.length) {
                    content += `\nNicht gefunden: ${missingRoles.map(role => role.roleName).join(', ')}`;
                }

                return replyToInteraction(interaction, {
                    content,
                    ephemeral: true
                });
            }
        }

        if (interaction.isButton()) {
            if (
                [
                    'welcome_rules',
                    'welcome_tutorials',
                    'welcome_sell',
                    'welcome_mockup',
                    'welcome_outfit'
                ].includes(interaction.customId)
            ) {
                const welcomeText = buildWelcomeGuideText(interaction.customId);
                if (welcomeText) {
                    return replyToInteraction(interaction, buildInfoReplyPayload(interaction, welcomeText));
                }
            }

            if (
                [
                    'sell_panel_info',
                    'sell_panel_vip',
                    'team_panel_info',
                    'mockup_panel_info',
                    'outfit_panel_info',
                    'iso_panel_info'
                ].includes(interaction.customId)
            ) {
                const panelInfoText = buildPanelInfoText(interaction.customId);
                if (panelInfoText) {
                    return replyToInteraction(interaction, buildInfoReplyPayload(interaction, panelInfoText));
                }
            }

            if (interaction.customId === 'start_upload') {
                const modal = new ModalBuilder()
                    .setCustomId('upload_modal')
                    .setTitle('Piece-Details');

                const pieceInput = new TextInputBuilder()
                    .setCustomId('title')
                    .setLabel('Piece')
                    .setPlaceholder('z.B. Nike Hoodie')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const brandInput = new TextInputBuilder()
                    .setCustomId('brand')
                    .setLabel('Marke')
                    .setPlaceholder('z.B. Nike')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const priceInput = new TextInputBuilder()
                    .setCustomId('price')
                    .setLabel('Preis')
                    .setPlaceholder('z.B. 12 EUR')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const sizeInput = new TextInputBuilder()
                    .setCustomId('size')
                    .setLabel('Groesse')
                    .setPlaceholder('z.B. M / 38 / One Size')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const linkInput = new TextInputBuilder()
                    .setCustomId('url')
                    .setLabel('Vinted Link')
                    .setPlaceholder('https://www.vinted.de/items/...')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(pieceInput),
                    new ActionRowBuilder().addComponents(brandInput),
                    new ActionRowBuilder().addComponents(priceInput),
                    new ActionRowBuilder().addComponents(sizeInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_teamup') {
                const modal = new ModalBuilder()
                    .setCustomId('team_modal')
                    .setTitle('Team finden');

                const descInput = new TextInputBuilder()
                    .setCustomId('desc')
                    .setLabel('Wonach suchst du?')
                    .setPlaceholder('z.B. Suche jemanden fuer ein 50/50 Resell-Projekt in Berlin...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(descInput));
                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_mockup_upload') {
                const modal = new ModalBuilder()
                    .setCustomId('mockup_modal')
                    .setTitle('Veloo Archive Mockup');

                const garmentTypeInput = new TextInputBuilder()
                    .setCustomId('garment_type')
                    .setLabel('Welche Art von Kleidung / Accessoire?')
                    .setPlaceholder('z.B. Hoodie, Jersey, Cap, Tote Bag, Beanie')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const nameInput = new TextInputBuilder()
                    .setCustomId('submitter_name')
                    .setLabel('Dein Name')
                    .setPlaceholder('z.B. Hasan / veloo archive')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(garmentTypeInput),
                    new ActionRowBuilder().addComponents(nameInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_outfit_upload') {
                const modal = new ModalBuilder()
                    .setCustomId('outfit_modal')
                    .setTitle('Poste deinen Fit');

                const fitDescriptionInput = new TextInputBuilder()
                    .setCustomId('fit_description')
                    .setLabel('Was traegst du?')
                    .setPlaceholder('z.B. Vintage Nike Zip, Baggy Denim, New Balance 9060')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const nameInput = new TextInputBuilder()
                    .setCustomId('submitter_name')
                    .setLabel('Dein Name')
                    .setPlaceholder('z.B. Hasan / veloo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(fitDescriptionInput),
                    new ActionRowBuilder().addComponents(nameInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_iso') {
                const modal = new ModalBuilder()
                    .setCustomId('iso_modal')
                    .setTitle('Suche / ISO');

                const pieceInput = new TextInputBuilder()
                    .setCustomId('iso_piece')
                    .setLabel('Wonach suchst du?')
                    .setPlaceholder('z.B. Nike Zip Hoodie')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const sizeInput = new TextInputBuilder()
                    .setCustomId('iso_size')
                    .setLabel('Groesse')
                    .setPlaceholder('z.B. M / L / 32 / One Size')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const budgetInput = new TextInputBuilder()
                    .setCustomId('iso_budget')
                    .setLabel('Budget')
                    .setPlaceholder('z.B. bis 40 EUR')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const nameInput = new TextInputBuilder()
                    .setCustomId('iso_name')
                    .setLabel('Dein Name')
                    .setPlaceholder('z.B. Hasan / veloo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(pieceInput),
                    new ActionRowBuilder().addComponents(sizeInput),
                    new ActionRowBuilder().addComponents(budgetInput),
                    new ActionRowBuilder().addComponents(nameInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_cooperation_post') {
                if (!memberHasOwnerRole(interaction.member)) {
                    return replyToInteraction(interaction, {
                        content: `Nur die Rolle ${OWNER_ROLE_NAME} kann Cooperationen posten.`,
                        ephemeral: true
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId('cooperation_modal')
                    .setTitle('Cooperation posten');

                const titleInput = new TextInputBuilder()
                    .setCustomId('coop_title')
                    .setLabel('Titel')
                    .setPlaceholder('z.B. Neue Brand Cooperation')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const contactInput = new TextInputBuilder()
                    .setCustomId('coop_contact')
                    .setLabel('Kontakt / Brand')
                    .setPlaceholder('z.B. @username / Brandname')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const textInput = new TextInputBuilder()
                    .setCustomId('coop_text')
                    .setLabel('Was soll gepostet werden?')
                    .setPlaceholder('Schreibe hier alle wichtigen Infos rein...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(titleInput),
                    new ActionRowBuilder().addComponents(contactInput),
                    new ActionRowBuilder().addComponents(textInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'start_creator_application') {
                const modal = new ModalBuilder()
                    .setCustomId('creator_application_modal')
                    .setTitle('Creator Bewerbung');

                const handleInput = new TextInputBuilder()
                    .setCustomId('creator_handle')
                    .setLabel('TikTok / Insta @username')
                    .setPlaceholder('z.B. @velooarchive')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const linkInput = new TextInputBuilder()
                    .setCustomId('creator_link')
                    .setLabel('Profil-Link')
                    .setPlaceholder('https://...')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const typeInput = new TextInputBuilder()
                    .setCustomId('creator_type')
                    .setLabel('Was bist du?')
                    .setPlaceholder('z.B. Reseller, Creator, UGC')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const ageInput = new TextInputBuilder()
                    .setCustomId('creator_age')
                    .setLabel('Alter')
                    .setPlaceholder('z.B. 18')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('creator_experience')
                    .setLabel('Wie lange machst du das schon?')
                    .setPlaceholder('z.B. seit 2 Jahren')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(handleInput),
                    new ActionRowBuilder().addComponents(linkInput),
                    new ActionRowBuilder().addComponents(typeInput),
                    new ActionRowBuilder().addComponents(ageInput),
                    new ActionRowBuilder().addComponents(experienceInput)
                );

                return interaction.showModal(modal);
            }

            if (interaction.customId.startsWith('mockup_like_')) {
                const entryId = interaction.customId.replace('mockup_like_', '');
                return handleMockupLike(interaction, entryId);
            }

            if (interaction.customId.startsWith('outfit_like_')) {
                const entryId = interaction.customId.replace('outfit_like_', '');
                return handleOutfitLike(interaction, entryId);
            }

            if (interaction.customId.startsWith('mockup_report_')) {
                const entryId = interaction.customId.replace('mockup_report_', '');
                const modal = new ModalBuilder()
                    .setCustomId(`mockup_report_modal_${entryId}`)
                    .setTitle('Mockup melden');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel('Warum meldest du dieses Mockup?')
                    .setPlaceholder('Beschreibe kurz, was vom Mod-Team geprueft werden soll.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                return interaction.showModal(modal);
            }

            if (interaction.customId.startsWith('creatorapp_accept_')) {
                if (!memberCanReviewCreatorApplication(interaction.member)) {
                    return replyToInteraction(interaction, {
                        content: 'Nur Owner oder Moderatoren koennen Creator-Bewerbungen pruefen.',
                        ephemeral: true
                    });
                }

                const applicationId = interaction.customId.replace('creatorapp_accept_', '');
                const application = getCreatorApplication(applicationId);
                if (!application) {
                    return replyToInteraction(interaction, {
                        content: 'Diese Creator-Bewerbung wurde nicht gefunden.',
                        ephemeral: true
                    });
                }

                if ((application.status || 'pending') !== 'pending') {
                    return replyToInteraction(interaction, {
                        content: 'Diese Bewerbung wurde bereits geprueft.',
                        ephemeral: true
                    });
                }

                application.status = 'accepted';
                application.reviewedBy = interaction.user.id;
                application.reviewedAt = new Date().toISOString();
                application.reviewReason = '';
                saveMockupStore();

                await updateCreatorApplicationReviewMessage(application);
                await grantContentCreatorRole(interaction.guild, application.userId);
                await sendCreatorApplicationResultDm(application, true);

                const creatorChannel = await client.channels.fetch(CREATOR_CHANNEL_ID).catch(() => null);
                if (creatorChannel) {
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('🔗 PROFIL OEFFNEN')
                            .setStyle(ButtonStyle.Link)
                            .setURL(application.profileLink)
                    );

                    await creatorChannel.send({
                        content: `✅ <@${application.userId}> wurde angenommen. Schaut euch den Account an.`,
                        embeds: [buildApprovedCreatorEmbed(application)],
                        components: [row]
                    }).catch(() => {});
                }

                return replyToInteraction(interaction, {
                    content: 'Die Creator-Bewerbung wurde angenommen.',
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith('creatorapp_decline_')) {
                if (!memberCanReviewCreatorApplication(interaction.member)) {
                    return replyToInteraction(interaction, {
                        content: 'Nur Owner oder Moderatoren koennen Creator-Bewerbungen pruefen.',
                        ephemeral: true
                    });
                }

                const applicationId = interaction.customId.replace('creatorapp_decline_', '');
                const application = getCreatorApplication(applicationId);
                if (!application) {
                    return replyToInteraction(interaction, {
                        content: 'Diese Creator-Bewerbung wurde nicht gefunden.',
                        ephemeral: true
                    });
                }

                if ((application.status || 'pending') !== 'pending') {
                    return replyToInteraction(interaction, {
                        content: 'Diese Bewerbung wurde bereits geprueft.',
                        ephemeral: true
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId(`creatorapp_decline_modal_${applicationId}`)
                    .setTitle('Bewerbung ablehnen');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('decline_reason')
                    .setLabel('Warum wird abgelehnt?')
                    .setPlaceholder('Schreibe kurz den Grund fuer die Ablehnung...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                return interaction.showModal(modal);
            }

            const parts = interaction.customId.split('_');
            if (parts.length < 3) {
                return;
            }

            const [action, itemId, sellerId] = parts;

            if (action === 'reserved') {
                if (interaction.user.id !== sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Das kann nur der Verkaeufer machen.',
                        ephemeral: true
                    });
                }

                const listedItem = getListedItem(itemId);
                if (listedItem?.soldAt) {
                    return replyToInteraction(interaction, {
                        content: 'Dieses Piece ist bereits verkauft.',
                        ephemeral: true
                    });
                }

                if (listedItem?.reservedAt) {
                    return replyToInteraction(interaction, {
                        content: 'Dieses Piece ist bereits als reserviert markiert.',
                        ephemeral: true
                    });
                }

                await markTrackedItemCopiesWithStatus(interaction.guild, itemId, interaction.message, 'reserved');

                if (listedItem) {
                    listedItem.reservedAt = new Date().toISOString();
                    saveMockupStore();
                }

                return replyToInteraction(interaction, {
                    content: 'Piece wurde als RESERVIERT markiert.',
                    ephemeral: true
                });
            }

            if (action === 'sold') {
                if (interaction.user.id !== sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Das kann nur der Verkaeufer machen.',
                        ephemeral: true
                    });
                }

                const listedItem = getListedItem(itemId);
                if (listedItem?.soldAt) {
                    return replyToInteraction(interaction, {
                        content: 'Dieses Piece ist bereits als verkauft markiert.',
                        ephemeral: true
                    });
                }

                await markTrackedItemCopiesWithStatus(interaction.guild, itemId, interaction.message, 'sold');
                const currentSaleNumber = await announceSale(sellerId).catch(error => {
                    console.error('Error posting sale message:', error.message);
                    return null;
                });

                if (listedItem) {
                    listedItem.soldAt = new Date().toISOString();
                    saveMockupStore();
                } else {
                    mockupStore.listedItems[itemId] = {
                        itemId,
                        sellerId,
                        title: interaction.message.embeds[0]?.title || 'Piece',
                        brand: interaction.message.embeds[0]?.title || 'Piece',
                        price: 'Unbekannt',
                        size: 'Unbekannt',
                        messageId: interaction.message.id,
                        messageUrl: interaction.message.url,
                        channelId: interaction.channelId,
                        createdAt: new Date().toISOString(),
                        monthKey: getMonthKey(new Date()),
                        favoriteUserIds: [],
                        offerUserIds: [],
                        reservedAt: null,
                        soldAt: new Date().toISOString(),
                        previewImageUrl:
                            interaction.message.embeds[0]?.image?.url ||
                            interaction.message.embeds[0]?.data?.image?.url ||
                            null
                    };
                    saveMockupStore();
                }

                if (currentSaleNumber !== null) {
                    await syncTrustedSellerRoleForMember(interaction.guild, sellerId, currentSaleNumber).catch(error => {
                        console.error('Trusted seller update failed:', error.message);
                    });
                }

                recordUserActivity(sellerId, 'sale_completed', {
                    displayName: getMemberDisplayName(interaction.member, interaction.user)
                });

                return replyToInteraction(interaction, {
                    content: 'Piece wurde als VERKAUFT markiert und der Sale wurde gezaehlt.',
                    ephemeral: true
                });
            }

            if (action === 'fav') {
                if (interaction.user.id === sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Du kannst dein eigenes Piece nicht favorisieren.',
                        ephemeral: true
                    });
                }

                const favoritesChannelName = `favs-${interaction.user.id}`;
                let favoriteChannel = interaction.guild.channels.cache.find(channel =>
                    channel.type === ChannelType.GuildText && channel.name === favoritesChannelName
                );

                if (!favoriteChannel) {
                    favoriteChannel = await interaction.guild.channels.create({
                        name: favoritesChannelName,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                        ]
                    });
                }

                const existingMessages = await favoriteChannel.messages.fetch({ limit: 100 });
                const alreadySaved = existingMessages.find(message =>
                    message.author.id === client.user.id &&
                    getEmbedFooterText(message.embeds[0]) === `Item-ID: ${itemId}`
                );

                if (alreadySaved) {
                    return replyToInteraction(interaction, {
                        content: 'Dieses Piece ist bereits in deinen Favoriten.',
                        ephemeral: true
                    });
                }

                const originalEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                originalEmbed.setFooter({ text: `Item-ID: ${itemId}` });

                const favoriteRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Original oeffnen')
                        .setStyle(ButtonStyle.Link)
                        .setURL(interaction.message.url)
                );

                await favoriteChannel.send({
                    content: 'Du hast dieses Piece gespeichert:',
                    embeds: [originalEmbed],
                    components: [favoriteRow]
                });

                const listedItem = getListedItem(itemId);
                if (listedItem && !listedItem.favoriteUserIds.includes(interaction.user.id)) {
                    listedItem.favoriteUserIds.push(interaction.user.id);
                    saveMockupStore();
                }
                recordUserActivity(interaction.user.id, 'favorite_saved', {
                    displayName: getMemberDisplayName(interaction.member, interaction.user)
                });

                return replyToInteraction(interaction, {
                    content: 'In deinen Favoriten gespeichert.',
                    ephemeral: true
                });
            }

            if (action === 'offer') {
                if (interaction.user.id === sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Du kannst dir selbst kein Angebot senden.',
                        ephemeral: true
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId(`moffer_${itemId}_${sellerId}`)
                    .setTitle('Angebot senden');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('oprice')
                            .setLabel('Dein Preisangebot')
                            .setPlaceholder('z.B. 10 EUR')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'upload_modal') {
                activeUploads.set(interaction.user.id, {
                    type: 'sell',
                    sourceChannelId: interaction.channelId,
                    title: interaction.fields.getTextInputValue('title'),
                    brand: interaction.fields.getTextInputValue('brand'),
                    price: interaction.fields.getTextInputValue('price'),
                    size: interaction.fields.getTextInputValue('size'),
                    url: interaction.fields.getTextInputValue('url')
                });

                return replyToInteraction(interaction, {
                    content: 'Sende jetzt genau eine Nachricht mit 1 Bild und dem Text `done`. Diese Nachricht wird danach automatisch geloescht.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'team_modal') {
                const embed = new EmbedBuilder()
                    .setTitle('TEAM-UP GESUCH')
                    .setDescription(interaction.fields.getTextInputValue('desc'))
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setColor('#2ecc71')
                    .setTimestamp();

                await interaction.channel.send({ embeds: [embed] });
                recordUserActivity(interaction.user.id, 'teamup_post', {
                    displayName: getMemberDisplayName(interaction.member, interaction.user)
                });
                return replyToInteraction(interaction, {
                    content: 'Dein Gesuch wurde gepostet.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'cooperation_modal') {
                if (!memberHasOwnerRole(interaction.member)) {
                    return replyToInteraction(interaction, {
                        content: `Nur die Rolle ${OWNER_ROLE_NAME} kann Cooperationen posten.`,
                        ephemeral: true
                    });
                }

                const cooperationChannel = await client.channels.fetch(COOPERATION_CHANNEL_ID).catch(() => null);
                if (!cooperationChannel) {
                    return replyToInteraction(interaction, {
                        content: 'Der Cooperation-Channel konnte nicht erreicht werden.',
                        ephemeral: true
                    });
                }

                const embed = buildPanelEmbed({
                    title: `🤝 ${interaction.fields.getTextInputValue('coop_title')}`,
                    description: interaction.fields.getTextInputValue('coop_text'),
                    color: '#cdb79e',
                    fields: [
                        { name: '🏷️ Kontakt / Brand', value: interaction.fields.getTextInputValue('coop_contact'), inline: true },
                        { name: '👑 Gepostet von', value: `<@${interaction.user.id}>`, inline: true }
                    ],
                    footerText: 'VELOO&YESTERA // COOPERATION'
                }).setTimestamp();

                await cooperationChannel.send({ embeds: [embed] });
                return replyToInteraction(interaction, {
                    content: 'Die Cooperation wurde gepostet.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'mockup_modal') {
                activeUploads.set(interaction.user.id, {
                    type: 'mockup',
                    sourceChannelId: interaction.channelId,
                    garmentType: interaction.fields.getTextInputValue('garment_type'),
                    submitterName: interaction.fields.getTextInputValue('submitter_name')
                });

                return replyToInteraction(interaction, {
                    content: 'Sende jetzt genau eine Nachricht mit 1 bis 3 Bildern und dem Text `done`. Diese Nachricht wird danach automatisch geloescht.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'outfit_modal') {
                activeUploads.set(interaction.user.id, {
                    type: 'outfit',
                    sourceChannelId: interaction.channelId,
                    fitDescription: interaction.fields.getTextInputValue('fit_description'),
                    submitterName: interaction.fields.getTextInputValue('submitter_name')
                });

                return replyToInteraction(interaction, {
                    content: 'Sende jetzt genau eine Nachricht mit 1 Bild und dem Text `done`. Diese Nachricht wird danach automatisch geloescht.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'creator_application_modal') {
                const reviewChannel = await client.channels.fetch(CREATOR_REVIEW_CHANNEL_ID).catch(() => null);
                if (!reviewChannel) {
                    return replyToInteraction(interaction, {
                        content: 'Der Review-Channel konnte nicht erreicht werden.',
                        ephemeral: true
                    });
                }

                const applicationId = Date.now().toString();
                const application = {
                    applicationId,
                    userId: interaction.user.id,
                    sourceChannelId: interaction.channelId,
                    accountHandle: interaction.fields.getTextInputValue('creator_handle'),
                    profileLink: interaction.fields.getTextInputValue('creator_link'),
                    creatorType: interaction.fields.getTextInputValue('creator_type'),
                    age: interaction.fields.getTextInputValue('creator_age'),
                    experience: interaction.fields.getTextInputValue('creator_experience'),
                    createdAt: new Date().toISOString(),
                    status: 'pending',
                    reviewedBy: null,
                    reviewedAt: null,
                    reviewReason: ''
                };

                const reviewMessage = await reviewChannel.send({
                    embeds: [buildCreatorApplicationReviewEmbed(application)],
                    components: [buildCreatorApplicationReviewRow(applicationId, false)]
                }).catch(() => null);

                if (!reviewMessage) {
                    return replyToInteraction(interaction, {
                        content: 'Die Bewerbung konnte nicht an das Mod-Team gesendet werden.',
                        ephemeral: true
                    });
                }

                application.reviewChannelId = reviewMessage.channelId;
                application.reviewMessageId = reviewMessage.id;
                mockupStore.creatorApplications[applicationId] = application;
                saveMockupStore();

                return replyToInteraction(interaction, {
                    content: 'Deine Bewerbung wurde an das Mod-Team weitergeleitet.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'iso_modal') {
                const isVipMember = memberHasVipRole(interaction.member);
                const creatorName = getMemberDisplayName(interaction.member, interaction.user);

                const embed = new EmbedBuilder()
                    .setTitle(isVipMember ? 'VIP ISO' : 'Suche / ISO')
                    .setDescription(interaction.fields.getTextInputValue('iso_piece'))
                    .addFields(
                        { name: 'Groesse', value: interaction.fields.getTextInputValue('iso_size'), inline: true },
                        { name: 'Budget', value: interaction.fields.getTextInputValue('iso_budget'), inline: true },
                        { name: 'Name', value: interaction.fields.getTextInputValue('iso_name'), inline: true },
                        { name: 'Von', value: `<@${interaction.user.id}>`, inline: true }
                    )
                    .setColor(isVipMember ? '#f1c40f' : getCurrentPanelTheme().iso)
                    .setTimestamp();

                if (isVipMember) {
                    embed
                        .setAuthor({
                            name: `VIP ISO • ${creatorName}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .addFields(buildVipHighlightField());
                }

                await interaction.channel.send({ embeds: [embed] });
                recordUserActivity(interaction.user.id, 'iso_post', {
                    displayName: creatorName
                });
                return replyToInteraction(interaction, {
                    content: 'Dein ISO wurde gepostet.',
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith('creatorapp_decline_modal_')) {
                if (!memberCanReviewCreatorApplication(interaction.member)) {
                    return replyToInteraction(interaction, {
                        content: 'Nur Owner oder Moderatoren koennen Creator-Bewerbungen pruefen.',
                        ephemeral: true
                    });
                }

                const applicationId = interaction.customId.replace('creatorapp_decline_modal_', '');
                const application = getCreatorApplication(applicationId);
                if (!application) {
                    return replyToInteraction(interaction, {
                        content: 'Diese Creator-Bewerbung wurde nicht gefunden.',
                        ephemeral: true
                    });
                }

                if ((application.status || 'pending') !== 'pending') {
                    return replyToInteraction(interaction, {
                        content: 'Diese Bewerbung wurde bereits geprueft.',
                        ephemeral: true
                    });
                }

                application.status = 'declined';
                application.reviewedBy = interaction.user.id;
                application.reviewedAt = new Date().toISOString();
                application.reviewReason = interaction.fields.getTextInputValue('decline_reason');
                saveMockupStore();

                await updateCreatorApplicationReviewMessage(application);
                await sendCreatorApplicationResultDm(application, false, application.reviewReason);

                return replyToInteraction(interaction, {
                    content: 'Die Bewerbung wurde abgelehnt und der Grund verschickt.',
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith('mockup_report_modal_')) {
                const entryId = interaction.customId.replace('mockup_report_modal_', '');
                return handleMockupReportSubmit(interaction, entryId);
            }

            if (interaction.customId.startsWith('moffer_')) {
                const [, itemId, sellerId] = interaction.customId.split('_');

                if (!itemId || !sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Das Angebot konnte nicht verarbeitet werden.',
                        ephemeral: true
                    });
                }

                if (interaction.user.id === sellerId) {
                    return replyToInteraction(interaction, {
                        content: 'Du kannst dir selbst kein Angebot senden.',
                        ephemeral: true
                    });
                }

                const offerPrice = interaction.fields.getTextInputValue('oprice');
                const seller = await client.users.fetch(sellerId).catch(() => null);

                if (!seller) {
                    return replyToInteraction(interaction, {
                        content: 'Der Verkaeufer konnte nicht gefunden werden.',
                        ephemeral: true
                    });
                }

                const offerEmbed = new EmbedBuilder()
                    .setTitle('Neues Angebot')
                    .addFields(
                        { name: 'Item-ID', value: itemId, inline: true },
                        { name: 'Angebot', value: offerPrice, inline: true },
                        { name: 'Von', value: `<@${interaction.user.id}>`, inline: true }
                    )
                    .setColor('#27ae60')
                    .setTimestamp();

                try {
                    await seller.send({ embeds: [offerEmbed] });
                    const listedItem = getListedItem(itemId);
                    if (listedItem && !listedItem.offerUserIds.includes(interaction.user.id)) {
                        listedItem.offerUserIds.push(interaction.user.id);
                        saveMockupStore();
                    }
                    recordUserActivity(interaction.user.id, 'offer_sent', {
                        displayName: getMemberDisplayName(interaction.member, interaction.user)
                    });
                    return replyToInteraction(interaction, {
                        content: 'Dein Angebot wurde an den Verkaeufer gesendet.',
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Error sending offer:', error.message);
                    return replyToInteraction(interaction, {
                        content: 'Ich konnte dem Verkaeufer keine DM senden.',
                        ephemeral: true
                    });
                }
            }
        }
    } catch (error) {
        console.error('Interaction handler failed:', error.message);
        await replyToInteraction(interaction, {
            content: 'Beim Verarbeiten dieser Aktion ist etwas schiefgelaufen.',
            ephemeral: true
        });
    }
});

client.on('messageCreate', async message => {
    await handleVipDeal(message).catch(error => {
        console.error('VIP detection failed:', error.message);
    });
    await forwardLatestGoodsToBrandChannels(message).catch(error => {
        console.error('Brand forward failed:', error.message);
    });

    if (message.author.bot) {
        return;
    }

    const uploadData = activeUploads.get(message.author.id);
    const isUploadFlowMessage =
        Boolean(uploadData) &&
        (!uploadData.sourceChannelId || uploadData.sourceChannelId === message.channelId);

    if (message.guild && !isUploadFlowMessage) {
        recordUserActivity(message.author.id, 'message_post', {
            displayName: getMemberDisplayName(message.member, message.author),
            cooldownMs: 10 * 60 * 1000
        });

        await handleMainChannelAutoReply(message).catch(error => {
            console.error('Main channel auto reply failed:', error.message);
        });
    }

    if (!uploadData) {
        return;
    }

    if (uploadData.sourceChannelId && uploadData.sourceChannelId !== message.channelId) {
        return;
    }

    if (uploadData.type === 'sell') {
        await handleSellUploadMessage(message, uploadData).catch(error => {
            console.error('Sell upload failed:', error.message);
        });
        return;
    }

    if (uploadData.type === 'mockup') {
        await handleMockupUploadMessage(message, uploadData).catch(error => {
            console.error('Mockup upload failed:', error.message);
        });
        return;
    }

    if (uploadData.type === 'outfit') {
        await handleOutfitUploadMessage(message, uploadData).catch(error => {
            console.error('Outfit upload failed:', error.message);
        });
    }
});

if (!process.env.TOKEN) {
    console.error('TOKEN is missing in Railway variables.');
    process.exit(1);
}

client.login(process.env.TOKEN);
