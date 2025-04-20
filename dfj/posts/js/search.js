// 文件: js/search.js
document.addEventListener('DOMContentLoaded', function() {

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('search-results-container');
    const resultsList = document.getElementById('search-results-list');
    const noResultsMessage = document.getElementById('search-no-results');
    const searchIndexUrl = '_data/posts.json'; // 索引文件路径改为合并后的文件

    // 添加CSS过渡效果
    if (resultsContainer) {
        resultsContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.2s ease-out';
        resultsContainer.style.transformOrigin = 'top center';
    }
    
    let fuse = null; // Fuse.js 实例
    let searchData = []; // 存储从 JSON 加载的数据
    let searchTimeout = null; // 用于防抖的定时器

    // --- 防抖函数 ---
    function debounce(func, delay) {
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    // --- 添加缺失的隐藏搜索结果函数 ---
    function hideSearchResults() {
        console.log('隐藏搜索结果');
        if (resultsContainer) {
            // 添加淡出和缩放效果
            resultsContainer.style.opacity = '0';
            resultsContainer.style.transform = 'scale(0.95)';
            
            // 等待淡出动画完成后再隐藏元素
            setTimeout(() => {
                resultsContainer.style.display = 'none';
                // 重置透明度和缩放，为下次显示做准备
                resultsContainer.style.opacity = '1';
                resultsContainer.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // --- 1. 加载搜索索引并初始化 Fuse.js ---
    async function loadSearchIndex() {
        try {
            const response = await fetch(searchIndexUrl);
            if (!response.ok) throw new Error(`无法加载搜索索引: ${response.status} ${searchIndexUrl}`);
            searchData = await response.json();
            console.log("搜索索引加载成功:", searchData.length, "篇文章");

            // Fuse.js 配置 (可以调整权重和阈值)
            const options = {
                includeScore: true, // 包含匹配得分，可以用于排序或调试
                // includeMatches: true, // 可选：包含匹配项的具体位置，用于高亮
                threshold: 0.4,     // 匹配的宽松程度（0 最严格，1 最宽松）
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [             // 定义搜索哪些字段以及它们的权重
                    { name: 'title', weight: 0.7 },   // 标题权重最高
                    { name: 'tags', weight: 0.5 },    // 标签权重次之
                    { name: 'content', weight: 0.3 }  // 内容摘要权重最低
                ]
            };

            // 初始化 Fuse 实例
            fuse = new Fuse(searchData, options);

            // 启用搜索框和按钮
            if (searchInput) { searchInput.disabled = false; searchInput.placeholder = "搜索文章..."; }
            if (searchButton) searchButton.disabled = false;

        } catch (error) {
            console.error("加载或初始化搜索索引失败:", error);
            if (searchInput) { searchInput.placeholder = "搜索加载失败"; searchInput.disabled = true; }
            if (searchButton) searchButton.disabled = true;
        }
    }

    // --- 2. 执行搜索并渲染结果 ---
    function performSearch() {
        console.log("performSearch 函数被调用了！");
        // 确保 Fuse 实例已加载，并且相关元素存在
        if (!fuse || !searchInput || !resultsContainer || !resultsList || !noResultsMessage) {
            console.warn("搜索功能尚未准备好或缺少必要元素。");
            return;
        }

        const query = searchInput.value.trim(); // 获取用户输入的搜索词

        // 清空旧结果并隐藏无结果提示
        resultsList.innerHTML = '';
        noResultsMessage.style.display = 'none';

        if (query.length === 0) { // 如果没有输入，则隐藏结果区域
            hideSearchResults();
            return;
        }

        const results = fuse.search(query); // 使用 Fuse.js 进行搜索
        console.log(`搜索 "${query}"，找到 ${results.length} 个结果:`, results);

        if (results.length > 0) {
            // 显示结果容器，添加淡入和缩放效果
            resultsContainer.style.opacity = '0';
            resultsContainer.style.transform = 'scale(0.95)';
            resultsContainer.style.display = 'block';
            
            // 遍历搜索结果并创建列表项
            results.forEach(result => {
                const post = result.item; // result.item 是原始的文章对象
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = post.url;
                link.textContent = post.title;
                li.appendChild(link);
                resultsList.appendChild(li);
            });
            
            // 使用setTimeout以确保DOM更新后再执行淡入动画
            setTimeout(() => {
                resultsContainer.style.opacity = '1';
                resultsContainer.style.transform = 'scale(1)';
            }, 10);
        } else {
            // 未找到结果，也添加淡入和缩放效果
            resultsContainer.style.opacity = '0';
            resultsContainer.style.transform = 'scale(0.95)';
            resultsContainer.style.display = 'block';
            noResultsMessage.style.display = 'block';
            
            setTimeout(() => {
                resultsContainer.style.opacity = '1';
                resultsContainer.style.transform = 'scale(1)';
            }, 10);
        }
    }

    // --- 3. 事件绑定 ---
    if (searchInput && searchButton) {
        // 页面加载时加载索引
        loadSearchIndex();

        // 点击按钮时执行搜索
        searchButton.addEventListener('click', performSearch);

        // 在输入框按回车键时执行搜索
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });

        // 创建一个带防抖的搜索函数
        const debouncedSearch = debounce(function() {
            if (searchInput.value.trim() === '') {
                console.log('Hiding results due to empty input');
                hideSearchResults();
            } else {
                console.log('实时搜索触发 (防抖后)');
                performSearch();
            }
        }, 300); // 300毫秒的防抖延迟

        // 输入时使用防抖搜索
        searchInput.addEventListener('input', debouncedSearch);

        // --- 新增：监听整个文档的点击事件，用于隐藏结果 ---
        document.addEventListener('click', (event) => {
            console.log('Document clicked');
            // 检查点击事件的目标是否在搜索输入框或搜索结果容器内部
            const isClickInsideSearch = searchInput.contains(event.target);
            const isClickInsideResults = resultsContainer.contains(event.target);
            // 还要排除点击搜索按钮本身的情况，否则刚搜完就隐藏了
            const isClickOnSearchButton = searchButton.contains(event.target);
            
            console.log('isClickInsideSearch:', isClickInsideSearch);
            console.log('isClickInsideResults:', isClickInsideResults);
            console.log('isClickOnSearchButton:', isClickOnSearchButton);

            // 如果点击发生在搜索相关区域之外，则隐藏结果
            if (!isClickInsideSearch && !isClickInsideResults && !isClickOnSearchButton) {
                console.log('Hiding results due to outside click');
                hideSearchResults();
            }
        });

        // --- 防止点击搜索结果区域内部导致隐藏 ---
        // (因为事件会冒泡到 document，所以需要阻止)
        resultsContainer.addEventListener('click', (event) => {
            console.log('Results container clicked, stopping propagation');
            event.stopPropagation(); // 阻止事件继续冒泡到 document
        });


    } else {
        console.warn("未找到搜索输入框、按钮或结果容器，搜索功能可能不完整。");
    }

});