console.log("【Omni Core】Gemini 原生光标流驱动已挂载！");

const taskTimer = setInterval(() => {
  try {
    chrome.runtime.sendMessage({ action: "sync_alive", aiType: "gemini" }, (response) => {
      if (chrome.runtime.lastError) { clearInterval(taskTimer); return; }
      if (response && response.task) {
        executeGeminiSend(response.task);
      }
    });
  } catch (e) {
    clearInterval(taskTimer);
  }
}, 1000);

function executeGeminiSend(text) {
  chrome.runtime.sendMessage({ action: "update_response", aiType: "gemini", status: "locating_input", text: "正在唤醒 Gemini 核心..." });
  
  const editor = document.querySelector('.ql-editor') || 
                 document.querySelector('[contenteditable="true"]');
  
  if (!editor) {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "gemini", status: "error_no_input", text: "未定位到输入框" });
    return;
  }

  chrome.runtime.sendMessage({ action: "update_response", aiType: "gemini", status: "typing", text: "注入物理文本流..." });
  
  // 核心突破：强行清除残留，通过系统级 Selection 执行文本插入
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);
  document.execCommand('insertText', false, text);

  // 广播事件流
  editor.dispatchEvent(new Event('input', { bubbles: true }));

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "gemini", status: "sending", text: "正在全弹发射..." });
    
    // 终极靶向：通过寻找它那个带箭头的蓝色物理按钮组件或包含它的容器
    let btn = document.querySelector('button[aria-label*="发送" i]') || 
              document.querySelector('button[aria-label*="Send" i]') ||
              document.querySelector('button:has(svg path[d*="M2"])') || // 匹配纸飞机图标
              document.querySelector('[data-test-id="send-button"]');

    if (btn) {
      btn.removeAttribute('disabled');
      btn.click();
      // 额外追加一组物理回车防止点击穿透失效
      editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
    } else {
      editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
    }
    
    setTimeout(() => { startGeminiObserver(); }, 1500);
  }, 600);
}

function startGeminiObserver() {
  function syncText() {
    // 兼容 Gemini 2026年最新版的多路由响应内容容器
    const parentContainers = document.querySelectorAll('.markdown-main-panel') || 
                             document.querySelectorAll('message-content') ||
                             document.querySelectorAll('.model-response-text');
    if (parentContainers.length > 0) {
      const currentText = parentContainers[parentContainers.length - 1].innerText.trim();
      if (currentText) {
        chrome.runtime.sendMessage({ action: "update_response", aiType: "gemini", status: "streaming", text: currentText }).catch(() => {});
      }
    }
  }
  const observer = new MutationObserver(() => { syncText(); });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setInterval(() => { try { syncText(); } catch(e) {} }, 500);
}