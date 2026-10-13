/**
 * Emits supabase/seed.sql from src/data/catalog.json.
 *
 * The JSON is the single source of truth: it powers demo mode in the app and
 * produces the SQL seed here, so the two can never drift apart.
 *
 * Run with: node scripts/generate-seed.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const q = (value) => (value === null || value === undefined ? "null" : `'${String(value).replace(/'/g, "''")}'`);
const json = (value) => `${q(JSON.stringify(value))}::jsonb`;
const arr = (values) =>
  values.length === 0
    ? "'{}'::text[]"
    : `array[${values.map((v) => q(v)).join(", ")}]::text[]`;
const num = (value) => (value === null || value === undefined ? "null" : String(value));

async function main() {
  const catalog = JSON.parse(await readFile(join(root, "src", "data", "catalog.json"), "utf8"));

  const rows = catalog.map(
    (p) => `(
    ${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.tagline)}, ${q(p.description)},
    ${q(p.category)}, ${q(p.collection)}, ${num(p.price)}, ${num(p.compare_at_price)},
    ${json(p.images)}, ${json(p.variant_groups)}, ${q(p.badge)},
    ${num(p.rating)}, ${num(p.review_count)}, ${num(p.stock)},
    ${p.is_active ? "true" : "false"}, ${p.is_featured ? "true" : "false"},
    ${arr(p.tags)}, ${q(p.created_at)}
  )`,
  );

  const sql = `-- ===========================================================================
-- Velvet Essence — catalogue seed
-- GENERATED FILE — edit src/data/catalog.json and run:
--     node scripts/generate-seed.mjs
-- ---------------------------------------------------------------------------
-- Requires supabase/schema.sql to have been applied first.
-- Idempotent: re-running refreshes every product in place.
-- ===========================================================================

insert into public.products (
  id, slug, name, tagline, description,
  category, collection, price, compare_at_price,
  images, variant_groups, badge,
  rating, review_count, stock,
  is_active, is_featured,
  tags, created_at
) values
${rows.join(",\n")}
on conflict (id) do update set
  slug             = excluded.slug,
  name             = excluded.name,
  tagline          = excluded.tagline,
  description      = excluded.description,
  category         = excluded.category,
  collection       = excluded.collection,
  price            = excluded.price,
  compare_at_price = excluded.compare_at_price,
  images           = excluded.images,
  variant_groups   = excluded.variant_groups,
  badge            = excluded.badge,
  rating           = excluded.rating,
  review_count     = excluded.review_count,
  stock            = excluded.stock,
  is_active        = excluded.is_active,
  is_featured      = excluded.is_featured,
  tags             = excluded.tags;

-- ---------------------------------------------------------------------------
-- Promote your first administrator (replace the address, then re-run):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------
`;

  await writeFile(join(root, "supabase", "seed.sql"), sql, "utf8");
  console.log(`Wrote supabase/seed.sql with ${catalog.length} products`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
