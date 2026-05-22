console.log("【Omni Core】Claude 隔离沙盒驱动已成功挂载！");

const taskTimer = setInterval(() => {
  try {
    // 报告在线状态，顺便看看有没有自己的任务
    chrome.runtime.sendMessage({ action: "sync_alive", aiType: "claude" }, (response) => {
      if (chrome.runtime.lastError) { clearInterval(taskTimer); return; }
      
      if (response && response.task) {
        executeClaudeSend(response.task);
      }
    });
  } catch (e) {
    clearInterval(taskTimer);
  }
}, 1000);

function executeClaudeSend(text) {
  chrome.runtime.sendMessage({ action: "update_response", aiType: "claude", status: "locating_input", text: "正在定位主输入框..." });
  
  const editor = document.querySelector('.ProseMirror') || document.querySelector('[contenteditable="true"]');
  if (!editor) {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "claude", status: "error_no_input", text: "未定位到 Claude 输入框" });
    return;
  }

  chrome.runtime.sendMessage({ action: "update_response", aiType: "claude", status: "typing", text: "正在填充内容并同步状态..." });
  editor.focus();
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    editor.innerHTML = ''; 
    const textNode = document.createTextNode(text);
    editor.appendChild(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (e) {
    editor.innerText = text;
  }

  editor.dispatchEvent(new Event('beforeinput', { bubbles: true }));
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  editor.dispatchEvent(new Event('change', { bubbles: true }));
  editor.blur(); 
  editor.focus();

  setTimeout(() => {
    chrome.runtime.sendMessage({ action: "update_response", aiType: "claude", status: "sending", text: "正在尝试触发发送按键..." });
    
    let btn = document.querySelector('[data-testid="send-button"]') || 
              document.querySelector('button[aria-label*="send" i]') ||
              document.querySelector('button[aria-label*="发送" i]') ||
              document.querySelector('button:has(svg)');
    if (btn) {
      if (btn.hasAttribute('disabled')) btn.removeAttribute('disabled');
      btn.click();
    } else {
      editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 }));
    }
    
    setTimeout(() => { startClaudeObserver(); }, 1500);
  }, 600);
}

function startClaudeObserver() {
  function syncText() {
    const parentContainers = document.querySelectorAll('.font-claude-response') || document.querySelectorAll('.standard-markdown');
    if (parentContainers.length > 0) {
      const currentText = parentContainers[parentContainers.length - 1].innerText.trim();
      if (currentText) {
        chrome.runtime.sendMessage({ action: "update_response", aiType: "claude", status: "streaming", text: currentText }).catch(() => {});
      }
    }
  }
  const observer = new MutationObserver(() => { syncText(); });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setInterval(() => { try { syncText(); } catch(e) {} }, 500);
}