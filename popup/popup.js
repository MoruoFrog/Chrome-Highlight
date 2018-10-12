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
        cmd: 'highlight__mor__clearkeyword',
    })
})

document.getElementById('confirm').addEventListener('click', function (e) {
    const value = document.querySelector('[name=keywords').value.trim()
    if (!value) return

    const keywordList = value.split(/\s+/)
    sendMessageToContentScript({
        cmd: 'highlight__mor__updatekeyword',
        keywordList,
    })
})

sendMessageToContentScript({
    cmd: 'highlight__mor__getsetting',
}, function ({cmd, keywords, _switch}) {
    if (cmd === 'highlight__mor__getsetting') {
        document.querySelector('[name=keywords]').value = keywords.join('\n')
        highlightSwitch = _switch
        if (highlightSwitch === 'off') {
            switchBar.classList.remove('transition')
            switchBar.classList.remove('on')
            setTimeout(() => {
                switchBar.classList.add('transition')
            }, 100)
        }
    }
})