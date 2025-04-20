// 文件: js/archives.js
document.addEventListener('DOMContentLoaded', function() {
    // 获取存放归档内容的容器
    const archiveContainer = document.getElementById('dynamic-archive-list');
    
    // 如果找不到容器，直接返回
    if (!archiveContainer) {
        console.error('找不到归档容器元素 #dynamic-archive-list');
        return;
    }

    // 显示加载提示
    archiveContainer.innerHTML = '<p>正在加载归档...</p>';
    
    // 解析URL参数，获取目标年份和月份
    const urlParams = new URLSearchParams(window.location.search);
    const targetYear = urlParams.get('year');
    const targetMonth = urlParams.get('month');
    const targetDay = urlParams.get('day');
    
    // 监听popstate事件，处理浏览器的前进/后退按钮
    window.addEventListener('popstate', function(event) {
        // 重新获取URL参数
        const newParams = new URLSearchParams(window.location.search);
        const newYear = newParams.get('year');
        const newMonth = newParams.get('month');
        const newDay = newParams.get('day');
        
        // 如果参数发生变化，重新加载归档内容
        if (newYear !== targetYear || newMonth !== targetMonth || newDay !== targetDay) {
            location.reload(); // 简单处理：直接刷新页面
        }
    });
    
    // 定义获取文章数据的函数
    async function fetchPostsData() {
        try {
            // 显示加载提示
            archiveContainer.innerHTML = '<p>正在加载归档数据...</p>';
            
            const response = await fetch('_data/posts.json');
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP 错误: ${response.status}`);
            }
            
            // 获取原始文本以便检查JSON格式
            const rawText = await response.text();
            
            // 尝试解析JSON
            let postsData;
            try {
                postsData = JSON.parse(rawText);
            } catch (jsonError) {
                // JSON解析失败，显示更详细的错误信息
                console.error('JSON解析失败:', jsonError, '\n原始文本:', rawText);
                archiveContainer.innerHTML = `
                    <div class="error-message">
                        <h3>读取文章数据失败 😢</h3>
                        <p>您的posts.json文件格式似乎有问题。常见的JSON错误包括：</p>
                        <ul>
                            <li>缺少逗号或多余的逗号</li>
                            <li>引号不匹配</li>
                            <li>大括号或方括号不匹配</li>
                        </ul>
                        <p>具体错误信息: ${jsonError.message}</p>
                        <p>请检查 _data/posts.json 文件并修复格式问题。</p>
                    </div>
                `;
                return;
            }
            
            // 处理并显示归档
            processAndDisplayArchives(postsData);
            
        } catch (error) {
            console.error('获取或处理文章数据失败:', error);
            archiveContainer.innerHTML = `
                <div class="error-message">
                    <h3>加载归档失败 T_T</h3>
                    <p>无法读取文章数据，请检查：</p>
                    <ul>
                        <li>_data/posts.json 文件是否存在</li>
                        <li>文件内容是否为正确的JSON格式</li>
                        <li>日期格式是否为YYYY-MM-DD，如"2024-05-10"</li>
                    </ul>
                    <p>具体错误: ${error.message}</p>
                </div>
            `;
        }
    }
    
    // 定义处理归档数据并显示的函数
    function processAndDisplayArchives(posts) {
        // 添加调试信息
        console.log('收到的原始文章数据:', posts);
        
        // 为用户显示日期问题的文章
        let invalidDatePosts = [];
        let missingFieldPosts = [];
        
        // 1. 确保所有日期格式正确
        const validPosts = posts.filter(post => {
            // 检查是否有必要的字段
            if (!post.title || !post.url || !post.date) {
                console.warn('文章缺少必要字段:', post);
                missingFieldPosts.push({...post, reason: '缺少必要字段(title、url或date)'});
                return false;
            }
            
            // 支持多种日期格式并尝试标准化
            try {
                // 尝试解析日期
                const date = new Date(post.date);
                if (isNaN(date.getTime())) {
                    // 无效日期
                    console.warn('无法解析的日期格式:', post.date);
                    invalidDatePosts.push({...post, reason: `无法解析日期: "${post.date}"`});
                    return false;
                }
                
                // 标准化日期格式为 YYYY-MM-DD
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                
                // 更新文章的日期为标准格式
                post.date = `${year}-${month}-${day}`;
                return true;
            } catch (error) {
                console.warn('日期处理错误:', error, post);
                invalidDatePosts.push({...post, reason: `日期处理错误: ${error.message}`});
                return false;
            }
        });
        
        // 如果有无效文章，显示错误信息
        if (invalidDatePosts.length > 0 || missingFieldPosts.length > 0) {
            console.error('发现无效文章:', {invalidDatePosts, missingFieldPosts});
            
            // 如果所有文章都无效，显示更详细的错误信息
            if (validPosts.length === 0) {
                archiveContainer.innerHTML = `
                    <div class="error-message">
                        <h3>归档加载失败</h3>
                        <p>没有发现有效的文章数据。请检查您的文章日期格式：</p>
                        
                        ${invalidDatePosts.length > 0 ? `
                        <h4>日期格式问题的文章:</h4>
                        <ul>
                            ${invalidDatePosts.map(post => `
                                <li>
                                    <strong>${post.title || '无标题'}</strong>: 
                                    ${post.reason} <br>
                                    <small>推荐使用标准格式: YYYY-MM-DD (例如 2024-05-10)</small>
                                </li>
                            `).join('')}
                        </ul>` : ''}
                        
                        ${missingFieldPosts.length > 0 ? `
                        <h4>缺少必要字段的文章:</h4>
                        <ul>
                            ${missingFieldPosts.map(post => `
                                <li>
                                    <strong>${post.title || '无标题'}</strong>: 
                                    ${post.reason} <br>
                                    <small>每篇文章必须包含 title、url 和 date 字段</small>
                                </li>
                            `).join('')}
                        </ul>` : ''}
                    </div>
                `;
                return;
            }
        }
        
        console.log('有效的文章数量:', validPosts.length);
        
        // 2. 按日期降序排序（最新的在前面）
        validPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 3. 按年月分组
        const groupedPosts = {};
        
        validPosts.forEach(post => {
            // 解析日期，并确保月和日是两位数
            let [year, month, day] = post.date.split('-');
            
            // 确保月和日是两位数格式
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');
            
            // 创建年份分组（如果不存在）
            if (!groupedPosts[year]) {
                groupedPosts[year] = {};
            }
            
            // 创建月份分组（如果不存在）
            if (!groupedPosts[year][month]) {
                groupedPosts[year][month] = [];
            }
            
            // 添加文章到对应的月份分组
            groupedPosts[year][month].push({
                ...post,
                day // 额外存储日期中的"日"
            });
        });
        
        console.log('按年月分组后的文章:', groupedPosts);
        
        // 4. 生成HTML
        let archiveHTML = '';
        
        // 获取年份数组并确保是降序排列（最新的年份在前面）
        const years = Object.keys(groupedPosts).sort((a, b) => b - a);
        
        // 如果没有文章，显示提示信息
        if (years.length === 0) {
            archiveHTML = '<p>暂无文章归档</p>';
            archiveContainer.innerHTML = archiveHTML;
            return;
        }
        
        // 确定哪些年份和月份应该默认展开
        let yearToExpand = targetYear || years[0]; // 如果没有指定年份，默认展开第一个
        let monthToExpand = targetMonth; // 如果没有指定月份，稍后会设置为该年的第一个月
        
        // 创建可折叠的归档列表
        archiveHTML = '<div class="archive-accordion">';
        
        // 处理每个年份
        years.forEach((year, yearIndex) => {
            const yearId = `year-${year}`;
            // 判断是否要展开这个年份
            const shouldExpandYear = year === yearToExpand;
            
            // 生成年份标题（可点击折叠）
            archiveHTML += `
                <div class="archive-year-item" id="year-item-${year}">
                    <h2 class="archive-year collapsible-header">
                        <span class="toggle-icon">${shouldExpandYear ? '▼' : '▶'}</span>
                        <a href="#" class="toggle-trigger" data-target="${yearId}">${year} 年</a>
                    </h2>
                    <div id="${yearId}" class="year-content collapsible-content" style="display: ${shouldExpandYear ? 'block' : 'none'}">`;
            
            // 获取月份数组并确保是降序排列（最新的月份在前面）
            const months = Object.keys(groupedPosts[year]).sort((a, b) => b - a);
            
            // 如果是当前要展开的年份，且没有指定月份，则设置为该年的第一个月
            if (shouldExpandYear && !monthToExpand && months.length > 0) {
                monthToExpand = months[0];
            }
            
            // 处理每个月份
            months.forEach((month, monthIndex) => {
                const monthId = `${year}-${month}`;
                // 判断是否要展开这个月份
                const shouldExpandMonth = shouldExpandYear && month === monthToExpand;
                
                // 移除月份前导零（例如将"05"显示为"5"）
                const displayMonth = month.replace(/^0/, '');
                
                // 生成月份标题（可点击折叠）
                archiveHTML += `
                    <div class="archive-month-item" id="month-item-${year}-${month}">
                        <h3 class="archive-month collapsible-header">
                            <span class="toggle-icon">${shouldExpandMonth ? '▼' : '▶'}</span>
                            <a href="#" class="toggle-trigger" data-target="${monthId}">${displayMonth} 月</a>
                        </h3>
                        <ul id="${monthId}" class="archive-list collapsible-content" style="display: ${shouldExpandMonth ? 'block' : 'none'}">`;
                
                // 处理该月份的每篇文章
                groupedPosts[year][month].forEach(post => {
                    // 移除日期前导零（例如将"08"显示为"8"）
                    const displayDay = post.day.replace(/^0/, '');
                    const postId = `post-${year}-${month}-${post.day}`;
                    
                    // 判断是否要高亮显示特定日期的文章
                    const isHighlighted = targetDay && post.day === targetDay && shouldExpandMonth;
                    
                    archiveHTML += `
                        <li id="${postId}" class="${isHighlighted ? 'highlighted-post' : ''}">
                            <span class="archive-date">${displayDay}</span> »
                            <a href="${post.url}">${post.title}</a>
                        </li>`;
                });
                
                archiveHTML += `
                        </ul>
                    </div>`;
            });
            
            archiveHTML += `
                    </div>
                </div>`;
        });
        
        archiveHTML += '</div>';
        
        // 5. 将生成的HTML插入到页面中
        archiveContainer.innerHTML = archiveHTML;
        
        // 6. 添加折叠功能的事件监听器
        setupCollapsibleBehavior();
        
        // 7. 如果有参数指定了特定的年月日，滚动到对应位置
        scrollToTarget();
    }
    
    // 设置折叠功能
    function setupCollapsibleBehavior() {
        // 获取所有的折叠标题
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        
        // 为每个折叠标题添加点击事件
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', function(event) {
                // 阻止默认行为（防止页面跳转）
                event.preventDefault();
                
                // 获取目标内容区域
                const triggerElement = this.querySelector('.toggle-trigger');
                const targetId = triggerElement.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                
                // 获取切换图标
                const toggleIcon = this.querySelector('.toggle-icon');
                
                // 切换内容区域的显示状态
                if (targetContent.style.display === 'none') {
                    targetContent.style.display = 'block';
                    toggleIcon.textContent = '▼';
                    
                    // 更新URL参数
                    updateURLParams(targetId);
                } else {
                    targetContent.style.display = 'none';
                    toggleIcon.textContent = '▶';
                }
            });
        });
    }
    
    // 更新URL参数但不刷新页面
    function updateURLParams(targetId) {
        const params = new URLSearchParams(window.location.search);
        
        // 清除现有参数
        params.delete('year');
        params.delete('month');
        params.delete('day');
        
        // 添加新参数
        if (targetId.startsWith('year-')) {
            // 年份类型的ID，如 "year-2024"
            const year = targetId.replace('year-', '');
            params.set('year', year);
        } else if (targetId.includes('-')) {
            // 月份类型的ID，如 "2024-05"
            const [year, month] = targetId.split('-');
            params.set('year', year);
            params.set('month', month);
        }
        
        // 更新URL
        const newURL = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.pushState({}, '', newURL);
    }
    
    // 滚动到目标位置
    function scrollToTarget() {
        let targetElement;
        
        // 优先检查是否有指定的日期
        if (targetYear && targetMonth && targetDay) {
            targetElement = document.getElementById(`post-${targetYear}-${targetMonth}-${targetDay}`);
        } 
        // 其次检查是否有指定的月份
        else if (targetYear && targetMonth) {
            targetElement = document.getElementById(`month-item-${targetYear}-${targetMonth}`);
        } 
        // 最后检查是否有指定的年份
        else if (targetYear) {
            targetElement = document.getElementById(`year-item-${targetYear}`);
        }
        
        // 如果找到目标元素，滚动到该位置
        if (targetElement) {
            // 添加一个小延迟，确保DOM已经完全渲染
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
    
    // 执行获取数据的函数
    fetchPostsData();
}); 