import 'dotenv/config';
import { createApp } from './app.js';
import { initDb, isPg } from './db.js';
import { ensureOwnerAdmin } from './data.js';
import { cloudinaryConfig } from './lib/cloudinary.js';

const PORT = process.env.PORT || 4000;
const app = createApp();

initDb()
  .then(async () => {
    const created = await ensureOwnerAdmin();
    if (created) console.log(`✓ Seeded owner admin: ${process.env.ADMIN_EMAIL || 'admin@kumbhconnect.in'}`);
  })
  .then(() => {
    app.listen(PORT, () => {
      const cld = cloudinaryConfig();
      console.log(`\n🪔  Kumbh Connect → http://localhost:${PORT}`);
      console.log(`    store: ${isPg() ? 'Postgres' : 'JSON file (.data/store.json)'}`);
      console.log(`    image uploads: ${cld ? `Cloudinary (cloud: ${cld.cloudName})` : 'off (set CLOUDINARY_* to enable)'}\n`);
    });
  });
