console.log("【Omni Core】DeepSeek 独立沙盒调试驱动已挂载！");

const taskTimer = setInterval(() => {
  try {
    // 实时向后台打卡报平安
    chrome.runtime.sendMessage({ action: "sync_alive", aiType: "deepseek" }, (response) => {
      if (chrome.runtime.lastError) { clearInterval(taskTimer); return; }
      
      // 捕获属于 DeepSeek 的专属任务
      if (response && response.task) {
        console.log("【DS沙盒】捕获到发送任务:", response.task);
        executeDeepSeekDebug(response.task);
      }
    });
  } catch (e) {
    clearInterval(taskTimer);
  }
}, 1000);

function executeDeepSeekDebug(text) {
  // 向控制台汇报：进入寻找输入框节点
  chrome.runtime.sendMessage({ action: "update_response", aiType: "deepseek", status: "locating_input", text: "正在扫描页面定位 [name='search'] 输入框..." });

  // 1. 精准靶向锁定
  const editor = document.querySelector('textarea[name="search"]') || document.querySelector('textarea.ds-scroll-area');
  
  if (!editor) {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "deepseek", status: "error_no_input", text: "【排查报错】页面上未能定位到 DeepSeek 的 textarea 元素！" });
    return;
  }

  // 2. 状态汇报：开始模拟键盘填充
  chrome.runtime.sendMessage({ action: "update_response", aiType: "deepseek", status: "typing", text: "已锁定文本域，正在进行底层值同步注入..." });
  editor.focus();
  editor.value = text;
  
  // 3. 实时更新 DeepSeek 的高度辅助容器
  const mirrorDiv = document.querySelector('.b13855df');
  if (mirrorDiv) {
    mirrorDiv.textContent = text;
  }

  // 四重基础状态驱动
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  editor.dispatchEvent(new Event('change', { bubbles: true }));

  // 4. 状态汇报：准备发车
  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "deepseek", status: "sending", text: "文本填充完毕。正在测试原生回车按键进行强制发车..." });
    
    // 发射单点调试：测试 Enter 敲击
    const enterEvent = new KeyboardEvent('keydown', {
      bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13
    });
    editor.dispatchEvent(enterEvent);
    
    setTimeout(() => { startDeepSeekObserver(); }, 1500);
  }, 600);
}

function startDeepSeekObserver() {
  function syncText() {
    const parentContainers = document.querySelectorAll('.ds-markdown') || document.querySelectorAll('.ds-moveable-inner');
    if (parentContainers.length > 0) {
      const currentText = parentContainers[parentContainers.length - 1].innerText.trim();
      if (currentText) {
        chrome.runtime.sendMessage({ action: "update_response", aiType: "deepseek", status: "streaming", text: currentText }).catch(() => {});
      }
    }
  }
  const observer = new MutationObserver(() => { syncText(); });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setInterval(() => { try { syncText(); } catch(e) {} }, 500);
}