import pg from 'pg';
import 'dotenv/config';
const client = new pg.Client(process.env.DATABASE_URL);
await client.connect();
try {
  await client.query("ALTER TYPE license_status ADD VALUE 'grace_period'");
  console.log('✓ Added grace_period to license_status enum');
} catch (e) {
  if (e.code === '42704') console.log('✓ grace_period already exists');
  else { console.error('ENUM ERROR:', e.message); process.exit(1); }
}
try {
  await client.query(`CREATE TABLE license_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    milestone TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT license_reminders_license_id_milestone_unique UNIQUE (license_id, milestone)
  )`);
  console.log('✓ Created license_reminders table');
} catch (e) {
  if (e.code === '42P07') console.log('✓ license_reminders table already exists');
  else { console.error('TABLE ERROR:', e.message); process.exit(1); }
}
try {
  await client.query('CREATE INDEX license_reminders_license_id_idx ON license_reminders(license_id)');
  console.log('✓ Created index');
} catch (e) {
  if (e.code === '42P07') console.log('✓ Index already exists');
  else throw e;
}
const r1 = await client.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'license_status'::regtype ORDER BY enumsortorder");
console.log('Enum values:', r1.rows.map(r => r.enumlabel));
const r2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'license_reminders' ORDER BY ordinal_position");
console.log('Table columns:', r2.rows.map(r => r.column_name));
await client.end();
console.log('\n✓ Phase 18 schema push complete');
