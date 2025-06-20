document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 정보
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let expenseOverrides = loadExpenseOverrides();

    // 데이터 저장소
    let expenseData = loadExpenseData(); // localStorage에서 데이터 로드
    let selectedTransactionForDutch = null;
    let currentTransaction = null;
    let isProcessingDutch = false;
    let pendingTransactions = [];

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

    // 백엔드 API에서 받아올 샘플 데이터 구조
    const sampleApiData = [
  {
    date: '2025-06-01', store: '이모즉석떡볶이',
    originalAmount: 45000, avgPrice: 8500,
    isSample: true, isDutch: true, peopleCount: 5, finalAmount: 9000
  },
  {
    date: '2025-06-01', store: '가메이',
    originalAmount: 24000, avgPrice: 10000,
    isSample: true, isDutch: false, peopleCount: 2, finalAmount:12000
  },
  {
    date: '2025-06-02', store: '궁중보쌈',
    originalAmount: 18000, avgPrice: 20000,
    isSample: true, isDutch: false, peopleCount: 1, finalAmount: 18000
  },
  {
    date: '2025-06-03', store: '닭살부부',
    originalAmount: 15000, avgPrice: 20000,
    isSample: true, isDutch: false, peopleCount: 1, finalAmount: 15000
  },
  {
    date: '2025-06-04', store: '금산양꼬치',
    originalAmount: 36000, avgPrice: 12000,
    isSample: true, isDutch: true, peopleCount: 4, finalAmount: 9000
  },
  {
    date: '2025-06-05', store: '메가커피',
    originalAmount: 3500, avgPrice: 5000,
    isSample: true, isDutch: false, peopleCount: 1, finalAmount: 3500
  },
  {
    date: '2025-06-06', store: '구름카츠',
    originalAmount: 32000, avgPrice: 14000,
    isSample: true, isDutch: true, peopleCount: 4, finalAmount: 8000
  },
  {
    date: '2025-06-07', store: '인하칼국수',
    originalAmount: 18000, avgPrice: 8000,
    isSample: true, isDutch: true, peopleCount: 3, finalAmount: 6000
  },
  {
    date: '2025-06-08', store: '미식당',
    originalAmount: 50000, avgPrice: 11000,
    isSample: true, isDutch: true, peopleCount: 5, finalAmount: 10000
  },
  {
    date: '2025-06-09', store: '커리야',
    originalAmount: 18500, avgPrice: 10000,
    isSample: true, isDutch: true, peopleCount: 1, finalAmount: 18500
  },
  {
    date: '2025-06-10', store: '성수완당',
    originalAmount: 15000, avgPrice: 10000,
    isSample: true, isDutch: true, peopleCount: 1, finalAmount: 15000
  },
  {
    date: '2025-06-11', store: '면식당',
    originalAmount: 6500, avgPrice: 8000,
    isSample: true, isDutch: false, peopleCount: 1, finalAmount: 6500
  },
  {
    date: '2025-06-12', store: '킹콩순두부',
    originalAmount: 28000, avgPrice: 15000,
    isSample: true, isDutch: true, peopleCount: 4, finalAmount: 7000
  },
  {
    date: '2025-06-13', store: '춘리마라탕',
    originalAmount: 12500, avgPrice: 8000,
    isSample: true, isDutch: true, peopleCount: 1, finalAmount: 12500
  }
];

    const monthNames = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];

    // 데이터 저장/로드 함수들
    function saveExpenseData() {
        try {
            localStorage.setItem('expenseData', JSON.stringify(expenseData));
        } catch (e) {
            console.error('데이터 저장 실패:', e);
        }
    }

    function loadExpenseData() {
        try {
            const data = localStorage.getItem('expenseData');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('데이터 로드 실패:', e);
            return {};
        }
    }

    // 더치페이 확인 함수
function confirmDutchPay(apiData, callback) {
    if (isProcessingDutch) return;
    isProcessingDutch = true;
    
    // 브라우저 내장 confirm 대신 모달 사용
    const modal = document.getElementById('dutch-confirm-modal');
    if (!modal) {
        console.error('dutch-confirm-modal 요소를 찾을 수 없습니다.');
        isProcessingDutch = false;
        callback(false, 1);
        return;
    }
    
    // 모달 내용 설정
    const storeNameEl = document.getElementById('store-name');
    const storeAvgPriceEl = document.getElementById('store-avg-price');
    const originalAmountEl = document.getElementById('original-amount');
    
    if (storeNameEl) storeNameEl.textContent = apiData.store;
    if (storeAvgPriceEl) storeAvgPriceEl.textContent = formatCurrency(apiData.avgPrice);
    if (originalAmountEl) originalAmountEl.textContent = formatCurrency(apiData.originalAmount);
    
    const peopleCountInput = document.getElementById('dutch-people-count');
    if (peopleCountInput) {
        peopleCountInput.value = 2;
    }
    
    // 콜백 저장
    modal.callback = callback;
    modal.apiData = apiData;
    
    // 계산 업데이트 및 모달 표시
    updateDutchCalculation();
    modal.classList.add('active');
    
    // 이벤트 리스너 설정 (한 번만 등록되도록)
    if (!modal.hasListeners) {
        const yesBtn = modal.querySelector('.dutch-yes-btn');
        const noBtn = modal.querySelector('.dutch-no-btn');
        
        if (yesBtn) {
            yesBtn.addEventListener('click', function() {
                const peopleCount = parseInt(document.getElementById('dutch-people-count').value) || 2;
                modal.classList.remove('active');
                isProcessingDutch = false;
                if (modal.callback) modal.callback(true, peopleCount);
            });
        }
        
        if (noBtn) {
            noBtn.addEventListener('click', function() {
                modal.classList.remove('active');
                isProcessingDutch = false;
                if (modal.callback) modal.callback(false, 1);
            });
        }
        
        modal.hasListeners = true;
    }
}

    // API 데이터를 전체 거래 정보로 변환하는 함수 (더치페이 확인 포함)
    function processApiDataToTransaction(apiData, category = '기타', memo = '', callback) {
  // 1) 샘플 데이터는 모달 없이 바로 처리
  if (apiData.isSample) {
    const transaction = {
      date: apiData.date,
      store: apiData.store,
      originalAmount: apiData.originalAmount,
      avgPrice: apiData.avgPrice,
      category: category,
      isDutch: apiData.isDutch,
      peopleCount: apiData.peopleCount,
      finalAmount: apiData.finalAmount,
      memo: memo
    };
    // 비동기 처리 패턴 유지
    setTimeout(() => callback(transaction), 0);
    return;
  }

  // 2) 실제 API 데이터는 기존 로직 수행
  if (apiData.originalAmount > apiData.avgPrice) {
    confirmDutchPay(apiData, (isDutch, peopleCount) => {
      const finalAmt = isDutch
        ? Math.round(apiData.originalAmount / peopleCount)
        : apiData.originalAmount;
      const transaction = {
        date: apiData.date,
        store: apiData.store,
        originalAmount: apiData.originalAmount,
        avgPrice: apiData.avgPrice,
        category: category,
        isDutch: isDutch,
        peopleCount: peopleCount,
        finalAmount: finalAmt,
        memo: memo
      };
      callback(transaction);
    });
  } else {
    // 평균가 이하 결제인 경우
    const transaction = {
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
    setTimeout(() => callback(transaction), 0);
  }
}

    // 순차적으로 API 데이터 처리
    function processApiDataSequentially(apiDataArray, index = 0) {
        if (index >= apiDataArray.length) {
            saveExpenseData(); // 처리 완료 후 데이터 저장
            renderCalendar();
            updateSummary();
            return;
        }

        const apiData = apiDataArray[index];
        const category = getCategoryByStore(apiData.store);
        
        processApiDataToTransaction(apiData, category, '', (transaction) => {
            // override 적용
            const key = `${transaction.date}|${transaction.store}`;
            if (expenseOverrides[key]) {
                Object.assign(transaction, expenseOverrides[key]);
            }

            if (!expenseData[transaction.date]) {
                expenseData[transaction.date] = [];
            }
            expenseData[transaction.date].push(transaction);
            
            // 다음 데이터 처리
            setTimeout(() => processApiDataSequentially(apiDataArray, index + 1), 50);
        });
    }

    // 데이터 가져오기 및 렌더링
function fetchExpenseDataAndRender() {
  fetch('/all-expenses')
    .then(response => {
      if (!response.ok) throw new Error('서버 응답 실패');
      return response.json();
    })
    .then(serverData => {
      const mergedData = [...serverData, ...sampleApiData];
      updateExpenseDataFromApi(mergedData);
    })
    .catch(error => {
      console.warn('[경고] 서버 오류, 샘플 데이터만 사용:', error.message);
      // 샘플 데이터만 있을 때도 같은 로직 적용
      updateExpenseDataFromApi(sampleApiData);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM이 로드되었습니다.');

    // 현재 날짜 정보
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // 데이터 로드
    let expenseOverrides = loadExpenseOverrides();
    let expenseData = loadExpenseData();
    let selectedTransactionForDutch = null;
    let currentTransaction = null;
    let isProcessingDutch = false;

    // DOM 요소 초기화 확인
    console.log('dutchConfirmModal:', document.getElementById('dutch-confirm-modal'));
    console.log('dutchTransactionModal:', document.getElementById('dutch-transaction-modal'));
    console.log('demoDutchBtn:', document.querySelector('.demo-dutch-btn'));

    // 이벤트 리스너 초기화
    initEventListeners();
    console.log('이벤트 리스너가 초기화되었습니다.');

    // 달력 렌더링
    renderCalendar();

    // 요약 정보 업데이트
    updateSummary();

    // 데이터 가져오기
    fetchExpenseDataAndRender();
});    

    function updateExpenseDataFromApi(apiDataArray) {
        expenseData = {};
        processApiDataSequentially(apiDataArray);
    }

    // expense overrides 로드/저장 함수들
    function loadExpenseOverrides() {
        try {
            return JSON.parse(localStorage.getItem('expenseOverrides') || '{}');
        } catch {
            return {};
        }
    }

    function saveExpenseOverrides() {
        localStorage.setItem('expenseOverrides', JSON.stringify(expenseOverrides));
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

    // 임시 함수: 가게 평균 가격 계산
    function getStoreAvgPrice(storeName, amount) {
        const factor = 0.7 + Math.random() * 0.6;
        return Math.round(amount * factor);
    }

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

        // 저장 버튼
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

            const avgPrice = getStoreAvgPrice(store, amount);
            const apiData = { date, store, originalAmount: amount, avgPrice };

            currentTransaction = { date, store, originalAmount: amount, avgPrice };
            expenseModal.classList.remove('active');

            if (amount > avgPrice && document.getElementById('auto-dutch-check').checked) {
                showDutchConfirmModal(currentTransaction);
            } else {
                processApiDataToTransaction(apiData, category, memo, (transaction) => {
                    addTransactionToData(transaction);
                    saveExpenseData(); // 거래 추가 후 저장
                    renderCalendar();
                    updateSummary();
                    currentTransaction = null;
                });
            }
        });

        // 더치페이 버튼
    const demoDutchBtn = document.querySelector('.demo-dutch-btn');
    if (demoDutchBtn) {
        demoDutchBtn.addEventListener('click', function() {
            showDutchTransactionModal();
        });
        console.log('더치페이 시뮬레이션 버튼 이벤트 리스너가 등록되었습니다.');
    } else {
        console.error('더치페이 시뮬레이션 버튼을 찾을 수 없습니다.');
    }

        // 더치페이 거래 선택 모달
        if (document.getElementById('dutch-transaction-close')) {
            document.getElementById('dutch-transaction-close').addEventListener('click', () => {
                dutchTransactionModal.classList.remove('active');
            });
        }

        // 날짜 선택 시 거래 목록 업데이트
        if (document.getElementById('dutch-date-select')) {
            document.getElementById('dutch-date-select').addEventListener('change', function() {
                const selectedDate = this.value;
                renderTransactionSelectList(selectedDate);
            });
        }

        // 더치페이 확인 모달 이벤트
        if (document.getElementById('dutch-close-btn')) {
            document.getElementById('dutch-close-btn').addEventListener('click', () => {
                dutchConfirmModal.classList.remove('active');
                
                if (currentTransaction) {
                    addTransactionToData(currentTransaction);
                    saveExpenseData(); // 거래 추가 후 저장
                    renderCalendar();
                    updateSummary();
                    currentTransaction = null;
                }
            });
        }

        // 인원수 조절 버튼
        document.querySelectorAll('.people-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const countInput = document.getElementById('dutch-people-count');
                if (countInput) {
                    const currentCount = parseInt(countInput.value) || 2;
                    
                    if (this.dataset.count === 'plus' && currentCount < 10) {
                        countInput.value = currentCount + 1;
                    } else if (this.dataset.count === 'minus' && currentCount > 2) {
                        countInput.value = currentCount - 1;
                    }
                    updateDutchCalculation();
                }
            });
        });

        // 인원수 직접 입력 시 검증
        if (document.getElementById('dutch-people-count')) {
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
        }

        // 더치페이 선택 버튼
        if (document.querySelector('.dutch-no-btn')) {
            document.querySelector('.dutch-no-btn').addEventListener('click', () => {
                applyDutchPay(false);
            });
        }

        if (document.querySelector('.dutch-yes-btn')) {
            document.querySelector('.dutch-yes-btn').addEventListener('click', () => {
                const peopleCount = parseInt(document.getElementById('dutch-people-count').value) || 2;
                applyDutchPay(true, peopleCount);
            });
        }

        // 일별 상세 모달
        if (document.getElementById('daily-detail-close')) {
            document.getElementById('daily-detail-close').addEventListener('click', () => {
                dailyDetailModal.classList.remove('active');
            });
        }

        // 필터 관련 이벤트
        if (document.getElementById('clear-filters')) {
            document.getElementById('clear-filters').addEventListener('click', () => {
                document.getElementById('category-filter').value = '';
                document.getElementById('dutch-filter').value = '';
                renderTransactions();
            });

            if (document.getElementById('category-filter')) {
                document.getElementById('category-filter').addEventListener('change', renderTransactions);
            }
            if (document.getElementById('dutch-filter')) {
                document.getElementById('dutch-filter').addEventListener('change', renderTransactions);
            }
        }

        // 모달 외부 클릭시 닫기
        [expenseModal, dutchConfirmModal, dutchTransactionModal, dailyDetailModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                        
                        if (modal === dutchConfirmModal && currentTransaction) {
                            addTransactionToData(currentTransaction);
                            saveExpenseData(); // 거래 추가 후 저장
                            renderCalendar();
                            updateSummary();
                            currentTransaction = null;
                        }
                    }
                });
            }
        });
    }

    // 더치페이 거래 선택 모달 표시
    function showDutchTransactionModal() {
    const modal = document.getElementById('dutch-transaction-modal');
    if (modal) {
        modal.classList.add('active');
        const dateSelect = document.getElementById('dutch-date-select');
        if (dateSelect) {
            dateSelect.value = formatDate(today);
            renderTransactionSelectList(formatDate(today));
        }
    } else {
        console.error('dutch-transaction-modal 요소를 찾을 수 없습니다.');
    }
}

// 거래 선택 리스트 렌더링 (날짜 오프셋 문제 수정)
function renderTransactionSelectList(dateStr) {
    const listContainer = document.getElementById('dutch-transaction-list');
    if (!listContainer) return;

    const dayTransactions = expenseData[dateStr] || [];
    
    // 선택된 날짜를 명확히 표시
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
    
    if (dayTransactions.length === 0) {
        listContainer.innerHTML = `
            <div class="no-transactions">
                <h4>${formattedDate}</h4>
                <p>해당 날짜에 거래 내역이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    let content = `<div class="transaction-date-header"><h4>${formattedDate} 거래 내역</h4></div>`;
    
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
        const modal = document.getElementById('dutch-confirm-modal');
        if (!modal) {
          console.error('dutch-confirm-modal 요소를 찾을 수 없습니다.');
         return;
    }

    const storeNameEl = document.getElementById('store-name');
    const storeAvgPriceEl = document.getElementById('store-avg-price');
    const originalAmountEl = document.getElementById('original-amount');
    
    if (storeNameEl) storeNameEl.textContent = transaction.store;
    if (storeAvgPriceEl) storeAvgPriceEl.textContent = formatCurrency(transaction.avgPrice);
    if (originalAmountEl) originalAmountEl.textContent = formatCurrency(transaction.originalAmount);
    
    const peopleCountInput = document.getElementById('dutch-people-count');
    if (peopleCountInput) {
        peopleCountInput.value = 2;
    }
    
    modal.transaction = transaction;
    
    updateDutchCalculation();
    modal.classList.add('active');
    }

    // 더치페이 계산 업데이트
    function updateDutchCalculation() {
        const peopleCountInput = document.getElementById('dutch-people-count');
        if (!peopleCountInput) return;

        const peopleCount = parseInt(peopleCountInput.value) || 2;
        const transaction = dutchConfirmModal?.transaction || currentTransaction;
        
        if (transaction) {
            const myAmount = Math.round(transaction.originalAmount / peopleCount);
            const savings = transaction.originalAmount - myAmount;
            
            if (document.getElementById('dutch-my-amount')) {
                document.getElementById('dutch-my-amount').textContent = formatCurrency(myAmount);
            }
            if (document.getElementById('dutch-savings-amount')) {
                document.getElementById('dutch-savings-amount').textContent = formatCurrency(savings);
            }
        }
    }

    // 더치페이 적용
    function applyDutchPay(isDutch, peopleCount = 1) {
        if (currentTransaction) {
            if (isDutch) {
                currentTransaction.isDutch = true;
                currentTransaction.peopleCount = peopleCount;
                currentTransaction.finalAmount = Math.round(currentTransaction.originalAmount / peopleCount);
            } else {
                currentTransaction.isDutch = false;
                currentTransaction.peopleCount = 1;
                currentTransaction.finalAmount = currentTransaction.originalAmount;
            }
            
            addTransactionToData(currentTransaction);
            saveExpenseData(); // 거래 추가 후 저장
            renderCalendar();
            updateSummary();
            currentTransaction = null;
        } else if (selectedTransactionForDutch) {
            const {date, index} = selectedTransactionForDutch;
            const transaction = expenseData[date][index];
            
            if (isDutch) {
                transaction.isDutch = true;
                transaction.peopleCount = peopleCount;
                transaction.finalAmount = Math.round(transaction.originalAmount / peopleCount);
            } else {
                transaction.isDutch = false;
                transaction.peopleCount = 1;
                transaction.finalAmount = transaction.originalAmount;
            }
            
            // override 저장
            const key = `${transaction.date}|${transaction.store}`;
            expenseOverrides[key] = {
                isDutch: transaction.isDutch,
                peopleCount: transaction.peopleCount,
                finalAmount: transaction.finalAmount
            };
            saveExpenseOverrides();
            saveExpenseData(); // 변경 후 저장
            
            renderCalendar();
            updateSummary();
            selectedTransactionForDutch = null;
        }
        
        if (dutchConfirmModal) {
            dutchConfirmModal.classList.remove('active');
        }
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
        
        // 날짜 클릭 이벤트 추가 (수정된 부분)
        calendarGrid.querySelectorAll('.date-cell').forEach(cell => {
            cell.addEventListener('click', function(e) {
                e.preventDefault();
                const dateStr = this.dataset.date;
                const dayTransactions = expenseData[dateStr] || [];
                
                if (dayTransactions.length > 0) {
                    showDailyDetail(dateStr, dayTransactions);
                }
            });
        });
    }

// 일별 상세 보기 (날짜 표시 개선 및 오류 수정)
function showDailyDetail(dateStr, transactions) {
    if (!dailyDetailModal) return;

    // UTC 시간대 문제 해결을 위한 로컬 시간 기준 파싱
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
    
    // 날짜 표시 개선 - 더 명확하게 표시
    if (document.getElementById('detail-date')) {
        document.getElementById('detail-date').textContent = `📅 ${formattedDate} 상세 내역`;
    }
    
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
    
    // 날짜별 요약 정보도 추가
    content = `
        <div class="daily-header">
            <h4>${formattedDate}</h4>
            <div class="daily-summary">
                총 ${transactions.length}건의 거래 | 
                지출: ${formatCurrency(totalAmount)}
                ${totalSavings > 0 ? ` | 절약: ${formatCurrency(totalSavings)}` : ''}
            </div>
        </div>
        ${content}
    `;
    
    content += `
        <div class="daily-total">
            총 지출: ${formatCurrency(totalAmount)}
            ${totalSavings > 0 ? ` | 절약: ${formatCurrency(totalSavings)}` : ''}
        </div>
    `;
    
    if (document.getElementById('daily-detail-content')) {
        document.getElementById('daily-detail-content').innerHTML = content;
    }
    
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
        
        if (document.getElementById('sidebar-total')) {
            document.getElementById('sidebar-total').textContent = formatCurrency(totalAmount);
        }
        if (document.getElementById('sidebar-avg')) {
            document.getElementById('sidebar-avg').textContent = formatCurrency(avgDaily);
        }
        if (document.getElementById('sidebar-max')) {
            document.getElementById('sidebar-max').textContent = formatCurrency(maxDayAmount || 0);
        }
        if (document.getElementById('sidebar-savings')) {
            document.getElementById('sidebar-savings').textContent = formatCurrency(totalSavings);
        }
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
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const dutchFilter = document.getElementById('dutch-filter')?.value || '';
        
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
        
        if (document.getElementById('monthly-total')) {
            document.getElementById('monthly-total').textContent = formatCurrency(totalAmount);
        }
        if (document.getElementById('monthly-savings')) {
            document.getElementById('monthly-savings').textContent = formatCurrency(totalSavings);
        }
        
        const transactionList = document.getElementById('transaction-list');
        if (!transactionList) return;

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
        
        if (document.getElementById('report-total')) {
            document.getElementById('report-total').textContent = formatCurrency(totalAmount);
        }
        if (document.getElementById('report-savings')) {
            document.getElementById('report-savings').textContent = formatCurrency(totalSavings);
        }
        if (document.getElementById('report-daily-avg')) {
            document.getElementById('report-daily-avg').textContent = formatCurrency(avgDaily);
        }
        if (document.getElementById('report-max-day')) {
            document.getElementById('report-max-day').textContent = maxDay ? 
                `${formatDateKr(maxDay)} (${formatCurrency(dailyTotals[maxDay])})` : '-';
        }
        
        // 더치페이 분석
        const dutchCount = currentMonthTransactions.filter(t => t.isDutch).length;
        const totalCount = currentMonthTransactions.length;
        const dutchRatio = totalCount > 0 ? Math.round((dutchCount / totalCount) * 100) : 0;
        
        if (document.getElementById('dutch-count')) {
            document.getElementById('dutch-count').textContent = `${dutchCount}건`;
        }
        if (document.getElementById('total-count')) {
            document.getElementById('total-count').textContent = `${totalCount}건`;
        }
        if (document.getElementById('dutch-ratio')) {
            document.getElementById('dutch-ratio').textContent = `${dutchRatio}%`;
        }
        
        // 카테고리별 지출 파이차트
        renderCategoryPieChart();
    }

    // 카테고리별 지출 파이차트
    function renderCategoryPieChart() {
        const ctx = document.getElementById('category-pie-chart');
        if (!ctx) return;
        
        const context = ctx.getContext('2d');
        
        // 기존 차트 있으면 제거
        if (window.categoryChart) {
            window.categoryChart.destroy();
        }
        
        // 고정 비율로 차트 데이터 설정
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
        
        if (typeof Chart !== 'undefined') {
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
    }

    // 날짜 포맷 함수들 (UTC 오프셋 문제 해결)
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateKr(dateStr) {
     // 로컬 시간 기준으로 파싱하여 UTC 오프셋 문제 해결
     const date = new Date(dateStr + 'T00:00:00');
     return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function formatCurrency(amount) {
     return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    // 초기화
    function init() {
        initEventListeners();
        
        // 이미 저장된 데이터가 있으면 바로 렌더링, 없으면 샘플 데이터 처리
        if (Object.keys(expenseData).length > 0) {
            renderCalendar();
            updateSummary();
        } else {
            // 샘플 데이터 처리 (서버 연결 시 fetchExpenseDataAndRender() 사용)
            updateExpenseDataFromApi(sampleApiData);
        }
    }

    // 앱 시작S
    init();
});