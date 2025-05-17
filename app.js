const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

// 백엔드에서 제공할 식비 데이터 예시
const expenses = {
  "2025-05-01": 11000,
  "2025-05-03": 8700,
  "2025-05-12": 13000,
  "2025-05-15": 9500,
  "2025-05-20": 7600
};

function renderCalendar(date) {
  calendar.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = `${year}년 ${month + 1}월`;

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  for (const day of weekDays) {
    const dayName = document.createElement("div");
    dayName.className = "day-name";
    dayName.textContent = day;
    calendar.appendChild(dayName);
  }

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayEl = document.createElement("div");
    dayEl.className = "day";

    const dateLabel = document.createElement("div");
    dateLabel.className = "date";
    dateLabel.textContent = day;

    dayEl.appendChild(dateLabel);

    if (expenses[fullDate]) {
      const amount = document.createElement("div");
      amount.className = "amount";
      amount.textContent = `₩${expenses[fullDate].toLocaleString()}`;
      dayEl.appendChild(amount);
    }

    calendar.appendChild(dayEl);
  }
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

renderCalendar(currentDate);
