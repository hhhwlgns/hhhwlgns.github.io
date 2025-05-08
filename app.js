const form = document.getElementById('expense-form');
const tbody = document.querySelector('#expense-table tbody');
const totalDisplay = document.getElementById('total');
let total = 0;

form.addEventListener('submit', e => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const desc = document.getElementById('desc').value;
  const amount = parseInt(document.getElementById('amount').value, 10);
  const category = document.getElementById('category').value;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${date}</td>
    <td>${desc}</td>
    <td>₩${amount.toLocaleString()}</td>
    <td>${category}</td>
  `;
  tbody.appendChild(row);

  if (category === "식비") {
    total += amount;
    totalDisplay.textContent = `식비 합계: ₩${total.toLocaleString()}`;
  }

  form.reset();
});
