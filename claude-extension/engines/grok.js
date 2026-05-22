console.log("【Omni Core】Grok 2026 深度穿透渲染驱动已成功挂载！");

const taskTimer = setInterval(() => {
  try {
    chrome.runtime.sendMessage({ action: "sync_alive", aiType: "grok" }, (response) => {
      if (chrome.runtime.lastError) { clearInterval(taskTimer); return; }
      if (response && response.task) {
        executeGrokSend(response.task);
      }
    });
  } catch (e) {
    clearInterval(taskTimer);
  }
}, 1000);

function executeGrokSend(text) {
  chrome.runtime.sendMessage({ action: "update_response", aiType: "grok", status: "locating_input", text: "正在锁定 Grok 骨架..." });
  
  const editor = document.querySelector('.ProseMirror') || 
                 document.querySelector('[contenteditable="true"]') ||
                 document.querySelector('[data-testid="chat-input"] [contenteditable="true"]');
  
  if (!editor) {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "grok", status: "error_no_input", text: "未定位到输入区域" });
    return;
  }

  chrome.runtime.sendMessage({ action: "update_response", aiType: "grok", status: "typing", text: "正在注入物理文本..." });
  
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);
  document.execCommand('insertText', false, text);

  editor.dispatchEvent(new Event('input', { bubbles: true }));

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "grok", status: "sending", text: "破防发射中..." });
    
    // 发送键组合拳
    const down = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
    const up = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
    editor.dispatchEvent(down);
    editor.dispatchEvent(up);
    
    setTimeout(() => { startGrokObserver(); }, 1200);
  }, 600);
}

function startGrokObserver() {
  function syncText() {
    // 靶向定位：直接抓取你提供的新版 Grok 助手回复大容器
    const messages = document.querySelectorAll('[data-testid="assistant-message"]') || 
                     document.querySelectorAll('.message-bubble') ||
                     document.querySelectorAll('.prose');
                     
    if (messages.length > 0) {
      // 拿到最后一条（最新的）AI 回复
      const latestMessage = messages[messages.length - 1];
      
      // 克隆一个节点，防止我们在剥离计算时干扰用户的网页视觉
      const clone = latestMessage.cloneNode(true);
      
      // 绝杀：暴力剔除掉里面所有干扰视线的脏组件（思考中、复制按钮、追问推荐按钮等）
      const garbageSelectors = [
        '.thinking-container', 
        '.action-buttons', 
        '.inline-media-container',
        'button', 
        'svg',
        '.absolute'
      ];
      garbageSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });

      // 提取纯净的打字流正文
      const cleanText = clone.innerText.trim();
      if (cleanText) {
        chrome.runtime.sendMessage({ 
          action: "update_response", 
          aiType: "grok", 
          status: "streaming", 
          text: cleanText 
        }).catch(() => {});
      }
    }
  }
  
  const observer = new MutationObserver(() => { syncText(); });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  
  // 双重保险：辅以轮询，应对极端情况下不触发 Mutation 的影子 DOM
  setInterval(() => { try { syncText(); } catch(e) {} }, 500);
}