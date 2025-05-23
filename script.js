document.addEventListener('DOMContentLoaded', function() {
  // 현재 날짜 정보
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  // DOM 요소들
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('close-btn');
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  const calendarGrid = document.getElementById('calendar-grid');
  const currentMonthYear = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const expenseModal = document.getElementById('expense-modal');
  const addExpenseBtn = document.querySelector('.add-expense-btn');
  
  // 월 이름 배열
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  // 이벤트 리스너 등록
  function initEventListeners() {
    // 사이드바 토글
    menuToggle.addEventListener('click', function() {
      sidebar.classList.add('active');
    });
    
    closeBtn.addEventListener('click', function() {
      sidebar.classList.remove('active');
    });
    
    // 사이드바 외부 클릭시 닫기
    document.addEventListener('click', function(e) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
    
    // 페이지 전환
    navItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        
        // 활성 네비게이션 업데이트
        navItems.forEach(function(nav) {
          nav.classList.remove('active');
        });
        this.classList.add('active');
        
        // 페이지 전환
        pages.forEach(function(page) {
          page.classList.remove('active');
        });
        document.getElementById(targetPage + '-page').classList.add('active');
        
        // 사이드바 닫기 (모바일)
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('active');
        }
      });
    });
    
    // 달력 네비게이션
    prevMonthBtn.addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
    
    // 모달 관련
    addExpenseBtn.addEventListener('click', function() {
      expenseModal.classList.add('active');
      document.getElementById('expense-date').value = formatDate(today);
    });
    
    document.querySelector('.modal-close').addEventListener('click', function() {
      expenseModal.classList.remove('active');
    });
    
    document.querySelector('.cancel-btn').addEventListener('click', function() {
      expenseModal.classList.remove('active');
    });
    
    // 모달 외부 클릭시 닫기
    expenseModal.addEventListener('click', function(e) {
      if (e.target === expenseModal) {
        expenseModal.classList.remove('active');
      }
    });
  }
  
  // 달력 렌더링 함수
  function renderCalendar() {
    try {
      // 달력 초기화
      calendarGrid.innerHTML = '';
      
      // 현재 월의 첫 날과 마지막 날 계산
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();
      
      // 이전 달의 마지막 날짜들
      const prevMonth = new Date(currentYear, currentMonth, 0);
      const daysInPrevMonth = prevMonth.getDate();
      
      // 헤더 업데이트
      currentMonthYear.textContent = `${currentYear}년 ${monthNames[currentMonth]}`;
      
      // 통계 변수 초기화
      let monthlyTotal = 0;
      let daysWithExpense = 0;
      let maxExpense = 0;
      let maxExpenseDay = 0;
      
      // 이전 달 날짜들 추가
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const cell = createDateCell(day, 'other-month');
        calendarGrid.appendChild(cell);
      }
      
      // 현재 달 날짜들 추가
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = createDateCell(day, 'current-month');
        
        // 오늘 날짜 체크
        if (currentYear === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            day === today.getDate()) {
          cell.classList.add('today');
        }
        
        // 주말 체크
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        if (dayOfWeek === 0) cell.classList.add('weekend-sun');
        if (dayOfWeek === 6) cell.classList.add('weekend-sat');
        
        calendarGrid.appendChild(cell);
      }
      
      // 다음 달 날짜들 추가
      const totalCells = 42;
      const cellsUsed = firstDayOfWeek + daysInMonth;
      const remainingCells = totalCells - cellsUsed;
      
      for (let day = 1; day <= remainingCells; day++) {
        const cell = createDateCell(day, 'other-month');
        calendarGrid.appendChild(cell);
      }
      
      // 통계 업데이트
      updateStatistics(monthlyTotal, daysWithExpense, maxExpenseDay, maxExpense);
      
    } catch (error) {
      console.error('달력 렌더링 오류:', error);
      calendarGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #e74c3c;">달력을 불러오는 중 오류가 발생했습니다.</div>';
    }
  }
  
  // 날짜 셀 생성 함수
  function createDateCell(day, type) {
    const cell = document.createElement('div');
    cell.className = `date-cell ${type}`;
    
    cell.innerHTML = `
      <div class="date-number">${day}</div>
      <div class="no-expense">식비 없음</div>
    `;
    
    return cell;
  }
  
  // 통계 업데이트 함수
  function updateStatistics(total, daysCount, maxDay, maxAmount) {
    // 사이드바 통계 업데이트
    document.getElementById('sidebar-total').textContent = total.toLocaleString() + '원';
    
    const average = daysCount > 0 ? Math.round(total / daysCount) : 0;
    document.getElementById('sidebar-average').textContent = average.toLocaleString() + '원';
    document.getElementById('sidebar-max').textContent = maxAmount.toLocaleString() + '원';
  }
  
  // 날짜 포맷 함수
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 거래 내역 초기화
  function initTransactions() {
    // 샘플 데이터는 제거하고 빈 상태로 시작
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">아직 등록된 거래 내역이 없습니다.</div>';
  }
  
  // 예산 관리 초기화
  function initBudget() {
    const saveBudgetBtn = document.querySelector('.save-budget-btn');
    const monthlyBudgetInput = document.getElementById('monthly-budget');
    
    if (saveBudgetBtn) {
      saveBudgetBtn.addEventListener('click', function() {
        const budget = monthlyBudgetInput.value;
        if (budget) {
          alert('예산이 저장되었습니다: ' + parseInt(budget).toLocaleString() + '원');
          updateBudgetProgress(0, parseInt(budget));
        }
      });
    }
  }
  
  // 예산 진행률 업데이트
  function updateBudgetProgress(used, total) {
    const progressFill = document.getElementById('progress-fill');
    const usedBudget = document.getElementById('used-budget');
    const remainingBudget = document.getElementById('remaining-budget');
    
    if (progressFill && usedBudget && remainingBudget) {
      const percentage = total > 0 ? (used / total) * 100 : 0;
      progressFill.style.width = Math.min(percentage, 100) + '%';
      usedBudget.textContent = used.toLocaleString() + '원';
      remainingBudget.textContent = Math.max(total - used, 0).toLocaleString() + '원';
    }
  }
  
  // 설정 초기화
  function initSettings() {
    const resetBtn = document.querySelector('.reset-btn');
    const exportBtn = document.querySelector('.export-btn');
    
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
          alert('데이터가 초기화되었습니다.');
          location.reload();
        }
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        alert('데이터 내보내기 기능은 백엔드 연동 후 구현됩니다.');
      });
    }
  }
  
  // 리포트 초기화
  function initReports() {
    // 기본 통계 표시
    document.getElementById('daily-average').textContent = '0원';
    document.getElementById('max-day').textContent = '-';
    document.getElementById('no-expense-days').textContent = '0일';
    
    const categoryBreakdown = document.getElementById('category-breakdown');
    if (categoryBreakdown) {
      categoryBreakdown.innerHTML = '<div style="text-align: center; color: #666;">데이터가 없습니다.</div>';
    }
  }
  
  // 초기화 함수들 실행
  initEventListeners();
  renderCalendar();
  initTransactions();
  initBudget();
  initSettings();
  initReports();
});
