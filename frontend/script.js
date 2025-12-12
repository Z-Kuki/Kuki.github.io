document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const queryInput = document.getElementById('query-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultCount = document.getElementById('result-count');
    const pagination = document.getElementById('pagination');
    const prevBtn = pagination.querySelector('.prev');
    const nextBtn = pagination.querySelector('.next');
    const currentPage = document.getElementById('current-page');
    const totalPages = document.getElementById('total-pages');
    const listViewBtn = document.getElementById('list-view');
    const gridViewBtn = document.getElementById('grid-view');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const queryTags = document.querySelectorAll('.query-tag');
    const showModalButtons = {
        about: document.getElementById('show-about'),
        api: document.getElementById('show-api')
    };
    const closeButtons = document.querySelectorAll('.close');
    const modals = {
        about: document.getElementById('about-modal'),
        api: document.getElementById('api-modal')
    };
    
    // 全局变量
    let currentResults = [];
    let currentPageNumber = 1;
    let resultsPerPage = 10;
    let currentView = 'list';
    let appliedFilters = {
        price_min: 0,
        price_max: 50,
        vehicle_types: [],
        energy_types: []
    };
    
    // 后端API基础URL (修改为您部署的Flask后端URL)
    const API_BASE_URL = 'https://your-backend-domain.com/api';
    
    // 初始化
    init();
    
    function init() {
        // 绑定事件
        bindEvents();
        
        // 初始化范围滑块
        initRangeSliders();
        
        // 设置默认价格范围值
        document.getElementById('min-value').textContent = appliedFilters.price_min;
        document.getElementById('max-value').textContent = appliedFilters.price_max;
    }
    
    function bindEvents() {
        // 搜索按钮点击
        searchBtn.addEventListener('click', performSearch);
        
        // 回车键触发搜索
        queryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 视图切换
        listViewBtn.addEventListener('click', function() {
            switchView('list');
        });
        
        gridViewBtn.addEventListener('click', function() {
            switchView('grid');
        });
        
        // 分页按钮
        prevBtn.addEventListener('click', function() {
            if (!this.classList.contains('disabled') && currentPageNumber > 1) {
                currentPageNumber--;
                renderResults();
            }
        });
        
        nextBtn.addEventListener('click', function() {
            const maxPage = Math.ceil(currentResults.length / resultsPerPage);
            if (!this.classList.contains('disabled') && currentPageNumber < maxPage) {
                currentPageNumber++;
                renderResults();
            }
        });
        
        // 应用筛选
        applyFiltersBtn.addEventListener('click', function() {
            const vehicleTypes = Array.from(document.querySelectorAll('.checkbox-group input[value="suv"]:checked, .checkbox-group input[value="sedan"]:checked, .checkbox-group input[value="mpv"]:checked, .checkbox-group input[value="hatchback"]:checked'))
                .map(input => input.value);
            
            const energyTypes = Array.from(document.querySelectorAll('.checkbox-group input[value="fuel"]:checked, .checkbox-group input[value="hybrid"]:checked, .checkbox-group input[value="electric"]:checked'))
                .map(input => input.value);
            
            appliedFilters = {
                price_min: parseInt(document.getElementById('price-min').value),
                price_max: parseInt(document.getElementById('price-max').value),
                vehicle_types: vehicleTypes,
                energy_types: energyTypes
            };
            
            // 如果有查询文本，重新搜索
            if (queryInput.value.trim()) {
                performSearch();
            }
        });
        
        // 查询标签点击
        queryTags.forEach(tag => {
            tag.addEventListener('click', function() {
                queryInput.value = this.textContent;
                performSearch();
            });
        });
        
        // 模态框显示
        showModalButtons.about.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('about');
        });
        
        showModalButtons.api.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('api');
        });
        
        // 模态框关闭
        closeButtons.forEach(button => {
            button.addEventListener('click', closeModal);
        });
        
        // 点击模态框外部关闭
        Object.values(modals).forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        });
    }
    
    function initRangeSliders() {
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const minValue = document.getElementById('min-value');
        const maxValue = document.getElementById('max-value');
        
        // 同步滑块值
        priceMin.addEventListener('input', function() {
            if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
                priceMax.value = priceMin.value;
            }
            minValue.textContent = priceMin.value;
            maxValue.textContent = priceMax.value;
        });
        
        priceMax.addEventListener('input', function() {
            if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
                priceMin.value = priceMax.value;
            }
            minValue.textContent = priceMin.value;
            maxValue.textContent = priceMax.value;
        });
    }
    
    function switchView(view) {
        currentView = view;
        
        // 更新按钮状态
        listViewBtn.classList.toggle('active', view === 'list');
        gridViewBtn.classList.toggle('active', view === 'grid');
        
        // 重新渲染结果
        renderResults();
    }
    
    function performSearch() {
        const queryText = queryInput.value.trim();
        
        if (!queryText) {
            alert('请输入查询内容');
            return;
        }
        
        // 显示加载状态
        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>正在查询汽车知识图谱，请稍候...</p>
            </div>
        `;
        
        // 准备请求数据
        const requestData = {
            query: queryText,
            filters: appliedFilters,
            page: currentPageNumber,
            page_size: resultsPerPage
        };
        
        // 发送查询请求
        fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                currentResults = data.results || [];
                currentPageNumber = data.page || 1;
                renderResults();
            } else {
                showError(data.error || '查询失败，请重试');
            }
        })
        .catch(error => {
            console.error('查询出错:', error);
            showError('网络错误: ' + error.message + '。请确保后端服务已启动并正确配置。');
        });
    }
    
    function renderResults() {
        if (currentResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>没有找到匹配的结果</h3>
                    <p>请尝试调整您的查询条件，例如"15万左右的SUV"或"最省油的混动车"</p>
                    <div class="example-cards">
                        <div class="example-card">
                            <div class="example-content">
                                <h4>"20万预算，适合家庭的SUV"</h4>
                                <p>系统将返回20万价格区间的家庭SUV</p>
                            </div>
                        </div>
                        <div class="example-card">
                            <div class="example-content">
                                <h4>"油耗最低的轿车"</h4>
                                <p>系统将返回油耗表现最佳的轿车</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            updatePagination(0, 0);
            resultCount.textContent = '(0)';
            return;
        }
        
        const startIndex = (currentPageNumber - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, currentResults.length);
        const paginatedResults = currentResults.slice(startIndex, endIndex);
        
        // 渲染不同视图
        if (currentView === 'list') {
            renderListView(paginatedResults);
        } else if (currentView === 'grid') {
            renderGridView(paginatedResults);
        }
        
        // 更新分页
        updatePagination(currentResults.length, paginatedResults.length);
        resultCount.textContent = `(${currentResults.length})`;
    }
    
    function renderListView(results) {
        let html = '';
        
        results.forEach(car => {
            html += `
                <div class="car-card">
                    <div class="car-image">
                        ${car.brand || car.name.substring(0, 1)}
                    </div>
                    <div class="car-details">
                        <div class="car-title">
                            <span>${car.name}</span>
                            <span class="rating">${car.rating ? car.rating.toFixed(1) : 'N/A'} <i class="fas fa-star"></i></span>
                        </div>
                        <div class="car-meta">
                            <span><i class="fas fa-tag"></i> ${car.brand || '未知品牌'}</span>
                            <span><i class="fas fa-car"></i> ${car.category || '未知级别'}</span>
                            <span><i class="fas fa-bolt"></i> ${car.energy_type || '未知能源'}</span>
                        </div>
                        <div class="car-price">
                            价格: ${car.price_range || '暂无价格信息'}
                        </div>
                        <div class="car-description">
                            ${car.engine ? `发动机: ${car.engine.replace('发 动 机：', '')} | ` : ''}
                            ${car.transmission ? `变速箱: ${car.transmission.replace('变 速 箱：', '')}` : ''}
                        </div>
                        <div class="car-actions">
                            <a href="${car.detail_url}" target="_blank" class="detail-btn">
                                <i class="fas fa-info-circle"></i> 详情
                            </a>
                            <a href="#" class="compare-btn">
                                <i class="fas fa-balance-scale"></i> 对比
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
        resultsContainer.classList.remove('grid-view');
    }
    
    function renderGridView(results) {
        let html = '';
        
        results.forEach(car => {
            html += `
                <div class="car-card">
                    <div class="car-image">
                        ${car.brand || car.name.substring(0, 1)}
                    </div>
                    <div class="car-details">
                        <div class="car-title">
                            <span>${car.name}</span>
                            <span class="rating">${car.rating ? car.rating.toFixed(1) : 'N/A'} <i class="fas fa-star"></i></span>
                        </div>
                        <div class="car-meta">
                            <span>${car.brand || '未知品牌'}</span>
                            <span>${car.category || '未知级别'}</span>
                        </div>
                        <div class="car-price">
                            ${car.price_range || '暂无价格'}
                        </div>
                        <div class="car-description">
                            ${car.energy_type || ''}
                        </div>
                        <div class="car-actions">
                            <a href="${car.detail_url}" target="_blank" class="detail-btn">
                                <i class="fas fa-info-circle"></i> 详情
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
        resultsContainer.classList.add('grid-view');
    }
    
    function updatePagination(totalCount, currentCount) {
        const totalPageCount = Math.ceil(totalCount / resultsPerPage);
        
        currentPage.textContent = currentPageNumber;
        totalPages.textContent = totalPageCount;
        
        prevBtn.classList.toggle('disabled', currentPageNumber === 1);
        nextBtn.classList.toggle('disabled', currentPageNumber === totalPageCount || totalPageCount === 0);
    }
    
    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>查询出错</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="apply-filter-btn" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> 重试
                </button>
            </div>
        `;
    }
    
    function showModal(modalName) {
        if (modals[modalName]) {
            modals[modalName].style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal() {
        Object.values(modals).forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
    
    // 初始渲染示例数据 (用于演示，实际应用中会从API获取)
    renderExampleData();
    
    function renderExampleData() {
        // 示例数据
        const exampleData = [
            {
                name: "RAV4荣放",
                brand: "丰田",
                category: "紧凑型SUV",
                price_range: "16.98-23.88万",
                rating: 4.43,
                energy_type: "混动车型",
                engine: "发 动 机：2.0L 2.5L",
                transmission: "变 速 箱：无级",
                detail_url: "https://car.autohome.com.cn/price/series-770.html"
            },
            {
                name: "天籁",
                brand: "日产",
                category: "中型车",
                price_range: "13.99-23.98万",
                rating: 4.5,
                energy_type: "混动车型",
                engine: "发 动 机：2.0L 2.0T",
                transmission: "变 速 箱：无级",
                detail_url: "https://car.autohome.com.cn/price/series-634.html"
            },
            {
                name: "海狮06",
                brand: "比亚迪",
                category: "中型SUV",
                price_range: "13.98-16.38万",
                rating: 4.47,
                energy_type: "混动车型",
                engine: "发 动 机：1.5L 1.5T",
                transmission: "变 速 箱：手自一体 干式双离合 自动",
                detail_url: "https://car.autohome.com.cn/price/series-8087.html"
            }
        ];
        
        currentResults = exampleData;
        renderResults();
    }
});