// 和active的tab的content_scripts通信
function sendMessageToContentScript(message, callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response);
    })
  })
}

// 给所有tabs发送消息
function sendMessageToAllTabs(message, callback) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message, function (response) {
        if (callback) callback(response);
      })
    })
  })
}

let highlightSwitch = 'on'
const switchBar = document.querySelector('.bar')
document.querySelector('.switch').addEventListener('click', function (e) {
  if (highlightSwitch === 'on') {
    highlightSwitch = 'off'
    switchBar.classList.remove('on')
    sendMessageToContentScript({
      cmd: 'highlight__mor__off',
    })
  } else {
    highlightSwitch = 'on'
    switchBar.classList.add('on')
    sendMessageToContentScript({
      cmd: 'highlight__mor__on',
    })
  }
})

document.getElementById('reset').addEventListener('click', function (e) {
  document.querySelector('[name=keywords').value = ''
  sendMessageToContentScript({
    cmd: 'highlight__mor__updatekeyword',
    keywordList: [],
  })
})

document.getElementById('confirm').addEventListener('click', function (e) {
  const value = document.querySelector('[name=keywords').value.trim()

  const keywordList = value ? value.split(/\s+/) : []
  sendMessageToContentScript({
    cmd: 'highlight__mor__updatekeyword',
    keywordList,
  }, window.close)
})

const storage = chrome.storage.local
storage.get({
  highlight__mor__keywords: [],
  highlight__mor__switch: 'on',
}, items => {
  document.querySelector('[name=keywords]').value = items.highlight__mor__keywords.join('\n')
  highlightSwitch = items.highlight__mor__switch
  if (highlightSwitch === 'off') {
    switchBar.classList.remove('transition')
    switchBar.classList.remove('on')
    setTimeout(() => {
      switchBar.classList.add('transition')
    }, 100)
  }
})
