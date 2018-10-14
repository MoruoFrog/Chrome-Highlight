(function() {
    const highLighter = (function () {
        const storage  = chrome.storage.local
        const singleton = {}
        const events = []
        const styleTypeCount = 6
        // 插入的dom
        const highLightTagTail = '</i>'
        const gethighLightTagHead = i => {
            const index = i % styleTypeCount + 1
            return `<i\
                        class="_higtlight_chrome_extension_mor _higtlight_chrome_extension_mor__style__${index}"\
                        data-highlighted="1">`
        }

        // 观察被替换掉的文本节点，如果发生更新，比如vue之类的框架的绑定
        const replacedNodeObserver = new MutationObserver(record => {
            const originTextNode = record[0].target
            originTextNode.responsedNode.replaceWith(originTextNode)
        })

        let keywords = [],
            reg,
            _switch,
            originTextNode = [], // 保存原始textnode
            needTrack = true // 是否需要关注本轮doom变动
        
        singleton.init = () => {
            // 1. 从storage获取配置
            storage.get({
                highlight__mor__keywords: '',
                highlight__mor__switch: 'on',
            }, items => {
                let keywordStr = items.highlight__mor__keywords
        
                keywords = keywordStr || []
                _switch = items.highlight__mor__switch
                reg = getRegFromStrList(keywords)
                singleton.highLight() // 因为chrome storage读取是异步的
            })

            // 2. 与pop建立通信
            chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
                events.forEach(event => {
                    if (event.cmd === message.cmd) event.cb && event.cb({ message, sender, sendResponse })
                })
            })

            // 3. 监听变动
            const mo = new MutationObserver(singleton.highLight)
            const options = {
                'childList': true,
                'characterData': true,
                'subtree': true,
                'attributes': true,
            }
            mo.observe(document.body, options)
        }

        singleton.highLight = (a, b, c) => {
            if (!needTrack) {
                needTrack = true
                return
            }

            if (_switch === 'off') return
            if (keywords.length === 0) return
    
            const all = document.all
            const len = all.length

            const excludeTagName = ['STYLE', 'LINK', 'SCRIPT', 'META', 'TITLE']
            for (let i = 0; i < len; i++) {
                const element = all[i]
    
                ;[...element.childNodes]
                    .filter(node => node.nodeType === 3 
                                && !node.parentNode.dataset.highlighted // 被高亮之后需要标记，否则会无限循环
                                && !excludeTagName.includes(node.parentElement.tagName.toUpperCase()))
                    .forEach(textNode => {
                        const text = textNode.data
                        if (text.search(reg) === -1) return
    
                        const newElement = document.createElement('morun')
                        newElement.innerHTML = text.replace(reg, match => {
                            const index = keywords.indexOf(match)
                            if (index > -1) {
                                return `${gethighLightTagHead(index)}${match}${highLightTagTail}`
                            }
                        })
                        textNode.replaceWith(newElement)
                        // newElement.outerHTML = newElement.innerHTML
                        originTextNode.push(textNode)
                        textNode.responsedNode = newElement
                        replacedNodeObserver.observe(textNode, { 'characterDataOldValue': true})
                        needTrack = false
                    })
            }
        }

        singleton.cancelHight = (needTrigerHighlight) => {
            originTextNode.forEach(node => node.responsedNode.replaceWith(node))
            originTextNode = []
        }

        singleton.on = (event, cb) => {
            events.push({
                cmd: `highlight__mor__${event}`,
                cb,
            })
        }

        singleton.switchOn = () => {
            _switch = 'on'
            storage.set({
                highlight__mor__switch: 'on',
            })
            singleton.highLight()
        }

        singleton.switchOff = () => {
            singleton.cancelHight()
            _switch = 'off'

            storage.set({
                highlight__mor__switch: 'off',
            })
        }

        Object.defineProperty(singleton, 'keywords', {
            get() {
                return keywords
            },
            set(v) {
                keywords = v

                chrome.storage.local.set({
                    highlight__mor__keywords: keywords,
                })

                singleton.cancelHight()

                if (keywords.length > 0) {
                    reg = getRegFromStrList(keywords)
                    singleton.highLight()
                }
            }
        })

        Object.defineProperty(singleton, 'switch', {
            get() {
                return _switch
            },
            set() {
                return new Error('switch is readonly')
            }
        })

        return singleton
    })()

    highLighter.init()
    
    highLighter.on('updatekeyword', ({ message }) => {
        highLighter.keywords = message.keywordList
    })
    highLighter.on('getsetting', ({ sendResponse }) => {
        sendResponse({
            cmd: 'highlight__mor__getsetting',
            keywords: highLighter.keywords,
            _switch: highLighter.switch,
        })
    })
    highLighter.on('off', highLighter.switchOff)
    highLighter.on('on', highLighter.switchOn)
    highLighter.on('clearkeyword', () => highLighter.keywords = [])

})()