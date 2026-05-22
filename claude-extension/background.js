// 动态数据中心，格式：{ aiName: { task: "xxx", response: "xxx", status: "xxx" } }
let aiRegistry = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. 驱动脚本上线注册，或高频同步状态
  if (request.action === "sync_alive") {
    const name = request.aiType;
    if (!aiRegistry[name]) {
      aiRegistry[name] = { task: null, response: "连接成功，准备就绪...", status: "ready" };
    }
    // 更新实时状态（由驱动脚本汇报上来）
    if (request.status) aiRegistry[name].status = request.status;
    
    // 把当前该 AI 的专属任务顺便丢给它
    sendResponse({ task: aiRegistry[name].task });
    
    // 任务被取走后立刻清空
    if (aiRegistry[name].task) {
      aiRegistry[name].task = null;
    }
  }

  // 2. 控制台一键群发：广播给所有当前已注册上线的 AI
  if (request.action === "set_task") {
    for (let name in aiRegistry) {
      aiRegistry[name].task = request.text;
      aiRegistry[name].status = "task_assigned";
      aiRegistry[name].response = "任务已下发，等待页面响应...";
    }
    sendResponse({ status: "ok" });
  }

  // 3. 驱动脚本回传其实时打字流文本
  if (request.action === "update_response") {
    const name = request.aiType;
    if (aiRegistry[name]) {
      aiRegistry[name].response = request.text;
      aiRegistry[name].status = request.status || "streaming";
    }
    sendResponse({ status: "ok" });
  }

  // 4. 控制台获取全量动态状态，用以动态渲染 UI
  if (request.action === "get_status") {
    sendResponse({ registry: aiRegistry });
  }

  return true;
});

// 点击图标打开控制台
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "tabs.html" });
});