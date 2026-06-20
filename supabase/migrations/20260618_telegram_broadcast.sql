-- Telegram channels registry: one row per regional channel
create table if not exists telegram_channels (
  id            uuid primary key default gen_random_uuid(),
  region        text not null,          -- e.g. "Eastern Europe", "Middle East"
  country_code  text not null,          -- ISO 3166-1 alpha-2, e.g. "IL", "RU"
  language_code text not null,          -- BCP-47, e.g. "he", "ru", "en"
  language_name text not null,          -- human name for Claude prompt, e.g. "Hebrew"
  channel_id    text not null unique,   -- Telegram chat_id or @username
  channel_name  text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed: add your actual channel IDs here
insert into telegram_channels (region, country_code, language_code, language_name, channel_id, channel_name) values
  ('Middle East',      'IL', 'he', 'Hebrew',               '@your_il_channel',   'ARVIO Israel'),
  ('Middle East',      'AR', 'ar', 'Arabic',               '@your_ar_channel',   'ARVIO Arab World'),
  ('Eastern Europe',   'RU', 'ru', 'Russian',              '@your_ru_channel',   'ARVIO Russia'),
  ('Eastern Europe',   'UA', 'uk', 'Ukrainian',            '@your_ua_channel',   'ARVIO Ukraine'),
  ('North America',    'US', 'en', 'American English',     '@your_us_channel',   'ARVIO USA'),
  ('Western Europe',   'DE', 'de', 'German',               '@your_de_channel',   'ARVIO Germany'),
  ('Western Europe',   'FR', 'fr', 'French',               '@your_fr_channel',   'ARVIO France'),
  ('South Asia',       'IN', 'hi', 'Hindi',                '@your_in_channel',   'ARVIO India'),
  ('Southeast Asia',   'ID', 'id', 'Indonesian',           '@your_id_channel',   'ARVIO Indonesia'),
  ('Latin America',    'BR', 'pt', 'Brazilian Portuguese', '@your_br_channel',   'ARVIO Brazil'),
  ('Latin America',    'MX', 'es', 'Mexican Spanish',      '@your_mx_channel',   'ARVIO Mexico'),
  ('East Asia',        'JP', 'ja', 'Japanese',             '@your_jp_channel',   'ARVIO Japan'),
  ('East Asia',        'KR', 'ko', 'Korean',               '@your_kr_channel',   'ARVIO Korea')
on conflict (channel_id) do nothing;

-- Log of every broadcast attempt
create table if not exists telegram_broadcast_log (
  id                uuid primary key default gen_random_uuid(),
  channel_id        uuid references telegram_channels(id) on delete set null,
  country_code      text not null,
  language_code     text not null,
  original_message  text not null,
  localized_message text not null,
  product_name      text,
  product_url       text,
  image_url         text,
  status            text not null check (status in ('sent','failed')),
  error_message     text,
  created_at        timestamptz not null default now()
);

-- Index for querying log by channel and date
create index if not exists idx_broadcast_log_channel on telegram_broadcast_log(channel_id);
create index if not exists idx_broadcast_log_created on telegram_broadcast_log(created_at desc);

-- Service role only — no public access
alter table telegram_channels enable row level security;
alter table telegram_broadcast_log enable row level security;
