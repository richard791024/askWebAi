document.getElementById('sendBtn').addEventListener('click', () => {
  const text = document.getElementById('promptInput').value.trim();
  if (!text) return;

  chrome.runtime.sendMessage({ action: "set_task", text: text }, (response) => {
    console.log("群发广播已发送至总线");
  });
});

// 状态文字汉化与样式映射映射表
const statusMap = {
  "ready": { text: "🟢 准备就绪", class: "status-ready" },
  "task_assigned": { text: "🟡 任务已下发", class: "status-busy" },
  "locating_input": { text: "🟡 正在定位输入框", class: "status-busy" },
  "typing": { text: "🟡 正在注入伪装输入", class: "status-busy" },
  "sending": { text: "🟡 正在触发发车按钮", class: "status-busy" },
  "streaming": { text: "⚡ 正在同步打字流", class: "status-busy" },
  "error_no_input": { text: "❌ 找不到输入框", class: "status-error" }
};

// 轮询渲染函数
setInterval(() => {
  chrome.runtime.sendMessage({ action: "get_status" }, (response) => {
    if (!response || !response.registry) return;
    
    const container = document.getElementById('panelContainer');
    const registry = response.registry;
    
    // 1. 清理已经不再活跃的卡片（比对当前字典里的 AI 是否在界面中存在）
    const activeAIs = Object.keys(registry);
    
    // 2. 遍历字典，动态更新或创建卡片
    activeAIs.forEach(name => {
      let card = document.getElementById(`card-${name}`);
      const aiData = registry[name];
      const statusConfig = statusMap[aiData.status] || { text: aiData.status, class: "status-busy" };
      
      // 如果卡片还不存在，动态创建
      if (!card) {
        card = document.createElement('div');
        card.id = `card-${name}`;
        card.className = `ai-card`;
        // 给不同的 AI 顶边加上独特的点缀色
        if (name === 'claude') card.style.borderTopColor = '#d97706';
        if (name === 'deepseek') card.style.borderTopColor = '#2563eb';
        
        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">${name}</span>
            <span class="status-badge ${statusConfig.class}" id="status-${name}">${statusConfig.text}</span>
          </div>
          <div class="output" id="output-${name}">等待发送...</div>
        `;
        container.appendChild(card);
      }
      
      // 动态更新数据与红绿灯状态
      const statusBadge = document.getElementById(`status-${name}`);
      statusBadge.innerText = statusConfig.text;
      statusBadge.className = `status-badge ${statusConfig.class}`;
      
      const outputDiv = document.getElementById(`output-${name}`);
      // 避免重复高频刷屏赋值，文字变了才更新
      if (outputDiv.innerText !== aiData.response) {
        outputDiv.innerText = aiData.response;
        // 自动滚动到底部
        outputDiv.scrollTop = outputDiv.scrollHeight;
      }
    });
  });
}, 400);