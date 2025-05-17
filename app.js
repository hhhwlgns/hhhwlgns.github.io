const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const dateInput = document.getElementById("date");
const amountInput = document.getElementById("amount");
const addEntryBtn = document.getElementById("addEntry");

let currentDate = new Date();
let expenses = JSON.parse(localStorage.getItem("foodExpenses")) || {};

function renderCalendar(date) {
  calendar.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = `${year}년 ${month + 1}월`;

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  for (let day of daysOfWeek) {
    const dayHeader = document.createElement("div");
    dayHeader.classList.add("day");
    dayHeader.textContent = day;
    calendar.appendChild(dayHeader);
  }

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const amount = expenses[fullDate] || 0;
    dayDiv.innerHTML = `<div class="day">${day}</div>`;
    if (amount) {
      dayDiv.innerHTML += `<div class="amount">₩${amount.toLocaleString()}</div>`;
    }
    calendar.appendChild(dayDiv);
  }
}

function updateStorage() {
  localStorage.setItem("foodExpenses", JSON.stringify(expenses));
}

addEntryBtn.addEventListener("click", () => {
  const date = dateInput.value;
  const amount = parseInt(amountInput.value);
  if (!date || isNaN(amount)) return alert("날짜와 금액을 정확히 입력해주세요.");

  expenses[date] = (expenses[date] || 0) + amount;
  updateStorage();

  const entryDate = new Date(date);
  if (entryDate.getFullYear() === currentDate.getFullYear() && entryDate.getMonth() === currentDate.getMonth()) {
    renderCalendar(currentDate);
  }

  dateInput.value = "";
  amountInput.value = "";
});

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

renderCalendar(currentDate);
