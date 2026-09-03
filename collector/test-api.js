/* Quick test to see what Delhi Duty Free actually has available */

const SITE = "https://www.delhidutyfree.co.in";
const GRAPHQL = SITE + "/graphql";

async function testApi() {
  console.log("Testing Delhi Duty Free GraphQL API...\n");

  // Try 1: Search for products
  console.log("1️⃣  Trying: Search for 'perfume'");
  let query = `{
    products(search: "perfume", pageSize: 5) {
      total_count
      items {
        name
        sku
        categories { name url_path }
        price_range {
          minimum_price { final_price { value } }
        }
      }
    }
  }`;

  try {
    const res = await fetch(GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
      },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (json.errors) {
      console.log(`   ✗ Error: ${json.errors[0].message}`);
    } else {
      console.log(`   ✓ Got ${json.data.products.total_count} total products`);
      console.log("   Sample products:");
      json.data.products.items.slice(0, 3).forEach(p => {
        console.log(`     - ${p.name} (${p.sku})`);
        if (p.categories?.length > 0) {
          console.log(`       Category: ${p.categories[0].url_path}`);
        }
      });
    }
  } catch (e) {
    console.log(`   ✗ Network error: ${e.message}`);
  }

  console.log("\n2️⃣  Trying: Available categories");
  query = `{
    categories(first: 10) {
      items {
        uid
        url_key
        url_path
        name
        level
      }
    }
  }`;

  try {
    const res = await fetch(GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0",
      },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (json.errors) {
      console.log(`   ✗ Error: ${json.errors[0].message}`);
    } else if (json.data?.categories?.items) {
      console.log(`   ✓ Found categories:`);
      json.data.categories.items.forEach(c => {
        console.log(`     - "${c.url_path}" (${c.name})`);
      });
    }
  } catch (e) {
    console.log(`   ✗ Network error: ${e.message}`);
  }
}

testApi().catch(console.error);
