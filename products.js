const productGrid = document.getElementById("product-grid");

async function loadProductsFromSupabase() {
  productGrid.innerHTML = `
    <p style="padding:20px;text-align:center;">
      Loading products...
    </p>
  `;

  try {
    if (!window.supabase) {
      throw new Error("Supabase library did not load.");
    }

    if (
      typeof SUPABASE_URL === "undefined" ||
      typeof SUPABASE_ANON_KEY === "undefined"
    ) {
      throw new Error("supabase-config.js is missing or not loaded.");
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase URL or key is empty.");
    }

    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    const { data, error } = await client
      .from("products")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      productGrid.innerHTML = `
        <p style="padding:20px;text-align:center;">
          No products found in Supabase.
        </p>
      `;
      return;
    }

    productGrid.innerHTML = data.map(product => `
      <div class="product-card">
        <img
          src="${product.image_url || "logo.png"}"
          alt="${product.name || "Product"}"
          style="width:100%;height:250px;object-fit:cover;"
        >

        <div style="padding:15px;">
          <h3>${product.name || "Unnamed Product"}</h3>
          <p>₦${Number(product.price || 0).toLocaleString()}</p>
          <p>
            ${product.available === false ? "Sold Out" : "Available"}
          </p>
        </div>
      </div>
    `).join("");

  } catch (error) {
    productGrid.innerHTML = `
      <div style="
        margin:20px;
        padding:20px;
        background:#fff0f0;
        color:#b00020;
        border:1px solid #ffb3b3;
        border-radius:10px;
        line-height:1.6;
      ">
        <strong>Supabase Error:</strong><br>
        ${error.message}
      </div>
    `;

    console.error("Supabase product error:", error);
  }
}

loadProductsFromSupabase();
