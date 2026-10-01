import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const DEFAULT_HASH = sha256('admin123');

let ready;
function ensureTables() {
  ready ??= (async () => {
    await sql`create table if not exists entries (
      id uuid default gen_random_uuid() primary key,
      date text, service text, customer text,
      charge float8 default 0, credit float8 default 0,
      debit float8 default 0, expense float8 default 0,
      staff text, remarks text, time text,
      created_at timestamptz default now()
    )`;
    await sql`create table if not exists bills (
      id uuid default gen_random_uuid() primary key,
      bill_no integer, date text, customer_name text, customer_mobile text,
      service text, amount float8 default 0, charge float8 default 0,
      remarks text, time text, created_at timestamptz default now()
    )`;
    await sql`create table if not exists settings (
      key text primary key, value jsonb
    )`;
  })();
  return ready;
}

async function getSettings() {
  const rows = await sql`select value from settings where key = 'app'`;
  return rows[0]?.value || null;
}
const saveSettings = (value) => sql`
  insert into settings (key, value) values ('app', ${JSON.stringify(value)}::jsonb)
  on conflict (key) do update set value = excluded.value`;

const num = (v) => Number(v) || 0;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    await ensureTables();
    const { action, payload = {} } = req.body || {};
    const hash = req.headers['x-admin-hash'] || '';

    const settings = await getSettings();
    const validHash = settings?.passwordHash || DEFAULT_HASH;
    if (hash !== validHash) return res.status(401).json({ error: 'Wrong password.' });

    switch (action) {
      case 'login':
        return res.json({ settings });

      case 'listEntries':
        return res.json(await sql`select * from entries order by created_at desc limit 5000`);

      case 'addEntry': {
        const e = payload;
        const rows = await sql`
          insert into entries (date, service, customer, charge, credit, debit, expense, staff, remarks, time)
          values (${e.date}, ${e.service}, ${e.customer}, ${num(e.charge)}, ${num(e.credit)},
                  ${num(e.debit)}, ${num(e.expense)}, ${e.staff}, ${e.remarks}, ${e.time})
          returning *`;
        return res.json(rows[0]);
      }
      case 'deleteEntry':
        await sql`delete from entries where id = ${payload.id}`;
        return res.json({ ok: true });
      case 'clearEntries':
        await sql`delete from entries`;
        return res.json({ ok: true });

      case 'listBills':
        return res.json(await sql`select * from bills order by created_at desc limit 2000`);
      case 'addBill': {
        const b = payload;
        const rows = await sql`
          insert into bills (bill_no, date, customer_name, customer_mobile, service, amount, charge, remarks, time)
          values (${b.bill_no}, ${b.date}, ${b.customer_name}, ${b.customer_mobile}, ${b.service},
                  ${num(b.amount)}, ${num(b.charge)}, ${b.remarks}, ${b.time})
          returning *`;
        return res.json(rows[0]);
      }
      case 'deleteBill':
        await sql`delete from bills where id = ${payload.id}`;
        return res.json({ ok: true });

      case 'saveSettings':
        await saveSettings({ ...(settings || {}), ...payload });
        return res.json({ ok: true });

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
