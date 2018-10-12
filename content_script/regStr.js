
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