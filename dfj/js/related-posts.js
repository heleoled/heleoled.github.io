document.addEventListener('DOMContentLoaded', function() {

    const relatedPostsContainer = document.getElementById('related-posts-container');
    const relatedPostsList = document.getElementById('related-posts-list');
    const relatedPostsPlaceholder = document.getElementById('related-posts-placeholder');
    const postsIndexUrl = '../_data/postss.json'; // !!! 注意路径，相对于 posts/ 目录 !!!

    // --- 1. 获取当前文章的信息 ---
    const bodyData = document.body.dataset; // 获取 body 的 data-* 属性
    const currentUrl = bodyData.postUrl;
    const currentTagsString = bodyData.postTags;

    // 检查是否能获取到当前文章信息和容器
    if (!relatedPostsContainer || !relatedPostsList || !currentUrl || !currentTagsString) {
        // console.log("关联推荐：缺少必要元素或当前文章信息。");
        return; // 如果缺少，则不执行后续逻辑
    }

    const currentTags = currentTagsString.split(',').map(tag => tag.trim()).filter(tag => tag); // 分割、清理标签

    // --- 2. 加载所有文章数据并计算推荐 ---
    async function loadAndRecommendPosts() {
        try {
            const response = await fetch(postsIndexUrl);
            if (!response.ok) throw new Error(`无法加载文章索引: ${response.status} ${postsIndexUrl}`);
            const allPosts = await response.json();

            // --- 3. 计算相关度 ---
            const scoredPosts = [];
            allPosts.forEach(post => {
                // 排除当前文章自身
                if (post.url === currentUrl) return;

                let score = 0; // 相关度得分
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => {
                        if (currentTags.includes(tag.trim())) {
                            score++; // 每匹配一个标签，得分 +1
                        }
                    });
                }

                // 只保留得分大于 0 的文章
                if (score > 0) {
                    scoredPosts.push({ post, score });
                }
            });

            // --- 4. 排序（按得分降序，得分相同按日期降序）---
            scoredPosts.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // 得分高的在前
                } else {
                    // 得分相同，比较日期 (假设 date 存在且格式正确)
                    try {
                        return new Date(b.post.date) - new Date(a.post.date); // 日期新的在前
                    } catch (e) { return 0; } // 日期格式错误则不排序
                }
            });

            // --- 5. 选取前 N 篇推荐 ---
            const recommendations = scoredPosts.slice(0, 3); // <<<=== 最多推荐 3 篇，可以修改

            // --- 6. 渲染 HTML ---
            renderRecommendations(recommendations.map(item => item.post)); // 只传递 post 对象

        } catch (error) {
            console.error("加载或处理关联推荐失败:", error);
            // 显示错误或不显示推荐区域
            relatedPostsContainer.style.display = 'none';
        }
    }

    // --- 函数：渲染推荐列表 ---
    function renderRecommendations(postsToRecommend) {
        relatedPostsList.innerHTML = ''; // 清空
        relatedPostsPlaceholder.style.display = 'none';

        if (postsToRecommend && postsToRecommend.length > 0) {
            relatedPostsContainer.style.display = 'block'; // 显示容器
            postsToRecommend.forEach(post => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                 // !!! 注意：推荐文章的 URL 也需要是相对根目录的，href 可能需要调整 !!!
                 // 如果当前在 posts/ 目录下，推荐的文章链接也应该是 posts/ 开头
                 // 如果 posts.json 里的 url 就是相对于根目录的，那可能需要 '../'
                 // 假设 posts.json 里的 url 是 "posts/xxx.html"，当前页面在 posts/ 下
                 link.href = post.url; // 直接使用 JSON 里的 url
                 // 或者如果需要返回上一级: link.href = `../${post.url}`;
                link.textContent = post.title;
                li.appendChild(link);
                relatedPostsList.appendChild(li);
            });
        } else {
            relatedPostsContainer.style.display = 'none'; // 没有推荐则不显示容器
            // 或者显示“暂无推荐”
            // relatedPostsPlaceholder.style.display = 'block';
            // relatedPostsContainer.style.display = 'block';
        }
    }

    // --- 页面加载时执行 ---
    loadAndRecommendPosts();

});