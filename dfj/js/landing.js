// 确保在 DOM (文档对象模型) 完全加载后再执行脚本
// 这是一种良好的实践，防止在元素还没准备好时就尝试操作它们
document.addEventListener('DOMContentLoaded', function() {

    // 1. 获取需要操作的元素：进入按钮
    // 我们通过之前在 HTML 中设置的 id 'enter-button' 来找到它
    const enterButton = document.getElementById('enter-button');

    // 2. 检查按钮是否存在 (以防万一 HTML 结构变化或 ID 写错)
    if (enterButton) {

        // 3. 为按钮添加点击事件监听器
        enterButton.addEventListener('click', function() {

            // --- 核心功能：跳转到博客主页 ---
            // 将这里的 'blog.html' 替换成你实际的博客主页文件名 (如果不同的话)
            enterButton.disabled = true;
            enterButton.textContent = '正在进入...';
            
            // 生成1-3秒的随机延迟时间 (1000-3000毫秒)
            const randomDelay = Math.floor(Math.random() * 500) + 1000;
            
            // 设置定时器，延迟跳转
            setTimeout(function() {
                window.location.href = 'blog.html';
            }, randomDelay);
        });

    } else {
        // 如果找不到按钮，在控制台输出一个错误信息，方便调试
        console.error('错误：未能找到 ID 为 "enter-button" 的按钮！');
    }
    document.addEventListener('DOMContentLoaded', function() {
    const enterButton = document.getElementById('enter-button');
    
    // 添加淡入动画类
    if (enterButton) {
        enterButton.style.opacity = '0';
        setTimeout(() => {
            enterButton.style.transition = 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out';
            enterButton.style.opacity = '1';
            enterButton.style.transform = 'translateY(0)';
        }, 500); // 延迟500ms开始动画
        // ... 原有按钮点击事件代码 ...
    }
});

}); // DOMContentLoaded 事件监听器结束