---
layout: post
title:  "网站前端基础"
date:   2015-12-21 19:00:00
categories: development
---

这篇博客是为了码妞儿2015冬季的活动来准备的。本来想直接放到活动的wiki里面，但是发现[jsfiddle](http://jsfiddle.net)不能内嵌到github的wiki页面里面。所以就借我的博客来写吧。[如果想直接跳到教程的点这里](#main)

***

I may or may not translate this later on for my blog purposes, but for now, you will have to make do with Google Translate. Cheers.

我一直对网页前端的技术不感冒。大概在2006年（我擦快十年了。。_十年之前~~_），当时百度空间挺流行的，当我发现了自定义模板的时候，我发现这些奇怪的语法可以把空间里面的按钮的字体大小，位置等等，谁不知当时看着临摹的是为IE6服务的CSS 2.0... 当时也喜欢篮球，所以会把篮球队员和篮球鞋做成空间的背景，并且会固定到屏幕中间，所以背景不会随着滚动条滚动而动。如今他们弃用了自定义模板已经太久了，到笔者今天回到百度空间的时候，发现百度早已经把原空间的文章转移到百度云，并且把当时的图片CDN撤走。。好吧，再四处看看，想想，如果文章转到了百度云，图片应该也会丢到相册吧？想办法进去了我的百度相册一看，嘿还在~

这个如果没记错的话是抄了国外某WordPress模板

![](/img/old_blog_css_1.jpg)

小时候是个一等一的篮球迷，所以。。嘿嘿。上面的菜单做了挺多trick的，基本上是把字用Photoshop P到了背景，然后用CSS对齐，然后再把对应的中文字隐藏。

![](/img/old_blog_css.jpg)

不过自从那时之后我都没有碰过网页前端了。记得高中毕业后大学上学前我给飞渡做了一个网站，当时借着机会苦练的竟是后台的Python和整个web stack，并没有对前端的HTML想太多。大学四年也巧妙地绕过了网站制作，大型的团队project不是纯C的OpenGL，就是Python的OpenCV还有Android，最后毕业的项目是C# + WPF，而且我的focus在后台数据分析处理的部分。

毕业之后进亚麻的第一个队伍做的就是前端JavaScript。当时那个懵啊。。当时刚进的时候我们队伍在做full-responsive website，用CSS3的Media Queries (\@media的语法)根据屏幕宽度对同一个模板渲染出不同的效果。

我心想一下，不行，不能再这样颓废下去了。然后我开始苦练前端各种技术，从女朋友公司里接了两个小project来做（一个纯JavaScript，一个几乎纯WordPress CSS模板），之后深谙浏览器兼容问题（网页都是面对国内用户的，我当时的浏览器兼容简直是做到渣到不能再渣）。

从2014年初开始，因为分配到一个针对前端的队伍，而且是卖女装的前端，所以我们组对前端的要求越来越高，接触前端技术的时间也越来越多。短暂的玩过iOS前端之后，我被分配到做一个用Angular搭建一个和我们iOS做的App类似的WebApp。之后我就对现代网页框架开始研究，整个2015年是玩了半年Angular然后玩了半年Mithril（Mithril这个project等我们把feature公开了我就放上来）。期间做了些对于CSS3部分动画效果在手机上运行和兼容性的理解，和对HTML5 Canvas还有WebGL Canvas的性能和兼容性的探讨。看过了这篇[关于Flipboard做的react-canvas](http://engineering.flipboard.com/2015/02/mobile-web/)之后，我和一个前端高手合作做了一个用Backbone来跑一个Pixi.js控制的WebGL Canvas的prototype。

现在我在做几个专门针对微信自带浏览器的[小游戏](http://www.divby0.io/SongQuiz/v0/?/cn)（不是神经猫）的[prototype](http://www.divby0.io/ThePullUpGame/)，希望以后在空余的时间可以玩更多前端的东西。

（怀旧的分割线）
***

<a name="main"></a>

下面准备开讲了。。终于。。

# HTML

[HTML](http://www.w3school.com.cn/html/html_intro.asp)的全称比较长，而且也没有什么实际意义哈哈。基本上是一种能够标记修饰文本，然后让这段文本能实现更多的功能，比如说提供链接到另一个网页，调整大小等等。想象一下我们手工写黑板报的时候我们可以给文字指定颜色和大小和位置，但是要是我们需要用电脑来写黑板报的话，我们应该怎么样给这些文字进行修饰和调整。HTML可以帮我们实现这样的功能。

<iframe width="100%" height="300" src="//jsfiddle.net/8uxrskz7/8/embedded/html,result" frameborder="0"></iframe>
