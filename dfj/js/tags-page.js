document.addEventListener('DOMContentLoaded', function() {

    const allTagsContainer = document.getElementById('all-tags-container');
    const tagPostsContainer = document.getElementById('tag-posts-container');
    const tagPostsTitle = document.getElementById('tag-posts-title');
    const tagPostsList = document.getElementById('tag-posts-list');
    const tagPostsPlaceholder = document.getElementById('tag-posts-placeholder');
    const postsListUrl = '_data/posts.json'; // JSON 文件路径

    let allPostsData = []; // 存储所有文章数据
    let allTags = {}; // 存储所有标签及其包含的文章 { tag: [post, post], ... }

    // --- 获取URL中的标签参数 ---
    function getTagFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tag');
    }

    // --- 更新URL参数，不刷新页面 ---
    function updateUrlTag(tag) {
        if (tag) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('tag', tag);
            window.history.pushState({}, '', newUrl);
        } else {
            // 如果没有标签参数，则清除URL参数
            const newUrl = new URL(window.location);
            newUrl.search = '';
            window.history.pushState({}, '', newUrl);
        }
    }

    // --- 函数：处理文章数据并构建标签索引 ---
    function processPostsData(postsData) {
        allPostsData = postsData; // 保存原始数据
        allTags = {}; // 重置标签索引

        postsData.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tag = tag.trim();
                    if (tag) {
                        if (!allTags[tag]) {
                            allTags[tag] = []; // 如果标签第一次出现，创建数组
                        }
                        allTags[tag].push(post); // 将文章添加到该标签的数组中
                    }
                });
            }
        });
        console.log('标签索引构建完成:', allTags);
    }

    // --- 函数：渲染所有标签按钮 ---
    function renderAllTags() {
        if (!allTagsContainer) return;

        const uniqueTags = Object.keys(allTags).sort((a, b) => a.localeCompare(b, 'zh-CN'));

        if (uniqueTags.length === 0) {
            allTagsContainer.innerHTML = '<p>暂无标签</p>';
            return;
        }

        allTagsContainer.innerHTML = ''; // 清空加载提示
        uniqueTags.forEach(tag => {
            const tagButton = document.createElement('button'); // 使用 button 语义更清晰
            tagButton.classList.add('tag-item');
            tagButton.textContent = tag;
            tagButton.dataset.tag = tag; // 将标签名存在 data 属性中
            tagButton.title = `查看标签 "${tag}" 下的文章 (${allTags[tag]?.length || 0} 篇)`;

            // 添加点击事件监听器
            tagButton.addEventListener('click', handleTagClick);

            allTagsContainer.appendChild(tagButton);
        });

        // 获取URL中的标签参数，并自动点击对应标签
        const tagFromUrl = getTagFromUrl();
        if (tagFromUrl) {
            const targetTagButton = allTagsContainer.querySelector(`.tag-item[data-tag="${tagFromUrl}"]`);
            if (targetTagButton) {
                targetTagButton.click(); // 模拟点击对应的标签按钮
            } else {
                // 如果找不到对应的标签按钮，显示无内容提示
                tagPostsTitle.textContent = `# ${tagFromUrl}`;
                tagPostsTitle.style.display = 'block';
                tagPostsList.innerHTML = '';
                tagPostsPlaceholder.style.display = 'block';
                tagPostsPlaceholder.textContent = `未找到标签 "${tagFromUrl}" 下的文章`;
            }
        }
    }

    // --- 函数：处理标签按钮点击 ---
    function handleTagClick(event) {
        const clickedButton = event.currentTarget;
        const selectedTag = clickedButton.dataset.tag;

        console.log('点击了标签:', selectedTag);

        // 移除其他按钮的 active 状态，给当前按钮添加 active
        const allTagButtons = allTagsContainer.querySelectorAll('.tag-item');
        allTagButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');

        // 更新URL参数
        updateUrlTag(selectedTag);

        // 显示该标签下的文章列表
        renderPostsForTag(selectedTag);
    }

    // --- 函数：渲染指定标签下的文章列表 ---
    function renderPostsForTag(tag) {
        if (!tagPostsContainer || !allTags[tag]) {
            tagPostsTitle.style.display = 'none';
            tagPostsList.innerHTML = '';
            tagPostsPlaceholder.style.display = 'block'; // 显示无文章提示
            return;
        }

        const posts = allTags[tag]; // 获取该标签下的文章数组

        tagPostsTitle.textContent = `# ${tag}`; // 设置标题
        tagPostsTitle.style.display = 'block'; // 显示标题
        tagPostsList.innerHTML = ''; // 清空旧列表
        tagPostsPlaceholder.style.display = 'none'; // 隐藏无文章提示

        if (posts.length === 0) {
             tagPostsPlaceholder.style.display = 'block'; // 如果该标签下确实没文章
        } else {
            posts.forEach(post => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = post.url; // 使用 JSON 中的 URL
                link.textContent = post.title;
                li.appendChild(link);
                tagPostsList.appendChild(li);
            });
        }
    }

    // --- 处理浏览器前进/后退按钮 ---
    window.addEventListener('popstate', function() {
        const tagFromUrl = getTagFromUrl();
        if (tagFromUrl) {
            const targetTagButton = allTagsContainer.querySelector(`.tag-item[data-tag="${tagFromUrl}"]`);
            if (targetTagButton) {
                targetTagButton.click(); // 模拟点击对应的标签按钮
            }
        } else {
            // 如果没有标签参数，清除当前选中状态
            const allTagButtons = allTagsContainer.querySelectorAll('.tag-item');
            allTagButtons.forEach(btn => btn.classList.remove('active'));
            tagPostsTitle.style.display = 'none';
            tagPostsList.innerHTML = '';
            tagPostsPlaceholder.style.display = 'none';
        }
    });

    // --- 主执行逻辑：获取数据 -> 处理数据 -> 渲染标签 ---
    async function initializeTagsPage() {
        try {
            const response = await fetch(postsListUrl);
            if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                 throw new TypeError(`服务器返回的不是 JSON 格式: ${contentType}`);
            }
            const postsData = await response.json();
            console.log('Tags page: JSON 解析成功:', postsData);

            processPostsData(postsData); // 处理数据，构建索引
            renderAllTags();            // 渲染标签按钮

        } catch (error) {
            console.error("初始化标签页面失败:", error);
            if (allTagsContainer) allTagsContainer.innerHTML = '<p>加载标签时出错 T_T</p>';
            tagPostsTitle.style.display = 'none';
            tagPostsList.innerHTML = '';
            tagPostsPlaceholder.style.display = 'none';
        }
    }

    // --- 页面加载时执行初始化 ---
    initializeTagsPage();

}); // DOMContentLoaded 结束