document.addEventListener('DOMContentLoaded', function() {
  // 현재 날짜 정보
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let expenseOverrides = {}; // key: `${date}|${store}`, value: override object
  // 데이터 저장소
  let expenseData = {};
  let selectedTransactionForDutch = null;
  let currentTransaction = null;

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

  // 백엔드 API에서 받아올 샘플 데이터 구조 (date, store, originalAmount, avgPrice만 포함)
  const sampleApiData = [
      { date: '2025-06-01', store: '이모즉석떡볶이', originalAmount: 45000, avgPrice: 8500 },
      { date: '2025-06-01', store: '가메이', originalAmount: 24000, avgPrice: 10000 },
      { date: '2025-06-02', store: '궁중보쌈', originalAmount: 18000, avgPrice: 20000 },
      { date: '2025-06-03', store: '닭살부부', originalAmount: 15000, avgPrice: 20000 },
      { date: '2025-06-04', store: '금산양꼬치', originalAmount: 36000, avgPrice: 12000 },
      { date: '2025-06-05', store: '메가커피', originalAmount: 3500, avgPrice: 5000 },
      { date: '2025-06-06', store: '구름카츠', originalAmount: 32000, avgPrice: 14000 },
      { date: '2025-06-07', store: '인하칼국수', originalAmount: 18000, avgPrice: 8000 },
      { date: '2025-06-08', store: '미식당', originalAmount: 50000, avgPrice: 11000 },
      { date: '2025-06-09', store: '커리야', originalAmount: 18500, avgPrice: 10000 },
      { date: '2025-06-10', store: '성수완당', originalAmount: 15000, avgPrice: 10000 },
      { date: '2025-06-11', store: '면식당', originalAmount: 6500, avgPrice: 8000 },
      { date: '2025-06-12', store: '킹콩순두부', originalAmount: 28000, avgPrice: 15000 },
      { date: '2025-06-13', store: '춘리마라탕', originalAmount: 12500, avgPrice: 8000 }
  ];

  // 샘플 데이터를 프론트엔드에서 처리하여 전체 거래 정보로 변환
  sampleApiData.forEach(apiData => {
      const transaction = processApiDataToTransaction(apiData, getCategoryByStore(apiData.store), '');
      if (!expenseData[transaction.date]) {
          expenseData[transaction.date] = [];
      }
      expenseData[transaction.date].push(transaction);
  });

  // 실제 API로부터 거래 데이터 가져오기
// fetch('/all-expenses')
// .then(response => response.json())
// .then(apiDataArray => {
//   apiDataArray.forEach(apiData => {
//     const transaction = processApiDataToTransaction(apiData, getCategoryByStore(apiData.store), '');
//     if (!expenseData[transaction.date]) {
//       expenseData[transaction.date] = [];
//     }
//     expenseData[transaction.date].push(transaction);
//   });

//   // 초기 렌더링 실행
//   initEventListeners();
//   renderCalendar();
//   updateSummary();
// })
function fetchExpenseDataAndRender() {
  fetch('/all-expenses')
    .then(response => {
      if (!response.ok) throw new Error('서버 응답 실패');
      return response.json();
    })
    .then(serverData => {
      const mergedData = [...serverData, ...sampleApiData]; 
      // const mergedData = [...serverData]; // ✅ 서버 + 샘플 데이터 합치기
      updateExpenseDataFromApi(mergedData);  // 👈 결합된 데이터를 렌더링
    })
    .catch(error => {
      console.warn('[경고] 서버 오류, 샘플 데이터만 사용:', error.message);
      updateExpenseDataFromApi(sampleApiData); // 👈 서버 오류 시 샘플만 사용
    });
}
function updateExpenseDataFromApi(apiDataArray) {
  expenseData = {};

  apiDataArray.forEach(apiData => {
    const transaction = processApiDataToTransaction(apiData, getCategoryByStore(apiData.store), '');

    // override 적용
    const key = `${transaction.date}|${transaction.store}`;
    if (expenseOverrides[key]) {
      Object.assign(transaction, expenseOverrides[key]);
    }

    if (!expenseData[transaction.date]) {
      expenseData[transaction.date] = [];
    }
    expenseData[transaction.date].push(transaction);
  });

  renderCalendar();
  updateSummary();
}
// .catch(error => {
//   console.error('데이터 불러오기 실패:', error);
//   alert('서버로부터 거래 데이터를 불러오는 데 실패했습니다.');
// });

  const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  // API 데이터를 전체 거래 정보로 변환하는 함수
  function processApiDataToTransaction(apiData, category = '기타', memo = '') {
      // 더치페이 적용 여부 결정 (원금액이 평균가보다 크면서 랜덤하게 일부만 더치페이 적용)
      const shouldApplyDutch = apiData.originalAmount > apiData.avgPrice //&& Math.random() > 0.5;
      
    if (shouldApplyDutch) {
        // 2) 자동 인원 수 계산 (2명~10명)
        const rawCount = Math.ceil(apiData.originalAmount / apiData.avgPrice);                                  // [1]
        const peopleCount = Math.min(10, Math.max(2, rawCount));         
          return {
              date: apiData.date,
              store: apiData.store,
              originalAmount: apiData.originalAmount,
              avgPrice: apiData.avgPrice,
              category: category,
              isDutch: true,
              peopleCount: peopleCount,
              finalAmount: Math.round(apiData.originalAmount / peopleCount),
              memo: memo
          };
      } else {
          return {
              date: apiData.date,
              store: apiData.store,
              originalAmount: apiData.originalAmount,
              avgPrice: apiData.avgPrice,
              category: category,
              isDutch: false,
              peopleCount: 1,
              finalAmount: apiData.originalAmount,
              memo: memo
          };
      }
  }

  // 가게명으로 카테고리 추정하는 함수
  function getCategoryByStore(storeName) {
      if (storeName.includes('버스') || storeName.includes('지하철') || storeName.includes('택시') || storeName.includes('역')) {
          return '교통비';
      } else if (storeName.includes('마트') || storeName.includes('쿠팡') || storeName.includes('올리브영') || storeName.includes('문구')) {
          return '생활비';
      } else if (storeName.includes('스타벅스') || storeName.includes('커피') || storeName.includes('김밥') || storeName.includes('치킨') || storeName.includes('마라탕') || storeName.includes('BHC') || storeName.includes('마켓컬리') || storeName.includes('스무디')) {
          return '식비';
      } else {
          return '기타';
      }
  }

  // // 임시 함수: 가게 평균 가격 계산 (실제로는 API에서 받아옴)
  // function getStoreAvgPrice(storeName, amount) {
  //     // 실제 구현에서는 이 부분이 API 호출 결과로 대체됩니다
  //     const factor = 0.7 + Math.random() * 0.6; // 0.7 ~ 1.3
  //     return Math.round(amount * factor);
  // }

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

      // 저장 버튼 - API 통합 처리
      document.querySelector('.save-btn').addEventListener('click', () => {
          const date = document.getElementById('expense-date').value;
          const store = document.getElementById('expense-store').value;
          const amount = parseInt(document.getElementById('expense-amount').value);
          const category = document.getElementById('expense-category').value;
          const memo = document.getElementById('expense-memo').value;

          if (!date || !store || !amount) {
              alert('필수 정보를 입력해주세요.');
              return;
          }

          // 백엔드 API에서 평균 가격 정보 받아오기 (임시로 함수 호출)
          const avgPrice = getStoreAvgPrice(store, amount);

          // 새 거래 생성 (백엔드 API 형식)
          const apiData = {
              date: date,
              store: store,
              originalAmount: amount,
              avgPrice: avgPrice
          };

          currentTransaction = {
              date: date,
              store: store,
              originalAmount: amount,
              avgPrice: avgPrice,
          };

          expenseModal.classList.remove('active');

          // originalAmount가 avgPrice보다 크면 더치페이 확인
          if (amount > avgPrice && document.getElementById('auto-dutch-check').checked) {
              showDutchConfirmModal(currentTransaction);
          } else {
              addTransactionToData(currentTransaction);
              renderCalendar();
              updateSummary();
              currentTransaction = null;
          }
      });

      // 더치페이 버튼
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
          
          // 모달 닫을 때 현재 거래 바로 저장 (더치페이 안함)
          if (currentTransaction) {
              addTransactionToData(currentTransaction);
              renderCalendar();
              updateSummary();
              currentTransaction = null;
          }
      });

      // 인원수 조절 버튼
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

      // 인원수 직접 입력 시 검증
      document.getElementById('dutch-people-count').addEventListener('input', function() {
          let value = this.value;
          value = value.replace(/[^0-9]/g, '');
          
          if (value === '') {
              this.value = '';
              return;
          }
          
          let numValue = parseInt(value);
          if (numValue < 2) {
              numValue = 2;
          } else if (numValue > 10) {
              numValue = 10;
          }
          
          this.value = numValue;
          updateDutchCalculation();
      });

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

      // 필터 관련 이벤트
      document.getElementById('clear-filters').addEventListener('click', () => {
          document.getElementById('category-filter').value = '';
          document.getElementById('dutch-filter').value = '';
          renderTransactions();
      });

      document.getElementById('category-filter').addEventListener('change', renderTransactions);
      document.getElementById('dutch-filter').addEventListener('change', renderTransactions);

      // 모달 외부 클릭시 닫기
      [expenseModal, dutchConfirmModal, dutchTransactionModal, dailyDetailModal].forEach(modal => {
          modal.addEventListener('click', function(e) {
              if (e.target === modal) {
                  modal.classList.remove('active');
                  
                  // 더치페이 모달이 닫힐 때 현재 거래 처리
                  if (modal === dutchConfirmModal && currentTransaction) {
                      addTransactionToData(currentTransaction);
                      renderCalendar();
                      updateSummary();
                      currentTransaction = null;
                  }
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
      const dayTransactions = expenseData[dateStr] || [];
      
      if (dayTransactions.length === 0) {
          listContainer.innerHTML = '<div class="no-transactions">해당 날짜에 거래 내역이 없습니다.</div>';
          return;
      }
      
      let content = '';
      dayTransactions.forEach((transaction, index) => {
          content += `
              <div class="transaction-select-item" data-date="${dateStr}" data-index="${index}">
                  <div class="transaction-select-info">
                      <div class="transaction-select-store">${transaction.store}</div>
                      <div class="transaction-select-category">${transaction.category}</div>
                  </div>
                  <div class="transaction-select-amount">
                      ${formatCurrency(transaction.originalAmount)}
                      ${transaction.isDutch ? '<span class="transaction-select-dutch">더치페이</span>' : ''}
                  </div>
              </div>
          `;
      });
      
      listContainer.innerHTML = content;
      
      // 거래 선택 이벤트 추가
      listContainer.querySelectorAll('.transaction-select-item').forEach(item => {
          item.addEventListener('click', function() {
              const date = this.dataset.date;
              const index = parseInt(this.dataset.index);
              const transaction = expenseData[date][index];
              
              selectedTransactionForDutch = {date, index, transaction};
              
              // 선택 표시
              listContainer.querySelectorAll('.transaction-select-item').forEach(i => i.classList.remove('selected'));
              this.classList.add('selected');
              
              // 더치페이 확인 모달로 이동
              dutchTransactionModal.classList.remove('active');
              showDutchConfirmModal(transaction);
          });
      });
  }

  // 더치페이 확인 모달 표시
  function showDutchConfirmModal(transaction) {
      document.getElementById('store-name').textContent = transaction.store;
      document.getElementById('store-avg-price').textContent = formatCurrency(transaction.avgPrice);
      document.getElementById('original-amount').textContent = formatCurrency(transaction.originalAmount);
      document.getElementById('dutch-people-count').value = 2;
      
      // 현재 거래 정보 저장
      dutchConfirmModal.transaction = transaction;
      
      updateDutchCalculation();
      dutchConfirmModal.classList.add('active');
  }

  // 더치페이 계산 업데이트
  function updateDutchCalculation() {
      const peopleCount = parseInt(document.getElementById('dutch-people-count').value) || 2;
      const transaction = dutchConfirmModal.transaction || currentTransaction;
      
      if (transaction) {
          const myAmount = Math.round(transaction.originalAmount / peopleCount);
          const savings = transaction.originalAmount - myAmount;
          
          document.getElementById('dutch-my-amount').textContent = formatCurrency(myAmount);
          document.getElementById('dutch-savings-amount').textContent = formatCurrency(savings);
      }
  }

// ✅ 더치페이 시뮬레이션 후 인원 수 적용이 안 되는 문제 수정
function applyDutchPay(isDutch, peopleCount = 1) {
  let transaction;
  if (currentTransaction) {
    transaction = currentTransaction;
  } else if (selectedTransactionForDutch) {
    const { date, index } = selectedTransactionForDutch;
    transaction = expenseData[date][index];
  }

  if (transaction) {
    const key = `${transaction.date}|${transaction.store}`;

    if (isDutch) {
      expenseOverrides[key] = {
        isDutch: true,
        peopleCount: peopleCount,
        finalAmount: Math.round(transaction.originalAmount / peopleCount)
      };
    } else {
      expenseOverrides[key] = {
        isDutch: false,
        peopleCount: 1,
        finalAmount: transaction.originalAmount
      };
    }
  }

  dutchConfirmModal.classList.remove('active');
  renderCalendar();
  updateSummary();
  renderTransactions();
  currentTransaction = null;
  selectedTransactionForDutch = null;
}

  // 데이터에 거래 추가
  function addTransactionToData(transaction) {
      if (!expenseData[transaction.date]) {
          expenseData[transaction.date] = [];
      }
      expenseData[transaction.date].push(transaction);
  }

  // 달력 렌더링
  function renderCalendar() {
      const year = currentYear;
      const month = currentMonth;
      
      currentMonthYear.textContent = `${year}년 ${monthNames[month]}`;
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      let content = '';
      const today = new Date();
      
      for (let i = 0; i < 42; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          
          const dateStr = formatDate(currentDate);
          const dayTransactions = expenseData[dateStr] || [];
          const totalAmount = dayTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
          const dutchSavings = dayTransactions.reduce((sum, t) => {
              return t.isDutch ? sum + (t.originalAmount - t.finalAmount) : sum;
          }, 0);
          
          const isToday = currentDate.toDateString() === today.toDateString();
          const isCurrentMonth = currentDate.getMonth() === month;
          const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
          
          let classes = 'date-cell';
          if (isToday) classes += ' today';
          if (!isCurrentMonth) classes += ' other-month';
          if (isWeekend && currentDate.getDay() === 0) classes += ' weekend-sun';
          if (isWeekend && currentDate.getDay() === 6) classes += ' weekend-sat';
          
          content += `
              <div class="${classes}" data-date="${dateStr}">
                  <div class="date-number">${currentDate.getDate()}</div>
                  ${totalAmount > 0 ? 
                      `<div class="expense-amount">${formatCurrency(totalAmount)}</div>` +
                      (dutchSavings > 0 ? `<div class="expense-dutch">절약 ${formatCurrency(dutchSavings)}</div>` : '') +
                      `<div class="expense-count">${dayTransactions.length}건</div>`
                      : '<div class="no-expense">지출 없음</div>'
                  }
              </div>
          `;
      }
      
      calendarGrid.innerHTML = content;
      updateSummary();
      
      // 날짜 클릭 이벤트 추가
      calendarGrid.querySelectorAll('.date-cell').forEach(cell => {
          cell.addEventListener('click', function() {
              const dateStr = this.dataset.date;
              const dayTransactions = expenseData[dateStr] || [];
              
              if (dayTransactions.length > 0) {
                  showDailyDetail(dateStr, dayTransactions);
              }
          });
      });
  }

  // 일별 상세 보기
  function showDailyDetail(dateStr, transactions) {
      const date = new Date(dateStr);
      const title = `${date.getMonth() + 1}월 ${date.getDate()}일 상세`;
      document.getElementById('daily-detail-title').textContent = title;
      
      let content = '';
      let totalAmount = 0;
      let totalSavings = 0;
      
      transactions.forEach(transaction => {
          totalAmount += transaction.finalAmount;
          if (transaction.isDutch) {
              totalSavings += (transaction.originalAmount - transaction.finalAmount);
          }
          
          content += `
              <div class="daily-expense-item">
                  <div>
                      <div class="expense-store-name">${transaction.store}</div>
                      ${transaction.isDutch ? 
                          `<div class="expense-original-amount">원금액: ${formatCurrency(transaction.originalAmount)}</div>` : ''
                      }
                      <div class="expense-final-amount">${formatCurrency(transaction.finalAmount)}</div>
                  </div>
                  <div>
                      ${transaction.isDutch ? `<span class="dutch-badge">더치페이 ${transaction.peopleCount}명</span>` : ''}
                      <span class="category-badge">${transaction.category}</span>
                  </div>
              </div>
          `;
      });
      
      content += `
          <div class="daily-total">
              총 지출: ${formatCurrency(totalAmount)}
              ${totalSavings > 0 ? ` | 절약: ${formatCurrency(totalSavings)}` : ''}
          </div>
      `;
      
      document.getElementById('daily-detail-content').innerHTML = content;
      dailyDetailModal.classList.add('active');
  }

  // 요약 정보 업데이트
  function updateSummary() {
      const currentMonthTransactions = getCurrentMonthTransactions();
      const totalAmount = currentMonthTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
      const totalSavings = currentMonthTransactions.reduce((sum, t) => {
          return t.isDutch ? sum + (t.originalAmount - t.finalAmount) : sum;
      }, 0);
      
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const avgDaily = Math.round(totalAmount / daysInMonth);
      
      const maxDayAmount = Math.max(...Object.keys(expenseData)
          .filter(date => date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`))
          .map(date => expenseData[date].reduce((sum, t) => sum + t.finalAmount, 0)));
      
      document.getElementById('sidebar-total').textContent = formatCurrency(totalAmount);
      document.getElementById('sidebar-avg').textContent = formatCurrency(avgDaily);
      document.getElementById('sidebar-max').textContent = formatCurrency(maxDayAmount || 0);
      document.getElementById('sidebar-savings').textContent = formatCurrency(totalSavings);
  }

  // 현재 월 거래 데이터 가져오기
  function getCurrentMonthTransactions() {
      const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      let transactions = [];
      
      Object.keys(expenseData).forEach(date => {
          if (date.startsWith(monthPrefix)) {
              transactions = transactions.concat(expenseData[date]);
          }
      });
      
      return transactions;
  }

  // 거래 내역 렌더링
  function renderTransactions() {
      const currentMonthTransactions = getCurrentMonthTransactions();
      
      // 필터 적용
      const categoryFilter = document.getElementById('category-filter').value;
      const dutchFilter = document.getElementById('dutch-filter').value;
      
      let filteredTransactions = [...currentMonthTransactions];
      
      if (categoryFilter) {
          filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
      }
      
      if (dutchFilter !== '') {
          const isDutch = dutchFilter === 'true';
          filteredTransactions = filteredTransactions.filter(t => t.isDutch === isDutch);
      }
      
      const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
      const totalSavings = filteredTransactions.reduce((sum, t) => {
          return t.isDutch ? sum + (t.originalAmount - t.finalAmount) : sum;
      }, 0);
      
      document.getElementById('monthly-total').textContent = formatCurrency(totalAmount);
      document.getElementById('monthly-savings').textContent = formatCurrency(totalSavings);
      
      const transactionList = document.getElementById('transaction-list');
      let content = '';
      
      // 날짜순으로 정렬
      const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      sortedTransactions.forEach(transaction => {
          content += `
              <div class="transaction-item">
                  <div class="transaction-date">${formatDateKr(transaction.date)}</div>
                  <div class="transaction-store">${transaction.store}</div>
                  <div class="transaction-original-amount">
                      ${transaction.isDutch ? formatCurrency(transaction.originalAmount) : ''}
                  </div>
                  <div class="transaction-final-amount">${formatCurrency(transaction.finalAmount)}</div>
                  <div class="transaction-category">${transaction.category}</div>
                  <div class="${transaction.isDutch ? 'transaction-dutch-badge' : 'transaction-normal-badge'}">
                      ${transaction.isDutch ? `더치페이 ${transaction.peopleCount}명` : '일반결제'}
                  </div>
              </div>
          `;
      });
      
      transactionList.innerHTML = content || '<div class="no-data">거래 내역이 없습니다.</div>';
  }

  // 리포트 렌더링
  function renderReports() {
      const currentMonthTransactions = getCurrentMonthTransactions();
      const totalAmount = currentMonthTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
      const totalSavings = currentMonthTransactions.reduce((sum, t) => {
          return t.isDutch ? sum + (t.originalAmount - t.finalAmount) : sum;
      }, 0);
      
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const avgDaily = Math.round(totalAmount / daysInMonth);
      
      // 최고 지출일 찾기
      const dailyTotals = {};
      currentMonthTransactions.forEach(t => {
          if (!dailyTotals[t.date]) {
              dailyTotals[t.date] = 0;
          }
          dailyTotals[t.date] += t.finalAmount;
      });
      
      const maxDay = Object.keys(dailyTotals).reduce((maxDate, date) => {
          return dailyTotals[date] > (dailyTotals[maxDate] || 0) ? date : maxDate;
      }, '');
      
      document.getElementById('report-total').textContent = formatCurrency(totalAmount);
      document.getElementById('report-savings').textContent = formatCurrency(totalSavings);
      document.getElementById('report-daily-avg').textContent = formatCurrency(avgDaily);
      document.getElementById('report-max-day').textContent = maxDay ? 
          `${formatDateKr(maxDay)} (${formatCurrency(dailyTotals[maxDay])})` : '-';
      
      // 더치페이 분석
      const dutchCount = currentMonthTransactions.filter(t => t.isDutch).length;
      const totalCount = currentMonthTransactions.length;
      const dutchRatio = totalCount > 0 ? Math.round((dutchCount / totalCount) * 100) : 0;
      
      document.getElementById('dutch-count').textContent = `${dutchCount}건`;
      document.getElementById('total-count').textContent = `${totalCount}건`;
      document.getElementById('dutch-ratio').textContent = `${dutchRatio}%`;
      
      // 카테고리별 지출 파이차트 (요청한 고정 비율)
      renderCategoryPieChart();
  }

  // 카테고리별 지출 파이차트 (요청한 고정 비율로 구현)
  function renderCategoryPieChart() {
      const ctx = document.getElementById('category-pie-chart');
      if (!ctx) return;
      
      const context = ctx.getContext('2d');
      
      // 기존 차트 있으면 제거
      if (window.categoryChart) {
          window.categoryChart.destroy();
      }
      
      // 요청한 고정 비율로 차트 데이터 설정: 식비 40%, 교통비 10%, 생활비 30%, 기타 20%
      const data = {
          labels: ['식비', '교통비', '생활비', '기타'],
          datasets: [{
              data: [40, 10, 30, 20],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
          }]
      };
      
      window.categoryChart = new Chart(context, {
          type: 'pie',
          data: data,
          options: {
              responsive: true,
              plugins: {
                  legend: {
                      position: 'bottom',
                  },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              return `${label}: ${value}%`;
                          }
                      }
                  }
              }
          }
      });
  }

// 유틸 함수들
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateKr(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }



  // 초기화
  function init() {
      initEventListeners();
      renderCalendar();
      updateSummary();
  }

  // 앱 시작
  // init();
  // 초기화
  function init() {
    initEventListeners();
    fetchExpenseDataAndRender(); // 첫 실행
    setInterval(fetchExpenseDataAndRender, 1000); // 1초마다 갱신
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    init(); // ✅ DOM이 완전히 로드된 후 실행
  });
  init();
});
