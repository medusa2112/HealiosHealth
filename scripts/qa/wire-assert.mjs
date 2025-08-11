#!/usr/bin/env node
import fetch from "node-fetch";
const BASE = process.env.QA_BASE || "http://localhost:5000";

const getSetCookie = (res, name) =>
  (res.headers.raw()["set-cookie"]||[]).find(c => c.startsWith(`${name}=`)) || "";

const mustInclude = (str, k) => {
  if (!str.includes(k)) throw new Error(`Missing cookie attr: ${k} in "${str}"`);
};

const main = async () => {
  console.log("🔍 Testing wire-level auth assertions at", BASE);
  
  // Customer CSRF
  console.log("  Getting customer CSRF token...");
  let r = await fetch(`${BASE}/api/csrf`, { credentials: "include" });
  if (!r.ok) throw new Error(`Customer CSRF failed: ${r.status}`);
  const custCsrfCookie = getSetCookie(r, "csrf_cust");
  const custCsrf = custCsrfCookie.split(";")[0].split("=")[1];
  if (!custCsrf) throw new Error("No csrf_cust cookie received");
  console.log("  ✓ Customer CSRF token obtained");

  // Create test customer account
  console.log("  Creating test customer account...");
  r = await fetch(`${BASE}/api/auth/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": custCsrf },
    body: JSON.stringify({ 
      email: "test.customer@example.com", 
      password: "TestPass123!", 
      firstName: "Test",
      lastName: "Customer"
    })
  });
  
  // If already exists, try login instead
  if (r.status === 409) {
    console.log("  Test customer exists, attempting login...");
    r = await fetch(`${BASE}/api/auth/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": custCsrf },
      body: JSON.stringify({ 
        email: "test.customer@example.com", 
        password: "TestPass123!"
      })
    });
  }
  
  if (!r.ok && r.status !== 201 && r.status !== 200) {
    const body = await r.text();
    throw new Error(`Customer auth failed: ${r.status} - ${body}`);
  }
  
  const custCookie = getSetCookie(r, "hh_cust_sess");
  if (!custCookie) throw new Error("No hh_cust_sess Set-Cookie header");
  mustInclude(custCookie.toLowerCase(), "path=/");
  mustInclude(custCookie, "SameSite=Lax");
  console.log("  ✓ Customer session cookie verified (Path=/, SameSite=Lax)");

  // Admin CSRF
  console.log("  Getting admin CSRF token...");
  r = await fetch(`${BASE}/api/admin/csrf`);
  if (!r.ok) throw new Error(`Admin CSRF failed: ${r.status}`);
  const admCsrfCookie = getSetCookie(r, "csrf_admin");
  const admCsrf = admCsrfCookie.split(";")[0].split("=")[1];
  if (!admCsrf) throw new Error("No csrf_admin cookie received");
  console.log("  ✓ Admin CSRF token obtained");

  // Admin login (using production admin credentials)
  console.log("  Testing admin login...");
  const adminPassword = process.env.ADM_PW || "admin123"; // Fallback for dev
  r = await fetch(`${BASE}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": admCsrf },
    body: JSON.stringify({ 
      email: "dn@thefourths.com", 
      password: adminPassword 
    })
  });
  
  if (!r.ok) {
    // Try backup admin
    console.log("  Primary admin failed, trying backup admin...");
    r = await fetch(`${BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": admCsrf },
      body: JSON.stringify({ 
        email: "admin@healios.com", 
        password: adminPassword 
      })
    });
  }
  
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Admin auth failed: ${r.status} - ${body}`);
  }
  
  const adminCookie = getSetCookie(r, "hh_admin_sess");
  if (!adminCookie) throw new Error("No hh_admin_sess Set-Cookie header");
  mustInclude(adminCookie.toLowerCase(), "path=/admin");
  mustInclude(adminCookie, "SameSite=Strict");
  console.log("  ✓ Admin session cookie verified (Path=/admin, SameSite=Strict)");

  // Test cross-auth protection
  console.log("  Testing cross-auth protection...");
  
  // Try customer accessing admin endpoint
  r = await fetch(`${BASE}/api/admin/products`, {
    headers: { 
      "Cookie": custCookie.split(";")[0]
    }
  });
  if (r.status !== 401 && r.status !== 403) {
    throw new Error(`Customer could access admin endpoint! Status: ${r.status}`);
  }
  console.log("  ✓ Customer blocked from admin endpoints");
  
  // Try admin accessing customer-only endpoint  
  r = await fetch(`${BASE}/api/auth/customer/me`, {
    headers: { 
      "Cookie": adminCookie.split(";")[0]
    }
  });
  if (r.status !== 401 && r.status !== 403) {
    throw new Error(`Admin could access customer endpoint! Status: ${r.status}`);
  }
  console.log("  ✓ Admin blocked from customer endpoints");

  console.log("\n✅ Wire cookie + CSRF + cross-auth assertions passed.");
};

main().catch(e => { 
  console.error("\n❌", e.message); 
  process.exit(1); 
});