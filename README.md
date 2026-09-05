# Collins Clothing Website

Modern streetwear store for **Collins Clothing**.

## Features

- Clean product grid (IShowSpeed-style layout)
- 14 graphic tees @ **₦15,000** each
- Shopping cart + quantity control
- Full checkout form (name, phone, address)
- Bank transfer payment details (PiggyVest)
- WhatsApp floating button + contact section
- CEO Dashboard (password protected)
  - Edit product names & prices
  - Mark Available / Sold Out
  - View all customer orders
- Works offline with localStorage
- Ready for Supabase (cross-device sync)

## Store Info

| Item              | Details                          |
|-------------------|----------------------------------|
| Address           | Lagos Island, Ikate, Lekki       |
| Phone / WhatsApp  | 0904 710 1249                    |
| Email             | ajigocollins@gmail.com           |
| Bank              | PiggyVest                        |
| Account Name      | Ajigo Collins Ojenya             |
| Account Number    | 9043728140                       |

## How to Run

1. Unzip the folder
2. Open `index.html` in Chrome / Firefox / Edge  
   **or** run a local server:
   ```bash
   npx serve .
   ```

## CEO Dashboard

- Open `dashboard.html` or click **CEO** in the menu
- Password: `collins2026`
- Change password in `js/dashboard.js` → `DASH_PASSWORD`

## Connect Supabase (recommended for multi-device)

So that stock & orders sync across phones/computers:

1. Go to [supabase.com](https://supabase.com) → Create free account → New project
2. Open **SQL Editor** and run this:

```sql
-- Products table
create table products (
  id bigint primary key,
  name text,
  brand text,
  price integer,
  image text,
  available boolean default true
);

-- Orders table
create table orders (
  id bigint primary key,
  created_at timestamptz default now(),
  customer_name text,
  customer_phone text,
  customer_address text,
  customer_note text,
  items jsonb,
  total integer,
  status text default 'pending'
);

-- Allow public read/write for simplicity (you can tighten later)
alter table products enable row level security;
alter table orders enable row level security;

create policy "Public products" on products for all using (true) with check (true);
create policy "Public orders" on orders for all using (true) with check (true);
```

3. Go to **Project Settings → API**
4. Copy **Project URL** and **anon public** key
5. Paste them into `js/supabase-config.js`
6. Tell me when you have the keys and I will finish the live sync code for you.

Until you add the keys, the website still works perfectly using the browser’s local storage.

## File Structure

```
collins-clothing/
├── index.html              # Main shop
├── dashboard.html          # CEO panel
├── css/styles.css
├── js/
│   ├── products.js         # Products, cart, checkout
│   ├── dashboard.js        # Admin logic
│   └── supabase-config.js  # Paste your Supabase keys here
├── images/                 # All product photos
└── README.md
```

Enjoy your store!  
Collins Clothing 🔥
```