(function() {
    let keywords = [],reg,_switch

    chrome.storage.local.get({
        highlight__mor__keywords: '',
        highlight__mor__switch: 'on',
    }, items => {
        let keywordStr = items.highlight__mor__keywords

        keywords = keywordStr ? JSON.parse(keywordStr) : []
        _switch = items.highlight__mor__switch
        reg = new RegExp(keywords.join('|'), 'g')

        highLight() // 因为chrome storage读取是异步的
    })

    const highLightTagHead = '<span\
        style="background: rgb(255, 198, 0);\
            border-radius: 3px;\
            box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 3px;\
            display:inline;\
            color: black;\
            padding: 0 2px; "\
        data-highlighted="1">'
    const highLightTagTail = '</span>'
    let hightedElements = []
    let mutationByCancel = false

    function highLight(content) {
        if (mutationByCancel) {
            mutationByCancel = false
            return // 取消高亮操作导致的Mutation，直接返回
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
                            && !excludeTagName.includes(node.tagName)
                            && document.body.contains(node))
                .forEach(textNode => {
                    const text = textNode.data
                    if (text.search(reg) === -1) return

                    const newElement = document.createElement('morun')
                    newElement.innerHTML = text.replace(reg, match => `${highLightTagHead}${match}${highLightTagTail}`)
                    textNode.replaceWith(newElement)
                    hightedElements.push(newElement)
                })
        }
    }

    function cancelHight() {
        if (hightedElements.length === 0) return
        hightedElements.forEach(element => {
            try {
                element.outerHTML = element.innerText
            } catch (e) {
                console.log(e, element)
            }
        })
        hightedElements = []
        mutationByCancel = true
    }

    const mo = new MutationObserver(highLight)
    const options = {
        'childList': true,
        'characterData': true,
        'subtree': true,
    }
    mo.observe(document.body, options)

    // 和popup通信
    chrome.runtime.onMessage.addListener(function({cmd, keywordList, regStr}, sender, sendResponse){
        if(cmd === 'highlight__mor__updatekeyword') {
            keywords = keywordList

            chrome.storage.local.set({
                highlight__mor__keywords: JSON.stringify(keywords),
            })

            reg = new RegExp(regStr, 'g')
            cancelHight()
            highLight()
        }

        if (cmd === 'highlight__mor__getsetting') {
            sendResponse({
                cmd: 'highlight__mor__getsetting',
                keywords,
                _switch,
            })
        }

        if (cmd === 'highlight__mor__offhight') {
            cancelHight()
            _switch = 'off'

            chrome.storage.local.set({
                highlight__mor__switch: 'off',
            })
        }

        if (cmd === 'highlight__mor__onhight') {
            _switch = 'on'

            chrome.storage.local.set({
                highlight__mor__switch: 'on',
            })
            highLight()
        }

        if (cmd === 'highlight__mor__clearkeyword') {
            keywords = []
            
            chrome.storage.local.set({
                highlight__mor__keywords: JSON.stringify(keywords),
            })
            cancelHight()
        }
    })
})()