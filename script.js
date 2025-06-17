document.addEventListener('DOMContentLoaded', function() {
  // 현재 날짜 정보
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  // 데이터 저장소
  let expenseData = {};
  let selectedTransactionForDutch = null;
  
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
  const dutchConfirmModal = document.getElementById('dutch-confirm-modal');
  const dutchTransactionModal = document.getElementById('dutch-transaction-modal');
  const dailyDetailModal = document.getElementById('daily-detail-modal');
  const addExpenseBtn = document.querySelector('.add-expense-btn');
  const demoDutchBtn = document.querySelector('.demo-dutch-btn');
  
  // 확장된 샘플 데이터 (6월 1일~13일)
  const sampleExpenses = [
    // 6월 1일
    { date: '2025-06-01', store: '이모즉석떡볶이', originalAmount: 45000, amount: 45000, category: '외식', isDutch: false, peopleCount: 1, memo: '일주일치 장보기' },
    
    // 6월 2일
    { date: '2025-06-02', store: '가메이', originalAmount: 24000, amount: 8000, category: '외식', isDutch: true, peopleCount: 3, memo: '친구들과 커피' },
    { date: '2025-06-02', store: '궁중보쌈', originalAmount: 18000, amount: 18000, category: '외식', isDutch: false, peopleCount: 1, memo: '점심' },
    
    // 6월 3일
    { date: '2025-06-03', store: '닭살부부', originalAmount: 15000, amount: 7500, category: '외식', isDutch: true, peopleCount: 2, memo: '스터디 모임' },
    
    // 6월 4일
    { date: '2025-06-04', store: '금산양꼬치', originalAmount: 36000, amount: 9000, category: '외식', isDutch: true, peopleCount: 4, memo: '치킨 회식' },
    { date: '2025-06-04', store: '메가커피', originalAmount: 3500, amount: 3500, category: '외식', isDutch: false, peopleCount: 1, memo: '간식' },
    
    // 6월 5일
    { date: '2025-06-05', store: '구름카츠', originalAmount: 32000, amount: 32000, category: '외식', isDutch: false, peopleCount: 1, memo: '냉장고 채우기' },
    
    // 6월 6일
    { date: '2025-06-06', store: '인하칼국수', originalAmount: 18000, amount: 9000, category: '외식', isDutch: true, peopleCount: 2, memo: '데이트' },
    { date: '2025-06-06', store: '미식당', originalAmount: 45000, amount: 15000, category: '외식', isDutch: true, peopleCount: 3, memo: '가족 저녁' },
    
    // 6월 7일
    { date: '2025-06-07', store: '커리야', originalAmount: 8000, amount: 8000, category: '외식', isDutch: false, peopleCount: 1, memo: '간단한 점심' },
    
    // 6월 8일
    { date: '2025-06-08', store: '성수완당', originalAmount: 28000, amount: 7000, category: '외식', isDutch: true, peopleCount: 4, memo: '회사 점심 주문' },
    { date: '2025-06-08', store: '면식당', originalAmount: 12000, amount: 6000, category: '외식', isDutch: true, peopleCount: 2, memo: '업무 미팅' },
    
    // 6월 9일
    { date: '2025-06-09', store: '킹콩순두부', originalAmount: 55000, amount: 55000, category: '외식', isDutch: false, peopleCount: 1, memo: '대용량 구매' },
    
    // 6월 10일
    { date: '2025-06-10', store: '인하각', originalAmount: 12000, amount: 12000, category: '외식', isDutch: false, peopleCount: 1, memo: '혼자 저녁' },
    { date: '2025-06-10', store: '시카고피자', originalAmount: 32000, amount: 16000, category: '외식', isDutch: true, peopleCount: 2, memo: '야식 주문' },
    
    // 6월 11일
    { date: '2025-06-11', store: '매운애갈비찜', originalAmount: 8500, amount: 8500, category: '외식', isDutch: false, peopleCount: 1, memo: '아침식사' },
    { date: '2025-06-11', store: '온뚝', originalAmount: 42000, amount: 10500, category: '외식', isDutch: true, peopleCount: 4, memo: '팀 회식' },
    
    // 6월 12일
    { date: '2025-06-12', store: '동아리닭갈비', originalAmount: 5000, amount: 5000, category: '외식', isDutch: false, peopleCount: 1, memo: '음료수' },
    { date: '2025-06-12', store: '알촌', originalAmount: 60000, amount: 20000, category: '외식', isDutch: true, peopleCount: 3, memo: '가족 외식' },
    { date: '2025-06-12', store: '미식당', originalAmount: 14000, amount: 7000, category: '외식', isDutch: true, peopleCount: 2, memo: '오후 커피' },
    
    // 6월 13일
    { date: '2025-06-13', store: '궁중보쌈', originalAmount: 15000, amount: 15000, category: '외식', isDutch: false, peopleCount: 1, memo: '점심' },
    { date: '2025-06-13', store: '춘리마라탕', originalAmount: 25000, amount: 8333, category: '외식', isDutch: true, peopleCount: 3, memo: '저녁 배달' },
    { date: '2025-06-13', store: '인하각', originalAmount: 3000, amount: 3000, category: '외식', isDutch: false, peopleCount: 1, memo: '간식' }
  ];
  
  // 샘플 데이터 로드
  sampleExpenses.forEach(expense => {
    if (!expenseData[expense.date]) {
      expenseData[expense.date] = [];
    }
    expenseData[expense.date].push(expense);
  });
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  // 이벤트 리스너 등록
  function initEventListeners() {
    // 사이드바 토글
    menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
    
    // 사이드바 외부 클릭시 닫기
    document.addEventListener('click', function(e) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
    
    // 페이지 전환
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage + '-page').classList.add('active');
        
        if (targetPage === 'transactions') renderTransactions();
        else if (targetPage === 'reports') renderReports();
        
        if (window.innerWidth <= 768) sidebar.classList.remove('active');
      });
    });
    
    // 달력 네비게이션
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
    
    // 지출 추가 모달
    addExpenseBtn.addEventListener('click', () => {
      expenseModal.classList.add('active');
      document.getElementById('expense-date').value = formatDate(today);
    });
    
    document.querySelector('.modal-close').addEventListener('click', () => {
      expenseModal.classList.remove('active');
    });
    
    document.querySelector('.cancel-btn').addEventListener('click', () => {
      expenseModal.classList.remove('active');
    });
    
    // 저장 버튼 - 새 지출 추가 시 더치페이 확인
    document.querySelector('.save-btn').addEventListener('click', () => {
      const amount = document.getElementById('expense-amount').value;
      const store = document.getElementById('expense-store').value;
      
      if (!amount || !store) {
        alert('필수 정보를 입력해주세요.');
        return;
      }
      
      expenseModal.classList.remove('active');
      showDutchConfirmModal(parseInt(amount), 'new');
    });
    
    // 더치페이 버튼 - 기존 거래 선택
    demoDutchBtn.addEventListener('click', () => {
      showDutchTransactionModal();
    });
    
    // 더치페이 거래 선택 모달
    document.getElementById('dutch-transaction-close').addEventListener('click', () => {
      dutchTransactionModal.classList.remove('active');
    });
    
    // 날짜 선택 시 거래 목록 업데이트
    document.getElementById('dutch-date-select').addEventListener('change', function() {
      const selectedDate = this.value;
      renderTransactionSelectList(selectedDate);
    });
    
    // 더치페이 확인 모달 이벤트
    document.getElementById('dutch-close-btn').addEventListener('click', () => {
      dutchConfirmModal.classList.remove('active');
    });
    
    // 인원수 조절 버튼 (1씩 증감)
    document.querySelectorAll('.people-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const countInput = document.getElementById('dutch-people-count');
        const currentCount = parseInt(countInput.value) || 2;
        
        if (this.dataset.count === 'plus' && currentCount < 10) {
          countInput.value = currentCount + 1;
        } else if (this.dataset.count === 'minus' && currentCount > 2) {
          countInput.value = currentCount - 1;
        }
        
        updateDutchCalculation();
      });
    });
    
    // 수정: 인원수 직접 입력 시 검증 로직 개선
    document.getElementById('dutch-people-count').addEventListener('input', function(e) {
      // 입력 중 실시간 검증
      let value = this.value;
      
      // 숫자가 아닌 문자 제거
      value = value.replace(/[^0-9]/g, '');
      
      // 빈 값이면 그대로 두기 (사용자가 입력 중일 수 있음)
      if (value === '') {
        this.value = '';
        return;
      }
      
      // 숫자로 변환
      let numValue = parseInt(value);
      
      // 범위 검증 (2-10)
      if (numValue < 2) {
        numValue = 2;
      } else if (numValue > 10) {
        numValue = 10;
      }
      
      this.value = numValue;
      updateDutchCalculation();
    });
    
    // 수정: blur 이벤트로 최종 검증
    document.getElementById('dutch-people-count').addEventListener('blur', function() {
      if (this.value === '' || parseInt(this.value) < 2) {
        this.value = 2;
        updateDutchCalculation();
      }
    });
    
    // 더치페이 선택 버튼
    document.querySelector('.dutch-no-btn').addEventListener('click', () => {
      applyDutchPay(false);
    });
    
    document.querySelector('.dutch-yes-btn').addEventListener('click', () => {
      const peopleCount = parseInt(document.getElementById('dutch-people-count').value) || 2;
      applyDutchPay(true, peopleCount);
    });
    
    // 일별 상세 모달
    document.getElementById('daily-detail-close').addEventListener('click', () => {
      dailyDetailModal.classList.remove('active');
    });
    
    // 모달 외부 클릭시 닫기
    [expenseModal, dutchConfirmModal, dutchTransactionModal, dailyDetailModal].forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
  
  // 더치페이 거래 선택 모달 표시
  function showDutchTransactionModal() {
    dutchTransactionModal.classList.add('active');
    document.getElementById('dutch-date-select').value = formatDate(today);
    renderTransactionSelectList(formatDate(today));
  }
  
  // 거래 선택 리스트 렌더링
  function renderTransactionSelectList(dateStr) {
    const listContainer = document.getElementById('dutch-transaction-list');
    const dayExpenses = expenseData[dateStr] || [];
    
    if (dayExpenses.length === 0) {
      listContainer.innerHTML = '<p class="no-transactions">해당 날짜에 거래 내역이 없습니다.</p>';
      return;
    }
    
    let content = '';
    dayExpenses.forEach((expense, index) => {
      content += `
        <div class="transaction-select-item" data-date="${dateStr}" data-index="${index}">
          <div class="transaction-select-info">
            <div class="transaction-select-store">${expense.store}</div>
            <div class="transaction-select-category">${expense.category}</div>
          </div>
          <div>
            <span class="transaction-select-amount">${expense.originalAmount.toLocaleString()}원</span>
            ${expense.isDutch ? `<span class="transaction-select-dutch">${expense.peopleCount}명 더치</span>` : ''}
          </div>
        </div>
      `;
    });
    
    listContainer.innerHTML = content;
    
    // 거래 선택 이벤트 추가
    document.querySelectorAll('.transaction-select-item').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.transaction-select-item').forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
        
        const date = this.getAttribute('data-date');
        const index = parseInt(this.getAttribute('data-index'));
        selectedTransactionForDutch = { date, index };
        
        // 선택한 거래로 더치페이 확인 모달 표시
        const selectedExpense = expenseData[date][index];
        dutchTransactionModal.classList.remove('active');
        showDutchConfirmModal(selectedExpense.originalAmount, 'existing');
      });
    });
  }
  
  // 더치페이 확인 모달 표시
  function showDutchConfirmModal(amount, type) {
    document.getElementById('original-amount-display').textContent = amount.toLocaleString() + '원';
    document.getElementById('dutch-people-count').value = '2';
    updateDutchCalculation();
    dutchConfirmModal.classList.add('active');
    dutchConfirmModal.dataset.type = type;
  }
  
  // 더치페이 계산 업데이트
  function updateDutchCalculation() {
    const originalAmountText = document.getElementById('original-amount-display').textContent;
    const originalAmount = parseInt(originalAmountText.replace(/[^0-9]/g, ''));
    const peopleCount = parseInt(document.getElementById('dutch-people-count').value) || 2;
    
    const myAmount = Math.floor(originalAmount / peopleCount);
    const savings = originalAmount - myAmount;
    
    document.getElementById('my-amount-display').textContent = myAmount.toLocaleString() + '원';
    document.getElementById('savings-display').textContent = savings.toLocaleString() + '원';
  }
  
  // 더치페이 적용
  function applyDutchPay(isDutch, peopleCount = 1) {
    const modalType = dutchConfirmModal.dataset.type;
    
    if (modalType === 'new') {
      // 새 지출 추가
      saveNewExpenseWithDutch(isDutch, peopleCount);
    } else if (modalType === 'existing' && selectedTransactionForDutch) {
      // 기존 거래 수정
      updateExistingTransactionDutch(isDutch, peopleCount);
    }
    
    dutchConfirmModal.classList.remove('active');
  }
  
  // 새 지출 저장
  function saveNewExpenseWithDutch(isDutch, peopleCount) {
    const date = document.getElementById('expense-date').value;
    const store = document.getElementById('expense-store').value;
    const originalAmount = parseInt(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const memo = document.getElementById('expense-memo').value;
    
    const expense = {
      store,
      originalAmount,
      amount: isDutch ? Math.floor(originalAmount / peopleCount) : originalAmount,
      category,
      isDutch,
      peopleCount: isDutch ? peopleCount : 1,
      memo
    };
    
    if (!expenseData[date]) {
      expenseData[date] = [];
    }
    
    expenseData[date].push(expense);
    resetExpenseForm();
    updateAllData();
    
    const message = isDutch ? 
      `더치페이 지출이 추가되었습니다! (${peopleCount}명, ${expense.amount.toLocaleString()}원)` :
      '지출이 추가되었습니다!';
    alert(message);
  }
  
  // 기존 거래 더치페이 적용
  function updateExistingTransactionDutch(isDutch, peopleCount) {
    const { date, index } = selectedTransactionForDutch;
    const expense = expenseData[date][index];
    
    expense.isDutch = isDutch;
    expense.peopleCount = isDutch ? peopleCount : 1;
    expense.amount = isDutch ? Math.floor(expense.originalAmount / peopleCount) : expense.originalAmount;
    
    selectedTransactionForDutch = null;
    updateAllData();
    
    const message = isDutch ? 
      `${expense.store} 거래에 더치페이가 적용되었습니다! (${peopleCount}명, ${expense.amount.toLocaleString()}원)` :
      `${expense.store} 거래가 일반결제로 변경되었습니다.`;
    alert(message);
  }
  
  // 달력 렌더링
  function renderCalendar() {
    try {
      calendarGrid.innerHTML = '';
      
      const firstDay = new Date(currentYear, currentMonth, 1);
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfWeek = firstDay.getDay();
      const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
      
      currentMonthYear.textContent = `${currentYear}년 ${monthNames[currentMonth]}`;
      
      // 이전 달 날짜들
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const cell = createDateCell(day, 'other-month');
        calendarGrid.appendChild(cell);
      }
      
      // 현재 달 날짜들
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = createDateCell(day, 'current-month');
        
        if (currentYear === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            day === today.getDate()) {
          cell.classList.add('today');
        }
        
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        if (dayOfWeek === 0) cell.classList.add('weekend-sun');
        if (dayOfWeek === 6) cell.classList.add('weekend-sat');
        
        cell.addEventListener('click', function() {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          showDailyDetail(dateStr, day);
        });
        
        calendarGrid.appendChild(cell);
      }
      
      // 다음 달 날짜들
      const totalCells = 42;
      const cellsUsed = firstDayOfWeek + daysInMonth;
      const remainingCells = totalCells - cellsUsed;
      
      for (let day = 1; day <= remainingCells; day++) {
        const cell = createDateCell(day, 'other-month');
        calendarGrid.appendChild(cell);
      }
      
      updateAllStatistics();
      
    } catch (error) {
      console.error('달력 렌더링 오류:', error);
    }
  }
  
  // 날짜 셀 생성
  function createDateCell(day, type) {
    const cell = document.createElement('div');
    cell.className = `date-cell ${type}`;
    
    let cellContent = `<div class="date-number">${day}</div>`;
    
    if (type === 'current-month') {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayExpenses = expenseData[dateStr] || [];
      
      if (dayExpenses.length > 0) {
        const totalAmount = calculateDayTotal(dayExpenses);
        const dutchCount = dayExpenses.filter(e => e.isDutch).length;
        
        cellContent += `<div class="expense-amount">${totalAmount.toLocaleString()}원</div>`;
        
        if (dutchCount > 0) {
          cellContent += `<div class="expense-dutch">더치 ${dutchCount}건</div>`;
        }
        
        cellContent += `<div class="expense-count">${dayExpenses.length}건</div>`;
      } else {
        cellContent += `<div class="no-expense">식비 없음</div>`;
      }
    }
    
    cell.innerHTML = cellContent;
    return cell;
  }
  
  // 하루 총 지출 계산
  function calculateDayTotal(expenses) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
  
  // 일별 상세 내역 표시
  function showDailyDetail(dateStr, day) {
    const dayExpenses = expenseData[dateStr] || [];
    
    if (dayExpenses.length === 0) {
      alert('해당 날짜에 지출 내역이 없습니다.');
      return;
    }
    
    document.getElementById('daily-detail-title').textContent = `${currentMonth + 1}월 ${day}일 상세 내역`;
    
    let content = '';
    let totalAmount = 0;
    
    dayExpenses.forEach(expense => {
      totalAmount += expense.amount;
      
      content += `
        <div class="daily-expense-item">
          <div>
            <div class="expense-store-name">${expense.store}</div>
            <div style="font-size: 0.8rem; color: #6c757d;">${expense.category}</div>
          </div>
          <div style="text-align: right;">
            ${expense.isDutch ? `<div class="expense-original-amount">${expense.originalAmount.toLocaleString()}원</div>` : ''}
            <div class="expense-final-amount">${expense.amount.toLocaleString()}원</div>
            ${expense.isDutch ? `<span class="dutch-badge">${expense.peopleCount}명 더치</span>` : ''}
          </div>
        </div>
      `;
    });
    
    content += `<div class="daily-total">총 지출: ${totalAmount.toLocaleString()}원</div>`;
    
    document.getElementById('daily-detail-content').innerHTML = content;
    dailyDetailModal.classList.add('active');
  }
  
  // 거래 내역 렌더링
  function renderTransactions() {
    const transactionList = document.getElementById('transaction-list');
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const allTransactions = [];
    let totalSpent = 0;
    let totalSavings = 0;
    
    Object.keys(expenseData).forEach(date => {
      if (date.startsWith(currentMonthStr)) {
        expenseData[date].forEach(expense => {
          allTransactions.push({ date, ...expense });
          totalSpent += expense.amount;
          
          if (expense.isDutch) {
            totalSavings += (expense.originalAmount - expense.amount);
          }
        });
      }
    });
    
    document.getElementById('transaction-total').textContent = totalSpent.toLocaleString() + '원';
    document.getElementById('dutch-savings').textContent = totalSavings.toLocaleString() + '원';
    
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allTransactions.length === 0) {
      transactionList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">이번 달 거래 내역이 없습니다.</div>';
      return;
    }
    
    let content = '';
    allTransactions.forEach(transaction => {
      content += `
        <div class="transaction-item">
          <div class="transaction-date">${transaction.date}</div>
          <div class="transaction-store">${transaction.store}</div>
          <div class="transaction-category">${transaction.category}</div>
          <div class="transaction-amount-cell">
            ${transaction.isDutch ? 
              `<div class="transaction-original-amount">${transaction.originalAmount.toLocaleString()}원</div>` : 
              ''
            }
            <div class="transaction-final-amount">${transaction.amount.toLocaleString()}원</div>
          </div>
          <div class="transaction-dutch-status">
            ${transaction.isDutch ? 
              `<span class="transaction-dutch-badge">${transaction.peopleCount}명 더치</span>` : 
              `<span class="transaction-normal-badge">일반결제</span>`
            }
          </div>
          <div class="transaction-actions">
            <button class="edit-btn">수정</button>
            <button class="delete-btn">삭제</button>
          </div>
        </div>
      `;
    });
    
    transactionList.innerHTML = content;
  }
  
  // 리포트 렌더링
  function renderReports() {
    const data = getCurrentMonthData();
    // 기존 통계 업데이트
    document.getElementById('report-total').textContent       = data.totalAmount.toLocaleString() + '원';
    document.getElementById('report-dutch-saved').textContent = data.dutchSaved.toLocaleString() + '원';
    document.getElementById('dutch-count').textContent        = data.dutchCount + '건';
    document.getElementById('total-count').textContent        = data.totalCount + '건';
    document.getElementById('dutch-ratio').textContent        = data.totalCount > 0
      ? Math.round(data.dutchCount / data.totalCount * 100) + '%' : '0%';
    document.getElementById('daily-average').textContent      = 
      Math.round(data.totalAmount / new Date().getDate()).toLocaleString() + '원';

    renderPieChart();
  }

  // 파이차트 생성
  function renderPieChart() {
    const ctx = document.getElementById('category-pie-chart');
    if (!ctx) return;

    // 기존 인스턴스 파괴
    if (ctx.chart) {
      ctx.chart.destroy();
    }

    // 임의 비율 데이터: 식비40, 생활비30, 교통비10, 기타20
    const data = {
      labels: ['식비','생활비','교통비','기타'],
      datasets: [{
        data: [40,30,10,20],
        backgroundColor: ['#3c40c6','#28a745','#3498db','#e74c3c'],
        borderWidth: 2
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth:20, padding:15 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((s,v)=>s+v,0);
              const pct = ((ctx.raw/total)*100).toFixed(1);
              return `${ctx.label}: ${ctx.raw}% (${pct}%)`;
            }
          }
        }
      }
    };

    ctx.chart = new Chart(ctx, { type:'pie', data, options });
  }

  // 리포트 페이지 활성 시 실행
  navItems.forEach(item => {
    if (item.getAttribute('data-page') === 'reports') {
      item.addEventListener('click', () => renderReports());
    }
  });

  // 초기 달력 렌더링 수행 후 통계 등 초기화
  renderCalendar();
  renderReports();


  
  // 현재 월 데이터 계산
  function getCurrentMonthData() {
    let totalAmount = 0;
    let dutchSaved = 0;
    let dutchCount = 0;
    let totalCount = 0;
    
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    Object.keys(expenseData).forEach(date => {
      if (date.startsWith(currentMonthStr)) {
        expenseData[date].forEach(expense => {
          totalCount++;
          totalAmount += expense.amount;
          
          if (expense.isDutch) {
            dutchCount++;
            dutchSaved += (expense.originalAmount - expense.amount);
          }
        });
      }
    });
    
    return { totalAmount, dutchSaved, dutchCount, totalCount };
  }
  
  // 모든 통계 및 화면 업데이트
  function updateAllStatistics() {
    const currentMonthData = getCurrentMonthData();
    
    document.getElementById('sidebar-total').textContent = currentMonthData.totalAmount.toLocaleString() + '원';
    document.getElementById('sidebar-average').textContent = currentMonthData.totalCount > 0 ? 
      Math.round(currentMonthData.totalAmount / currentMonthData.totalCount).toLocaleString() + '원' : '0원';
    
    let maxAmount = 0;
    Object.keys(expenseData).forEach(date => {
      if (date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)) {
        const dayTotal = calculateDayTotal(expenseData[date]);
        if (dayTotal > maxAmount) {
          maxAmount = dayTotal;
        }
      }
    });
    
    document.getElementById('sidebar-max').textContent = maxAmount.toLocaleString() + '원';
    document.getElementById('sidebar-dutch-saved').textContent = currentMonthData.dutchSaved.toLocaleString() + '원';
  }
  
  function updateAllData() {
    renderCalendar();
    updateAllStatistics();
    if (document.getElementById('transactions-page').classList.contains('active')) {
      renderTransactions();
    }
  }
  
  // 폼 초기화
  function resetExpenseForm() {
    document.getElementById('expense-store').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-memo').value = '';
  }
  
  // 날짜 포맷 함수
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 초기화
  initEventListeners();
  renderCalendar();
  updateAllStatistics();
});
