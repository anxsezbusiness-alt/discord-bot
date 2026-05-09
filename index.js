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
const http = require('node:http');
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
const BOT_GUILD_ID = process.env.GUILD_ID || process.env.DISCORD_GUILD_ID || process.env.SERVER_ID || '1492255499201286298';

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
const COOPERATION_CHANNEL_ID = process.env.COOPERATION_CHANNEL_ID || '1492261552697643178';
const CREATOR_CHANNEL_ID = process.env.CREATOR_CHANNEL_ID || '1501550981421207562';
const CREATOR_REVIEW_CHANNEL_ID = process.env.CREATOR_REVIEW_CHANNEL_ID || '1492261750110949509';
const MONTHLY_ACTIVITY_CHANNEL_ID = process.env.MONTHLY_ACTIVITY_CHANNEL_ID || '1500944487357223092';
const MONTHLY_ACTIVITY_CRON = process.env.MONTHLY_ACTIVITY_CRON || '0 0 1 * *';
const COMMUNITY_COOKED_CHANNEL_ID = process.env.COMMUNITY_COOKED_CHANNEL_ID || '1501207095092183201';
const COMMUNITY_COOKED_CRON = process.env.COMMUNITY_COOKED_CRON || '0 0 1 * *';
const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID || '1492261145078272230';
const REACTION_ROLE_CHANNEL_ID = process.env.REACTION_ROLE_CHANNEL_ID || '1492255500434407631';
const VERIFICATION_CHANNEL_ID = process.env.VERIFICATION_CHANNEL_ID || '1492469888759890131';
const UNVERIFIED_ROLE_ID = process.env.UNVERIFIED_ROLE_ID || '1492469864701493278';
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID || '1492463758864416829';
const AI_PANEL_CHANNEL_ID = process.env.AI_PANEL_CHANNEL_ID || '1501914878716280833';
const SERVER_GUIDE_CHANNEL_ID = process.env.SERVER_GUIDE_CHANNEL_ID || '1502274806354280644';
const AI_EXPLAINER_CHANNEL_ID = process.env.AI_EXPLAINER_CHANNEL_ID || '1502297892336173066';
const NOTIFICATION_PANEL_CHANNEL_ID = process.env.NOTIFICATION_PANEL_CHANNEL_ID || '1502387252611780668';
const PRICE_DROPS_CHANNEL_ID = process.env.PRICE_DROPS_CHANNEL_ID || '1502555933346234399';
const BUNDLES_CHANNEL_ID = process.env.BUNDLES_CHANNEL_ID || '1502556130315075686';
const VIP_TUTORIAL_CHANNEL_ID = process.env.VIP_TUTORIAL_CHANNEL_ID || '1502556739831070860';
const VIP_PANEL_MANAGER_CHANNEL_ID = process.env.VIP_PANEL_MANAGER_CHANNEL_ID || '1502554630633029752';
const SUPPORT_TICKET_PANEL_CHANNEL_ID = process.env.SUPPORT_TICKET_PANEL_CHANNEL_ID || '1492255500434407632';
const REVIEW_CHANNEL_ID = process.env.REVIEW_CHANNEL_ID || '1502373071678607442';
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID || '1502339213176344796';
const TICKET_NOTIFY_USER_ID = process.env.TICKET_NOTIFY_USER_ID || null;
const TICKET_IDLE_HOURS = Number(process.env.TICKET_IDLE_HOURS || 24);
const TICKET_IDLE_MS = TICKET_IDLE_HOURS * 60 * 60 * 1000;
const STAFF_LOG_CHANNEL_ID = process.env.STAFF_LOG_CHANNEL_ID || '1492261750110949509';
const ANALYTICS_CHANNEL_ID = process.env.ANALYTICS_CHANNEL_ID || STAFF_LOG_CHANNEL_ID;
const ANALYTICS_WEEKLY_CRON = process.env.ANALYTICS_WEEKLY_CRON || '0 9 * * 1';
const ANTI_SPAM_WINDOW_MS = Number(process.env.ANTI_SPAM_WINDOW_MS || 8000);
const ANTI_SPAM_MAX_MESSAGES = Number(process.env.ANTI_SPAM_MAX_MESSAGES || 6);
const NEW_ACCOUNT_WARN_DAYS = Number(process.env.NEW_ACCOUNT_WARN_DAYS || 7);
const VIP_EXPIRY_REMINDER_DAYS = Number(process.env.VIP_EXPIRY_REMINDER_DAYS || 2);
const VIP_EXPIRY_REMINDER_MS = VIP_EXPIRY_REMINDER_DAYS * 24 * 60 * 60 * 1000;
const AI_CHANNEL_CATEGORY_ID = process.env.AI_CHANNEL_CATEGORY_ID || null;
const AI_TOKEN_STORE_PATH = process.env.AI_TOKEN_STORE_PATH || path.join(__dirname, 'ai-token-store.json');
const VIP_STATUS_STORE_PATH = process.env.VIP_STATUS_STORE_PATH || path.join(__dirname, 'vip-status-store.json');
const AI_BUY_TOKENS_URL = process.env.AI_BUY_TOKENS_URL || 'https://www.veloo.org/vip.html#ai-tokens';
const AI_STARTING_TOKENS = Number(process.env.AI_STARTING_TOKENS || 0);
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const OPENAI_MAX_OUTPUT_TOKENS = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 900);
const AI_MIN_OUTPUT_TOKENS = Number(process.env.AI_MIN_OUTPUT_TOKENS || 32);
const AI_TOKEN_SAFETY_BUFFER = Number(process.env.AI_TOKEN_SAFETY_BUFFER || 16);
const BOT_SYNC_SECRET = process.env.BOT_SYNC_SECRET || null;
const BOT_HTTP_PORT = Number(process.env.PORT || process.env.BOT_HTTP_PORT || 3000);
const MODERATOR_ROLE_ID = process.env.MODERATOR_ROLE_ID || null;
const MODERATOR_ROLE_NAME = process.env.MODERATOR_ROLE_NAME || '𝘔𝘰𝘥𝘦𝘳𝘢𝘵𝘰𝘳';
const TIKTOK_URL = process.env.TIKTOK_URL || 'https://www.tiktok.com/@velooarchive';
const SECONDARY_TIKTOK_LABEL = process.env.SECONDARY_TIKTOK_LABEL || 'LCV Vintage TikTok';
const SECONDARY_TIKTOK_URL = process.env.SECONDARY_TIKTOK_URL || 'https://www.tiktok.com/@lcv_vintage';
const INSTAGRAM_HANDLE = process.env.INSTAGRAM_HANDLE || '@velooarchive';
const INSTAGRAM_URL = process.env.INSTAGRAM_URL || 'https://www.instagram.com/velooarchive/';
const WHATSAPP_CHANNEL_URL = process.env.WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb8Qc1zEAKW5GYGaSJ3N';
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'velooarchive@gmail.com';
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.veloo.org';
const MAIN_REPLY_COOLDOWN_MS = Number(process.env.MAIN_REPLY_COOLDOWN_MS || 30000);
const TRUSTED_SELLER_ROLE_ID = process.env.TRUSTED_SELLER_ROLE_ID || null;
const TRUSTED_SELLER_ROLE_NAME = process.env.TRUSTED_SELLER_ROLE_NAME || '𝐓𝐫𝐮𝐬𝐭𝐞𝐝𝐒𝐞𝐥𝐥𝐞𝐫';
const TRUSTED_SELLER_MIN_SALES = Number(process.env.TRUSTED_SELLER_MIN_SALES || 5);
const REVIEW_TRUSTED_MIN_COUNT = Number(process.env.REVIEW_TRUSTED_MIN_COUNT || 10);
const REVIEW_TRUSTED_MIN_AVERAGE = Number(process.env.REVIEW_TRUSTED_MIN_AVERAGE || 4);
const OPENAI_INSTRUCTIONS = [
    'Du bist die VELOO&YESTERA AI im Discord.',
    'Dein Fokus ist Vinted: bessere Listings, Titel, Beschreibungen, Preisideen, Fotos, Produktpositionierung, Bundle-Strategien, Verhandlung, Buyer-Messages, Marketing-Taktiken, Content-Ideen und Schritt-fuer-Schritt Tutorials fuer Vintage, Resell und Creator.',
    'Wenn eine Frage nicht zu Vinted, Resell, Marketing, Verkauf, Content, Branding oder Community-Aufbau passt, leite freundlich zurueck auf diese Themen.',
    'Gib klare, praktische Antworten mit konkreten Beispielen. Wenn sinnvoll, erstelle fertige Vinted-Titel, Beschreibungen, Preisanker, DM-Vorlagen, Upload-Plaene oder Checklisten.',
    'Keine Scam-Taktiken, keine gefaelschten Markenangaben, keine Umgehung von Plattformregeln, keine Garantien fuer Umsatz. Bleib ehrlich, hilfreich und umsetzbar.',
    'Erwaehne oeffentlich nie den Anbieter oder interne API-Details. Sprich nur von AI.'
].join(' ');
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
const SUPPORT_TICKET_PANEL_TITLE = '\uD83C\uDF9F\uFE0F SUPPORT TICKETS';
const COOPERATION_REQUEST_PANEL_TITLE = '\uD83E\uDD1D VELO COLLABORATION PROTOCOL';
const AI_EXPLAINER_PANEL_TITLE = '\u2728 VELOO&YESTERA AI & TOKEN GUIDE';
const SELLER_REVIEW_PANEL_TITLE = '\u2B50 VELOO&YESTERA SELLER REVIEWS';
const VINTED_NOTIFICATION_PANEL_TITLE = '🔔 VELOO&YESTERA VINTED NOTIFICATIONS';
const VIP_TUTORIAL_PANEL_TITLE = '👑 VELOO&YESTERA VIP TUTORIAL';
const VIP_PANEL_MANAGER_TITLE = '🧱 VIP CHANGE PANELS';
const VIP_PRIVATE_PANEL_TITLE = '🧱 DEINE CHANGE PANELS';
const SERVER_GUIDE_PANEL_TITLE = '🧭 VELOO&YESTERA SERVER GUIDE';
const VERIFICATION_PANEL_TITLE = '✅ VELOO&YESTERA VERIFICATION';
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
const forwardedSpecialMessages = new Set();
const mainChannelReplyCooldowns = new Map();
const spamWindows = new Map();
const newAccountWarnings = new Set();
let mockupStore = loadMockupStore();
let aiTokenStore = loadAiTokenStore();
let vipStatusStore = loadVipStatusStore();

const BRAND_CHANNEL_CONFIGS = [
    { key: 'nike', label: 'Nike', emoji: '👟', keywords: ['nike'], channelId: '1502544883502813285' },
    { key: 'adidas', label: 'Adidas', emoji: '🐚', keywords: ['adidas'], channelId: '1502544923222868018' },
    { key: 'new-balance', label: 'New Balance', emoji: '👟', keywords: ['new balance', 'new-balance'], channelId: '1502545164315660288' },
    { key: 'asics', label: 'Asics', emoji: '🏃', keywords: ['asics'], channelId: '1502545111085486112' },
    { key: 'salomon', label: 'Salomon', emoji: '⛰️', keywords: ['salomon'], channelId: '1502545427788992722' },
    { key: 'dr-martens', label: 'Dr. Martens', emoji: '🥾', keywords: ['dr martens', 'dr-martens', 'doc martens', 'doc-martens'], channelId: '1502545465709953055' },
    { key: 'ugg', label: 'UGG', emoji: '🧸', keywords: ['ugg'], channelId: '1502545506646102107' },
    { key: 'converse', label: 'Converse', emoji: '⭐', keywords: ['converse'], channelId: '1502545535121227886' },
    { key: 'vans', label: 'Vans', emoji: '🏁', keywords: ['vans'], channelId: '1502545579161682051' },
    { key: 'puma', label: 'Puma', emoji: '🐆', keywords: ['puma'], channelId: '1502545614297104514' },
    { key: 'reebok', label: 'Reebok', emoji: '🔁', keywords: ['reebok'], channelId: '1502545637042815076' },
    { key: 'mizuno', label: 'Mizuno', emoji: '🌊', keywords: ['mizuno'], channelId: '1502545661097283695' },
    { key: 'fila', label: 'Fila', emoji: '🔵', keywords: ['fila'], channelId: '1502545709902336123' },
    { key: 'carhartt', label: 'Carhartt', emoji: '🧥', keywords: ['carhartt'], channelId: '1502545740268834846' },
    { key: 'dickies', label: 'Dickies', emoji: '🛠️', keywords: ['dickies'], channelId: '1502545790281711676' },
    { key: 'levi', label: 'Levi', emoji: '👖', keywords: ['levi', 'levis', "levi's"], channelId: '1502545837840924722' },
    { key: 'wrangler', label: 'Wrangler', emoji: '🤠', keywords: ['wrangler'], channelId: '1502545873295642694' },
    { key: 'diesel', label: 'Diesel', emoji: '⛽', keywords: ['diesel'], channelId: '1502545898922836059' },
    { key: 'g-star', label: 'G-Star', emoji: '⭐', keywords: ['g star', 'g-star', 'gstar'], channelId: '1502545921932787742' },
    { key: 'evisu', label: 'Evisu', emoji: '🧬', keywords: ['evisu'], channelId: '1502545960134246441' },
    { key: 'lee', label: 'Lee', emoji: '👖', keywords: ['lee'], channelId: '1502545989930582026' },
    { key: 'ben-davis', label: 'Ben Davis', emoji: '🧰', keywords: ['ben davis', 'ben-davis'], channelId: '1502546027918524426' },
    { key: 'caterpillar', label: 'Caterpillar', emoji: '🚜', keywords: ['caterpillar', 'cat'], channelId: '1502546084596289686' },
    { key: 'timberland', label: 'Timberland', emoji: '🥾', keywords: ['timberland'], channelId: '1502546118381142116' },
    { key: 'stussy', label: 'Stussy', emoji: '🌊', keywords: ['stussy', 'stüssy'], channelId: '1502546192335376484' },
    { key: 'supreme', label: 'Supreme', emoji: '🔥', keywords: ['supreme'], channelId: '1502546217303933020' },
    { key: 'bape', label: 'Bape', emoji: '🦍', keywords: ['bape', 'a bathing ape'], channelId: '1502546259456692255' },
    { key: 'corteiz', label: 'Corteiz', emoji: '⚡', keywords: ['corteiz', 'crtz'], channelId: '1502546291669078178' },
    { key: 'trapstar', label: 'Trapstar', emoji: '⭐', keywords: ['trapstar'], channelId: '1502546330835484712' },
    { key: 'palm-angels', label: 'Palm Angels', emoji: '🪽', keywords: ['palm angels', 'palm-angels'], channelId: '1502546360551870464' },
    { key: 'off-white', label: 'Off-White', emoji: '🚧', keywords: ['off white', 'off-white'], channelId: '1502546401605849110' },
    { key: 'fear-of-god', label: 'Fear of God', emoji: '🕊️', keywords: ['fear of god', 'fear-of-god', 'fog'], channelId: '1502546432002097234' },
    { key: 'represent', label: 'Represent', emoji: '🎯', keywords: ['represent'], channelId: '1502546840107876352' },
    { key: 'daily-paper', label: 'Daily Paper', emoji: '🌍', keywords: ['daily paper', 'daily-paper'], channelId: '1502546872907337868' },
    { key: 'palace', label: 'Palace', emoji: '🏰', keywords: ['palace'], channelId: '1502546912161697812' },
    { key: 'nocta', label: 'Nocta', emoji: '🌙', keywords: ['nocta'], channelId: '1502546938355257434' },
    { key: 'kith', label: 'Kith', emoji: '🗽', keywords: ['kith'], channelId: '1502546968545595516' },
    { key: 'awake-ny', label: 'Awake NY', emoji: '🧢', keywords: ['awake ny', 'awake-ny'], channelId: '1502546991861858304' },
    { key: 'aime-leon-dore', label: 'Aime Leon Dore', emoji: '🍃', keywords: ['aime leon dore', 'aime-leon-dore', 'ald'], channelId: '1502547019862900796' },
    { key: 'ralph-lauren', label: 'Ralph Lauren', emoji: '🐎', keywords: ['ralph lauren', 'ralph-lauren', 'polo ralph lauren'], channelId: '1502547053400559646' },
    { key: 'lacoste', label: 'Lacoste', emoji: '🐊', keywords: ['lacoste'], channelId: '1502547084312711218' },
    { key: 'tommy-hilfiger', label: 'Tommy Hilfiger', emoji: '🇺🇸', keywords: ['tommy hilfiger', 'tommy-hilfiger', 'tommy'], channelId: '1502547114788524094' },
    { key: 'napapijri', label: 'Napapijri', emoji: '🏔️', keywords: ['napapijri'], channelId: '1502547143985205369' },
    { key: 'patagonia', label: 'Patagonia', emoji: '⛰️', keywords: ['patagonia'], channelId: '1502547170656649326' },
    { key: 'the-north-face', label: 'The North Face', emoji: '❄️', keywords: ['the north face', 'the-north-face', 'tnf', 'north face'], channelId: '1502547198150447124' },
    { key: 'arcteryx', label: "Arc'teryx", emoji: '🦖', keywords: ['arcteryx', 'arc teryx', "arc'teryx"], channelId: '1502547220702957708' },
    { key: 'stone-island', label: 'Stone Island', emoji: '🧊', keywords: ['stone island', 'stone-island'], channelId: '1502547250696556606' },
    { key: 'cp-company', label: 'CP Company', emoji: '🕶️', keywords: ['cp company', 'cp-company', 'c.p. company'], channelId: '1502547277623984258' },
    { key: 'moncler', label: 'Moncler', emoji: '🐥', keywords: ['moncler'], channelId: '1502547306744905870' },
    { key: 'oakley', label: 'Oakley', emoji: '🕶️', keywords: ['oakley'], channelId: '1502547725567398089' },
    { key: 'columbia', label: 'Columbia', emoji: '🌲', keywords: ['columbia'], channelId: '1502547750456135800' },
    { key: 'helly-hansen', label: 'Helly Hansen', emoji: '🌊', keywords: ['helly hansen', 'helly-hansen', 'hh'], channelId: '1502547779224862841' },
    { key: 'chrome-hearts', label: 'Chrome Hearts', emoji: '💎', keywords: ['chrome hearts', 'chrome-hearts'], channelId: '1502547822770389062' },
    { key: 'vivienne-westwood', label: 'Vivienne Westwood', emoji: '🪐', keywords: ['vivienne westwood', 'vivienne-westwood'], channelId: '1502547861311586415' },
    { key: 'ed-hardy', label: 'Ed Hardy', emoji: '❤️‍🔥', keywords: ['ed hardy', 'ed-hardy'], channelId: '1502547912561918012' },
    { key: 'maison-margiela', label: 'Maison Margiela', emoji: '🪡', keywords: ['maison margiela', 'maison-margiela', 'margiela'], channelId: '1502547945168568461' },
    { key: 'comme-des-garcons', label: 'Comme des Garcons', emoji: '🖤', keywords: ['comme des garcons', 'comme-des-garcons', 'cdg'], channelId: '1502547975090606191' },
    { key: 'acne-studios', label: 'Acne Studios', emoji: '🌫️', keywords: ['acne studios', 'acne-studios'], channelId: '1502547997886517318' },
    { key: 'y-project', label: 'Y/Project', emoji: '〰️', keywords: ['y project', 'y-project', 'y/project'], channelId: '1502548025644552293' },
    { key: 'our-legacy', label: 'Our Legacy', emoji: '📜', keywords: ['our legacy', 'our-legacy'], channelId: '1502548056275554424' },
    { key: 'rick-owens', label: 'Rick Owens', emoji: '🦇', keywords: ['rick owens', 'rick-owens'], channelId: '1502548076542296064' },
    { key: 'gucci', label: 'Gucci', emoji: '💼', keywords: ['gucci'], channelId: '1502548109522374748' },
    { key: 'prada', label: 'Prada', emoji: '🖤', keywords: ['prada'], channelId: '1502548156104179732' },
    { key: 'louis-vuitton', label: 'Louis Vuitton', emoji: '🎁', keywords: ['louis vuitton', 'louis-vuitton', 'lv'], channelId: '1502548182792536116' },
    { key: 'dior', label: 'Dior', emoji: '✨', keywords: ['dior'], channelId: '1502548202258436196' },
    { key: 'chanel', label: 'Chanel', emoji: '🌹', keywords: ['chanel'], channelId: '1502548229550510090' },
    { key: 'loewe', label: 'Loewe', emoji: '🪡', keywords: ['loewe'], channelId: '1502548255781949480' },
    { key: 'fendi', label: 'Fendi', emoji: '👜', keywords: ['fendi'], channelId: '1502548278795960380' },
    { key: 'celine', label: 'Celine', emoji: '🕶️', keywords: ['celine'], channelId: '1502548308705411072' },
    { key: 'coach', label: 'Coach', emoji: '👜', keywords: ['coach'], channelId: '1502548329945632808' },
    { key: 'balenciaga', label: 'Balenciaga', emoji: '⚫', keywords: ['balenciaga'], channelId: '1502548392402882560' },
    { key: 'versace', label: 'Versace', emoji: '🏛️', keywords: ['versace'], channelId: '1502548415559499816' },
    { key: 'valentino', label: 'Valentino', emoji: '🌹', keywords: ['valentino'], channelId: '1502548456143585410' },
    { key: 'ysl', label: 'YSL', emoji: '🖤', keywords: ['ysl', 'saint laurent', 'yves saint laurent'], channelId: '1502548477916352726' },
    { key: 'amiri', label: 'Amiri', emoji: '💫', keywords: ['amiri'], channelId: '1502548505930240040' },
    { key: 'gallery-dept', label: 'Gallery Dept', emoji: '🎨', keywords: ['gallery dept', 'gallery-dept', 'gallery department'], channelId: '1502548538423513088' },
    { key: 'givenchy', label: 'Givenchy', emoji: '⭐', keywords: ['givenchy'], channelId: '1502548559017545832' },
    { key: 'bottega-veneta', label: 'Bottega Veneta', emoji: '🧺', keywords: ['bottega veneta', 'bottega-veneta'], channelId: '1502548589874905209' },
    { key: 'burberry', label: 'Burberry', emoji: '🧥', keywords: ['burberry'], channelId: '1502548623890841640' }
];

const VINTED_CATEGORY_ROLE_CONFIGS = [
    { key: 'schuhe', label: 'Schuhe', emoji: '👟', roleId: '1502548809648181298', keywords: ['schuhe', 'shoe', 'shoes', 'sneaker', 'sneakers', 'boots', 'boot'] },
    { key: 't-shirts', label: 'T-Shirts', emoji: '👕', roleId: '1502548997888278619', keywords: ['t-shirt', 't-shirts', 't shirt', 't shirts', 'tee', 'tees'] },
    { key: 'hoodies', label: 'Hoodies', emoji: '🧥', roleId: '1502549040615915520', keywords: ['hoodie', 'hoodies', 'zip hoodie', 'zip-hoodie'] },
    { key: 'pullover', label: 'Pullover', emoji: '🧶', roleId: '1502549068981993532', keywords: ['pullover', 'sweater', 'sweatshirt', 'crewneck'] },
    { key: 'jacken', label: 'Jacken', emoji: '🧥', roleId: '1502549100220907592', keywords: ['jacke', 'jacken', 'jacket', 'jackets', 'puffer', 'coat', 'mantel'] },
    { key: 'hosen', label: 'Hosen', emoji: '👖', roleId: '1502549126242631840', keywords: ['hose', 'hosen', 'pants', 'jeans', 'cargo', 'cargos'] },
    { key: 'shorts', label: 'Shorts', emoji: '🩳', roleId: '1502549159859720192', keywords: ['shorts', 'short', 'kurze hose'] },
    { key: 'tracksuits', label: 'Tracksuits', emoji: '🏃', roleId: '1502549189169643620', keywords: ['tracksuit', 'tracksuits', 'trainingsanzug', 'jogger set', 'set'] },
    { key: 'hemden', label: 'Hemden', emoji: '👔', roleId: '1502549216302596106', keywords: ['hemd', 'hemden', 'button up', 'button-up', 'dress shirt'] },
    { key: 'polos', label: 'Polos', emoji: '🏌️', roleId: '1502549240075780096', keywords: ['polo', 'polos'] },
    { key: 'knitwear', label: 'Knitwear', emoji: '🧶', roleId: '1502549241015566386', keywords: ['knitwear', 'knit', 'strick', 'strickpullover', 'cardigan'] },
    { key: 'westen', label: 'Westen', emoji: '🦺', roleId: '1502549292374823053', keywords: ['weste', 'westen', 'vest', 'vests', 'gilet'] },
    { key: 'taschen', label: 'Taschen', emoji: '👜', roleId: '1502549335315841145', keywords: ['tasche', 'taschen', 'bag', 'bags', 'rucksack', 'backpack'] },
    { key: 'caps', label: 'Caps', emoji: '🧢', roleId: '1502549369751339018', keywords: ['cap', 'caps', 'mütze', 'muetze', 'beanie', 'hat'] },
    { key: 'schmuck', label: 'Schmuck', emoji: '💍', roleId: '1502549397269909564', keywords: ['schmuck', 'jewelry', 'jewellery', 'chain', 'ring', 'necklace', 'kette'] },
    { key: 'accessoires', label: 'Accessoires', emoji: '🎒', roleId: '1502549425850028062', keywords: ['accessoire', 'accessoires', 'accessory', 'accessories', 'belt', 'gürtel', 'guertel', 'wallet'] },
    { key: 'steals', label: 'Steals', emoji: '💸', roleId: '1502549449036140656', keywords: ['steal', 'steals', 'schnapper', 'deal', 'bargain'] },
    { key: 'price-drops', label: 'Price Drops', emoji: '📉', roleId: '1502549477087645707', keywords: ['price drop', 'price-drops', 'pricedrop', 'preis drop', 'preisdrops', 'reduziert', 'sale'] },
    { key: 'bundles', label: 'Bundles', emoji: '📦', roleId: '1502549498688176220', keywords: ['bundle', 'bundles', 'paket', 'set', 'mehrere'] },
    { key: 'suche', label: 'Suche', emoji: '🔎', roleId: '1502549531479380018', keywords: ['suche', 'gesucht', 'search', 'looking for', 'lf', 'wtb'] },
    { key: 'legit-check', label: 'Legit Check', emoji: '✅', roleId: '1502549566631837788', keywords: ['legit check', 'legit-check', 'lc', 'fake check', 'authentic', 'authenticity'] },
    { key: 'sold', label: 'Sold', emoji: '🏷️', roleId: '1502549596017266860', keywords: ['sold', 'verkauft'] }
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

const BRAND_KEYWORDS = [...new Set(BRAND_CHANNEL_CONFIGS.flatMap(config => config.keywords))];

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
    outfit_like: 1,
    seller_review: 2
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
    outfit_like: 'Fit-Likes',
    seller_review: 'Reviews'
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
        communityCookedHistory: {},
        sellerReviews: {},
        notificationPreferences: {},
        announcedAnalyticsWeeks: []
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
                    : {},
            sellerReviews:
                parsed.sellerReviews && typeof parsed.sellerReviews === 'object'
                    ? parsed.sellerReviews
                    : {},
            notificationPreferences:
                parsed.notificationPreferences && typeof parsed.notificationPreferences === 'object'
                    ? parsed.notificationPreferences
                    : {},
            announcedAnalyticsWeeks: Array.isArray(parsed.announcedAnalyticsWeeks)
                ? parsed.announcedAnalyticsWeeks
                : []
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

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchTextIncludesKeyword(searchableText, keyword) {
    const normalizedKeyword = normalizeSearchText(keyword);
    if (!normalizedKeyword) {
        return false;
    }

    if (/^[a-z0-9]{1,3}$/.test(normalizedKeyword)) {
        return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`).test(searchableText);
    }

    return searchableText.includes(normalizedKeyword);
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
        config.keywords.some(keyword => searchTextIncludesKeyword(searchableText, keyword))
    );
}

function getMatchingCategoryConfigs(message) {
    const searchableText = getMessageBrandSearchText(message);
    if (!searchableText) {
        return [];
    }

    return VINTED_CATEGORY_ROLE_CONFIGS.filter(config =>
        config.keywords.some(keyword => searchTextIncludesKeyword(searchableText, keyword))
    );
}

function chunkArray(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
}

function getNotificationPreference(userId) {
    if (!mockupStore.notificationPreferences || typeof mockupStore.notificationPreferences !== 'object') {
        mockupStore.notificationPreferences = {};
    }

    const preference = mockupStore.notificationPreferences[userId] || {};
    const brandKeys = Array.isArray(preference.brandKeys)
        ? preference.brandKeys.filter(key => BRAND_CHANNEL_CONFIGS.some(config => config.key === key))
        : [];

    mockupStore.notificationPreferences[userId] = {
        ...preference,
        brandKeys
    };

    return mockupStore.notificationPreferences[userId];
}

function saveNotificationPreference(userId, patch) {
    const previousPreference = getNotificationPreference(userId);
    mockupStore.notificationPreferences[userId] = {
        ...previousPreference,
        ...patch,
        updatedAt: new Date().toISOString()
    };
    saveMockupStore();
    return mockupStore.notificationPreferences[userId];
}

function getCategoryKeysForMember(member) {
    if (!member?.roles?.cache) {
        return [];
    }

    return VINTED_CATEGORY_ROLE_CONFIGS
        .filter(config => member.roles.cache.has(config.roleId))
        .map(config => config.key);
}

function buildBrandNotificationSelectRows(userId) {
    const preference = getNotificationPreference(userId);
    const selectedBrandKeys = new Set(preference.brandKeys || []);

    return chunkArray(BRAND_CHANNEL_CONFIGS, 25).map((brandGroup, groupIndex) =>
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`vinted_notify_brand_${groupIndex}`)
                .setPlaceholder(`Marken ${groupIndex + 1} auswaehlen`)
                .setMinValues(0)
                .setMaxValues(brandGroup.length)
                .addOptions(
                    brandGroup.map(config => ({
                        label: config.label,
                        value: config.key,
                        description: `Benachrichtigung fuer ${config.label}`,
                        emoji: config.emoji,
                        default: selectedBrandKeys.has(config.key)
                    }))
                )
        )
    );
}

function buildCategoryNotificationRow(member) {
    const selectedCategoryKeys = new Set(getCategoryKeysForMember(member));

    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('vinted_notify_categories')
            .setPlaceholder('Kategorien auswaehlen')
            .setMinValues(0)
            .setMaxValues(VINTED_CATEGORY_ROLE_CONFIGS.length)
            .addOptions(
                VINTED_CATEGORY_ROLE_CONFIGS.map(config => ({
                    label: config.label,
                    value: config.key,
                    description: `Ping fuer ${config.label}`,
                    emoji: config.emoji,
                    default: selectedCategoryKeys.has(config.key)
                }))
            )
    );
}

async function showNotificationSettings(interaction) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Diese Benachrichtigungen kannst du nur im Server einstellen.',
            ephemeral: true
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
        return replyToInteraction(interaction, {
            content: 'Dein Mitgliedsprofil konnte nicht geladen werden.',
            ephemeral: true
        });
    }

    const preference = getNotificationPreference(interaction.user.id);
    const brandCount = preference.brandKeys?.length || 0;
    const categoryCount = getCategoryKeysForMember(member).length;
    const embed = buildPanelEmbed({
        title: '🔔 Deine Vinted Benachrichtigungen',
        description:
            'Waehle zuerst Marken aus, danach Kategorien. Du wirst dann nur gepingt, wenn ein neues Piece zu deinen Marken und zu deinen Kategorien passt.',
        color: '#d9c39a',
        fields: [
            {
                name: 'Aktuell',
                value: `${brandCount} Marken gespeichert\n${categoryCount} Kategorien aktiv`,
                inline: false
            },
            {
                name: 'Hinweis',
                value: 'Wenn du keine Kategorie waehlst, bekommst du alle neuen Pieces deiner gespeicherten Marken. Gross- und Kleinschreibung wird beim Erkennen ignoriert.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // VINTED NOTIFICATIONS'
    });

    return replyToInteraction(interaction, {
        embeds: [embed],
        components: [
            ...buildBrandNotificationSelectRows(interaction.user.id),
            buildCategoryNotificationRow(member)
        ],
        ephemeral: true
    });
}

async function handleBrandNotificationSelect(interaction) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Diese Benachrichtigungen kannst du nur im Server einstellen.',
            ephemeral: true
        });
    }

    const groupIndex = Number(interaction.customId.replace('vinted_notify_brand_', ''));
    const brandGroups = chunkArray(BRAND_CHANNEL_CONFIGS, 25);
    const selectedGroup = brandGroups[groupIndex] || [];
    const selectedValues = new Set(interaction.values);
    const previousPreference = getNotificationPreference(interaction.user.id);
    const untouchedBrandKeys = (previousPreference.brandKeys || []).filter(key =>
        !selectedGroup.some(config => config.key === key)
    );
    const nextBrandKeys = [...untouchedBrandKeys, ...selectedGroup.filter(config => selectedValues.has(config.key)).map(config => config.key)];
    const preference = saveNotificationPreference(interaction.user.id, {
        brandKeys: [...new Set(nextBrandKeys)]
    });

    return replyToInteraction(interaction, {
        content: `Marken gespeichert. Aktuell aktiv: ${preference.brandKeys.length}.`,
        ephemeral: true
    });
}

async function handleCategoryNotificationSelect(interaction) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Diese Rollen kannst du nur im Server auswaehlen.',
            ephemeral: true
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
        return replyToInteraction(interaction, {
            content: 'Dein Mitgliedsprofil konnte nicht geladen werden.',
            ephemeral: true
        });
    }

    const selectedValues = new Set(interaction.values);
    const roleIdsToAdd = VINTED_CATEGORY_ROLE_CONFIGS
        .filter(config => selectedValues.has(config.key) && !member.roles.cache.has(config.roleId))
        .map(config => config.roleId);
    const roleIdsToRemove = VINTED_CATEGORY_ROLE_CONFIGS
        .filter(config => !selectedValues.has(config.key) && member.roles.cache.has(config.roleId))
        .map(config => config.roleId);

    if (roleIdsToAdd.length) {
        await member.roles.add(roleIdsToAdd).catch(() => {});
    }

    if (roleIdsToRemove.length) {
        await member.roles.remove(roleIdsToRemove).catch(() => {});
    }

    const selectedLabels = VINTED_CATEGORY_ROLE_CONFIGS
        .filter(config => selectedValues.has(config.key))
        .map(config => `${config.emoji} ${config.label}`);

    return replyToInteraction(interaction, {
        content: selectedLabels.length
            ? `Kategorien aktualisiert: ${selectedLabels.join(', ')}`
            : 'Kategorie-Pings wurden entfernt.',
        ephemeral: true
    });
}

async function buildBrandNotificationContent(guild, brandConfig, message) {
    const matchingCategories = getMatchingCategoryConfigs(message);
    const matchingCategoryKeys = matchingCategories.map(config => config.key);
    const mentions = [];
    const preferences = mockupStore.notificationPreferences || {};

    for (const [userId, preference] of Object.entries(preferences)) {
        if (!Array.isArray(preference.brandKeys) || !preference.brandKeys.includes(brandConfig.key)) {
            continue;
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) {
            continue;
        }

        const memberCategoryKeys = getCategoryKeysForMember(member);
        const categoryMatches =
            !matchingCategoryKeys.length ||
            !memberCategoryKeys.length ||
            matchingCategoryKeys.some(key => memberCategoryKeys.includes(key));

        if (categoryMatches) {
            mentions.push(`<@${userId}>`);
        }
    }

    const categoryText = matchingCategories.length
        ? `\nKategorien: ${matchingCategories.map(config => `${config.emoji} ${config.label}`).join(', ')}`
        : '';
    const pingLine = mentions.length ? `${mentions.slice(0, 40).join(' ')}\n` : '';

    return `${pingLine}${brandConfig.emoji} Neues ${brandConfig.label}-Piece wurde in latest-goods gepostet.${categoryText}`;
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

    const payload = buildBrandForwardPayload(message);

    for (const brandConfig of matchingBrands) {
        const brandChannel = await client.channels.fetch(brandConfig.channelId).catch(() => null);
        if (!brandChannel) {
            continue;
        }

        await brandChannel.send({
            content: await buildBrandNotificationContent(message.guild, brandConfig, message),
            embeds: payload.embeds,
            components: payload.components,
            allowedMentions: { parse: ['users'] }
        }).catch(error => {
            console.error(`Brand forward failed for ${brandConfig.label}:`, error.message);
        });
    }

    forwardedBrandMessages.add(message.id);
}

async function forwardSpecialListingChannels(message) {
    if (message.channelId !== LATEST_GOODS_CHANNEL_ID || !message.guild) {
        return;
    }

    const matchingCategories = getMatchingCategoryConfigs(message);
    if (!matchingCategories.length) {
        return;
    }

    const payload = buildBrandForwardPayload(message);
    const specialRoutes = [
        {
            key: 'price-drops',
            channelId: PRICE_DROPS_CHANNEL_ID,
            content: '📉 Price Drop erkannt. Neues reduziertes Piece aus latest-goods.'
        },
        {
            key: 'bundles',
            channelId: BUNDLES_CHANNEL_ID,
            content: '📦 Bundle erkannt. Neues Paket aus latest-goods.'
        }
    ];

    for (const route of specialRoutes) {
        const hasRouteCategory = matchingCategories.some(config => config.key === route.key);
        const forwardKey = `${message.id}:${route.key}`;
        if (!hasRouteCategory || forwardedSpecialMessages.has(forwardKey)) {
            continue;
        }

        const channel = await client.channels.fetch(route.channelId).catch(() => null);
        if (!channel) {
            continue;
        }

        await channel.send({
            content: route.content,
            embeds: payload.embeds,
            components: payload.components
        }).catch(error => {
            console.error(`Special listing forward failed for ${route.key}:`, error.message);
        });
        forwardedSpecialMessages.add(forwardKey);
    }
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

    const combinedText = normalizeSearchText(`${title} ${description} ${fieldText}`);
    const brand = BRAND_KEYWORDS.find(keyword => searchTextIncludesKeyword(combinedText, keyword));
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

async function getBotGuild() {
    if (BOT_GUILD_ID) {
        return client.guilds.fetch(BOT_GUILD_ID).catch(() => null);
    }

    return client.guilds.cache.first() || null;
}

async function removeVipRoleForUser(discordUserId) {
    const guild = await getBotGuild();
    if (!guild) {
        throw new Error('Guild konnte nicht geladen werden.');
    }

    await guild.roles.fetch().catch(() => null);
    const vipRole = findRoleByIdOrName(guild, VIP_ROLE_ID, VIP_ROLE_NAME);
    if (!vipRole) {
        throw new Error('VIP-Rolle wurde nicht gefunden.');
    }

    const member = await guild.members.fetch(discordUserId).catch(() => null);
    if (!member) {
        return {
            removed: false,
            reason: 'member_not_found'
        };
    }

    if (!member.roles.cache.has(vipRole.id)) {
        return {
            removed: false,
            reason: 'role_not_present'
        };
    }

    await member.roles.remove(vipRole.id);
    upsertVipStatus(discordUserId, {
        active: false,
        removedAt: new Date().toISOString(),
        reminderSentAt: null
    });
    await sendStaffLog('👑 VIP Rolle entfernt', `VIP wurde bei <@${discordUserId}> entfernt.`, [
        { name: 'User', value: `<@${discordUserId}>`, inline: true },
        { name: 'Rolle', value: `<@&${vipRole.id}>`, inline: true }
    ], '#e74c3c');
    return {
        removed: true,
        roleId: vipRole.id
    };
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

function buildServerGuidePanel() {
    const embed = buildPanelEmbed({
        title: SERVER_GUIDE_PANEL_TITLE,
        description:
            'Willkommen bei VELOO&YESTERA. Dieses Panel erklaert dir den Server, die wichtigsten Wege und wie AI Tokens funktionieren.',
        color: '#d9c39a',
        fields: [
            {
                name: '✅ 1. Erst verifizieren',
                value:
                    `Neue Member starten mit Unverified. Gehe zu ${getChannelMention(VERIFICATION_CHANNEL_ID, 'Verification')} und bestaetige dich kurz. Danach bekommst du Verified und kannst den Server richtig nutzen.`,
                inline: false
            },
            {
                name: '🎭 2. Rollen waehlen',
                value:
                    `In ${getChannelMention(REACTION_ROLE_CHANNEL_ID, 'Rollen')} kannst du deine Interessen setzen, damit du die passenden Bereiche und Updates siehst.`,
                inline: false
            },
            {
                name: '🛒 3. Verkaufen & Community nutzen',
                value:
                    `Pieces postest du im Verkaufsbereich ${getChannelMention(SELL_CHANNEL_ID, 'Sell')}. Fuer Fragen, Austausch und schnelle Hilfe nutzt du ${getChannelMention(MAIN_CHANNEL_ID, 'Main Chat')}.`,
                inline: false
            },
            {
                name: '📸 4. Fits, Mockups, ISO & Creator',
                value:
                    `Fits: ${getChannelMention(OUTFIT_CHANNEL_ID, 'Outfit')}\n` +
                    `Mockups: ${getChannelMention(MOCKUP_CHANNEL_ID, 'Mockup')}\n` +
                    `ISO/Suche: ${getChannelMention(ISO_CHANNEL_ID, 'ISO')}\n` +
                    `Creator Bewerbung: ${getChannelMention(CREATOR_CHANNEL_ID, 'Creator')}`,
                inline: false
            },
            {
                name: '👑 5. VIP',
                value:
                    `VIP gibt dir mehr Sichtbarkeit, staerkere Listing-Hervorhebung und Zugriff auf ${getChannelMention(VIP_TUTORIAL_CHANNEL_ID, 'VIP Tutorial')}. ` +
                    `Ueber ${getChannelMention(VIP_PANEL_MANAGER_CHANNEL_ID, 'VIP Change Panels')} kannst du als VIP deine eigenen latest-goods Panels privat bearbeiten. ` +
                    'Wenn dein Abo endet oder gekuendigt wird, entfernt das System die VIP-Rolle automatisch.',
                inline: false
            },
            {
                name: '✨ 6. AI Tokens richtig erklaert',
                value:
                    `AI nutzt du ueber ${getChannelMention(AI_PANEL_CHANNEL_ID, 'Ask AI')}. Tokens sind kein "1 Frage = 1 Token" System. Abgerechnet wird nach echter AI-Nutzung: Frage plus Antwort. Wenn eine Antwort z.B. 550 AI Tokens verbraucht, werden 550 Tokens abgezogen. Kaufen kannst du sie hier: ${AI_BUY_TOKENS_URL}`,
                inline: false
            },
            {
                name: '🌐 Socials & Kontakt',
                value:
                    `Website: ${WEBSITE_URL}\n` +
                    `TikTok: ${TIKTOK_URL}\n` +
                    `${SECONDARY_TIKTOK_LABEL}: ${SECONDARY_TIKTOK_URL}\n` +
                    `Instagram: ${INSTAGRAM_HANDLE} - ${INSTAGRAM_URL}\n` +
                    `WhatsApp: ${WHATSAPP_CHANNEL_URL}\n` +
                    `Business: ${BUSINESS_EMAIL}`,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // SERVER GUIDE'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('🌐 Website')
            .setStyle(ButtonStyle.Link)
            .setURL(WEBSITE_URL),
        new ButtonBuilder()
            .setLabel('🛒 Tokens')
            .setStyle(ButtonStyle.Link)
            .setURL(AI_BUY_TOKENS_URL),
        new ButtonBuilder()
            .setLabel('🎵 TikTok')
            .setStyle(ButtonStyle.Link)
            .setURL(TIKTOK_URL),
        new ButtonBuilder()
            .setLabel('📸 Instagram')
            .setStyle(ButtonStyle.Link)
            .setURL(INSTAGRAM_URL),
        new ButtonBuilder()
            .setLabel('💬 WhatsApp')
            .setStyle(ButtonStyle.Link)
            .setURL(WHATSAPP_CHANNEL_URL)
    );

    return { embeds: [embed], components: [row] };
}

async function upsertPanelMessage(channel, title, payload) {
    const messages = await channel.messages.fetch({ limit: 50 });
    const existingPanel = messages.find(message =>
        message.author.id === client.user.id &&
        message.embeds[0]?.title === title
    );

    if (existingPanel) {
        await existingPanel.edit(payload);
        return existingPanel;
    }

    return channel.send(payload);
}

async function sendServerGuidePanel() {
    const guideChannel = await client.channels.fetch(SERVER_GUIDE_CHANNEL_ID).catch(() => null);
    if (!guideChannel) {
        return;
    }

    await upsertPanelMessage(guideChannel, SERVER_GUIDE_PANEL_TITLE, buildServerGuidePanel());
}

function buildVintedNotificationPanel() {
    const embed = buildPanelEmbed({
        title: VINTED_NOTIFICATION_PANEL_TITLE,
        description:
            'Stelle ein, fuer welche Marken und Pieces du gepingt werden willst. Die Marken-Posts bleiben in ihren Announcement-Channels, aber du bekommst nur die Hinweise, die zu dir passen.',
        color: '#d9c39a',
        fields: [
            {
                name: '1. Marken waehlen',
                value: 'Nike, Adidas, Stone Island, Gucci und alle weiteren Marken kannst du einzeln aktivieren.',
                inline: false
            },
            {
                name: '2. Kategorien waehlen',
                value: 'Danach waehle Schuhe, Hoodies, Jacken, Taschen, Price Drops, Bundles, Legit Checks und mehr.',
                inline: false
            },
            {
                name: '3. Smart gepingt werden',
                value: 'Der Bot achtet beim Erkennen nicht auf Gross- und Kleinschreibung. Wenn ein Post zu Marke und Kategorie passt, bekommst du den Ping.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // VINTED NOTIFICATIONS'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_vinted_notifications')
            .setLabel('🔔 Benachrichtigungen anpassen')
            .setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

async function sendVintedNotificationPanel() {
    const channel = await client.channels.fetch(NOTIFICATION_PANEL_CHANNEL_ID).catch(() => null);
    if (!channel) {
        return;
    }

    await upsertPanelMessage(channel, VINTED_NOTIFICATION_PANEL_TITLE, buildVintedNotificationPanel());
}

function buildVipTutorialPanel() {
    const embed = buildPanelEmbed({
        title: VIP_TUTORIAL_PANEL_TITLE,
        description:
            'VIP ist dein Bereich fuer mehr Sichtbarkeit, bessere Kontrolle ueber deine Listings und schnelleren Support beim Verkaufen.',
        color: '#f1c40f',
        fields: [
            {
                name: '👑 Was VIP bringt',
                value:
                    'VIP-Listings werden staerker hervorgehoben. Deine Pieces fallen im Feed schneller auf und werden in den passenden Marken- und Kategorie-Bereichen besser sichtbar.',
                inline: false
            },
            {
                name: '🧱 Eigene Panels bearbeiten',
                value:
                    `Im Channel ${getChannelMention(VIP_PANEL_MANAGER_CHANNEL_ID, 'VIP Panel Manager')} kannst du deinen privaten Bereich oeffnen und eigene latest-goods Listings aktualisieren.`,
                inline: false
            },
            {
                name: '📉 Price Drops & 📦 Bundles',
                value:
                    `${getChannelMention(PRICE_DROPS_CHANNEL_ID, 'Price Drops')} zeigt reduzierte Pieces. ${getChannelMention(BUNDLES_CHANNEL_ID, 'Bundles')} zeigt Pakete und Sets.`,
                inline: false
            },
            {
                name: '🤖 AI Tokens',
                value:
                    `AI Tokens sind Guthaben fuer Fragen rund um Vinted, Marketing, Taktiken und Tutorials. Kaufen und verwalten kannst du sie ueber ${AI_BUY_TOKENS_URL}`,
                inline: false
            },
            {
                name: '🛟 Fragen',
                value:
                    `Wenn etwas nicht klappt, oeffne ein Ticket in ${getChannelMention(SUPPORT_TICKET_PANEL_CHANNEL_ID, 'Support')}.`,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // VIP TUTORIAL'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('VIP Website')
            .setStyle(ButtonStyle.Link)
            .setURL(`${WEBSITE_URL}/vip.html`),
        new ButtonBuilder()
            .setLabel('AI Tokens')
            .setStyle(ButtonStyle.Link)
            .setURL(AI_BUY_TOKENS_URL),
        new ButtonBuilder()
            .setLabel('Support')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${BOT_GUILD_ID}/${SUPPORT_TICKET_PANEL_CHANNEL_ID}`)
    );

    return { embeds: [embed], components: [row] };
}

async function sendVipTutorialPanel() {
    const channel = await client.channels.fetch(VIP_TUTORIAL_CHANNEL_ID).catch(() => null);
    if (!channel) {
        return;
    }

    await upsertPanelMessage(channel, VIP_TUTORIAL_PANEL_TITLE, buildVipTutorialPanel());
}

function buildVipPanelManagerPanel() {
    const embed = buildPanelEmbed({
        title: VIP_PANEL_MANAGER_TITLE,
        description:
            'VIP Member koennen hier einen privaten Listing-Bereich oeffnen. Dort siehst du deine latest-goods Panels und kannst Titel, Marke, Preis, Groesse oder Link nachtraeglich anpassen.',
        color: '#d9c39a',
        fields: [
            {
                name: 'Privat',
                value: 'Der Channel ist nur fuer dich, Owner, Moderation und den Bot sichtbar.',
                inline: false
            },
            {
                name: 'Bearbeiten',
                value: 'Waehle dein Piece aus, passe die Daten an und der Bot aktualisiert die gefundenen Kopien.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // VIP CHANGE PANELS'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_vip_change_panels')
            .setLabel('🧱 Privaten Bereich oeffnen')
            .setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

async function sendVipPanelManagerPanel() {
    const channel = await client.channels.fetch(VIP_PANEL_MANAGER_CHANNEL_ID).catch(() => null);
    if (!channel) {
        return;
    }

    await upsertPanelMessage(channel, VIP_PANEL_MANAGER_TITLE, buildVipPanelManagerPanel());
}

function getListedItemStatus(listedItem) {
    if (listedItem?.soldAt) {
        return 'sold';
    }

    if (listedItem?.reservedAt) {
        return 'reserved';
    }

    return 'active';
}

function buildStoredListingEmbed(listedItem) {
    const status = getListedItemStatus(listedItem);
    const prefixByStatus = {
        active: '',
        reserved: 'RESERVIERT | ',
        sold: 'VERKAUFT | '
    };
    const descriptionByStatus = {
        active: listedItem.isVipSeller ? 'Prioritaets-Listing aus dem VIP-Bereich.' : '',
        reserved: 'Dieses Piece ist gerade reserviert.',
        sold: 'Dieses Piece wurde verkauft.'
    };

    const embed = new EmbedBuilder()
        .setTitle(`${prefixByStatus[status]}${listedItem.isVipSeller ? 'VIP ' : ''}${listedItem.brand || ''} ${listedItem.title || 'Piece'}`.trim())
        .addFields(
            { name: 'Preis', value: listedItem.price || 'Unbekannt', inline: true },
            { name: 'Groesse', value: listedItem.size || 'Unbekannt', inline: true },
            { name: 'Verkaeufer', value: `<@${listedItem.sellerId}>`, inline: true }
        )
        .setColor(status === 'sold' ? '#e74c3c' : status === 'reserved' ? '#d6a24c' : listedItem.isVipSeller ? '#f1c40f' : '#ffffff')
        .setFooter({ text: `Item-ID: ${listedItem.itemId}${status === 'reserved' ? ' | RESERVIERT' : status === 'sold' ? ' | VERKAUFT' : ''}` });

    if (descriptionByStatus[status]) {
        embed.setDescription(descriptionByStatus[status]);
    }

    if (listedItem.previewImageUrl) {
        embed.setImage(listedItem.previewImageUrl);
    }

    if (listedItem.isVipSeller) {
        embed.addFields(buildVipHighlightField());
    }

    return embed;
}

function buildListingContentForStatus(status, listedItem) {
    if (status === 'reserved') {
        return '## RESERVIERT\nDieses Piece ist gerade reserviert.';
    }

    if (status === 'sold') {
        return '## VERKAUFT\nDieses Piece ist verkauft.';
    }

    return listedItem.isVipSeller ? 'VIP-LISTING • extra hervorgehoben' : undefined;
}

function getUserListedItems(userId) {
    return Object.values(mockupStore.listedItems || {})
        .filter(item => item?.sellerId === userId)
        .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

function buildVipPrivatePanelPayload(userId) {
    const items = getUserListedItems(userId);
    const visibleItems = items.slice(0, 10);
    const lines = visibleItems.length
        ? visibleItems.map((item, index) =>
            `${index + 1}. **${item.brand || 'Marke'} ${item.title || 'Piece'}** - ${item.price || 'Preis offen'} - ${getListedItemStatus(item).toUpperCase()}`
        ).join('\n')
        : 'Du hast noch keine gespeicherten latest-goods Listings.';

    const embed = buildPanelEmbed({
        title: VIP_PRIVATE_PANEL_TITLE,
        description:
            'Hier kannst du deine eigenen Panels aus latest-goods bearbeiten. Waehle ein Piece aus und aktualisiere die wichtigsten Daten.',
        color: '#d9c39a',
        fields: [
            {
                name: 'Deine letzten Listings',
                value: lines,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // PRIVATE VIP PANEL'
    });

    const components = [];
    if (items.length) {
        components.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('vip_edit_item_select')
                    .setPlaceholder('Listing bearbeiten')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        items.slice(0, 25).map(item => ({
                            label: `${item.brand || 'Marke'} ${item.title || 'Piece'}`.slice(0, 100),
                            description: `${item.price || 'Preis offen'} | ${getListedItemStatus(item)}`.slice(0, 100),
                            value: item.itemId
                        }))
                    )
            )
        );
    }

    components.push(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_vip_change_panels')
                .setLabel('🔄 Aktualisieren')
                .setStyle(ButtonStyle.Secondary)
        )
    );

    return { embeds: [embed], components };
}

async function upsertVipPrivatePanel(channel, userId) {
    return upsertPanelMessage(channel, VIP_PRIVATE_PANEL_TITLE, buildVipPrivatePanelPayload(userId));
}

function buildVipChannelPermissionOverwrites(guild, userId) {
    const overwrites = [
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: userId,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        },
        {
            id: client.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        }
    ];

    const staffRoles = [
        findRoleByIdOrName(guild, OWNER_ROLE_ID, OWNER_ROLE_NAME),
        findRoleByIdOrName(guild, MODERATOR_ROLE_ID, EFFECTIVE_MODERATOR_ROLE_NAME)
    ].filter(Boolean);

    for (const role of staffRoles) {
        overwrites.push({
            id: role.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        });
    }

    return overwrites;
}

async function openOrRefreshVipChangeChannel(interaction) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Das funktioniert nur im Server.',
            ephemeral: true
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member || !memberHasVipRole(member)) {
        return replyToInteraction(interaction, {
            content: 'Dieser Bereich ist nur fuer VIP Member.',
            ephemeral: true
        });
    }

    const topicNeedle = `VELOO_VIP_PANEL_MANAGER user=${interaction.user.id}`;
    let channel = interaction.guild.channels.cache.find(existingChannel =>
        existingChannel.type === ChannelType.GuildText && existingChannel.topic?.includes(topicNeedle)
    );

    if (!channel) {
        const sourceChannel = await interaction.guild.channels.fetch(VIP_PANEL_MANAGER_CHANNEL_ID).catch(() => null);
        channel = await interaction.guild.channels.create({
            name: '╰・🧱・change-panels',
            type: ChannelType.GuildText,
            topic: topicNeedle,
            parent: sourceChannel?.parentId || undefined,
            permissionOverwrites: buildVipChannelPermissionOverwrites(interaction.guild, interaction.user.id)
        });
    }

    await upsertVipPrivatePanel(channel, interaction.user.id);

    return replyToInteraction(interaction, {
        content: `Dein privater Bereich ist bereit: ${channel}`,
        ephemeral: true
    });
}

async function updateTrackedItemCopiesWithListing(guild, listedItem) {
    const status = getListedItemStatus(listedItem);
    const embed = buildStoredListingEmbed(listedItem);
    const row = buildListingActionRow(
        listedItem.itemId,
        listedItem.sellerId,
        listedItem.url || listedItem.messageUrl || WEBSITE_URL,
        status
    );
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
        const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
        if (!messages) {
            continue;
        }

        const copies = messages.filter(message =>
            message.author.id === client.user.id &&
            getEmbedFooterText(message.embeds[0])?.includes(`Item-ID: ${listedItem.itemId}`)
        );

        for (const copy of copies.values()) {
            await copy.edit({
                content: buildListingContentForStatus(status, listedItem),
                embeds: [embed],
                components: [row]
            }).catch(() => {});
        }
    }
}

async function showVipEditItemModal(interaction, itemId) {
    const listedItem = getListedItem(itemId);
    if (!listedItem || listedItem.sellerId !== interaction.user.id) {
        return replyToInteraction(interaction, {
            content: 'Dieses Listing gehoert nicht zu deinem Account.',
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId(`vip_edit_item_modal_${itemId}`)
        .setTitle('Listing bearbeiten');

    const titleInput = new TextInputBuilder()
        .setCustomId('edit_title')
        .setLabel('Titel')
        .setStyle(TextInputStyle.Short)
        .setValue((listedItem.title || '').slice(0, 100))
        .setRequired(true);
    const brandInput = new TextInputBuilder()
        .setCustomId('edit_brand')
        .setLabel('Marke')
        .setStyle(TextInputStyle.Short)
        .setValue((listedItem.brand || '').slice(0, 100))
        .setRequired(true);
    const priceInput = new TextInputBuilder()
        .setCustomId('edit_price')
        .setLabel('Preis')
        .setStyle(TextInputStyle.Short)
        .setValue((listedItem.price || '').slice(0, 100))
        .setRequired(true);
    const sizeInput = new TextInputBuilder()
        .setCustomId('edit_size')
        .setLabel('Groesse')
        .setStyle(TextInputStyle.Short)
        .setValue((listedItem.size || '').slice(0, 100))
        .setRequired(true);
    const urlInput = new TextInputBuilder()
        .setCustomId('edit_url')
        .setLabel('Vinted Link')
        .setStyle(TextInputStyle.Short)
        .setValue((listedItem.url || '').slice(0, 100))
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(brandInput),
        new ActionRowBuilder().addComponents(priceInput),
        new ActionRowBuilder().addComponents(sizeInput),
        new ActionRowBuilder().addComponents(urlInput)
    );

    return interaction.showModal(modal);
}

async function handleVipEditItemSubmit(interaction, itemId) {
    const listedItem = getListedItem(itemId);
    if (!listedItem || listedItem.sellerId !== interaction.user.id) {
        return replyToInteraction(interaction, {
            content: 'Dieses Listing gehoert nicht zu deinem Account.',
            ephemeral: true
        });
    }

    listedItem.title = interaction.fields.getTextInputValue('edit_title').trim();
    listedItem.brand = interaction.fields.getTextInputValue('edit_brand').trim();
    listedItem.price = interaction.fields.getTextInputValue('edit_price').trim();
    listedItem.size = interaction.fields.getTextInputValue('edit_size').trim();
    listedItem.url = interaction.fields.getTextInputValue('edit_url').trim();
    listedItem.updatedAt = new Date().toISOString();
    saveMockupStore();

    await updateTrackedItemCopiesWithListing(interaction.guild, listedItem);
    await upsertVipPrivatePanel(interaction.channel, interaction.user.id).catch(() => null);

    return replyToInteraction(interaction, {
        content: 'Listing wurde aktualisiert.',
        ephemeral: true
    });
}

function buildAiExplainerPanel() {
    const aiPanelUrl = `https://discord.com/channels/${BOT_GUILD_ID}/${AI_PANEL_CHANNEL_ID}`;

    const embed = buildPanelEmbed({
        title: AI_EXPLAINER_PANEL_TITLE,
        description:
            'Diese AI ist fuer Vinted, Vintage, Resell und Creator-Verkauf gebaut. Sie hilft dir dabei, bessere Listings zu erstellen, smarter zu vermarkten und deine Pieces klarer zu verkaufen.',
        color: '#6a7dff',
        fields: [
            {
                name: '\uD83C\uDFAF Wofuer die AI da ist',
                value:
                    'Die AI ist spezialisiert auf Vinted: Titel, Beschreibungen, Preise, Fotos, Keywords, Hashtags, Upload-Planung, Bundle-Taktiken, Rabatt-Strategien, Buyer-Messages, Verhandlung, Content-Ideen, Marketing-Tipps und Schritt-fuer-Schritt Tutorials.',
                inline: false
            },
            {
                name: '\uD83D\uDCA1 Gute Fragen, die du stellen kannst',
                value:
                    'Beispiele: "Mach mir einen starken Vinted Titel fuer diese Diesel Jeans", "Wie preise ich diese Jacke?", "Schreib mir eine Beschreibung, die verkauft", "Welche Fotos brauche ich?", "Wie antworte ich auf einen Preisvorschlag?", "Gib mir einen 7-Tage Upload Plan."',
                inline: false
            },
            {
                name: '\uD83D\uDC8E Was AI Tokens machen',
                value:
                    'AI Tokens sind dein Guthaben fuer die AI. Tokens werden benutzt, wenn die AI Text liest, versteht und eine Antwort schreibt. Kurze Fragen mit kurzen Antworten verbrauchen wenig. Lange Fragen, viele Details und lange Tutorials verbrauchen mehr.',
                inline: false
            },
            {
                name: '\uD83E\uDDFE Wie abgerechnet wird',
                value:
                    'Es ist nicht "1 Frage = 1 Token". Abgerechnet wird nach echter Nutzung: deine Frage plus die Antwort der AI. Wenn eine Antwort z.B. 550 AI Tokens braucht, werden 550 abgezogen. Wenn die AI nicht antworten kann, werden keine Tokens abgezogen.',
                inline: false
            },
            {
                name: '\uD83D\uDCC8 So nutzt du Tokens am besten',
                value:
                    'Schick der AI klare Infos: Marke, Groesse, Zustand, Preisziel, Fotosituation und Zielgruppe. Je genauer du fragst, desto besser kann sie dir fertige Listing-Texte, Preisanker, Verkaufsargumente und konkrete naechste Schritte geben.',
                inline: false
            },
            {
                name: '\u26A0\uFE0F Fair & ehrlich',
                value:
                    'Die AI hilft beim Verkaufen, aber sie garantiert keine Sales. Sie soll keine Fake-Marken, Scam-Texte oder Tricks gegen Plattformregeln erstellen. Ziel ist: bessere Listings, ehrliches Marketing und smartere Verkaufstaktik.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // AI FUER VINTED, RESELL & MARKETING'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('\u2728 Ask AI')
            .setStyle(ButtonStyle.Link)
            .setURL(aiPanelUrl),
        new ButtonBuilder()
            .setLabel('\uD83D\uDED2 Tokens kaufen')
            .setStyle(ButtonStyle.Link)
            .setURL(AI_BUY_TOKENS_URL),
        new ButtonBuilder()
            .setLabel('\uD83C\uDF10 Website')
            .setStyle(ButtonStyle.Link)
            .setURL(WEBSITE_URL)
    );

    return { embeds: [embed], components: [row] };
}

async function sendAiExplainerPanel() {
    const explainerChannel = await client.channels.fetch(AI_EXPLAINER_CHANNEL_ID).catch(() => null);
    if (!explainerChannel) {
        return;
    }

    await upsertPanelMessage(explainerChannel, AI_EXPLAINER_PANEL_TITLE, buildAiExplainerPanel());
}

function buildSupportTicketPanel() {
    const embed = buildPanelEmbed({
        title: SUPPORT_TICKET_PANEL_TITLE,
        description:
            'Mit einem Ticket oeffnest du einen privaten Chat mit dem Support-Team, um Hilfe oder Anliegen direkt zu klaeren.',
        color: '#f1c75b',
        fields: [
            {
                name: '\uD83D\uDCCC Bitte erstelle ein Ticket nur fuer',
                value:
                    '\uD83D\uDD27 Hilfe\n' +
                    '\uD83D\uDC1B Bug Reports\n' +
                    '\uD83D\uDCAC Sonstige Fragen',
                inline: false
            },
            {
                name: '\uD83D\uDCDD Wichtig',
                value: 'Beschreibe dein Problem kurz und klar, damit wir dir schnell helfen koennen.',
                inline: false
            }
        ],
        footerText: 'Powered by VELOO&YESTERA Tickets'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_support_ticket')
            .setLabel('\uD83C\uDF9F\uFE0F Create Ticket')
            .setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

async function sendSupportTicketPanel() {
    const supportChannel = await client.channels.fetch(SUPPORT_TICKET_PANEL_CHANNEL_ID).catch(() => null);
    if (!supportChannel) {
        return;
    }

    await upsertPanelMessage(supportChannel, SUPPORT_TICKET_PANEL_TITLE, buildSupportTicketPanel());
}

function buildCooperationRequestPanel() {
    const embed = buildPanelEmbed({
        title: COOPERATION_REQUEST_PANEL_TITLE,
        description:
            'Um den Prozess zu beschleunigen, sende uns im Ticket bitte direkt folgende Informationen:',
        color: '#f1c75b',
        fields: [
            {
                name: 'PROJECT-DATA',
                value:
                    '\uD83D\uDD17 Name/Link: Server-Link, Instagram oder Website\n' +
                    '\uD83D\uDCCA Stats: Memberzahl oder Engagement-Rate\n' +
                    '\uD83D\uDCDD Konzept: kurze Beschreibung, worum es geht\n' +
                    '\uD83D\uDCA1 Vorschlag: Partnerschaft, Event, Shoutout oder anderer Wunsch',
                inline: false
            },
            {
                name: '\uD83D\uDD0E Review',
                value: 'Unser Management-Team prueft deine Daten und meldet sich im privaten Ticket.',
                inline: false
            }
        ],
        footerText: 'LEVO archive. // COOPERATION REQUEST'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_cooperation_ticket')
            .setLabel('\uD83C\uDF9F\uFE0F Create Ticket')
            .setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

function showSupportTicketModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('support_ticket_modal')
        .setTitle('Support Ticket');

    const topicInput = new TextInputBuilder()
        .setCustomId('support_topic')
        .setLabel('Worum geht es?')
        .setPlaceholder('z.B. Hilfe, Bug Report, Frage zum Server')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('support_description')
        .setLabel('Beschreibe dein Anliegen')
        .setPlaceholder('Schreibe kurz und klar, was passiert ist oder was du brauchst.')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const urgencyInput = new TextInputBuilder()
        .setCustomId('support_urgency')
        .setLabel('Dringlichkeit')
        .setPlaceholder('z.B. niedrig, normal, dringend')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const linkInput = new TextInputBuilder()
        .setCustomId('support_link')
        .setLabel('Link / Screenshot-Hinweis')
        .setPlaceholder('Optional: Link, Channel, Message-Link oder Screenshot-Hinweis')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(topicInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(urgencyInput),
        new ActionRowBuilder().addComponents(linkInput)
    );

    return interaction.showModal(modal);
}

function showCooperationTicketModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('cooperation_ticket_modal')
        .setTitle('Cooperation Anfrage');

    const projectInput = new TextInputBuilder()
        .setCustomId('coop_project')
        .setLabel('Name / Link')
        .setPlaceholder('Server-Link, Instagram, Website oder Projektname')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const statsInput = new TextInputBuilder()
        .setCustomId('coop_stats')
        .setLabel('Stats')
        .setPlaceholder('Memberzahl, Reichweite, Engagement oder Zielgruppe')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const conceptInput = new TextInputBuilder()
        .setCustomId('coop_concept')
        .setLabel('Konzept')
        .setPlaceholder('Worum geht es bei deinem Projekt?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const proposalInput = new TextInputBuilder()
        .setCustomId('coop_proposal')
        .setLabel('Vorschlag')
        .setPlaceholder('Partnerschaft, Event, Shoutout, Content, Giveaway...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const contactInput = new TextInputBuilder()
        .setCustomId('coop_contact')
        .setLabel('Kontakt')
        .setPlaceholder('@username, E-Mail oder beste Kontaktmoeglichkeit')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(projectInput),
        new ActionRowBuilder().addComponents(statsInput),
        new ActionRowBuilder().addComponents(conceptInput),
        new ActionRowBuilder().addComponents(proposalInput),
        new ActionRowBuilder().addComponents(contactInput)
    );

    return interaction.showModal(modal);
}

function buildTicketDetailsEmbed(type, details = {}) {
    const fields = Object.entries(details)
        .filter(([, value]) => String(value || '').trim())
        .map(([name, value]) => ({
            name,
            value: cleanLogValue(value, 900),
            inline: false
        }));

    if (!fields.length) {
        return null;
    }

    return buildPanelEmbed({
        title: type === 'cooperation' ? '📋 Cooperation Daten' : '📋 Support Details',
        description: 'Diese Angaben kamen direkt aus dem Ticket-Formular.',
        color: type === 'cooperation' ? '#f1c75b' : '#6a7dff',
        fields,
        footerText: 'VELOO&YESTERA // TICKET FORMULAR'
    });
}

const TICKET_TOPIC_PREFIX = 'VELOO_TICKET';

function buildTicketTopic(meta) {
    return [
        TICKET_TOPIC_PREFIX,
        `type=${meta.type}`,
        `user=${meta.userId}`,
        `status=${meta.status}`,
        `created=${meta.createdAt || Date.now()}`,
        `accepted=${meta.acceptedAt || 0}`,
        `last=${meta.lastActivityAt || Date.now()}`,
        `idleAlert=${meta.idleAlertAt || 0}`
    ].join(' ').slice(0, 1024);
}

function parseTicketTopic(topic = '') {
    if (!topic.startsWith(TICKET_TOPIC_PREFIX)) {
        return null;
    }

    const meta = {};
    for (const match of topic.matchAll(/(\w+)=([^\s]+)/g)) {
        meta[match[1]] = match[2];
    }

    return {
        type: meta.type || 'support',
        userId: meta.user || null,
        status: meta.status || 'open',
        createdAt: Number(meta.created || Date.now()),
        acceptedAt: Number(meta.accepted || 0),
        lastActivityAt: Number(meta.last || Date.now()),
        idleAlertAt: Number(meta.idleAlert || 0)
    };
}

function findRoleByCandidates(guild, roleId, candidates) {
    const directRole = findRoleByIdOrName(guild, roleId, candidates[0]);
    if (directRole) {
        return directRole;
    }

    const loweredCandidates = candidates
        .filter(Boolean)
        .map(candidate => candidate.toLowerCase());

    return guild.roles.cache.find(role =>
        loweredCandidates.includes(role.name.toLowerCase())
    ) || null;
}

function findTicketTeamRoles(guild) {
    return {
        ownerRole: findRoleByCandidates(guild, OWNER_ROLE_ID, [OWNER_ROLE_NAME, 'Owner', '𝘖𝘸𝘯𝘦𝘳']),
        moderatorRole: findRoleByCandidates(guild, MODERATOR_ROLE_ID, [EFFECTIVE_MODERATOR_ROLE_NAME, 'Moderator', '𝘔𝘰𝘥𝘦𝘳𝘢𝘵𝘰𝘳'])
    };
}

function memberCanManageTickets(member) {
    if (!member) {
        return false;
    }

    const { ownerRole, moderatorRole } = findTicketTeamRoles(member.guild);
    return (
        memberHasOwnerRole(member) ||
        (ownerRole && member.roles.cache.has(ownerRole.id)) ||
        (moderatorRole && member.roles.cache.has(moderatorRole.id)) ||
        memberHasRoleByIdOrName(member, MODERATOR_ROLE_ID, EFFECTIVE_MODERATOR_ROLE_NAME)
    );
}

function sanitizeChannelName(value) {
    return String(value || 'member')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/_+/g, '-')
        .slice(0, 32) || 'member';
}

function buildTicketControlRow(status = 'open') {
    const isOpen = status === 'open';
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_accept')
            .setLabel('\u2705 Annehmen')
            .setStyle(ButtonStyle.Success)
            .setDisabled(!isOpen),
        new ButtonBuilder()
            .setCustomId('ticket_decline')
            .setLabel('\u274C Ablehnen')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!isOpen),
        new ButtonBuilder()
            .setCustomId('ticket_delete')
            .setLabel('\uD83D\uDDD1\uFE0F Loeschen')
            .setStyle(ButtonStyle.Danger)
    );
}

function getTicketTypeLabel(type) {
    return type === 'cooperation' ? 'Cooperation Request' : 'Support Ticket';
}

function buildTicketChannelEmbed(type, requester, status = 'open') {
    const statusText = {
        open: '\u23F3 Offen - Team kann annehmen oder ablehnen',
        accepted: '\u2705 Angenommen - Ticket wird bearbeitet',
        declined: '\u274C Abgelehnt - Ticket kann geloescht werden'
    }[status] || status;

    const embed = buildPanelEmbed({
        title: `${type === 'cooperation' ? '\uD83E\uDD1D' : '\uD83C\uDF9F\uFE0F'} ${getTicketTypeLabel(type)}`,
        description:
            `${requester} hat ein ${getTicketTypeLabel(type)} erstellt.\n` +
            'Owner und Moderatoren koennen die Anfrage zuerst annehmen oder ablehnen. Wenn alles erledigt ist, kann der Channel geloescht werden.',
        color: type === 'cooperation' ? '#f1c75b' : '#6a7dff',
        fields: [
            {
                name: 'Status',
                value: statusText,
                inline: false
            },
            {
                name: type === 'cooperation' ? 'Was du jetzt senden solltest' : 'Was du jetzt beschreiben solltest',
                value: type === 'cooperation'
                    ? 'Name/Link, Stats, Konzept und deinen konkreten Vorschlag fuer die Cooperation.'
                    : 'Beschreibe dein Problem kurz, klar und mit allen wichtigen Details.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // PRIVATE TICKET'
    });

    return embed;
}

async function updateTicketMeta(channel, patch) {
    const current = parseTicketTopic(channel.topic || '') || {};
    const next = {
        type: current.type || patch.type || 'support',
        userId: current.userId || patch.userId || null,
        status: current.status || patch.status || 'open',
        createdAt: current.createdAt || patch.createdAt || Date.now(),
        acceptedAt: current.acceptedAt || patch.acceptedAt || 0,
        lastActivityAt: current.lastActivityAt || patch.lastActivityAt || Date.now(),
        idleAlertAt: current.idleAlertAt || patch.idleAlertAt || 0,
        ...patch
    };

    await channel.setTopic(buildTicketTopic(next)).catch(() => null);
    return next;
}

async function handleOpenTicketButton(interaction, type, details = {}) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Tickets koennen nur im Server erstellt werden.',
            ephemeral: true
        });
    }

    await interaction.guild.roles.fetch().catch(() => null);
    const existingChannel = interaction.guild.channels.cache.find(channel => {
        if (channel.type !== ChannelType.GuildText) {
            return false;
        }
        const meta = parseTicketTopic(channel.topic || '');
        return meta?.userId === interaction.user.id &&
            meta.type === type &&
            meta.status !== 'declined';
    });

    if (existingChannel) {
        return replyToInteraction(interaction, {
            content: `Du hast schon ein offenes ${getTicketTypeLabel(type)}: <#${existingChannel.id}>`,
            ephemeral: true
        });
    }

    const { ownerRole, moderatorRole } = findTicketTeamRoles(interaction.guild);
    const parentChannel = await interaction.guild.channels.fetch(TICKET_CATEGORY_ID).catch(() => null);
    const parentId = parentChannel?.type === ChannelType.GuildCategory ? parentChannel.id : null;
    const channelName = `${type === 'cooperation' ? 'coop' : 'support'}-${sanitizeChannelName(interaction.user.username)}`;
    const permissionOverwrites = [
        {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles
            ]
        },
        {
            id: client.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels
            ]
        }
    ];

    for (const role of [ownerRole, moderatorRole].filter(Boolean)) {
        permissionOverwrites.push({
            id: role.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels
            ]
        });
    }

    const createdAt = Date.now();
    const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parentId || undefined,
        topic: buildTicketTopic({
            type,
            userId: interaction.user.id,
            status: 'open',
            createdAt,
            lastActivityAt: createdAt,
            acceptedAt: 0,
            idleAlertAt: 0
        }),
        permissionOverwrites
    });

    const teamMention = [
        ownerRole ? `<@&${ownerRole.id}>` : null,
        moderatorRole ? `<@&${moderatorRole.id}>` : null
    ].filter(Boolean).join(' ');

    await ticketChannel.send({
        content: `${interaction.user} ${teamMention}`.trim(),
        embeds: [buildTicketChannelEmbed(type, interaction.user, 'open')],
        components: [buildTicketControlRow('open')]
    });

    const detailsEmbed = buildTicketDetailsEmbed(type, details);
    if (detailsEmbed) {
        await ticketChannel.send({ embeds: [detailsEmbed] }).catch(() => null);
    }

    await sendStaffLog('🎟️ Ticket erstellt', `${interaction.user} hat ein ${getTicketTypeLabel(type)} erstellt.`, [
        { name: 'Ticket', value: `<#${ticketChannel.id}>`, inline: true },
        { name: 'User', value: `${interaction.user} (${interaction.user.id})`, inline: true },
        { name: 'Typ', value: getTicketTypeLabel(type), inline: true },
        ...Object.entries(details).map(([name, value]) => ({ name, value, inline: false }))
    ], type === 'cooperation' ? '#f1c75b' : '#6a7dff');

    return replyToInteraction(interaction, {
        content: `Dein ${getTicketTypeLabel(type)} wurde erstellt: <#${ticketChannel.id}>`,
        ephemeral: true
    });
}

async function handleTicketDecision(interaction, status) {
    if (!interaction.inGuild() || interaction.channel?.type !== ChannelType.GuildText) {
        return replyToInteraction(interaction, {
            content: 'Diese Aktion funktioniert nur in einem Ticket-Channel.',
            ephemeral: true
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!memberCanManageTickets(member)) {
        return replyToInteraction(interaction, {
            content: 'Nur Owner oder Moderatoren koennen Tickets annehmen oder ablehnen.',
            ephemeral: true
        });
    }

    const meta = parseTicketTopic(interaction.channel.topic || '');
    if (!meta) {
        return replyToInteraction(interaction, {
            content: 'Dieser Channel ist kein Ticket-Channel.',
            ephemeral: true
        });
    }

    const updatedMeta = await updateTicketMeta(interaction.channel, {
        status,
        acceptedAt: status === 'accepted' ? Date.now() : meta.acceptedAt,
        lastActivityAt: Date.now(),
        idleAlertAt: 0
    });

    await interaction.message.edit({
        embeds: [buildTicketChannelEmbed(updatedMeta.type, `<@${updatedMeta.userId}>`, updatedMeta.status)],
        components: [buildTicketControlRow(updatedMeta.status)]
    }).catch(() => null);

    const text = status === 'accepted'
        ? `\u2705 ${interaction.user} hat das Ticket angenommen.`
        : `\u274C ${interaction.user} hat die Anfrage abgelehnt.`;

    await sendStaffLog(status === 'accepted' ? '✅ Ticket angenommen' : '❌ Ticket abgelehnt', text, [
        { name: 'Ticket', value: `<#${interaction.channel.id}>`, inline: true },
        { name: 'User', value: updatedMeta.userId ? `<@${updatedMeta.userId}>` : 'Unbekannt', inline: true },
        { name: 'Bearbeitet von', value: `${interaction.user}`, inline: true }
    ], status === 'accepted' ? '#2ecc71' : '#e67e22');

    return replyToInteraction(interaction, {
        content: text,
        ephemeral: false
    });
}

async function buildTicketTranscript(channel) {
    const collected = [];
    let before;

    while (collected.length < 500) {
        const options = { limit: 100 };
        if (before) {
            options.before = before;
        }

        const batch = await channel.messages.fetch(options).catch(() => null);
        if (!batch?.size) {
            break;
        }

        collected.push(...batch.values());
        before = batch.last()?.id;

        if (batch.size < 100) {
            break;
        }
    }

    collected.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const lines = [
        `VELOO&YESTERA Ticket Transcript`,
        `Channel: #${channel.name} (${channel.id})`,
        `Created: ${new Date().toISOString()}`,
        ''
    ];

    for (const message of collected) {
        const time = message.createdAt.toISOString();
        const author = `${message.author?.tag || message.author?.username || 'Unknown'} (${message.author?.id || 'unknown'})`;
        const content = message.content || '';
        lines.push(`[${time}] ${author}: ${content || '[kein Text]'}`);

        for (const embed of message.embeds || []) {
            const title = embed.title ? `Title: ${embed.title}` : '';
            const description = embed.description ? `Description: ${embed.description}` : '';
            const fields = (embed.fields || []).map(field => `${field.name}: ${field.value}`).join(' | ');
            lines.push(`  [Embed] ${[title, description, fields].filter(Boolean).join(' | ')}`);
        }

        for (const attachment of message.attachments.values()) {
            lines.push(`  [Attachment] ${attachment.name || 'Datei'}: ${attachment.url}`);
        }
    }

    return lines.join('\n');
}

async function sendTicketTranscriptToStaff(channel, meta, reason, actor = null) {
    const staffChannel = await client.channels.fetch(STAFF_LOG_CHANNEL_ID).catch(() => null);
    if (!staffChannel?.send) {
        return;
    }

    const transcript = await buildTicketTranscript(channel);
    const safeName = sanitizeChannelName(channel.name).slice(0, 42);
    const file = new AttachmentBuilder(Buffer.from(transcript, 'utf8'), {
        name: `${safeName}-transcript-${Date.now()}.txt`
    });

    const embed = buildPanelEmbed({
        title: '🧾 Ticket Transcript',
        description: `Ein Ticket wurde geschlossen/geloescht. Der Verlauf ist als Datei angehaengt.`,
        color: '#d9c39a',
        fields: [
            { name: 'Ticket', value: `#${channel.name} (${channel.id})`, inline: false },
            { name: 'Typ', value: getTicketTypeLabel(meta?.type || 'support'), inline: true },
            { name: 'Member', value: meta?.userId ? `<@${meta.userId}>` : 'Unbekannt', inline: true },
            { name: 'Aktion', value: reason, inline: true },
            { name: 'Ausgeloest von', value: actor ? `${actor}` : 'System', inline: true }
        ],
        footerText: 'VELOO&YESTERA // STAFF LOG'
    });

    await staffChannel.send({ embeds: [embed], files: [file] }).catch(error => {
        console.error('Ticket transcript log failed:', error.message);
    });
}

async function handleTicketDelete(interaction) {
    const channel = interaction.channel;
    if (!interaction.inGuild() || channel?.type !== ChannelType.GuildText || !parseTicketTopic(channel.topic || '')) {
        return replyToInteraction(interaction, {
            content: 'Diese Aktion funktioniert nur in einem Ticket-Channel.',
            ephemeral: true
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!memberCanManageTickets(member)) {
        return replyToInteraction(interaction, {
            content: 'Nur Owner oder Moderatoren koennen Tickets loeschen.',
            ephemeral: true
        });
    }

    await replyToInteraction(interaction, {
        content: 'Ticket wird geloescht...',
        ephemeral: true
    });

    const meta = parseTicketTopic(channel.topic || '');
    await sendTicketTranscriptToStaff(channel, meta, 'Manuell geloescht', interaction.user).catch(error => {
        console.error('Ticket transcript before delete failed:', error.message);
    });

    setTimeout(() => {
        channel.delete('Ticket per Button geloescht').catch(error => {
            console.error('Ticket delete failed:', error.message);
        });
    }, 1200);
}

async function sendTicketIdleAlert(channel, meta) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`ticket_idle_delete_${channel.id}`)
            .setLabel('\uD83D\uDDD1\uFE0F Loeschen')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`ticket_idle_keep_${channel.id}`)
            .setLabel('\u23F3 Noch lassen')
            .setStyle(ButtonStyle.Secondary)
    );

    const embed = buildPanelEmbed({
        title: '\u23F0 Ticket lange inaktiv',
        description:
            `Das Ticket <#${channel.id}> wurde angenommen, aber seit ca. ${TICKET_IDLE_HOURS} Stunden nicht mehr beschrieben.\n` +
            'Soll der Bot den Channel loeschen oder noch offen lassen?',
        color: '#d6a34e',
        fields: [
            { name: 'Ticket', value: getTicketTypeLabel(meta.type), inline: true },
            { name: 'Member', value: meta.userId ? `<@${meta.userId}>` : 'Unbekannt', inline: true }
        ],
        footerText: 'VELOO&YESTERA // TICKET REMINDER'
    });

    if (TICKET_NOTIFY_USER_ID) {
        const user = await client.users.fetch(TICKET_NOTIFY_USER_ID).catch(() => null);
        if (user) {
            await user.send({ embeds: [embed], components: [row] }).catch(() => null);
            await sendStaffLog('⏰ Ticket inaktiv', `Erinnerung per DM verschickt fuer <#${channel.id}>.`, [
                { name: 'Ticket', value: `<#${channel.id}>`, inline: true },
                { name: 'Member', value: meta.userId ? `<@${meta.userId}>` : 'Unbekannt', inline: true }
            ], '#d6a34e');
            return;
        }
    }

    const { ownerRole } = findTicketTeamRoles(channel.guild);
    await channel.send({
        content: ownerRole ? `<@&${ownerRole.id}>` : 'Owner',
        embeds: [embed],
        components: [row]
    }).catch(() => null);
    await sendStaffLog('⏰ Ticket inaktiv', `Erinnerung im Ticket verschickt fuer <#${channel.id}>.`, [
        { name: 'Ticket', value: `<#${channel.id}>`, inline: true },
        { name: 'Member', value: meta.userId ? `<@${meta.userId}>` : 'Unbekannt', inline: true }
    ], '#d6a34e');
}

async function checkAcceptedTicketInactivity() {
    const guild = client.guilds.cache.get(BOT_GUILD_ID) || await client.guilds.fetch(BOT_GUILD_ID).catch(() => null);
    if (!guild) {
        return;
    }

    await guild.channels.fetch().catch(() => null);
    const now = Date.now();

    for (const channel of guild.channels.cache.values()) {
        if (channel.type !== ChannelType.GuildText) {
            continue;
        }

        const meta = parseTicketTopic(channel.topic || '');
        if (!meta || meta.status !== 'accepted') {
            continue;
        }

        if (TICKET_CATEGORY_ID && channel.parentId !== TICKET_CATEGORY_ID) {
            continue;
        }

        if (now - meta.lastActivityAt < TICKET_IDLE_MS) {
            continue;
        }

        if (meta.idleAlertAt && now - meta.idleAlertAt < TICKET_IDLE_MS) {
            continue;
        }

        await sendTicketIdleAlert(channel, meta);
        await updateTicketMeta(channel, { idleAlertAt: now });
    }
}

async function checkVipExpiryReminders() {
    const now = Date.now();

    for (const [userId, record] of Object.entries(vipStatusStore.users || {})) {
        if (!record.active || !record.currentPeriodEnd) {
            continue;
        }

        const endAt = new Date(record.currentPeriodEnd).getTime();
        if (!Number.isFinite(endAt)) {
            continue;
        }

        if (endAt <= now) {
            await removeVipRoleForUser(userId).catch(error => {
                console.error(`VIP expiry remove failed for ${userId}:`, error.message);
            });
            upsertVipStatus(userId, {
                active: false,
                expiredAt: new Date().toISOString()
            });
            continue;
        }

        if (endAt - now > VIP_EXPIRY_REMINDER_MS || record.reminderSentAt) {
            continue;
        }

        const user = await client.users.fetch(userId).catch(() => null);
        if (user) {
            await user.send(
                `Dein VIP bei VELOO&YESTERA laeuft bald ab (${new Date(endAt).toLocaleString('de-DE', { timeZone: TIMEZONE })}). ` +
                `Du kannst dein Abo hier verwalten: ${WEBSITE_URL}/vip.html`
            ).catch(() => null);
        }

        upsertVipStatus(userId, {
            reminderSentAt: new Date().toISOString()
        });
        await sendStaffLog('👑 VIP laeuft bald ab', `<@${userId}> wurde erinnert.`, [
            { name: 'User', value: `<@${userId}>`, inline: true },
            { name: 'Laeuft ab', value: new Date(endAt).toISOString(), inline: true }
        ], '#f1c75b');
    }
}

async function handleTicketIdleDecision(interaction, action, channelId) {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText || !parseTicketTopic(channel.topic || '')) {
        return replyToInteraction(interaction, {
            content: 'Das Ticket wurde nicht gefunden oder ist schon geloescht.',
            ephemeral: interaction.inGuild()
        });
    }

    if (interaction.inGuild()) {
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!memberCanManageTickets(member)) {
            return replyToInteraction(interaction, {
                content: 'Nur Owner oder Moderatoren koennen diese Erinnerung entscheiden.',
                ephemeral: true
            });
        }
    } else if (TICKET_NOTIFY_USER_ID && interaction.user.id !== TICKET_NOTIFY_USER_ID) {
        return replyToInteraction(interaction, {
            content: 'Diese Erinnerung ist nicht fuer deinen Account.',
            ephemeral: interaction.inGuild()
        });
    }

    if (action === 'delete') {
        const meta = parseTicketTopic(channel.topic || '');
        await sendTicketTranscriptToStaff(channel, meta, 'Inaktiv per Reminder geloescht', interaction.user).catch(error => {
            console.error('Idle ticket transcript failed:', error.message);
        });
        await replyToInteraction(interaction, {
            content: `Ticket <#${channel.id}> wird geloescht.`,
            ephemeral: interaction.inGuild()
        });
        return channel.delete('Inaktives Ticket per Reminder geloescht').catch(error => {
            console.error('Idle ticket delete failed:', error.message);
        });
    }

    await updateTicketMeta(channel, {
        idleAlertAt: Date.now()
    });
    await sendStaffLog('⏳ Ticket bleibt offen', `${interaction.user} hat entschieden, <#${channel.id}> offen zu lassen.`, [
        { name: 'Ticket', value: `<#${channel.id}>`, inline: true }
    ], '#95a5a6');

    return replyToInteraction(interaction, {
        content: `Ticket <#${channel.id}> bleibt offen.`,
        ephemeral: interaction.inGuild()
    });
}

async function markTicketActivity(message) {
    if (!message.guild || message.channel?.type !== ChannelType.GuildText) {
        return;
    }

    const meta = parseTicketTopic(message.channel.topic || '');
    if (!meta) {
        return;
    }

    await updateTicketMeta(message.channel, {
        lastActivityAt: Date.now(),
        idleAlertAt: 0
    });
}

async function handleAntiSpam(message) {
    if (!message.guild || !message.member || memberCanManageTickets(message.member)) {
        return false;
    }

    const accountAgeMs = Date.now() - message.author.createdTimestamp;
    const accountAgeDays = accountAgeMs / (24 * 60 * 60 * 1000);
    if (accountAgeDays < NEW_ACCOUNT_WARN_DAYS && !newAccountWarnings.has(message.author.id)) {
        newAccountWarnings.add(message.author.id);
        await sendStaffLog('🛡️ Neuer Account aktiv', `${message.author} hat mit einem jungen Account geschrieben.`, [
            { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
            { name: 'Account-Alter', value: `${accountAgeDays.toFixed(1)} Tage`, inline: true },
            { name: 'Channel', value: `<#${message.channelId}>`, inline: true }
        ], '#f1c75b');
    }

    const now = Date.now();
    const history = (spamWindows.get(message.author.id) || []).filter(timestamp => now - timestamp < ANTI_SPAM_WINDOW_MS);
    history.push(now);
    spamWindows.set(message.author.id, history);

    if (history.length <= ANTI_SPAM_MAX_MESSAGES) {
        return false;
    }

    await message.delete().catch(() => null);
    await sendTempMessage(
        message.channel,
        `<@${message.author.id}> bitte langsamer schreiben. Wenn du Hilfe brauchst, oeffne ein Support-Ticket.`,
        7000
    );
    await sendStaffLog('🚨 Anti-Spam ausgelöst', `${message.author} hat zu schnell geschrieben.`, [
        { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
        { name: 'Nachrichten', value: `${history.length} in ${ANTI_SPAM_WINDOW_MS / 1000}s`, inline: true },
        { name: 'Channel', value: `<#${message.channelId}>`, inline: true }
    ], '#e74c3c');

    return true;
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
            'Kurze Frage? Schreib sie direkt hier rein, dann kann die Community helfen.\n' +
            `Wenn du neu bist: erst ${getChannelMention(VERIFICATION_CHANNEL_ID, 'Verification')}, dann ` +
            `${getChannelMention(RULES_CHANNEL_ID, 'Regeln')} und Tutorials checken.`
        );
    }

    if (topicKey === 'socials') {
        return (
            `Socials von VELOO&YESTERA:\n` +
            `TikTok: ${TIKTOK_URL}\n` +
            `${SECONDARY_TIKTOK_LABEL}: ${SECONDARY_TIKTOK_URL}\n` +
            `Instagram: ${INSTAGRAM_HANDLE} - ${INSTAGRAM_URL}\n` +
            `WhatsApp: ${WHATSAPP_CHANNEL_URL}`
        );
    }

    if (topicKey === 'contact') {
        return (
            `Fuer Collabs, Business, Support oder Kontakt:\n` +
            `Mail: ${BUSINESS_EMAIL}\n` +
            `Instagram: ${INSTAGRAM_HANDLE} - ${INSTAGRAM_URL}`
        );
    }

    if (topicKey === 'sell') {
        return (
            `Pieces verkaufst du ueber ${getChannelMention(SELL_CHANNEL_ID, 'den Verkauf-Channel')}.\n` +
            'Panel anklicken, Details eintragen, danach genau ein Bild mit `done` senden.'
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
            'Panel nutzen, Design hochladen und Voting abwarten. Gute Ideen bekommen mehr Sichtbarkeit.'
        );
    }

    if (topicKey === 'outfit') {
        return (
            `Deinen Fit kannst du in ${getChannelMention(OUTFIT_CHANNEL_ID, '`fits`')} posten.\n` +
            'Dort laeuft Daily Voting. Ein sauberer Fit + gutes Bild bringt dir die besten Chancen.'
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
            `VIP hebt deine Listings, Fits, Mockups und ISO-Posts staerker hervor.\n` +
            'Wichtig: Wenn dein Abo gekuendigt oder abgelaufen ist, entfernt der Bot die VIP-Rolle automatisch.'
        );
    }

    if (topicKey === 'ai') {
        return (
            `AI nutzt du ueber ${getChannelMention(AI_PANEL_CHANNEL_ID, 'Ask AI')}.\n` +
            `Oeffne dort deinen privaten AI-Chat. Tokens kaufst du hier: ${AI_BUY_TOKENS_URL}`
        );
    }

    if (topicKey === 'verification') {
        return (
            `Wenn du neu bist, verifiziere dich bitte in ${getChannelMention(VERIFICATION_CHANNEL_ID, 'Verification')}.\n` +
            'Danach bekommst du automatisch die Verified-Rolle und Zugriff auf den Server.'
        );
    }

    if (topicKey === 'rules') {
        return (
            `Alles fuer den Start:\n` +
            `Verification: ${getChannelMention(VERIFICATION_CHANNEL_ID, 'Verification')}\n` +
            `Regeln: ${getChannelMention(RULES_CHANNEL_ID, 'Regeln')}\n` +
            `Tutorials: ${getChannelMention(TUTORIAL_CHANNEL_ID, 'Tutorials')}`
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
            keywords: ['vip', 'highlight', 'hervorgehoben', 'abo', 'abonnement', 'kuendigen', 'kündigen', 'gekündigt', 'gekuendigt']
        },
        {
            key: 'ai',
            keywords: ['ask ai', 'ai', 'ki', 'tokens', 'token', 'ai tokens', 'ki tokens', 'frage an ai']
        },
        {
            key: 'verification',
            keywords: ['verify', 'verified', 'verifizieren', 'verification', 'unverified', 'freischalten']
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

    const reviewStats = getSellerReviewStats(userId);
    const trustedByReviews = sellerQualifiesForReviewTrusted(reviewStats);

    if (saleCount >= TRUSTED_SELLER_MIN_SALES || trustedByReviews) {
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
        const reviewStats = getSellerReviewStats(member.id);
        if (saleCount < TRUSTED_SELLER_MIN_SALES && !sellerQualifiesForReviewTrusted(reviewStats)) {
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

function cleanLogValue(value, limit = 900) {
    const text = String(value ?? 'n/a').trim() || 'n/a';
    return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

async function sendStaffLog(title, description, fields = [], color = '#d9c39a') {
    if (!STAFF_LOG_CHANNEL_ID) {
        return null;
    }

    const staffChannel = await client.channels.fetch(STAFF_LOG_CHANNEL_ID).catch(() => null);
    if (!staffChannel?.send) {
        return null;
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(cleanLogValue(description, 1800))
        .setColor(color)
        .setTimestamp();

    const safeFields = fields
        .filter(field => field && field.name)
        .slice(0, 20)
        .map(field => ({
            name: cleanLogValue(field.name, 250),
            value: cleanLogValue(field.value, 900),
            inline: Boolean(field.inline)
        }));

    if (safeFields.length) {
        embed.addFields(safeFields);
    }

    return staffChannel.send({ embeds: [embed] }).catch(error => {
        console.error('Staff log failed:', error.message);
        return null;
    });
}

function getAnalyticsWeekKey(date = new Date()) {
    const copy = new Date(date);
    const day = copy.getUTCDay() || 7;
    copy.setUTCHours(0, 0, 0, 0);
    copy.setUTCDate(copy.getUTCDate() - day + 1);
    return copy.toISOString().slice(0, 10);
}

function isRecentIsoDate(value, sinceMs) {
    const time = new Date(value || 0).getTime();
    return Number.isFinite(time) && time >= sinceMs;
}

function sumAmounts(events, sinceMs) {
    return events
        .filter(event => isRecentIsoDate(event.createdAt, sinceMs))
        .reduce((sum, event) => sum + Number(event.amount || 0), 0);
}

function buildTopActivityText(monthKey) {
    const monthBucket = mockupStore.activityByMonth?.[monthKey] || {};
    const topEntries = Object.entries(monthBucket)
        .sort((left, right) => Number(right[1]?.points || 0) - Number(left[1]?.points || 0))
        .slice(0, 5);

    if (!topEntries.length) {
        return 'Noch keine Aktivitaet in diesem Monat.';
    }

    return topEntries
        .map(([userId, entry], index) =>
            `${index + 1}. ${getActivityDisplayName(entry, userId)} - ${Number(entry.points || 0)} Punkte`
        )
        .join('\n');
}

async function countOpenTicketChannels() {
    const guild = await getBotGuild();
    if (!guild) {
        return 0;
    }

    await guild.channels.fetch().catch(() => null);
    return guild.channels.cache.filter(channel =>
        channel?.topic?.startsWith?.(TICKET_TOPIC_PREFIX)
    ).size;
}

async function sendWeeklyAnalyticsReport(options = {}) {
    if (!ANALYTICS_CHANNEL_ID) {
        return;
    }

    const weekKey = getAnalyticsWeekKey();
    mockupStore.announcedAnalyticsWeeks = Array.isArray(mockupStore.announcedAnalyticsWeeks)
        ? mockupStore.announcedAnalyticsWeeks
        : [];

    if (!options.force && mockupStore.announcedAnalyticsWeeks.includes(weekKey)) {
        return;
    }

    const analyticsChannel = await client.channels.fetch(ANALYTICS_CHANNEL_ID).catch(() => null);
    if (!analyticsChannel?.send) {
        return;
    }

    const sinceMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentReviews = Object.values(mockupStore.sellerReviews || {}).filter(review =>
        review && !review.deleted && isRecentIsoDate(review.createdAt, sinceMs)
    );
    const reviewAverage = recentReviews.length
        ? recentReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / recentReviews.length
        : 0;
    const criticalReviews = recentReviews.filter(review => Number(review.rating || 0) <= 2).length;
    const tokenGrants = Array.isArray(aiTokenStore.grants) ? aiTokenStore.grants : [];
    const tokenUsageEvents = Array.isArray(aiTokenStore.usageEvents) ? aiTokenStore.usageEvents : [];
    const recentTokenGrants = sumAmounts(tokenGrants, sinceMs);
    const recentTokenUse = sumAmounts(tokenUsageEvents, sinceMs);
    const activeAiUsers = new Set(
        tokenUsageEvents
            .filter(event => isRecentIsoDate(event.createdAt, sinceMs))
            .map(event => event.userId)
            .filter(Boolean)
    ).size;
    const activeVipCount = Object.values(vipStatusStore.users || {}).filter(record => record?.active).length;
    const openTickets = await countOpenTicketChannels();
    const monthKey = getMonthKey();

    const embed = buildPanelEmbed({
        title: '\uD83D\uDCCA VELOO&YESTERA WEEKLY ANALYTICS',
        description:
            'Automatischer Staff-Report fuer Wachstum, Safety, Tokens und Community-Aktivitaet.',
        color: '#6a7dff',
        fields: [
            {
                name: '\uD83D\uDC51 VIP / Account',
                value: `Aktive VIP Accounts: ${activeVipCount}\nOffene Tickets: ${openTickets}`,
                inline: true
            },
            {
                name: '\u2728 AI Tokens',
                value:
                    `Gutschriften 7 Tage: ${recentTokenGrants}\nVerbraucht 7 Tage: ${recentTokenUse}\nAktive AI User: ${activeAiUsers}`,
                inline: true
            },
            {
                name: '\u2B50 Seller Reviews',
                value:
                    `Reviews 7 Tage: ${recentReviews.length}\nDurchschnitt: ${reviewAverage.toFixed(2)}/5\nKritisch: ${criticalReviews}`,
                inline: true
            },
            {
                name: '\uD83D\uDCC8 Top Aktivitaet diesen Monat',
                value: buildTopActivityText(monthKey),
                inline: false
            },
            {
                name: '\uD83D\uDEE1\uFE0F Payment Safety',
                value:
                    'Token-Gutschriften nutzen Idempotency Keys. Success-URL Reloads werden abgefangen, damit Kaeufe nicht doppelt zaehlen.',
                inline: false
            }
        ],
        footerText: `Analytics Week: ${weekKey}`
    });

    await analyticsChannel.send({ embeds: [embed] });
    mockupStore.announcedAnalyticsWeeks.push(weekKey);
    mockupStore.announcedAnalyticsWeeks = mockupStore.announcedAnalyticsWeeks.slice(-20);
    saveMockupStore();
}

function loadVipStatusStore() {
    try {
        if (!fs.existsSync(VIP_STATUS_STORE_PATH)) {
            return { users: {} };
        }

        const parsed = JSON.parse(fs.readFileSync(VIP_STATUS_STORE_PATH, 'utf8'));
        return { users: parsed.users || {} };
    } catch (error) {
        console.error('VIP status store could not be loaded:', error.message);
        return { users: {} };
    }
}

function saveVipStatusStore() {
    fs.writeFileSync(VIP_STATUS_STORE_PATH, JSON.stringify(vipStatusStore, null, 2));
}

function upsertVipStatus(userId, patch) {
    if (!userId) {
        return null;
    }

    const current = vipStatusStore.users[userId] || {};
    const next = {
        ...current,
        ...patch,
        userId,
        updatedAt: new Date().toISOString()
    };
    vipStatusStore.users[userId] = next;
    saveVipStatusStore();
    return next;
}

function loadAiTokenStore() {
    try {
        if (!fs.existsSync(AI_TOKEN_STORE_PATH)) {
            return { users: {}, grants: [], usageEvents: [], processedGrants: [] };
        }

        const parsed = JSON.parse(fs.readFileSync(AI_TOKEN_STORE_PATH, 'utf8'));
        return {
            users: parsed.users || {},
            grants: Array.isArray(parsed.grants) ? parsed.grants : [],
            usageEvents: Array.isArray(parsed.usageEvents) ? parsed.usageEvents : [],
            processedGrants: Array.isArray(parsed.processedGrants) ? parsed.processedGrants : []
        };
    } catch (error) {
        console.error('AI token store could not be loaded:', error.message);
        return { users: {}, grants: [], usageEvents: [], processedGrants: [] };
    }
}

function saveAiTokenStore() {
    fs.writeFileSync(AI_TOKEN_STORE_PATH, JSON.stringify(aiTokenStore, null, 2));
}

function getAiUserRecord(userId) {
    if (!aiTokenStore.users[userId]) {
        aiTokenStore.users[userId] = {
            balance: AI_STARTING_TOKENS,
            totalGranted: AI_STARTING_TOKENS,
            totalUsed: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            channelId: null,
            panelMessageId: null,
            createdAt: new Date().toISOString()
        };
        saveAiTokenStore();
    }

    return aiTokenStore.users[userId];
}

function addAiTokens(userId, amount, reason = 'manual', options = {}) {
    const cleanAmount = Math.max(0, Math.floor(Number(amount || 0)));
    if (!userId || cleanAmount <= 0) {
        return getAiUserRecord(userId);
    }

    const idempotencyKey = String(options.idempotencyKey || '').trim().slice(0, 180);
    aiTokenStore.processedGrants = Array.isArray(aiTokenStore.processedGrants)
        ? aiTokenStore.processedGrants
        : [];

    if (idempotencyKey && aiTokenStore.processedGrants.some(entry => entry.key === idempotencyKey)) {
        return getAiUserRecord(userId);
    }

    const record = getAiUserRecord(userId);
    record.balance = Number(record.balance || 0) + cleanAmount;
    record.totalGranted = Number(record.totalGranted || 0) + cleanAmount;
    record.updatedAt = new Date().toISOString();
    aiTokenStore.grants.push({
        userId,
        amount: cleanAmount,
        reason,
        idempotencyKey: idempotencyKey || null,
        createdAt: new Date().toISOString()
    });

    if (idempotencyKey) {
        aiTokenStore.processedGrants.push({
            key: idempotencyKey,
            userId,
            amount: cleanAmount,
            reason,
            createdAt: new Date().toISOString()
        });
        aiTokenStore.processedGrants = aiTokenStore.processedGrants.slice(-500);
    }

    saveAiTokenStore();
    sendStaffLog('🪙 AI Tokens gutgeschrieben', `<@${userId}> hat AI Tokens bekommen.`, [
        { name: 'User', value: `<@${userId}>`, inline: true },
        { name: 'Menge', value: String(cleanAmount), inline: true },
        { name: 'Grund', value: reason, inline: true },
        { name: 'Neuer Stand', value: String(record.balance), inline: true }
    ], '#2ecc71').catch(() => null);
    return record;
}

function spendAiTokens(userId, amount, usage = {}) {
    const cleanAmount = Math.max(1, Math.floor(Number(amount || 1)));
    const record = getAiUserRecord(userId);

    if (Number(record.balance || 0) < cleanAmount) {
        return false;
    }

    record.balance = Number(record.balance || 0) - cleanAmount;
    record.totalUsed = Number(record.totalUsed || 0) + cleanAmount;
    record.totalInputTokens = Number(record.totalInputTokens || 0) + Number(usage.inputTokens || 0);
    record.totalOutputTokens = Number(record.totalOutputTokens || 0) + Number(usage.outputTokens || 0);
    record.updatedAt = new Date().toISOString();
    aiTokenStore.usageEvents.push({
        userId,
        amount: cleanAmount,
        inputTokens: Number(usage.inputTokens || 0),
        outputTokens: Number(usage.outputTokens || 0),
        model: usage.model || OPENAI_MODEL,
        reason: usage.reason || 'openai_usage',
        createdAt: new Date().toISOString()
    });
    saveAiTokenStore();
    sendStaffLog('✨ AI Tokens verbraucht', `<@${userId}> hat die AI genutzt.`, [
        { name: 'User', value: `<@${userId}>`, inline: true },
        { name: 'Abgezogen', value: String(cleanAmount), inline: true },
        { name: 'Rest', value: String(record.balance), inline: true },
        { name: 'Input / Output', value: `${usage.inputTokens || 0} / ${usage.outputTokens || 0}`, inline: true },
        { name: 'Grund', value: usage.reason || 'ai_usage', inline: true }
    ], '#6a7dff').catch(() => null);
    return true;
}

function estimateTextTokens(text) {
    const cleanText = String(text || '').trim();
    if (!cleanText) {
        return 0;
    }

    return Math.max(1, Math.ceil(cleanText.length / 4));
}

function estimateAiInputTokens(question, username) {
    return (
        estimateTextTokens(OPENAI_INSTRUCTIONS) +
        estimateTextTokens(`${username}: ${question}`) +
        12
    );
}

function getOpenAiUsage(payload) {
    const usage = payload?.usage || {};
    const inputTokens = Number(
        usage.input_tokens ||
        usage.prompt_tokens ||
        usage.inputTokens ||
        0
    );
    const outputTokens = Number(
        usage.output_tokens ||
        usage.completion_tokens ||
        usage.outputTokens ||
        0
    );
    const totalTokens = Number(
        usage.total_tokens ||
        usage.totalTokens ||
        inputTokens + outputTokens ||
        0
    );

    return {
        inputTokens,
        outputTokens,
        totalTokens
    };
}

function getAiTokenBudget(question, username, balance) {
    const availableTokens = Math.max(0, Math.floor(Number(balance || 0)));
    const estimatedInputTokens = estimateAiInputTokens(question, username);
    const minimumRequired = estimatedInputTokens + AI_MIN_OUTPUT_TOKENS + AI_TOKEN_SAFETY_BUFFER;
    const maxOutputTokens = Math.min(
        OPENAI_MAX_OUTPUT_TOKENS,
        Math.max(0, availableTokens - estimatedInputTokens - AI_TOKEN_SAFETY_BUFFER)
    );

    return {
        availableTokens,
        estimatedInputTokens,
        minimumRequired,
        maxOutputTokens: Math.floor(maxOutputTokens)
    };
}

function buildVerificationPanel() {
    const embed = buildPanelEmbed({
        title: VERIFICATION_PANEL_TITLE,
        description: '👋 Willkommen bei VELOO&YESTERA. Verifiziere dich kurz, dann wird dein Server-Zugang freigeschaltet.',
        color: '#6a7dff',
        fields: [
            {
                name: '🛡️ Warum?',
                value: 'So bleibt der Server sauber und neue Mitglieder bekommen direkt die richtige Rolle.',
                inline: false
            },
            {
                name: '✅ Was passiert danach?',
                value: `Du bekommst die Verified-Rolle <@&${VERIFIED_ROLE_ID}> und die Unverified-Rolle wird entfernt.`,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // VERIFY'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('verify_member')
            .setLabel('✅ Verifizieren')
            .setStyle(ButtonStyle.Success)
    );

    return { embeds: [embed], components: [row] };
}

async function sendVerificationPanel() {
    const verificationChannel = await client.channels.fetch(VERIFICATION_CHANNEL_ID).catch(() => null);
    if (!verificationChannel) {
        return;
    }

    await deletePanelMessages(verificationChannel, VERIFICATION_PANEL_TITLE);
    await verificationChannel.send(buildVerificationPanel());
}

async function grantJoinVerificationRole(member) {
    if (!UNVERIFIED_ROLE_ID || member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
        return;
    }

    await member.roles.add(UNVERIFIED_ROLE_ID).catch(error => {
        console.error(`Unverified role could not be added to ${member.user.tag}:`, error.message);
    });
}

async function handleVerifyButton(interaction) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Diese Verifizierung funktioniert nur im Server.',
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

    await member.roles.add(VERIFIED_ROLE_ID).catch(error => {
        console.error(`Verified role could not be added to ${interaction.user.tag}:`, error.message);
    });

    if (!member.roles.cache.has(VERIFIED_ROLE_ID)) {
        return replyToInteraction(interaction, {
            content: 'Die Verified-Rolle konnte nicht gesetzt werden. Bitte melde dich bei einem Mod.',
            ephemeral: true
        });
    }

    if (UNVERIFIED_ROLE_ID && member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
        await member.roles.remove(UNVERIFIED_ROLE_ID).catch(error => {
            console.error(`Unverified role could not be removed from ${interaction.user.tag}:`, error.message);
        });
    }

    await interaction.user.send({
        content:
            `Willkommen bei ${interaction.guild.name}. Du bist jetzt verifiziert.\n` +
            `Starte hier: Regeln ${getChannelMention(RULES_CHANNEL_ID, 'Regeln')}, AI ${getChannelMention(AI_PANEL_CHANNEL_ID, 'Ask AI')}, Support ${getChannelMention(SUPPORT_TICKET_PANEL_CHANNEL_ID, 'Support')}.`
    }).catch(() => null);

    await sendStaffLog('✅ Member verifiziert', `${interaction.user} wurde verifiziert.`, [
        { name: 'User', value: `${interaction.user} (${interaction.user.id})`, inline: true }
    ], '#2ecc71');

    return replyToInteraction(interaction, {
        content:
            '✅ Du bist verifiziert. Willkommen bei VELOO&YESTERA.\n' +
            'Naechste Schritte: Regeln lesen, Rollen waehlen und bei Fragen ein Support-Ticket oeffnen.',
        ephemeral: true
    });
}

function buildAiMainPanel() {
    const embed = buildPanelEmbed({
        title: '✨ VELOO&YESTERA AI',
        description: '💬 Moechtest du einen privaten Chat mit der AI eroeffnen?',
        color: '#6a7dff',
        fields: [
            {
                name: '🔒 Privater Channel',
                value: 'Nur du, der Bot und Owner sehen deinen AI-Chat.',
                inline: false
            },
            {
                name: '🪙 AI Tokens',
                value: 'Abgerechnet wird nach echter AI-Nutzung: Frage + Antwort. Tokens bekommst du im VIP-Abo oder ueber Token-Packs.',
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // ASK AI'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_ai_chat')
            .setLabel('✨ AI Chat eroeffnen')
            .setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

function buildAiChatPanel(userId) {
    const record = getAiUserRecord(userId);
    const embed = buildPanelEmbed({
        title: '💬 Was moechtest du mich fragen?',
        description: '✨ Stell deine Frage ueber den Button. Die Antwort erscheint direkt hier im privaten Channel.',
        color: '#6a7dff',
        fields: [
            {
                name: '🪙 Deine Tokens',
                value: `${Number(record.balance || 0)} verfuegbar`,
                inline: true
            },
            {
                name: '⚡ Kosten',
                value: 'Abrechnung nach AI-Nutzung pro Antwort',
                inline: true
            },
            {
                name: '🛒 Tokens kaufen',
                value: AI_BUY_TOKENS_URL,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // PRIVATE AI'
    });

    const askButton = new ButtonBuilder()
        .setCustomId('ask_ai_question')
        .setLabel('💬 Frage stellen')
        .setStyle(ButtonStyle.Primary);

    const listingButton = new ButtonBuilder()
        .setCustomId('ai_listing_generator')
        .setLabel('🧾 Vinted Listing')
        .setStyle(ButtonStyle.Success);

    const refreshButton = new ButtonBuilder()
        .setCustomId('ai_refresh_balance')
        .setLabel('🔄 Tokens aktualisieren')
        .setStyle(ButtonStyle.Secondary);

    const buyButton = new ButtonBuilder()
        .setLabel('🛒 Tokens kaufen')
        .setStyle(ButtonStyle.Link)
        .setURL(AI_BUY_TOKENS_URL);

    const row = new ActionRowBuilder().addComponents(askButton, listingButton, refreshButton, buyButton);
    return { embeds: [embed], components: [row] };
}

async function sendAiPanel() {
    const aiPanelChannel = await client.channels.fetch(AI_PANEL_CHANNEL_ID).catch(() => null);
    if (!aiPanelChannel) {
        return;
    }

    await deletePanelMessages(aiPanelChannel, ['VELOO&YESTERA AI', '✨ VELOO&YESTERA AI']);
    await aiPanelChannel.send(buildAiMainPanel());
}

async function getOrCreateAiChannel(interaction) {
    if (!interaction.inGuild()) {
        return null;
    }

    const record = getAiUserRecord(interaction.user.id);
    const existingChannel = record.channelId
        ? await interaction.guild.channels.fetch(record.channelId).catch(() => null)
        : null;

    if (existingChannel) {
        return existingChannel;
    }

    const ownerRole = findRoleByIdOrName(interaction.guild, OWNER_ROLE_ID, OWNER_ROLE_NAME);
    const permissionOverwrites = [
        {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        },
        {
            id: client.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        }
    ];

    if (ownerRole) {
        permissionOverwrites.push({
            id: ownerRole.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        });
    }

    const channel = await interaction.guild.channels.create({
        name: `ai-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80),
        type: ChannelType.GuildText,
        parent: AI_CHANNEL_CATEGORY_ID || undefined,
        topic: `Private AI fuer ${interaction.user.id}`,
        permissionOverwrites
    });

    record.channelId = channel.id;
    record.updatedAt = new Date().toISOString();
    saveAiTokenStore();
    return channel;
}

async function upsertAiChatPanel(channel, userId) {
    const record = getAiUserRecord(userId);
    const payload = buildAiChatPanel(userId);
    const existingMessage = record.panelMessageId
        ? await channel.messages.fetch(record.panelMessageId).catch(() => null)
        : null;

    if (existingMessage) {
        await existingMessage.edit(payload).catch(() => null);
        return existingMessage;
    }

    const message = await channel.send(payload);
    record.panelMessageId = message.id;
    record.channelId = channel.id;
    record.updatedAt = new Date().toISOString();
    saveAiTokenStore();
    return message;
}

function extractOpenAiText(payload) {
    if (payload.output_text) {
        return payload.output_text;
    }

    const textParts = [];
    for (const item of payload.output || []) {
        for (const content of item.content || []) {
            if (content.type === 'output_text' && content.text) {
                textParts.push(content.text);
            }
        }
    }

    return textParts.join('\n').trim();
}

async function askOpenAi(question, username, maxOutputTokens) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY fehlt in Railway.');
    }

    const outputLimit = Math.max(16, Math.min(OPENAI_MAX_OUTPUT_TOKENS, Math.floor(Number(maxOutputTokens || OPENAI_MAX_OUTPUT_TOKENS))));
    const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            max_output_tokens: outputLimit,
            instructions: OPENAI_INSTRUCTIONS,
            input: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: `${username}: ${question}`
                        }
                    ]
                }
            ]
        })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.error?.message || 'AI Anfrage fehlgeschlagen.');
    }

    return {
        answer: extractOpenAiText(payload) || 'Ich konnte gerade keine Antwort erzeugen.',
        usage: getOpenAiUsage(payload),
        model: payload.model || OPENAI_MODEL
    };
}

async function handleOpenAiChatButton(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = await getOrCreateAiChannel(interaction);

    if (!channel) {
        return interaction.editReply('Der AI-Channel konnte nicht erstellt werden.');
    }

    await upsertAiChatPanel(channel, interaction.user.id);
    return interaction.editReply(`Dein privater AI-Chat ist bereit: <#${channel.id}>`);
}

function showAiListingGeneratorModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('ai_listing_modal')
        .setTitle('Vinted Listing Generator');

    const pieceInput = new TextInputBuilder()
        .setCustomId('listing_piece')
        .setLabel('Piece / Artikel')
        .setPlaceholder('z.B. Diesel Jeans, Nike Zip Hoodie')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const brandInput = new TextInputBuilder()
        .setCustomId('listing_brand')
        .setLabel('Marke')
        .setPlaceholder('z.B. Diesel, Nike, Carhartt, No Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const detailsInput = new TextInputBuilder()
        .setCustomId('listing_details')
        .setLabel('Groesse / Zustand / Besonderheiten')
        .setPlaceholder('z.B. W32 L32, guter Zustand, leichter Fade, Baggy Fit')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const priceInput = new TextInputBuilder()
        .setCustomId('listing_price')
        .setLabel('Preisziel')
        .setPlaceholder('z.B. schnell verkaufen ab 35 EUR, Zielpreis 49 EUR')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const styleInput = new TextInputBuilder()
        .setCustomId('listing_style')
        .setLabel('Style / Zielgruppe')
        .setPlaceholder('z.B. Y2K, Streetwear, Vintage, clean, Skater')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(pieceInput),
        new ActionRowBuilder().addComponents(brandInput),
        new ActionRowBuilder().addComponents(detailsInput),
        new ActionRowBuilder().addComponents(priceInput),
        new ActionRowBuilder().addComponents(styleInput)
    );

    return interaction.showModal(modal);
}

function buildVintedListingPrompt(interaction) {
    return (
        'Erstelle ein professionelles Vinted Listing fuer dieses Piece. ' +
        'Gib mir: 1. starken Titel, 2. verkaufsstarke Beschreibung, 3. Keywords, 4. Preisstrategie, 5. Foto-Tipps, 6. kurze Verhandlungsantworten.\n\n' +
        `Piece: ${interaction.fields.getTextInputValue('listing_piece')}\n` +
        `Marke: ${interaction.fields.getTextInputValue('listing_brand')}\n` +
        `Details: ${interaction.fields.getTextInputValue('listing_details')}\n` +
        `Preisziel: ${interaction.fields.getTextInputValue('listing_price') || 'nicht angegeben'}\n` +
        `Style/Zielgruppe: ${interaction.fields.getTextInputValue('listing_style') || 'nicht angegeben'}`
    );
}

async function handleAiQuestionSubmit(interaction, overrideQuestion = null) {
    const question = (overrideQuestion || interaction.fields.getTextInputValue('ai_question')).trim();
    const record = getAiUserRecord(interaction.user.id);

    if (!question) {
        return replyToInteraction(interaction, {
            content: 'Bitte schreibe eine Frage.',
            ephemeral: true
        });
    }

    const budget = getAiTokenBudget(question, interaction.user.username, record.balance);

    if (budget.maxOutputTokens < AI_MIN_OUTPUT_TOKENS) {
        return replyToInteraction(interaction, {
            content:
                `Du hast nicht genug AI Tokens fuer diese Frage. ` +
                `Du brauchst ungefaehr ${budget.minimumRequired} Tokens Startguthaben. ` +
                `Aktuell: ${budget.availableTokens}. Tokens kaufen: ${AI_BUY_TOKENS_URL}`,
            ephemeral: true
        });
    }

    await interaction.deferReply();

    try {
        const result = await askOpenAi(question, interaction.user.username, budget.maxOutputTokens);
        const fallbackUsage = {
            inputTokens: budget.estimatedInputTokens,
            outputTokens: estimateTextTokens(result.answer),
            totalTokens: budget.estimatedInputTokens + estimateTextTokens(result.answer)
        };
        const usage = result.usage.totalTokens > 0 ? result.usage : fallbackUsage;

        if (!spendAiTokens(interaction.user.id, usage.totalTokens, {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            model: result.model,
            reason: 'openai_response_usage'
        })) {
            console.error(
                `AI token charge exceeded balance for ${interaction.user.id}: ` +
                `${usage.totalTokens} used, ${getAiUserRecord(interaction.user.id).balance} available.`
            );
            spendAiTokens(interaction.user.id, getAiUserRecord(interaction.user.id).balance, {
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                model: result.model,
                reason: 'openai_response_usage_partial'
            });
        }

        const updatedRecord = getAiUserRecord(interaction.user.id);
        const embed = new EmbedBuilder()
            .setTitle('✨ AI Antwort')
            .setDescription(result.answer.slice(0, 3900))
            .addFields(
                {
                    name: '💬 Deine Frage',
                    value: question.slice(0, 900),
                    inline: false
                },
                {
                    name: '🪙 Abrechnung',
                    value:
                        `${usage.totalTokens} AI Tokens abgezogen` +
                        (usage.inputTokens || usage.outputTokens
                            ? ` (${usage.inputTokens} Input / ${usage.outputTokens} Output)`
                            : ''),
                    inline: false
                }
            )
            .setColor('#6a7dff')
            .setFooter({ text: `Tokens uebrig: ${updatedRecord.balance}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        await upsertAiChatPanel(interaction.channel, interaction.user.id).catch(() => null);
    } catch (error) {
        console.error('AI answer failed:', error.message);
        await interaction.editReply('Die AI konnte gerade nicht antworten. Es wurden keine Tokens abgezogen.');
    }
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
        description: 'Willkommen bei VELOO&YESTERA. Lies die Regeln kurz durch, dann bleibt der Server sauber, fair und nutzbar.',
        color: '#d9cfbf',
        fields: [
            { name: '1. Verifizieren', value: `Neue Mitglieder verifizieren sich zuerst in ${getChannelMention(VERIFICATION_CHANNEL_ID, 'Verification')}. Danach bekommst du Zugriff auf den Server.`, inline: false },
            { name: '2. Respekt', value: 'Kein Hate, keine Beleidigungen, keine Provokationen. Klaert Diskussionen normal und bleibt fair.', inline: false },
            { name: '3. Kein Spam', value: 'Keine unnoetigen Pings, kein Flooding, keine Copy-Paste Werbung und keine Eigenwerbung ohne passenden Kontext.', inline: false },
            { name: '4. Faire Deals', value: 'Keine Fakes, kein Scam, keine irrefuehrenden Angaben. Preise, Zustand, Groesse und Links muessen ehrlich sein.', inline: false },
            { name: '5. Richtige Channels', value: 'Sales, Fits, Mockups, ISO, Creator und AI gehoeren in ihre eigenen Bereiche. Der Main-Chat bleibt fuer kurze Fragen und Austausch.', inline: false },
            { name: '6. VIP & AI Tokens', value: 'VIP gilt nur mit aktivem Abo. Wenn ein Abo gekuendigt oder abgelaufen ist, entfernt der Bot die VIP-Rolle automatisch. AI Tokens sind separat nutzbar.', inline: false },
            { name: '7. Team respektieren', value: 'Mods und Owner pruefen Reports, Bewerbungen und Probleme. Entscheidungen bitte akzeptieren oder ruhig per Ticket/DM klaeren.', inline: false }
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

async function sendCooperationRequestTicketPanel() {
    const cooperationChannel = await client.channels.fetch(COOPERATION_CHANNEL_ID).catch(() => null);
    if (!cooperationChannel) {
        return;
    }

    await deletePanelMessages(cooperationChannel, COOPERATION_PANEL_TITLE);
    await upsertPanelMessage(cooperationChannel, COOPERATION_REQUEST_PANEL_TITLE, buildCooperationRequestPanel());
}

function buildSellerReviewPanel() {
    const embed = buildPanelEmbed({
        title: SELLER_REVIEW_PANEL_TITLE,
        description:
            'Bewerte Seller nach einem echten Deal. So sieht die Community schneller, wer sauber liefert, fair kommuniziert und trusted ist.',
        color: '#f1c75b',
        fields: [
            {
                name: '\u2B50 Review abgeben',
                value:
                    'Klicke auf den Button, trage den Seller, 1-5 Sterne, Deal/Item und dein Feedback ein.',
                inline: false
            },
            {
                name: '\uD83D\uDEE1\uFE0F Fair bleiben',
                value:
                    'Nur echte Deals bewerten. Fake Reviews, Beleidigungen oder Rache-Reviews koennen vom Staff entfernt werden.',
                inline: false
            },
            {
                name: '\uD83C\uDFC5 Trusted Seller',
                value:
                    `Ab ${REVIEW_TRUSTED_MIN_COUNT} Reviews mit mindestens ${REVIEW_TRUSTED_MIN_AVERAGE.toFixed(1)} Sternen kann automatisch die ${DEFAULT_TRUSTED_SELLER_ROLE_NAME} Rolle vergeben werden.`,
                inline: false
            }
        ],
        footerText: 'VELOO&YESTERA // SELLER REVIEWS'
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('open_seller_review')
            .setLabel('\u2B50 Review abgeben')
            .setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

async function sendSellerReviewPanel() {
    const reviewChannel = await client.channels.fetch(REVIEW_CHANNEL_ID).catch(() => null);
    if (!reviewChannel) {
        return;
    }

    await upsertPanelMessage(reviewChannel, SELLER_REVIEW_PANEL_TITLE, buildSellerReviewPanel());
}

function showSellerReviewModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('seller_review_modal')
        .setTitle('Seller Review');

    const sellerInput = new TextInputBuilder()
        .setCustomId('seller')
        .setLabel('Seller @ oder User-ID')
        .setPlaceholder('@seller oder Discord User-ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const ratingInput = new TextInputBuilder()
        .setCustomId('rating')
        .setLabel('Bewertung 1-5')
        .setPlaceholder('5')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const dealInput = new TextInputBuilder()
        .setCustomId('deal')
        .setLabel('Piece / Deal')
        .setPlaceholder('z.B. Carhartt Jacke, Bundle, Hoodie...')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const feedbackInput = new TextInputBuilder()
        .setCustomId('feedback')
        .setLabel('Feedback')
        .setPlaceholder('Was lief gut oder schlecht? Versand, Kommunikation, Zustand...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const proofInput = new TextInputBuilder()
        .setCustomId('proof')
        .setLabel('Link / Proof optional')
        .setPlaceholder('Optional: Vinted-Link, Discord Message-Link oder kurzer Hinweis')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(sellerInput),
        new ActionRowBuilder().addComponents(ratingInput),
        new ActionRowBuilder().addComponents(dealInput),
        new ActionRowBuilder().addComponents(feedbackInput),
        new ActionRowBuilder().addComponents(proofInput)
    );

    return interaction.showModal(modal);
}

function parseDiscordUserId(value) {
    const match = String(value || '').match(/\d{16,25}/);
    return match ? match[0] : null;
}

function getReviewStars(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 1));
    return '\u2B50'.repeat(safeRating) + '\u25FB\uFE0F'.repeat(5 - safeRating);
}

function getSellerReviewStats(sellerId) {
    const reviews = Object.values(mockupStore.sellerReviews || {}).filter(review =>
        review &&
        !review.deleted &&
        review.sellerId === sellerId
    );

    const totalRating = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    const count = reviews.length;
    const average = count ? totalRating / count : 0;

    return {
        count,
        average,
        positive: reviews.filter(review => Number(review.rating) >= 4).length,
        critical: reviews.filter(review => Number(review.rating) <= 2).length
    };
}

function sellerQualifiesForReviewTrusted(stats) {
    return stats.count >= REVIEW_TRUSTED_MIN_COUNT && stats.average >= REVIEW_TRUSTED_MIN_AVERAGE;
}

function buildSellerReviewEmbed(review, sellerMember, buyerMember, stats) {
    const sellerName = getMemberDisplayName(sellerMember, sellerMember?.user);
    const buyerName = getMemberDisplayName(buyerMember, buyerMember?.user);
    const rating = Number(review.rating) || 1;

    return buildPanelEmbed({
        title: `${getReviewStars(rating)} Seller Review`,
        description:
            `${buyerMember ? `<@${buyerMember.id}>` : buyerName} hat ${sellerMember ? `<@${sellerMember.id}>` : sellerName} bewertet.`,
        color: rating >= 4 ? '#57f287' : rating <= 2 ? '#ed4245' : '#f1c75b',
        fields: [
            {
                name: '\uD83D\uDC64 Seller',
                value: sellerMember ? `<@${sellerMember.id}>` : sellerName,
                inline: true
            },
            {
                name: '\uD83D\uDED2 Deal',
                value: cleanLogValue(review.deal, 300),
                inline: true
            },
            {
                name: '\u2B50 Bewertung',
                value: `${rating}/5`,
                inline: true
            },
            {
                name: '\uD83D\uDCDD Feedback',
                value: cleanLogValue(review.feedback, 900),
                inline: false
            },
            {
                name: '\uD83D\uDCCA Seller Score',
                value:
                    stats.count
                        ? `${stats.average.toFixed(2)}/5 aus ${stats.count} Review(s)`
                        : 'Noch keine Stats',
                inline: false
            }
        ].concat(
            review.proof
                ? [{
                    name: '\uD83D\uDD17 Proof / Hinweis',
                    value: cleanLogValue(review.proof, 500),
                    inline: false
                }]
                : []
        ),
        footerText: `Review ID: ${review.reviewId}`
    });
}

function buildSellerReviewActionRow(reviewId) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`review_delete_${reviewId}`)
            .setLabel('\uD83D\uDDD1\uFE0F Review entfernen')
            .setStyle(ButtonStyle.Danger)
    );
}

async function maybeGrantReviewTrustedSellerRole(guild, sellerId, stats) {
    if (!sellerQualifiesForReviewTrusted(stats)) {
        return false;
    }

    const trustedRole = findRoleByIdOrName(guild, TRUSTED_SELLER_ROLE_ID, DEFAULT_TRUSTED_SELLER_ROLE_NAME);
    if (!trustedRole) {
        return false;
    }

    const member = await guild.members.fetch(sellerId).catch(() => null);
    if (!member || member.roles.cache.has(trustedRole.id)) {
        return false;
    }

    await member.roles.add(trustedRole).catch(() => null);
    await sendStaffLog('\uD83C\uDFC5 Trusted Seller vergeben', `<@${sellerId}> hat die Trusted Seller Rolle ueber Reviews bekommen.`, [
        { name: 'Reviews', value: String(stats.count), inline: true },
        { name: 'Durchschnitt', value: `${stats.average.toFixed(2)}/5`, inline: true },
        { name: 'Rolle', value: `<@&${trustedRole.id}>`, inline: true }
    ], '#57f287');

    return true;
}

async function handleSellerReviewSubmit(interaction) {
    if (!interaction.inGuild()) {
        return replyToInteraction(interaction, {
            content: 'Reviews funktionieren nur direkt im Server.',
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    const sellerId = parseDiscordUserId(interaction.fields.getTextInputValue('seller'));
    const rating = Number(interaction.fields.getTextInputValue('rating'));
    const deal = interaction.fields.getTextInputValue('deal');
    const feedback = interaction.fields.getTextInputValue('feedback');
    const proof = interaction.fields.getTextInputValue('proof') || '';

    if (!sellerId) {
        return interaction.editReply('Bitte gib den Seller als @Mention oder Discord User-ID an.');
    }

    if (sellerId === interaction.user.id) {
        return interaction.editReply('Du kannst dich nicht selbst bewerten.');
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return interaction.editReply('Bitte gib bei Bewertung eine Zahl von 1 bis 5 ein.');
    }

    const sellerMember = await interaction.guild.members.fetch(sellerId).catch(() => null);
    if (!sellerMember) {
        return interaction.editReply('Ich konnte diesen Seller nicht im Server finden.');
    }

    const buyerMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    const reviewChannel = await client.channels.fetch(REVIEW_CHANNEL_ID).catch(() => null);
    if (!reviewChannel?.send) {
        return interaction.editReply('Der Review-Channel wurde nicht gefunden. Bitte sag dem Staff Bescheid.');
    }

    const reviewId = `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const review = {
        reviewId,
        sellerId,
        buyerId: interaction.user.id,
        rating,
        deal: cleanLogValue(deal, 350),
        feedback: cleanLogValue(feedback, 1200),
        proof: cleanLogValue(proof, 600),
        channelId: REVIEW_CHANNEL_ID,
        messageId: null,
        messageUrl: null,
        createdAt: new Date().toISOString(),
        deleted: false
    };

    mockupStore.sellerReviews[reviewId] = review;
    let stats = getSellerReviewStats(sellerId);
    const sentMessage = await reviewChannel.send({
        embeds: [buildSellerReviewEmbed(review, sellerMember, buyerMember, stats)],
        components: [buildSellerReviewActionRow(reviewId)]
    });

    review.messageId = sentMessage.id;
    review.messageUrl = sentMessage.url;
    mockupStore.sellerReviews[reviewId] = review;
    saveMockupStore();

    stats = getSellerReviewStats(sellerId);
    await sentMessage.edit({
        embeds: [buildSellerReviewEmbed(review, sellerMember, buyerMember, stats)],
        components: [buildSellerReviewActionRow(reviewId)]
    }).catch(() => null);

    await maybeGrantReviewTrustedSellerRole(interaction.guild, sellerId, stats);

    recordUserActivity(interaction.user.id, 'seller_review', {
        displayName: getMemberDisplayName(buyerMember, interaction.user)
    });

    await sendStaffLog(
        rating <= 2 ? '\u26A0\uFE0F Kritische Seller Review' : '\u2B50 Seller Review',
        `${interaction.user} hat <@${sellerId}> mit ${rating}/5 bewertet.`,
        [
            { name: 'Seller', value: `<@${sellerId}>`, inline: true },
            { name: 'Buyer', value: `${interaction.user}`, inline: true },
            { name: 'Deal', value: cleanLogValue(deal, 400), inline: false },
            { name: 'Feedback', value: cleanLogValue(feedback, 800), inline: false },
            { name: 'Nachricht', value: sentMessage.url || 'kein Link', inline: false }
        ],
        rating <= 2 ? '#ed4245' : '#f1c75b'
    );

    return interaction.editReply(`Deine Review wurde gepostet. Neuer Seller Score: ${stats.average.toFixed(2)}/5 aus ${stats.count} Review(s).`);
}

async function handleSellerReviewDelete(interaction, reviewId) {
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!memberCanManageTickets(member)) {
        return replyToInteraction(interaction, {
            content: 'Nur Owner oder Moderatoren koennen Reviews entfernen.',
            ephemeral: true
        });
    }

    const review = mockupStore.sellerReviews?.[reviewId];
    if (!review || review.deleted) {
        return replyToInteraction(interaction, {
            content: 'Diese Review wurde schon entfernt oder nicht gefunden.',
            ephemeral: true
        });
    }

    review.deleted = true;
    review.deletedAt = new Date().toISOString();
    review.deletedBy = interaction.user.id;
    mockupStore.sellerReviews[reviewId] = review;
    saveMockupStore();

    const removedEmbed = buildPanelEmbed({
        title: '\uD83D\uDDD1\uFE0F Review entfernt',
        description: `Diese Review wurde von ${interaction.user} entfernt.`,
        color: '#ed4245',
        fields: [
            { name: 'Seller', value: `<@${review.sellerId}>`, inline: true },
            { name: 'Buyer', value: `<@${review.buyerId}>`, inline: true },
            { name: 'Review ID', value: review.reviewId, inline: false }
        ],
        footerText: 'VELOO&YESTERA // REVIEW MODERATION'
    });

    await interaction.message.edit({ embeds: [removedEmbed], components: [] }).catch(() => null);
    await sendStaffLog('\uD83D\uDDD1\uFE0F Review entfernt', `${interaction.user} hat eine Seller Review entfernt.`, [
        { name: 'Seller', value: `<@${review.sellerId}>`, inline: true },
        { name: 'Buyer', value: `<@${review.buyerId}>`, inline: true },
        { name: 'Review ID', value: review.reviewId, inline: false }
    ], '#ed4245');

    return replyToInteraction(interaction, {
        content: 'Review wurde entfernt.',
        ephemeral: true
    });
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
        await sendVerificationPanel();
    } catch (error) {
        console.error('Verification channel error:', error.message);
    }

    try {
        await sendServerGuidePanel();
    } catch (error) {
        console.error('Server guide channel error:', error.message);
    }

    try {
        await sendVintedNotificationPanel();
    } catch (error) {
        console.error('Vinted notification panel error:', error.message);
    }

    try {
        await sendVipTutorialPanel();
    } catch (error) {
        console.error('VIP tutorial panel error:', error.message);
    }

    try {
        await sendVipPanelManagerPanel();
    } catch (error) {
        console.error('VIP panel manager error:', error.message);
    }

    try {
        await sendAiExplainerPanel();
    } catch (error) {
        console.error('AI explainer channel error:', error.message);
    }

    try {
        await sendSupportTicketPanel();
    } catch (error) {
        console.error('Support ticket panel error:', error.message);
    }

    try {
        await sendSellerReviewPanel();
    } catch (error) {
        console.error('Seller review panel error:', error.message);
    }

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
        await sendAiPanel();
    } catch (error) {
        console.error('AI panel error:', error.message);
    }

    try {
        await sendReactionRolePanel();
    } catch (error) {
        console.error('Reaction role channel error:', error.message);
    }

    try {
        await sendCooperationRequestTicketPanel();
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

    await grantJoinVerificationRole(member);

    recordUserActivity(member.id, 'join_server', {
        displayName: getMemberDisplayName(member, member.user)
    });

    const welcomeEmbeds = buildWelcomeEmbeds(member);

    await member.send({
        content: `Willkommen auf ${member.guild.name}. Bitte verifiziere dich kurz in <#${VERIFICATION_CHANNEL_ID}>. Danach bekommst du Zugriff auf den Server.`,
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
    await checkAcceptedTicketInactivity().catch(error => {
        console.error('Ticket inactivity check failed on startup:', error.message);
    });
    await checkVipExpiryReminders().catch(error => {
        console.error('VIP expiry check failed on startup:', error.message);
    });

    cron.schedule('*/5 * * * *', async () => {
        await refreshPanels();
    }, { timezone: TIMEZONE });

    cron.schedule('0 * * * *', async () => {
        await closeExpiredMockupVotes();
        await closeExpiredOutfitVotes();
        await checkAcceptedTicketInactivity();
        await checkVipExpiryReminders();
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

    cron.schedule(ANALYTICS_WEEKLY_CRON, async () => {
        await sendWeeklyAnalyticsReport().catch(error => {
            console.error('Weekly analytics report failed:', error.message);
        });
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

            if (interaction.customId.startsWith('vinted_notify_brand_')) {
                return handleBrandNotificationSelect(interaction);
            }

            if (interaction.customId === 'vinted_notify_categories') {
                return handleCategoryNotificationSelect(interaction);
            }

            if (interaction.customId === 'vip_edit_item_select') {
                return showVipEditItemModal(interaction, interaction.values[0]);
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'verify_member') {
                return handleVerifyButton(interaction);
            }

            if (interaction.customId === 'open_vinted_notifications') {
                return showNotificationSettings(interaction);
            }

            if (interaction.customId === 'open_vip_change_panels') {
                return openOrRefreshVipChangeChannel(interaction);
            }

            if (interaction.customId === 'refresh_vip_change_panels') {
                await upsertVipPrivatePanel(interaction.channel, interaction.user.id);
                return replyToInteraction(interaction, {
                    content: 'Dein Panel wurde aktualisiert.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'open_ai_chat') {
                return handleOpenAiChatButton(interaction);
            }

            if (interaction.customId === 'ask_ai_question') {
                const modal = new ModalBuilder()
                    .setCustomId('ai_question_modal')
                    .setTitle('✨ Ask AI');

                const questionInput = new TextInputBuilder()
                    .setCustomId('ai_question')
                    .setLabel('Was moechtest du mich fragen?')
                    .setPlaceholder('💬 Schreibe deine Frage hier...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(questionInput));
                return interaction.showModal(modal);
            }

            if (interaction.customId === 'ai_listing_generator') {
                return showAiListingGeneratorModal(interaction);
            }

            if (interaction.customId === 'ai_refresh_balance') {
                await upsertAiChatPanel(interaction.channel, interaction.user.id);
                return replyToInteraction(interaction, {
                    content: `Tokenstand aktualisiert: ${getAiUserRecord(interaction.user.id).balance}`,
                    ephemeral: true
                });
            }

            if (interaction.customId === 'open_support_ticket') {
                return showSupportTicketModal(interaction);
            }

            if (interaction.customId === 'open_cooperation_ticket') {
                return showCooperationTicketModal(interaction);
            }

            if (interaction.customId === 'open_seller_review') {
                return showSellerReviewModal(interaction);
            }

            if (interaction.customId.startsWith('review_delete_')) {
                return handleSellerReviewDelete(
                    interaction,
                    interaction.customId.replace('review_delete_', '')
                );
            }

            if (interaction.customId === 'ticket_accept') {
                return handleTicketDecision(interaction, 'accepted');
            }

            if (interaction.customId === 'ticket_decline') {
                return handleTicketDecision(interaction, 'declined');
            }

            if (interaction.customId === 'ticket_delete') {
                return handleTicketDelete(interaction);
            }

            if (interaction.customId.startsWith('ticket_idle_delete_')) {
                return handleTicketIdleDecision(
                    interaction,
                    'delete',
                    interaction.customId.replace('ticket_idle_delete_', '')
                );
            }

            if (interaction.customId.startsWith('ticket_idle_keep_')) {
                return handleTicketIdleDecision(
                    interaction,
                    'keep',
                    interaction.customId.replace('ticket_idle_keep_', '')
                );
            }

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
            if (interaction.customId === 'ai_question_modal') {
                return handleAiQuestionSubmit(interaction);
            }

            if (interaction.customId === 'ai_listing_modal') {
                return handleAiQuestionSubmit(interaction, buildVintedListingPrompt(interaction));
            }

            if (interaction.customId === 'support_ticket_modal') {
                return handleOpenTicketButton(interaction, 'support', {
                    'Anliegen': interaction.fields.getTextInputValue('support_topic'),
                    'Beschreibung': interaction.fields.getTextInputValue('support_description'),
                    'Dringlichkeit': interaction.fields.getTextInputValue('support_urgency') || 'normal',
                    'Link / Screenshot': interaction.fields.getTextInputValue('support_link') || 'kein Link'
                });
            }

            if (interaction.customId === 'cooperation_ticket_modal') {
                return handleOpenTicketButton(interaction, 'cooperation', {
                    'Name / Link': interaction.fields.getTextInputValue('coop_project'),
                    'Stats': interaction.fields.getTextInputValue('coop_stats'),
                    'Konzept': interaction.fields.getTextInputValue('coop_concept'),
                    'Vorschlag': interaction.fields.getTextInputValue('coop_proposal'),
                    'Kontakt': interaction.fields.getTextInputValue('coop_contact') || 'kein Kontakt angegeben'
                });
            }

            if (interaction.customId === 'seller_review_modal') {
                return handleSellerReviewSubmit(interaction);
            }

            if (interaction.customId.startsWith('vip_edit_item_modal_')) {
                return handleVipEditItemSubmit(
                    interaction,
                    interaction.customId.replace('vip_edit_item_modal_', '')
                );
            }

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
    await forwardSpecialListingChannels(message).catch(error => {
        console.error('Special listing forward failed:', error.message);
    });

    if (message.author.bot) {
        return;
    }

    if (await handleAntiSpam(message).catch(error => {
        console.error('Anti-spam check failed:', error.message);
        return false;
    })) {
        return;
    }

    await markTicketActivity(message).catch(error => {
        console.error('Ticket activity update failed:', error.message);
    });

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

function sendJsonResponse(response, status, data) {
    response.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
    });
    response.end(JSON.stringify(data));
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => {
            body += chunk;
            if (body.length > 1_000_000) {
                reject(new Error('Request body too large'));
                request.destroy();
            }
        });
        request.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        request.on('error', reject);
    });
}

function isAuthorizedBotSync(request) {
    if (!BOT_SYNC_SECRET) {
        return false;
    }

    const authorization = request.headers.authorization || '';
    return authorization === `Bearer ${BOT_SYNC_SECRET}`;
}

function startBotHttpServer() {
    const server = http.createServer(async (request, response) => {
        const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

        if (request.method === 'GET' && url.pathname === '/health') {
            return sendJsonResponse(response, 200, { ok: true });
        }

        if (request.method === 'POST' && url.pathname === '/api/grant-tokens') {
            if (!isAuthorizedBotSync(request)) {
                return sendJsonResponse(response, 401, { error: 'unauthorized' });
            }

            try {
                const payload = await readJsonBody(request);
                const discordUserId = String(payload.discordUserId || '').trim();
                const amount = Math.floor(Number(payload.amount || 0));
                const reason = String(payload.reason || 'external_grant').slice(0, 80);
                const idempotencyKey = String(payload.idempotencyKey || '').trim().slice(0, 180);

                if (!/^\d{16,25}$/.test(discordUserId) || amount <= 0) {
                    return sendJsonResponse(response, 400, { error: 'invalid_grant' });
                }

                const wasProcessed = idempotencyKey
                    ? aiTokenStore.processedGrants?.some(entry => entry.key === idempotencyKey)
                    : false;
                const record = addAiTokens(discordUserId, amount, reason, { idempotencyKey });
                const channel = record.channelId
                    ? await client.channels.fetch(record.channelId).catch(() => null)
                    : null;

                if (channel) {
                    await upsertAiChatPanel(channel, discordUserId).catch(() => null);
                }

                return sendJsonResponse(response, 200, {
                    ok: true,
                    discordUserId,
                    balance: record.balance,
                    duplicate: Boolean(wasProcessed && idempotencyKey)
                });
            } catch (error) {
                console.error('Token grant endpoint failed:', error.message);
                return sendJsonResponse(response, 500, { error: 'token_grant_failed' });
            }
        }

        if (request.method === 'POST' && url.pathname === '/api/revoke-vip') {
            if (!isAuthorizedBotSync(request)) {
                return sendJsonResponse(response, 401, { error: 'unauthorized' });
            }

            try {
                const payload = await readJsonBody(request);
                const discordUserId = String(payload.discordUserId || '').trim();
                const reason = String(payload.reason || 'subscription_inactive').slice(0, 80);

                if (!/^\d{16,25}$/.test(discordUserId)) {
                    return sendJsonResponse(response, 400, { error: 'invalid_user' });
                }

                const result = await removeVipRoleForUser(discordUserId);
                upsertVipStatus(discordUserId, {
                    active: false,
                    status: payload.status || reason,
                    subscriptionId: payload.subscriptionId || null,
                    revokeReason: reason,
                    reminderSentAt: null
                });
                console.log(`VIP revoke sync for ${discordUserId}: ${reason}`, result);

                return sendJsonResponse(response, 200, {
                    ok: true,
                    discordUserId,
                    ...result
                });
            } catch (error) {
                console.error('VIP revoke endpoint failed:', error.message);
                return sendJsonResponse(response, 500, { error: 'vip_revoke_failed' });
            }
        }

        if (request.method === 'POST' && url.pathname === '/api/vip-status') {
            if (!isAuthorizedBotSync(request)) {
                return sendJsonResponse(response, 401, { error: 'unauthorized' });
            }

            try {
                const payload = await readJsonBody(request);
                const discordUserId = String(payload.discordUserId || '').trim();

                if (!/^\d{16,25}$/.test(discordUserId)) {
                    return sendJsonResponse(response, 400, { error: 'invalid_user' });
                }

                const statusRecord = upsertVipStatus(discordUserId, {
                    active: Boolean(payload.active),
                    status: String(payload.status || ''),
                    subscriptionId: payload.subscriptionId || null,
                    currentPeriodEnd: payload.currentPeriodEnd || null,
                    plan: payload.plan || null,
                    reminderSentAt: payload.resetReminder ? null : vipStatusStore.users[discordUserId]?.reminderSentAt || null
                });

                await sendStaffLog('👑 VIP Status aktualisiert', `<@${discordUserId}> VIP Status wurde synchronisiert.`, [
                    { name: 'User', value: `<@${discordUserId}>`, inline: true },
                    { name: 'Aktiv', value: String(statusRecord.active), inline: true },
                    { name: 'Status', value: statusRecord.status || 'n/a', inline: true },
                    { name: 'Ende', value: statusRecord.currentPeriodEnd || 'n/a', inline: true }
                ], '#d9c39a');

                return sendJsonResponse(response, 200, {
                    ok: true,
                    discordUserId,
                    vip: statusRecord
                });
            } catch (error) {
                console.error('VIP status endpoint failed:', error.message);
                return sendJsonResponse(response, 500, { error: 'vip_status_failed' });
            }
        }

        if (request.method === 'POST' && url.pathname === '/api/account-status') {
            if (!isAuthorizedBotSync(request)) {
                return sendJsonResponse(response, 401, { error: 'unauthorized' });
            }

            try {
                const payload = await readJsonBody(request);
                const discordUserId = String(payload.discordUserId || '').trim();

                if (!/^\d{16,25}$/.test(discordUserId)) {
                    return sendJsonResponse(response, 400, { error: 'invalid_user' });
                }

                const tokenRecord = getAiUserRecord(discordUserId);
                const vipRecord = vipStatusStore.users[discordUserId] || null;

                return sendJsonResponse(response, 200, {
                    ok: true,
                    discordUserId,
                    tokens: {
                        balance: Number(tokenRecord.balance || 0),
                        totalGranted: Number(tokenRecord.totalGranted || 0),
                        totalUsed: Number(tokenRecord.totalUsed || 0)
                    },
                    vip: vipRecord
                });
            } catch (error) {
                console.error('Account status endpoint failed:', error.message);
                return sendJsonResponse(response, 500, { error: 'account_status_failed' });
            }
        }

        return sendJsonResponse(response, 404, { error: 'not_found' });
    });

    server.listen(BOT_HTTP_PORT, () => {
        console.log(`Bot HTTP server listening on port ${BOT_HTTP_PORT}.`);
    });
}

startBotHttpServer();

if (!process.env.TOKEN) {
    console.error('TOKEN is missing in Railway variables.');
    process.exit(1);
}

client.login(process.env.TOKEN);
