const highLighter = new Highlighter(document.body) // from highlighter.js
highLighter.show()

// get stored keywords and switch
const storage = chrome.storage.local
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

// message with popup.html
message.on('highlight__mor__updatekeyword', ({
  message
}) => {
  const keywords = message.keywordList
  highLighter.updateKeywords(keywords)
  storage.set({
    highlight__mor__keywords: keywords,
  })
})

message.on('highlight__mor__off', () => {
  highLighter.switchOff()
  storage.set({
    highlight__mor__switch: 'off',
  })
})

message.on('highlight__mor__on', () => {
  highLighter.switchOn()
  storage.set({
    highlight__mor__switch: 'on',
  })
})
