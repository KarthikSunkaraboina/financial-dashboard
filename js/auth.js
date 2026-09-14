// frontend/js/auth.js - Login & Signup Logic

const BASE_URL = "http://localhost:8080/api"; // Change to your teammate's backend URL

// Toggle this: true = test without backend, false = use real backend
const MOCK_MODE = true; 

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const btn = document.querySelector('button');

  // 1. Validation
  if (!email || !password) {
    showToast("Please fill all fields", "error");
    return;
  }
  if (!email.includes("@")) {
    showToast("Enter valid email", "error");
    return;
  }

  // 2. Loading state
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Logging in...`;
  btn.disabled = true;

  try {
    if (MOCK_MODE) {
      // --- MOCK MODE FOR DEMO (remove this when backend is ready) ---
      await new Promise(r => setTimeout(r, 1000)); // fake delay
      if (email === "test@test.com" && password === "1234") {
        localStorage.setItem("user", JSON.stringify({ email, token: "mock_token_123" }));
        localStorage.setItem("isLoggedIn", "true");
        showToast("Login successful!", "success");
        setTimeout(() => window.location.href = "dashboard.html", 800);
      } else {
        // Allow any login in mock mode for hackathon
        localStorage.setItem("user", JSON.stringify({ email, token: "mock_token_123" }));
        localStorage.setItem("isLoggedIn", "true");
        showToast("Login successful! (Mock Mode)", "success");
        setTimeout(() => window.location.href = "dashboard.html", 800);
      }
      return;
    }

    // --- REAL BACKEND MODE ---
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save token
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", data.token);

    showToast("Login successful!", "success");
    setTimeout(() => window.location.href = "dashboard.html", 800);

  } catch (err) {
    showToast(err.message || "Server error. Check backend.", "error");
    btn.innerHTML = "Login";
    btn.disabled = false;
  }
}

// --- SIGNUP FUNCTION (if you have signup.html) ---
async function signup() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const name = document.getElementById('name')?.value.trim() || "User";

  if (!email || !password) {
    showToast("Fill all fields", "error");
    return;
  }

  try {
    if (MOCK_MODE) {
      showToast("Account created! (Mock Mode)", "success");
      setTimeout(() => window.location.href = "login.html", 800);
      return;
    }

    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast("Account created! Please login", "success");
    setTimeout(() => window.location.href = "login.html", 800);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// --- Helper: Toast Message ---
function showToast(msg, type) {
  // Remove old toast
  const old = document.getElementById('customToast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'customToast';
  toast.innerText = msg;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
    color: white; background: ${type === 'success' ? '#10b981' : '#ef4444'};
    box-shadow: 0 4px 20px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Auth Guard: Add this to dashboard.html, loan.html, result.html ---
function checkAuth() {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
  }
}

// --- Logout ---
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Auto-Enter on Enter key
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') login();
});