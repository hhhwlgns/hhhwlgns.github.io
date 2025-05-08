// 예시 데이터 (백엔드 연동 시 대체될 예정)
const expenseData = {
    "2025-05-01": 12000,
    "2025-05-03": 7800,
    "2025-05-06": 25000,
    "2025-05-08": 9900,
    "2025-05-13": 14400,
    "2025-05-18": 17500,
  };
  
  const calendar = document.getElementById('calendar');
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed (0 = January)
  
  // 이번 달 1일의 요일
  const firstDay = new Date(year, month, 1).getDay();
  // 이번 달의 마지막 날짜
  const lastDate = new Date(year, month + 1, 0).getDate();
  
  // 빈 칸 (이전 달 여백)
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('day');
    calendar.appendChild(emptyCell);
  }
  
  // 날짜 채우기
  for (let day = 1; day <= lastDate; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const amount = expenseData[dateStr] || null;
  
    const cell = document.createElement('div');
    cell.classList.add('day');
  
    const dateEl = document.createElement('div');
    dateEl.classList.add('date');
    dateEl.textContent = day;
  
    cell.appendChild(dateEl);
  
    if (amount) {
      const amountEl = document.createElement('div');
      amountEl.classList.add('amount');
      amountEl.textContent = `₩${amount.toLocaleString()}`;
      cell.appendChild(amountEl);
    }
  
    calendar.appendChild(cell);
  }
  