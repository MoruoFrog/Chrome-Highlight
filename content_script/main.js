const highLighter = new Highlighter(document.body) // from highlighter.js
highLighter.show()

// get stored keywords and switch
const storage  = chrome.storage.sync
storage.get({
    highlight__mor__keywords: [],
    highlight__mor__switch: 'on',
}, items => {
    const keywordStr = items.highlight__mor__keywords
    const _switch = items.highlight__mor__switch
    if (_switch === 'off') {
        highLighter.switchOff()
    }
    highLighter.updateKeywords(keywordStr)
})

// message with popup
const events = [] 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    events.forEach(event => {
        if (event.cmd === message.cmd) event.cb && event.cb({ message, sender, sendResponse })
    })
})

const message = {
    on (event, cb) {
        events.push({
            cmd: `highlight__mor__${event}`,
            cb,
        })
    }
}

message.on('updatekeyword', ({ message }) => {
    const keywords = message.keywordList
    highLighter.updateKeywords(keywords)
    storage.set({
        highlight__mor__keywords: keywords,
    })
})

message.on('off', () => {
    highLighter.switchOff()
    storage.set({
        highlight__mor__switch: 'off',
    })
})

message.on('on', () => {
    highLighter.switchOn()
    storage.set({
        highlight__mor__switch: 'on',
    })
})
