// message with popup.html
const events = []

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  events.forEach(event => {
    if (event.cmd === message.cmd) {
      event.cb && event.cb({
        message,
        sender,
        sendResponse
      })
    }
  })
})

const message = {
  on(cmd, cb) {
    events.push({
      cmd,
      cb,
    })
  }
}
