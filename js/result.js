// frontend/js/result.js
window.addEventListener('DOMContentLoaded', () => {
  const data = JSON.parse(localStorage.getItem("lastLoanResult") || "{}");
  if (!data.amount || data.eligible === false) return;

  // Draw EMI chart
  const ctx = document.getElementById('emiChart');
  if (!ctx) return;

  const principal = data.amount;
  const totalPay = data.emi * (parseInt(document.getElementById('tenure')?.value || 60));
  const interest = totalPay - principal;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{ data: [principal, interest], backgroundColor: ['#2563eb', '#93c5fd'] }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
});