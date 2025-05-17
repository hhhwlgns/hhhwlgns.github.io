document.addEventListener('DOMContentLoaded', function() {
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  const calendarGrid = document.getElementById('calendar-grid');
  const currentMonthYear = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const totalExpenseEl = document.getElementById('total-expense');
  const averageExpenseEl = document.getElementById('average-expense');
  const maxExpenseDateEl = document.getElementById('max-expense-date');
  const maxExpenseEl = document.getElementById('max-expense');
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });
  
  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
  
  async function fetchExpenseData(year, month) {
    /* 백엔드 API 연동시 이 부분을 수정하세요 */
    return new Promise(resolve => resolve({}));
  }
  
  async function renderCalendar() {
    calendarGrid.innerHTML = '<div class="loading">달력을 불러오는 중...</div>';
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInLastMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    currentMonthYear.textContent = `${currentYear}년 ${monthNames[currentMonth]}`;
    const expenseData = await fetchExpenseData(currentYear, currentMonth);
    
    calendarGrid.innerHTML = '';
    
    let monthlyTotal = 0;
    let daysWithExpense = 0;
    let maxExpense = 0;
    let maxExpenseDay = 0;
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInLastMonth - i;
      const dateCell = document.createElement('div');
      dateCell.className = 'date-cell other-month';
      dateCell.innerHTML = `<div class="date-number">${day}</div>`;
      calendarGrid.appendChild(dateCell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateCell = document.createElement('div');
      let cellClass = 'date-cell';
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
      
      if (dayOfWeek === 0) cellClass += ' weekend-sun';
      if (dayOfWeek === 6) cellClass += ' weekend-sat';
      
      if (currentYear === today.getFullYear() && 
          currentMonth === today.getMonth() && 
          day === today.getDate()) {
        cellClass += ' today';
      }
      
      dateCell.className = cellClass;
      let cellContent = `<div class="date-number">${day}</div>`;
      
      if (expenseData[day]) {
        const amount = expenseData[day];
        cellContent += `<div class="expense-amount">${amount.toLocaleString()}원</div>`;
        monthlyTotal += amount;
        daysWithExpense++;
        
        if (amount > maxExpense) {
          maxExpense = amount;
          maxExpenseDay = day;
        }
      } else {
        cellContent += `<div class="no-expense">식비 없음</div>`;
      }
      
      dateCell.innerHTML = cellContent;
      calendarGrid.appendChild(dateCell);
    }
    
    if (maxExpenseDay > 0) {
      const cellIndex = firstDayOfMonth + maxExpenseDay - 1;
      if (calendarGrid.children[cellIndex]) {
        calendarGrid.children[cellIndex].classList.add('max-expense');
      }
    }
    
    const totalCells = 42;
    const cellsAdded = firstDayOfMonth + daysInMonth;
    const remainingCells = totalCells - cellsAdded;
    
    for (let day = 1; day <= remainingCells && day <= 14; day++) {
      const dateCell = document.createElement('div');
      dateCell.className = 'date-cell other-month';
      dateCell.innerHTML = `<div class="date-number">${day}</div>`;
      calendarGrid.appendChild(dateCell);
    }
    
    totalExpenseEl.textContent = monthlyTotal.toLocaleString();
    const average = daysWithExpense > 0 ? Math.round(monthlyTotal / daysWithExpense) : 0;
    averageExpenseEl.textContent = average.toLocaleString();
    
    if (maxExpenseDay > 0) {
      maxExpenseDateEl.textContent = `${maxExpenseDay}일`;
      maxExpenseEl.textContent = maxExpense.toLocaleString();
    } else {
      maxExpenseDateEl.textContent = '-';
      maxExpenseEl.textContent = '0';
    }
  }
  
  renderCalendar();
});
