// frontend/js/loan.js - Connects to PanParser.java + BankStatementParser.java + LoanCalculator.java

const MOCK_MODE_LOAN = true; // true = demo without backend, false = real backend
const LOAN_API_URL = "http://localhost:8080/api"; // Your teammate's backend URL

async function submitLoan() {
  const amount = document.getElementById('amount').value;
  const income = document.getElementById('income').value;
  const tenure = document.getElementById('tenure').value;
  const empType = document.getElementById('empType').value;
  const panFile = document.getElementById('panFile').files[0];
  const bankFile = document.getElementById('bankFile').files[0];

  const submitBtn = document.getElementById('submitBtn');
  const loader = document.getElementById('loader');

  // 1. Validation
  if (!amount ||!income ||!tenure) {
    alert("Please fill Loan Amount, Income & Tenure");
    return;
  }
  if (parseInt(amount) < 10000) {
    alert("Minimum loan amount is ₹10,000");
    return;
  }
  if (!panFile ||!bankFile) {
    alert("Please upload both PAN Card & Bank Statement");
    return;
  }

  // 2. Show loader
  submitBtn.classList.add("d-none");
  loader.classList.remove("d-none");

  try {
    let result;

    if (MOCK_MODE_LOAN) {
      // ===== MOCK MODE - FOR HACKATHON DEMO =====
      // Simulates what your teammate's Java code does
      await new Promise(r => setTimeout(r, 2500)); // fake parsing time

      // Mock logic similar to LoanCalculator.java
      const monthlyIncome = parseInt(income);
      const loanAmt = parseInt(amount);
      const eligible = monthlyIncome * 0.6 * parseInt(tenure) > loanAmt; // simple rule
      const emi = Math.round((loanAmt * 0.105 / 12 * Math.pow(1 + 0.105 / 12, tenure)) / (Math.pow(1 + 0.105 / 12, tenure) - 1));

      result = {
        eligible: eligible,
        amount: loanAmt,
        emi: emi,
        interestRate: 10.5,
        panVerified: true,
        avgBalance: Math.round(monthlyIncome * 1.2),
        reason: eligible? "Income criteria met" : "Income too low for requested amount. Try lower amount.",
        panData: { panNumber: "ABCDE1234F", name: "Jashu" },
        bankData: { avgBalance: monthlyIncome * 1.2, months: 6 }
      };

    } else {
      // ===== REAL BACKEND MODE =====
      // This sends files to your teammate's backend
      const formData = new FormData();
      formData.append("loanAmount", amount);
      formData.append("monthlyIncome", income);
      formData.append("tenure", tenure);
      formData.append("employmentType", empType);
      formData.append("panFile", panFile);
      formData.append("bankStatement", bankFile);

      // Get token from login
      const token = localStorage.getItem("token") || "mock_token";

      const res = await fetch(`${LOAN_API_URL}/apply-loan`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
        // Don't set Content-Type, browser will set it for FormData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Backend error");
      }

      result = await res.json();
      // Expected result from backend: { eligible, amount, emi, reason, panData, bankData }
    }

    // 3. Save result & redirect
    localStorage.setItem("lastLoanResult", JSON.stringify(result));
    showToast(`Documents parsed! ${result.eligible? "Approved" : "Checked"}`, "success");

    setTimeout(() => {
      window.location.href = "result.html";
    }, 800);

  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
    loader.classList.add("d-none");
    submitBtn.classList.remove("d-none");
    submitBtn.innerHTML = "Check Eligibility";
  }
}

// Helper toast (if not already in auth.js)
function showToast(msg, type) {
  if (typeof window.showToast === 'function' && window.showToast!== showToast) return window.showToast(msg,type);
  const old = document.getElementById('customToast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.id = 'customToast';
  toast.innerText = msg;
  toast.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; color: white; background: ${type === 'success'? '#10b981' : '#ef4444'}; box-shadow: 0 4px 20px rgba(0,0,0,0.15);`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}