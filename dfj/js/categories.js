// 文件: js/categories.js
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有的折叠标题
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    // 为每个折叠标题添加点击事件
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function(event) {
            // 阻止默认行为（防止页面跳转）
            event.preventDefault();
            
            // 获取父级折叠部分
            const section = this.closest('.collapsible-section');
            
            // 获取内容区域
            const content = section.querySelector('.collapsible-content');
            
            // 获取切换图标
            const toggleIcon = this.querySelector('.toggle-icon');
            
            // 切换内容区域的显示状态
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggleIcon.textContent = '▼';
                section.classList.add('open');
            } else {
                content.style.display = 'none';
                toggleIcon.textContent = '▶';
                section.classList.remove('open');
            }
        });
    });

    // 查看URL参数，如果有指定的分类，自动展开
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        // 查找匹配的分类标题并自动展开
        document.querySelectorAll('.toggle-trigger').forEach(trigger => {
            if (trigger.textContent.toLowerCase().includes(categoryParam.toLowerCase())) {
                // 模拟点击
                trigger.closest('.collapsible-header').click();
            }
        });
    }
}); 