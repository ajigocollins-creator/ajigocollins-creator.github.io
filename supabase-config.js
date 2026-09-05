// ============================================
// SUPABASE CONFIG - Paste your keys here
// ============================================
// 1. Create free project at https://supabase.com
// 2. Go to Project Settings → API
// 3. Copy Project URL and anon public key
// 4. Paste them below and the site will sync across devices

const SUPABASE_URL = '';      // e.g. 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = ''; // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Leave empty to use localStorage only (works on one device)
// Once filled, the site will use Supabase for products & orders

const USE_SUPABASE = SUPABASE_URL && SUPABASE_ANON_KEY;