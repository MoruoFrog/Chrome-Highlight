chrome highlight extension without any side effect

feature:<br>
* without any side effect, you can use it in SPA made by Vue, React and so on
* store keywords and switch in local

need chrome V54 and above

***

一款无副作用的chrome高亮插件<br>
通常的高亮插件不能很好的和mvvm框架一起使用，如果高亮的内容是一个binding的变量，当变量改变时，会引起副作用。<br>
本插件通过observe原文本节点保证了无副作用，可以在使用Vue, React等编写的网页上使用

example:
![example](https://raw.githubusercontent.com/MoruoFrog/chrome_highlight/master/image/example.png)
