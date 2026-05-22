console.log("【Omni Core】ChatGPT 隔离沙盒驱动已挂载！");

const taskTimer = setInterval(() => {
  try {
    chrome.runtime.sendMessage({ action: "sync_alive", aiType: "chatgpt" }, (response) => {
      if (chrome.runtime.lastError) { clearInterval(taskTimer); return; }
      if (response && response.task) {
        executeChatGPTSend(response.task);
      }
    });
  } catch (e) {
    clearInterval(taskTimer);
  }
}, 1000);

function executeChatGPTSend(text) {
  chrome.runtime.sendMessage({ action: "update_response", aiType: "chatgpt", status: "locating_input", text: "正在定位 ChatGPT 输入框..." });
  
  // ChatGPT 最常使用 contenteditable 的主富文本框（或者可以用 #prompt-textarea 兜底）
  const editor = document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"]');
  
  if (!editor) {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "chatgpt", status: "error_no_input", text: "未定位到 ChatGPT 输入框" });
    return;
  }

  chrome.runtime.sendMessage({ action: "update_response", aiType: "chatgpt", status: "typing", text: "正在填充内容..." });
  editor.focus();

  if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
    editor.value = text;
  } else {
    editor.innerText = text;
  }

  editor.dispatchEvent(new Event('beforeinput', { bubbles: true }));
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  editor.dispatchEvent(new Event('change', { bubbles: true }));

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "chatgpt", status: "sending", text: "正在触发发送按键..." });
    
    // ChatGPT 的按钮通常带特定的 data-testid
    let btn = document.querySelector('[data-testid="send-button"]') || 
              document.querySelector('button[aria-label*="send" i]') ||
              document.querySelector('button:has(svg)');
              
    if (btn && !btn.hasAttribute('disabled')) {
      btn.click();
    } else {
      editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
    }
    
    setTimeout(() => { startChatGPTObserver(); }, 1500);
  }, 600);
}

function startChatGPTObserver() {
  function syncText() {
    // ChatGPT 会把对话渲染在类名为 markdown or prose 的大容器里
    const parentContainers = document.querySelectorAll('.markdown') || document.querySelectorAll('.prose');
    if (parentContainers.length > 0) {
      const currentText = parentContainers[parentContainers.length - 1].innerText.trim();
      if (currentText) {
        chrome.runtime.sendMessage({ action: "update_response", aiType: "chatgpt", status: "streaming", text: currentText }).catch(() => {});
      }
    }
  }
  const observer = new MutationObserver(() => { syncText(); });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setInterval(() => { try { syncText(); } catch(e) {} }, 500);
}