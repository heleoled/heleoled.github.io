// 确保在 DOM 完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', function() {

    // --- 回到顶部功能 ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        const scrollThreshold = 20; // 显示按钮的滚动阈值 (你之前改为 20px)
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > scrollThreshold) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        backToTopButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.warn('提示：未找到 ID 为 "back-to-top" 的按钮，回到顶部功能未启用。');
    }


    // --- 主题切换功能 ---
    const themeToggleButton = document.getElementById('theme-switcher'); // 确保你的按钮 ID 是这个
    const bodyElement = document.body;
    const lightIcon = '🌙'; // 亮色模式下显示 "切换到暗色" 的图标
    const darkIcon = '☀️'; // 暗色模式下显示 "切换到亮色" 的图标

    // 函数：应用主题并更新按钮和 localStorage
    function applyTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('theme-dark'); // 应用暗色主题类
            if (themeToggleButton) themeToggleButton.textContent = darkIcon; // 更新按钮图标为太阳
            localStorage.setItem('theme', 'dark'); // 确保存储的是 'dark'
        } else {
            bodyElement.classList.remove('theme-dark'); // 移除暗色主题类 (应用亮色)
            if (themeToggleButton) themeToggleButton.textContent = lightIcon; // 更新按钮图标为月亮
            localStorage.setItem('theme', 'light'); // 确保存储的是 'light'
        }
    }

    // 初始化主题
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
       applyTheme(currentTheme); // 应用 localStorage 中保存的主题
    } else {
       // 默认应用亮色 (因为 body HTML 默认是亮色或无特定类)
       applyTheme('light');
       // (可选) 如果想根据系统偏好初始化
       /*
       if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
           applyTheme('dark');
       } else {
           applyTheme('light');
       }
       */
    }

    // 监听主题切换按钮点击事件
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', function() {
            const isDarkMode = bodyElement.classList.contains('theme-dark');
            if (isDarkMode) {
                applyTheme('light'); // 切换到亮色
            } else {
                applyTheme('dark'); // 切换到暗色
            }
        });
    } else {
         console.warn('提示：未找到 ID 为 "theme-switcher" 的按钮，主题切换功能未启用。');
    }


    // --- BGM 播放器功能 ---
    const bgmToggleButton = document.getElementById('bgm-toggle-button');
    const bgmAudio = document.getElementById('bgm-audio');
    if (bgmToggleButton && bgmAudio) {
         bgmToggleButton.addEventListener('click', function() {
             if (!bgmAudio.paused) {
                 // 暂停
                 bgmAudio.pause();
                 bgmToggleButton.classList.remove('playing');
             } else {
                 // 尝试播放
                 const playPromise = bgmAudio.play();
                 if (playPromise !== undefined) {
                     playPromise.then(_ => {
                         // 播放成功
                         bgmToggleButton.classList.add('playing');
                     }).catch(error => {
                         // 播放失败
                         console.error("BGM 播放失败:", error);
                         alert("浏览器限制，请先与页面交互后再尝试播放背景音乐。"); // 给用户提示
                         bgmToggleButton.classList.remove('playing');
                     });
                 }
             }
         });
         // (可选) 监听播放结束事件 (如果不是 loop)
         // bgmAudio.addEventListener('ended', () => bgmToggleButton.classList.remove('playing'));
    } else {
        console.warn('提示：未找到 BGM 播放器按钮或 Audio 元素，BGM 功能未启用。');
    }


// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 点赞按钮功能 (支持取消点赞，调用后端 API 版本) ---

// !!! 重要：请将下面的 URL 替换成你虚拟主机上 API 脚本的真实、完整 URL !!!
const GET_LIKES_API_URL = 'http://dfj.xzin.top/api/get_likes.php'; // 替换 yourdomain.com
const LIKE_POST_API_URL = 'http://dfj.xzin.top/api/like.php';   // 替换 yourdomain.com
const UNLIKE_POST_API_URL = 'http://dfj.xzin.top/api/unlike.php'; // 新增：取消点赞的 API URL
// ---

const likeButtons = document.querySelectorAll('.like-button');
const storageKeyPrefix = 'dongfengjia_client_liked_';

// --- 函数：更新单个点赞按钮的 UI ---
function updateLikeButtonUI(button, count, isLikedClient) {
    const countSpan = button.querySelector('.count');
    if (countSpan) {
        countSpan.textContent = count;
    }
    if (isLikedClient) {
        button.classList.add('liked');
        button.disabled = false; // 不再禁用，允许取消
    } else {
        button.classList.remove('liked');
        button.disabled = false; // 确保启用
    }
}

// --- 函数：获取并更新所有文章的点赞数 ---
async function fetchLikeCounts() {
    // ... (这个函数和之前一样，无需修改) ...
     if (likeButtons.length === 0) return;
     const postIds = [];
     likeButtons.forEach(button => {
         const postId = button.dataset.postId;
         if (postId && !postIds.includes(postId)) {
             postIds.push(postId);
         }
     });
     if (postIds.length === 0) return;
     const url = `${GET_LIKES_API_URL}?ids=${postIds.join(',')}`;
     try {
         const response = await fetch(url);
         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
         const likesData = await response.json();
         likeButtons.forEach(button => {
             const postId = button.dataset.postId;
             if (postId) {
                 const serverCount = likesData[postId] || 0;
                 const storageKey = storageKeyPrefix + postId;
                 const isLikedClient = localStorage.getItem(storageKey) === 'true';
                 updateLikeButtonUI(button, serverCount, isLikedClient);
             }
         });
     } catch (error) {
         console.error("获取点赞数失败:", error);
          likeButtons.forEach(button => {
              const postId = button.dataset.postId;
              if (postId) {
                 const storageKey = storageKeyPrefix + postId;
                 const isLikedClient = localStorage.getItem(storageKey) === 'true';
                 updateLikeButtonUI(button, 0, isLikedClient);
              }
          });
     }
}

// --- 函数：处理点赞/取消点赞按钮点击 ---
async function handleLikeClick(event) {
    const button = event.currentTarget;
    const postId = button.dataset.postId;
    if (!postId) return; // 没有 postId 则退出

    const storageKey = storageKeyPrefix + postId;
    const isLikedClient = localStorage.getItem(storageKey) === 'true'; // 获取当前客户端状态
    const countSpan = button.querySelector('.count');
    const currentCount = countSpan ? parseInt(countSpan.textContent || '0', 10) : 0;

    // 决定目标 URL 和预期的计数变化
    const targetUrl = isLikedClient ? UNLIKE_POST_API_URL : LIKE_POST_API_URL;
    const optimisticCountChange = isLikedClient ? -1 : 1;
    const optimisticLikedState = !isLikedClient;

    // 1. 乐观更新 UI
    updateLikeButtonUI(button, currentCount + optimisticCountChange, optimisticLikedState);
    // 更新 localStorage
    if (optimisticLikedState) {
        localStorage.setItem(storageKey, 'true');
    } else {
        localStorage.removeItem(storageKey); // 取消点赞则移除标记
    }
    // 临时禁用按钮防止快速连点
    button.disabled = true;


    try {
        // 2. 发送 POST 请求到后端
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `post_id=${encodeURIComponent(postId)}`
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        if (result.success) {
            // 服务器操作成功！保持乐观更新的状态即可
            // console.log(`Action successful for post ${postId}`);
            // 如果想确保数字绝对精确，可以再次 fetchLikeCounts()，但会慢
            // fetchLikeCounts();
        } else {
            // 服务器操作失败，撤销乐观更新
            console.error(`操作失败 (服务器) for ${postId}: ${result.error}`);
            // 恢复 localStorage
            if (optimisticLikedState) { // 如果之前是想点赞
                localStorage.removeItem(storageKey);
            } else { // 如果之前是想取消点赞
                localStorage.setItem(storageKey, 'true');
            }
            // 恢复 UI
            updateLikeButtonUI(button, currentCount, isLikedClient); // 恢复到操作前的状态
            alert(`操作失败: ${result.error || '未知错误'}`);
        }

    } catch (error) {
        // 网络或 JS 错误，撤销乐观更新
        console.error("请求失败 (网络/JS):", error);
        // 恢复 localStorage
        if (optimisticLikedState) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, 'true');
        }
        // 恢复 UI
        updateLikeButtonUI(button, currentCount, isLikedClient);
        alert("操作时发生网络错误，请稍后再试。");
    } finally {
        // 无论成功失败，最终都重新启用按钮 (如果希望操作后能立即再次操作)
        // 如果希望点赞/取消后有一段时间不能操作，可以在这里加个 setTimeout
        button.disabled = false;
    }
}

// --- 初始化和事件绑定 (点赞) ---
if (likeButtons.length > 0) {
    fetchLikeCounts(); // 页面加载时获取初始计数
    likeButtons.forEach(button => {
        button.addEventListener('click', handleLikeClick); // 绑定点击事件
    });
}
// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 今日运势/心情小部件功能 ---
const fortuneTextElement = document.getElementById('fortune-text');

if (fortuneTextElement) {
    // 定义你的运势/心情短语库 (可以尽情添加你喜欢的二次元梗或句子！)
    const fortunes = [
        "今天宜补番，尤其是催泪番！(´;ω;`)",
        "大吉！抽卡运势爆棚，快去试试手气！✨",
        "平平淡淡才是真，适合安静地写代码或摸鱼...",
        "可能会遇到意想不到的小确幸哦~ (〃'▽'〃)",
        "今天你的存在感堪比《间谍过家家》的阿尼亚！'わくわく'！",
        "仿佛被《鬼灭之刃》的祢豆子附体，体力MAX，鬼见了都跑路！",
        "《赛马娘》附体，冲啊！今日目标：赢到乌拉拉都为你点赞！",
        "像《孤独摇滚》的后藤一里一样社恐但爆发力惊人，偷偷闪耀吧！",
        "《咒术回战》五条悟式自信：天上天下，唯我独尊（但今天只限抢到奶茶）。",
        "《进击的巨人》既视感：虽然'心臓を捧げよ'，但今天只想躺平。",
        "《EVA》同步率40%，勉强能开机甲但会撞墙……小心走路！",
        "《JOJO》的'だが男だ'气势，可惜用在和早餐煎蛋搏斗上。",
        "《轻音少女》的'ふわふわ时间'——迷糊但可爱的一天~",
        "仿佛《寒蝉鸣泣之时》的轮回日……快抱住你的羽入求保佑！",
        "《死亡笔记》既视感：名字被写在'加班名单'上了吧？",
        "《魔法少女小圆》式选择：今天是否要QB签订契约？（建议：快逃）",
        "像《间谍过家家》的邦德一样快乐狗勾摇尾巴~🐾",
        "《辉夜大小姐》的'オーケー、ラブ～'状态启动！",
        "《龙女仆》托尔附体：今日も元気です！ヽ(✿ﾟ▽ﾟ)ノ",
        "《银魂》阿银式死鱼眼：'啊，麻烦死了，糖分补充不足……'",
        "《Re:0》486同款崩溃：'死んでも嫌だ——！'",
        "《火影忍者》佐助语气：'……無駄だ'（并默默拉高领子）。",
        "《Clannad》团子大家族BGM循环中……'だんご だんご'😢",
        "《四月は君の嘘》模式：'もう少しだけ、生きてみようかな'…",
        "《文豪野犬》太宰治附体：'今日も自殺失敗です'（叹气）。",
        "《中二病也要谈恋爱》觉醒：'爆ぜろリアル！ 弾けろシナプス！'",
        "《Fate》经典咏唱：「――――此処は、地獄か？」",
        "《游戏人生》空白宣言：'さぁ、ゲームを始めよう'！",
        "打起精神！没什么是一首好听的 Anisong 解决不了的！🎵"
        // 你可以继续往这里添加更多有趣的句子！
    ];

    // 随机选择一个索引
    const randomIndex = Math.floor(Math.random() * fortunes.length);

    // 更新 p 标签的内容
    fortuneTextElement.textContent = fortunes[randomIndex];

} else {
    // console.log("提示：未找到 ID 为 'fortune-text' 的元素，运势小部件未启用。");
}

// --- 其他博客主页的 JS 功能继续写在这里 ---
// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)
// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 阅读进度条功能 ---
const progressBar = document.querySelector('.reading-progress-bar');

// 仅在页面包含进度条元素时执行
if (progressBar) {
    const updateProgressBar = () => {
        // 计算页面总高度、视口高度和可滚动高度
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const maxScroll = scrollHeight - clientHeight;

        // 如果页面不可滚动，进度为 0
        if (maxScroll <= 0) {
            progressBar.style.width = '0%';
            return;
        }

        // 计算当前滚动距离
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 计算滚动百分比
        const scrollPercent = (scrollTop / maxScroll) * 100;

        // 更新进度条宽度 (确保不超过 100%)
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    };

    // 页面加载时先执行一次，设置初始状态
    updateProgressBar();

    // 监听滚动事件
    window.addEventListener('scroll', updateProgressBar);

    // (可选) 监听窗口大小变化事件，重新计算
    window.addEventListener('resize', updateProgressBar);

} else {
    // console.log("提示：当前页面没有阅读进度条元素。");
}
// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 悬浮测验小部件功能 (多题目随机显示 + 5秒自动关闭) ---
const quizContainer = document.getElementById('quiz-widget-container');

// 只在包含测验容器的页面执行
if (quizContainer) {
    const quizForm = document.getElementById('quiz-form');
    const quizResultDiv = document.getElementById('quiz-result');
    const quizResultText = document.getElementById('quiz-result-text');
    const quizResetBtn = document.getElementById('quiz-reset-btn');
    const quizCloseBtn = document.getElementById('quiz-close-btn');
    const quizQuestionElement = quizContainer.querySelector('.quiz-question'); // 获取显示问题的元素
    const quizOptionsList = quizContainer.querySelector('.quiz-options'); // 获取选项列表 ul
    const quizTitleElement = quizContainer.querySelector('.quiz-title'); // 获取标题元素 (可选)

    // --- 存储定时器 ID ---
    let closeTimerId = null;
    let countdownIntervalId = null;
    let countdownSeconds = 5;
    const countdownElement = document.createElement('p');
    countdownElement.id = 'quiz-countdown';
    countdownElement.style.fontSize = '0.8rem';
    countdownElement.style.color = 'var(--text-light-color)';
    countdownElement.style.marginTop = '10px';
    // 确保 countdownElement 只添加一次
    if (!document.getElementById('quiz-countdown')) {
        quizResultDiv.appendChild(countdownElement);
    }

    // --- 添加拖动功能 ---
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // 用于记住位置的本地存储键
    const QUIZ_POSITION_KEY = 'quiz_widget_position';

    // 尝试从本地存储恢复位置
    function restorePosition() {
        const savedPosition = localStorage.getItem(QUIZ_POSITION_KEY);
        if (savedPosition) {
            try {
                const position = JSON.parse(savedPosition);
                // 确保位置在视口内
                if (isPositionValid(position)) {
                    quizContainer.style.bottom = 'auto'; // 清除底部固定
                    quizContainer.style.right = 'auto';  // 清除右侧固定
                    quizContainer.style.left = `${position.left}px`;
                    quizContainer.style.top = `${position.top}px`;
                }
            } catch (e) {
                console.error('恢复小部件位置失败:', e);
                // 出错时删除可能损坏的存储
                localStorage.removeItem(QUIZ_POSITION_KEY);
            }
        }
    }

    // 检查位置是否在视口内
    function isPositionValid(position) {
        return position.left >= 0 && 
               position.top >= 0 && 
               position.left <= window.innerWidth - 100 && 
               position.top <= window.innerHeight - 100;
    }

    // 保存位置到本地存储
    function savePosition(left, top) {
        const position = { left, top };
        localStorage.setItem(QUIZ_POSITION_KEY, JSON.stringify(position));
    }

    // 开始拖动
    quizContainer.addEventListener('mousedown', function(e) {
        // 如果点击的是输入框、按钮等，不要开始拖动
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'LABEL' || 
            e.target.closest('form') || 
            e.target === quizCloseBtn) {
            return;
        }
        
        isDragging = true;
        quizContainer.classList.add('dragging');
        
        // 计算鼠标在小部件内的位置
        const rect = quizContainer.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        
        // 防止文本选择
        e.preventDefault();
    });

    // 拖动过程
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // 计算新位置
        const left = e.clientX - dragOffsetX;
        const top = e.clientY - dragOffsetY;
        
        // 确保小部件不会被拖出视口
        const maxX = window.innerWidth - quizContainer.offsetWidth;
        const maxY = window.innerHeight - quizContainer.offsetHeight;
        
        // 应用新位置
        quizContainer.style.bottom = 'auto'; // 取消底部固定
        quizContainer.style.right = 'auto';  // 取消右侧固定
        quizContainer.style.left = `${Math.max(0, Math.min(left, maxX))}px`;
        quizContainer.style.top = `${Math.max(0, Math.min(top, maxY))}px`;
        
        // 如果正在计时关闭，取消计时
        clearQuizTimers();
    });

    // 结束拖动
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            quizContainer.classList.remove('dragging');
            
            // 保存位置
            const rect = quizContainer.getBoundingClientRect();
            savePosition(rect.left, rect.top);
        }
    });

    // 页面加载时恢复位置
    restorePosition();

    // --- !!! 定义你的测验题目库 !!! ---
    const quizzes = [
        {
            title: "属性测试 Lv.1",
            question: "面对成堆的待补番剧，你会？",
            options: {
                A: "热血沸腾，先肝为敬！",
                B: "精挑细选，看评分解说再决定。",
                C: "可爱即是正义，优先萌系日常！",
                D: "随缘吧，打开哪个看哪个。"
            },
            resultsMap: {
                A: "【肝帝属性】只要是认准的番剧，爆肝通宵算什么！让弹幕刷满你的名字！",
                B: "【考据党/评论家属性】看得不仅是剧情，更是制作与细节。评分和口碑很重要！",
                C: "【萌豚属性】AWSL！可爱就是生产力！只要角色够萌，剧情什么的可以缓缓~",
                D: "【随缘佛系属性】一切皆是缘分，打开哪个看哪个，随遇而安也是一种境界。"
            }
        },
        {
            title: "口味测试 α",
            question: "如果转生异世界，你希望获得什么能力？",
            options: {
                A: "毁天灭地的强大魔法！",
                B: "富可敌国的经商头脑！",
                C: "能和万物沟通的自然之力！",
                D: "无敌的幸运值和后宫光环！"
            },
            resultsMap: {
                A: "【战斗番爱好者】追求力量与冒险，渴望成为龙傲天！",
                B: "【种田/经营爱好者】比起打打杀杀，更喜欢建设与发展。",
                C: "【治愈系/日常番爱好者】向往平静祥和，与自然和谐共处。",
                D: "【后宫/爽文爱好者】运气也是实力的一部分，享受就完事了！"
            }
        },
        {
            title: "代码风格诊断",
            question: "遇到一个复杂的 Bug，你的第一反应是？",
            options: {
                A: "console.log() 大法好！",
                B: "Stack Overflow / Google 搜索！",
                C: "先去泡杯茶，冷静一下再说。",
                D: "重构！一定是之前的代码写得太烂了！"
            },
            resultsMap: {
                A: "【调试先锋】坚信没有什么是 log 不能解决的，如果有，就加更多 log！",
                B: "【CV 工程师】站在巨人的肩膀上，善用搜索解决问题也是一种能力！",
                C: "【养生程序员】保持冷静，调整心态是解决问题的第一步。",
                D: "【重构狂魔】代码洁癖，总觉得重写一遍能解决所有问题！"
            }
        },
        // 更多测验题目示例：

        {
            title: "穿越装备选择",
            question: "如果突然穿越，只能带一件装备，你会选？",
            options: {
                A: "无限容量的空间背包",
                B: "能鉴定万物的智慧眼镜",
                C: "一把削铁如泥的神剑",
                D: "一本能召唤萌妹/帅哥的契约书"
            },
            resultsMap: {
                A: "【仓鼠/囤积癖】安全感第一！拥有无限背包，走到哪儿都不怕！",
                B: "【情报就是力量】知识就是财富，掌握信息才能立于不败之地！",
                C: "【战斗力至上】管他那么多，能打才是硬道理！物理超度一切！",
                D: "【社交恐怖分子/CP头子】一个人冒险太孤单，召唤伙伴一起才有趣！"
            }
        },
        {
            title: "你的本命声优是？",
            question: "挑选声优时，你更看重？",
            options: {
                A: "声线！独特迷人的声线最重要！",
                B: "演技！能驾驭各种角色的实力派！",
                C: "颜值/性格！声优本人也要有趣/好看！",
                D: "角色加成！只要配了我喜欢的角色就好！"
            },
            resultsMap: {
                A: "【音控晚期】耳朵怀孕是最高追求！独特的声线是灵魂！",
                B: "【实力至上主义】用声音塑造角色的能力才是王道！",
                C: "【人设粉/颜粉】声优本人也是重要的组成部分！有趣的灵魂万里挑一！",
                D: "【角色厨】爱屋及乌，角色是连接你和声优的桥梁！"
            }
        },
        {
            title: "游戏角色定位",
            question: "在组队打副本时，你倾向于扮演？",
            options: {
                A: "冲锋陷阵的坦克/战士",
                B: "暴力输出的法师/射手",
                C: "默默守护的奶妈/辅助",
                D: "掌控全场的指挥/战术家"
            },
            resultsMap: {
                A: "【莽就完事了】喜欢冲在最前面，保护队友，感受近战的刺激！",
                B: "【输出就是信仰】追求极致的伤害数字，瞬间秒杀的快感！",
                C: "【团队守护者】默默付出，保证团队续航，是队伍不可或缺的存在。",
                D: "【策略大师】喜欢分析局势，运筹帷幄，享受掌控胜利的乐趣。"
            }
        },
        {
            title: "入坑姿势诊断",
            question: "你通常是如何入坑一部新作品的？",
            options: {
                A: "朋友疯狂安利，不吃不行！",
                B: "看PV/画风/人设，第一眼就爱上！",
                C: "追当季热门，随大流总没错！",
                D: "考古挖掘，喜欢自己发现宝藏作品！"
            },
            resultsMap: {
                A: "【被动安利型】有好朋友真是太好了！总能发现新大陆！",
                B: "【视觉动物/颜控】颜值即是正义！好看的皮囊是入坑的第一动力！",
                C: "【潮流前线玩家】紧跟热点，第一时间参与讨论才有乐趣！",
                D: "【独立探险家】喜欢自己挖掘冷门佳作，享受发现宝藏的惊喜！"
            }
        },
        {
            title: "你的CP观是？",
            question: "关于作品里的 CP (配对)，你的态度更接近？",
            options: {
                A: "官配最高！官方发的糖最甜！",
                B: "只要有互动，万物皆可CP！",
                C: "冷圈爱好者，喜欢在北极圈产粮。",
                D: "更关注角色个人成长，CP随缘。"
            },
            resultsMap: {
                A: "【官配党】官方认证，最为致命！坚决拥护官方CP！",
                B: "【杂食/拉郎党】脑洞大过天，只要同框就能磕！CP乱炖最快乐！",
                C: "【极地探险家】我的CP就是最真的！就算冷死也要自己发电！",
                D: "【角色本位主义】CP是锦上添花，角色的独立魅力和成长更重要！"
            }
        }
    ];
    // ------------------------------------

    let currentQuiz = null; // 用于存储当前选中的测验

    // 函数：加载并显示一个随机测验
    function loadRandomQuiz() {
        // 1. 随机选择一个测验
        const randomIndex = Math.floor(Math.random() * quizzes.length);
        currentQuiz = quizzes[randomIndex];

        // 2. 更新 HTML 内容
        if (quizTitleElement) quizTitleElement.textContent = currentQuiz.title; // 更新标题
        if (quizQuestionElement) quizQuestionElement.textContent = currentQuiz.question; // 更新问题

        if (quizOptionsList) {
            quizOptionsList.innerHTML = ''; // 清空旧选项
            for (const key in currentQuiz.options) {
                const li = document.createElement('li');
                const label = document.createElement('label');
                const input = document.createElement('input');

                input.type = 'radio';
                input.name = 'quiz-choice'; // name 必须一致
                input.value = key;          // value 是选项标识符 A/B/C/D
                input.required = true;

                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${key}. ${currentQuiz.options[key]}`)); // 显示选项文本
                li.appendChild(label);
                quizOptionsList.appendChild(li);
            }
        }

        // 3. 重置结果区域和表单
        resetQuizState();
    }

    // 函数：重置测验状态 (清除结果，重置表单)
    function resetQuizState() {
        clearQuizTimers(); // 清除可能存在的定时器
        if (quizResultDiv) quizResultDiv.style.display = 'none';
        if (quizResultText) quizResultText.textContent = '';
        if (quizForm) quizForm.reset();
        // (可选) 恢复问题和选项的显示 (如果之前隐藏了)
        // if (quizForm) quizForm.style.display = 'block';
    }

    // 函数：清除定时器 (保持不变)
    // 函数：清除所有定时器并重置状态
    function clearQuizTimers() {
        if (closeTimerId) {
            clearTimeout(closeTimerId);
            closeTimerId = null;
        }
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        // 确保 countdownElement 存在再操作
        const countdownElem = document.getElementById('quiz-countdown');
        if(countdownElem) {
            countdownElem.textContent = ''; // 清空倒计时显示
        }
    }

    // 函数：开始自动关闭倒计时
    function startAutoCloseTimer() {
        clearQuizTimers(); // 先清除可能存在的旧定时器

        // 确保 countdownElement 存在
        const countdownElem = document.getElementById('quiz-countdown');
        if (!countdownElem) {
            console.error("无法找到用于显示倒计时的元素 #quiz-countdown");
            return; // 找不到元素就无法继续
        }

        countdownSeconds = 5; // 重置秒数
        countdownElem.textContent = `将在 ${countdownSeconds} 秒后自动关闭...`;

        // 每秒更新倒计时
        countdownIntervalId = setInterval(() => {
            countdownSeconds--;
            if (countdownSeconds > 0) {
                countdownElem.textContent = `将在 ${countdownSeconds} 秒后自动关闭...`;
            } else {
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
                // countdownElem.textContent = '即将关闭...';
            }
        }, 1000);

        // 设置 5 秒后执行关闭操作
        closeTimerId = setTimeout(() => {
            // 确保 quizContainer 存在
            if (quizContainer) {
                quizContainer.classList.add('hidden');
            }
            // 关闭后也清理一下状态
            clearQuizTimers();
        }, 5000);
    }

    // 处理表单提交 (查看结果按钮点击)
    if (quizForm) {
        quizForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (!currentQuiz) return; // 如果没有加载测验，则不处理

            const formData = new FormData(quizForm);
            const selectedChoice = formData.get('quiz-choice');

            if (selectedChoice && currentQuiz.resultsMap[selectedChoice]) {
                quizResultText.textContent = currentQuiz.resultsMap[selectedChoice]; // 使用当前测验的结果
                quizResultDiv.style.display = 'block';
                startAutoCloseTimer(); // 启动关闭倒计时
            } else {
                alert('请先选择一个选项哦~');
            }
        });
    }

    // 处理重置按钮点击
    if (quizResetBtn) {
        quizResetBtn.addEventListener('click', function() {
            // 重置状态，并且加载一个新的随机测验
            resetQuizState();
            loadRandomQuiz();
        });
    }

    // 处理关闭按钮点击
    if (quizCloseBtn) {
        quizCloseBtn.addEventListener('click', function() {
            clearQuizTimers();
            quizContainer.classList.add('hidden');
            // (可选) localStorage 记录关闭状态
        });
    }

    // --- 页面加载时，加载第一个随机测验 ---
    loadRandomQuiz();

    // (可选) 检查 localStorage 关闭状态 (保持不变)

} // if (quizContainer) 结束

// --- 其他 JS 功能 ---

    // (可选) 检查 localStorage，如果用户之前关闭过，则默认隐藏
    // if (localStorage.getItem('quizClosed') === 'true') {
    //     quizContainer.classList.add('hidden');
    // }

 // if (quizContainer) 结束
// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 文章分类页面折叠功能 ---
// 使用事件委托，监听整个分类列表容器的点击事件
const categoryListContainer = document.querySelector('.category-list');

if (categoryListContainer) {
    categoryListContainer.addEventListener('click', function(event) {
        // 检查被点击的元素是否是触发器 (图标或标题链接)
        const target = event.target;
        const header = target.closest('.collapsible-header'); // 找到最近的 header

        // 确保点击的是 header 内部的元素或者是 header 本身
        if (header && (target.classList.contains('toggle-icon') || target.classList.contains('toggle-trigger'))) {
            event.preventDefault(); // 阻止链接默认行为

            const section = header.closest('.collapsible-section'); // 找到对应的 section
            if (!section) return;

            const content = section.querySelector('.collapsible-content'); // 找到内容区域
            const icon = header.querySelector('.toggle-icon'); // 找到图标

            if (section.classList.contains('open')) {
                // 如果当前是展开状态，则收起
                section.classList.remove('open');
                if (content) content.style.display = 'none'; // 直接隐藏
                // 如果使用 max-height 动画，则移除 open 类即可
                if (icon) icon.textContent = '▶'; // 变回右箭头

            } else {
                // 如果当前是收起状态，则展开
                section.classList.add('open');
                if (content) content.style.display = 'block'; // 直接显示
                // 如果使用 max-height 动画，则添加 open 类即可
                if (icon) icon.textContent = '▼'; // 变成下箭头
            }
        }
    });
}

// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 新版二次元时钟小部件功能 ---
const clockHourElement = document.querySelector('.clock-widget .hour');
const clockMinuteElement = document.querySelector('.clock-widget .minute');
const clockSecondElement = document.querySelector('.clock-widget .second');
const clockWeekdayElement = document.getElementById('clock-weekday');
const clockAmpmElement = document.getElementById('clock-ampm');
// 只在有时、分、秒元素时执行
if (clockHourElement && clockMinuteElement && clockSecondElement && clockWeekdayElement && clockAmpmElement) {

    // 函数：更新时钟显示
// 函数：更新时钟显示
function updateClock() {
    const now = new Date();
    const hours = now.getHours(); // 先获取原始小时数 (0-23)
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dayOfWeek = now.getDay(); // 获取星期几 (0=周日, 1=周一, ..., 6=周六)

    // --- 新增：星期和 AM/PM 处理 ---
    const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const ampm = hours >= 12 ? '午後' : '午前';
    // (可选) 如果你想用 12 小时制显示小时:
    // const displayHours = String(hours % 12 || 12).padStart(2, '0'); // 12点显示12, 0点显示12
    const displayHours = String(hours).padStart(2, '0'); // 保持 24 小时制
    // -----------------------------

    // 更新时、分、秒
    if (clockHourElement.textContent !== displayHours) {
        clockHourElement.textContent = displayHours;
    }
    if (clockMinuteElement.textContent !== minutes) {
        clockMinuteElement.textContent = minutes;
    }
    if (clockSecondElement.textContent !== seconds) {
        clockSecondElement.textContent = seconds;
    }

    // --- 新增：更新星期和 AM/PM ---
    if (clockWeekdayElement.textContent !== weekdays[dayOfWeek]) {
        clockWeekdayElement.textContent = weekdays[dayOfWeek];
    }
    if (clockAmpmElement.textContent !== ampm) {
        clockAmpmElement.textContent = ampm;
    }
    // -----------------------------
}
    // 1. 页面加载时立即执行一次
    updateClock();

    // 2. 每秒更新一次
    setInterval(updateClock, 1000);

} else {
    console.log("提示：未找到完整的时钟显示元素 (hour, minute, second, weekday, ampm)，时钟小部件未启用。");
}


// (确保这是在 document.addEventListener('DOMContentLoaded', function() { ... }); 内部)

// --- 随机古诗小部件功能 (调用今日诗词 API 版本) ---
const poemSentenceElement = document.getElementById('poem-sentence');
const poemInfoElement = document.getElementById('poem-info');
const poemWidget = document.querySelector('.poem-widget'); // 获取整个小部件容器

// 只在相关元素存在时执行
if (poemSentenceElement && poemInfoElement && poemWidget) {

    // 定义加载函数
    function loadJinrishici() {
        jinrishici.load(result => {
            // 请求成功的回调函数
            console.log(">>> 今日诗词成功回调执行！");
            console.log("今日诗词 API 返回:", result); // API 数据能正确打印

            // !!! 问题很可能就出在下面这两行 !!!

            poemSentenceElement.textContent = result.data.content; // 显示诗句

            // 构建作者和标题信息
            let infoText = `—— 《${result.data.origin.title}》 ${result.data.origin.dynasty}·${result.data.origin.author}`;
            poemInfoElement.textContent = infoText;        }, errorResult => {
            console.log(">>> 今日诗词失败回调执行！"); // <--- 添加这行
            console.error("今日诗词 API 请求失败:", errorResult);
        });
    }

    // --- 页面加载时执行加载 ---
    loadJinrishici();

    // --- (可选) 添加刷新功能 ---
    // 如果 HTML 中有一个 id="refresh-poem-btn" 的按钮
    const refreshPoemBtn = document.getElementById('refresh-poem-btn');
    if (refreshPoemBtn) {
        refreshPoemBtn.addEventListener('click', () => {
            // 点击按钮时再次调用加载函数
            poemSentenceElement.textContent = "正在加载..."; // 显示加载提示
            poemInfoElement.textContent = "";
            loadJinrishici();
        });
    }
    // 或者，让整个小部件标题可点击刷新？
    const poemWidgetTitle = poemWidget.querySelector('.widget-title');
    if (poemWidgetTitle) {
         poemWidgetTitle.style.cursor = 'pointer';
         poemWidgetTitle.title = '点击换一首';
         poemWidgetTitle.addEventListener('click', () => {
             poemSentenceElement.textContent = "正在加载...";
             poemInfoElement.textContent = "";
             loadJinrishici();
         });
    }


} else {
     console.log("提示：未找到诗词显示元素，随机古诗小部件未启用。");
}

// --- 其他 JS 功能 ---

const contentMainArea = document.querySelector('.content-main'); // 获取主内容区域

if (contentMainArea) { // 确保主内容区存在
    contentMainArea.addEventListener('click', function(event) {
        // 检查被点击的元素是否是折叠触发器 (图标或标题链接)
        const target = event.target;
        const header = target.closest('.collapsible-header'); // 找到最近的 header

        // 确保点击的是 header 内部的元素或者是 header 本身,
        // 并且它位于 .collapsible-section 内部 (避免误触其他非折叠标题)
        if (header && header.closest('.collapsible-section') && (target.classList.contains('toggle-icon') || target.classList.contains('toggle-trigger'))) {
            event.preventDefault(); // 阻止链接默认行为

            const section = header.closest('.collapsible-section');
            if (!section) return;

            const content = section.querySelector('.collapsible-content');
            const icon = header.querySelector('.toggle-icon');

            if (section.classList.contains('open')) {
                // 收起
                section.classList.remove('open');
                if (content) content.style.display = 'none';
                if (icon) icon.textContent = '▶';
            } else {
                // 展开
                section.classList.add('open');
                if (content) content.style.display = 'block';
                if (icon) icon.textContent = '▼';
            }
        }
    });
}


}); // DOMContentLoaded 的最终结束符