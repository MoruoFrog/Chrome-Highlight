const Highlighter = (function() {
    let keywords, target, reg
    let _switch = 'on'
    let originTextNode = [] // 被替换掉的text-node，用来取消高亮

    const getRegFromStrList = (function () {
        const metaStrInReg = [
            '*',
            '^',
            '$',
            '*',
            '+',
            '?',
            '{',
            '}',
            '?',
            '.',
            '(',
            ')',
            '!',
            '|',
            '\\',
        ]
        const reg = new RegExp(metaStrInReg.map(s => `\\${s}`).join('|'), 'g')
             
        return arr => {
            if (arr.length === 0) return false
            const regStr =  arr.map(str => str.replace(reg, match => `\\${match}`)).join('|')
            return new RegExp(regStr, 'g')
        }
    })()

    // 观察被替换掉的文本节点，如果发生更新，比如vue之类的框架的绑定，替换高亮节点
    const replacedNodeObserver = new MutationObserver(records => {
        records.forEach(record => {
            const originTextNode = record.target
            originTextNode.responsedNode.replaceWith(originTextNode)  
        })
    })

    // 高亮单个text-node
    const highlightTextNode = node => {
        if (!reg) return
        if (node.nodeType !== 3) return
        text = node.data
        if (text.search(reg) === -1) return

        const styleTypeCount = 6 // 样式种类数量
        const gethighLightTagHead = i => {
            const index = i % styleTypeCount + 1
            return `<span\
                        class="_higtlight_chrome_extension_mor _higtlight_chrome_extension_mor__style__${index}"\
                        data-highlighted="1">`
        }
        const highLightTagTail = '</span>'

        const newElement = document.createElement('morun')
        newElement.innerHTML = text.replace(reg, match => {
            const index = keywords.indexOf(match)
            if (index > -1) {
                return `${gethighLightTagHead(index)}${match}${highLightTagTail}`
            }
        })
        node.replaceWith(newElement)
        originTextNode.push(node)
        node.responsedNode = newElement
        replacedNodeObserver.observe(node, { 'characterDataOldValue': true})
    }

    // 在target节点变动时高亮
    let mo
    const observe = target => {
        if (mo) return
        mo = new MutationObserver(Highlighter.prototype.show)
        const options = {
            'childList': true,
            'characterData': true,
            'subtree': true,
            'attributes': true,
        }
        mo.observe(target, options)
    }

    function Highlighter(targetNode, keywordList = []) {
        keywords = keywordList
        target = targetNode
        reg = getRegFromStrList(keywords)
    }
    
    const excludeTagName = ['STYLE', 'LINK', 'SCRIPT', 'META', 'TITLE']
    Highlighter.prototype.show = function() {
        if (_switch === 'off') return
        if (keywords.length === 0) return

        // 层序遍历
        const nodeStack = [target]
        while(nodeStack.length !== 0) {
            const node = nodeStack.shift()
            const len = node.childNodes.length

            for(let i = 0; i< len; i++) {
                const child = node.childNodes[i]
                // ignore <style> <link> and highted node
                if (child.nodeType === 1 
                    && !excludeTagName.includes(child.tagName.toUpperCase())
                    && !child.dataset.highlighted ) {
                    nodeStack.push(child)
                }

                if (child.nodeType === 3) {
                    highlightTextNode(child)
                }
            }
        }

        observe(target)
    }

    Highlighter.prototype.clear = function () {
        originTextNode.forEach(node => node.responsedNode.replaceWith(node))
        originTextNode = []
    }

    Highlighter.prototype.updateKeywords = function (keywordList) {
        this.clear()
        keywords = keywordList
        if (keywords.length > 0) {
            reg = getRegFromStrList(keywords)
            this.show()
        }
    }

    Highlighter.prototype.switchOn = function() {
        _switch = 'on'
        this.show()
    }

    Highlighter.prototype.switchOff = function() {
        _switch = 'off'
        this.clear()
    }

    return Highlighter
})()

