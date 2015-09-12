
*****************************

之前自己搭了这个静态的博客网站，一开始使用最原始的方法，写文章时就放在`html`的标签里面。随着文章数目的增多，页面`html`变得极度的臃肿。而且无论是空格换行还是代码样式的处理，都变得相当的难以处理。于是萌生了新的想法，写文章时使用`markdown`，每篇文章都放在一个单独的本地文本文件(`.md`)中。然后在页面中通过`js`加载`markdown`文件，并编译成`html`，最后再用模板把内容加入到页面中。具体的实现过程如下：

-------------------

###一. 编写放置文章的模板结构

每一篇文章都占据页面中的一个区块，而在里面除了最主要的文章正文外，还包括如标题，发表时间，相关标签等额外的信息。这些内容我并不是放在`md`文件中的，`md`文件中只存放正文内容的`markdown`语句。

这里我们使用一个前端的模板引擎，叫做`handlebars.js`。它通过编译一段类html代码成为模板，并套入对应格式的`json`数据，从而生成最终的`html`代码。核心的用法如下:


####1.  引入`handlebars.js`
```
<script src="js/handlebars.js"></script>
```
####2.  在`script`标签，通过属性`type="text/x-handlebars-template"`标示标签中内容为`handlebars`模板
####3.  编写模板代码，变量用`{{VARIABLE}}`标示，循环用`{{#each VARIABLE}}`，还有`{{if VARIABLE}}`用于判断。另外还有`{{this}}`。本博客的文章模板如下:

```html
    <script id="article_template" type="text/x-handlebars-template">
      {{#each this}}
        <div class="row">
          <div class="col-lg-3 col-md-3 col-sm-3 col-xs-3  tag">
            <div class="tag_content">
              <img src="image/tag.jpg">
              <h1>{{year}}</h1>               
              <h2>{{month-date}}</h2>
            </div>
          </div>
          <div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">
            <h2 class="titles"><b>{{title}}</b></h2>
            <h4 class="article_label">
              标签：
              {{#each tags}}
                <span>{{this}}</span>
              {{/each}}
            </h4>
            <p class="body_text" data-article={{article-text}}>
                <!-- 这里是真正的博客正文内容 -->
            </p>
          </div>
        </div>

        <!-- 文章之间分割线 -->
        <hr class="divided_line"> 
      {{/each}}
    </script>
```

-------------------
###二. 编写用于模板的对应`json`(不含正文内容)

使用`articles/allAritcles.json`，内容如下：

```json
    [
        {
            "title": "文章1",
            "tags": ["标签1", "标签2", "标签3", "标签4"],
            "year": "2015",
            "month-date": "3-15",
            "article-text": "articles/article1.md" 
        },
        {
            "title": "文章2",
            "tags": ["标签1", "标签2", "标签3", "标签4"],
            "year": "2333",
            "month-date": "4-25",
            "article-text": "articles/article2.md" 
        }
    ]
```

整个`json`是一个数组，数组中每一项对应一篇文章。每一项中，`"title"`为标题，`"tags"`为标签数组，`"year"`为发表年份，`"month-date"`为发表月和日，__`"article-text"`为该文章正文内容对应的markdown文件路径。__

-------------------
###三. 通过模板与`json`，生成文章`html`骨架

####1. 在本地编写好`allArticles.json`后，要用`javascript`先把它加载进来。这里选择使用`ajax`加载(`jQuery`)。由于`ajax`同源策略的限制，尽管是静态网站，但是我们开发时，还是要放在本地服务器环境，然后用`localhost`加载，不然`ajax`会报错。

####2. 在`success`回调函数中，编译上述 __第一步__ 的`handlebars`模板(`Handlebars.compile(html)`)，并对模板应用上述`json`数据。 

```javascript
  $.ajax({
    url: 'articles/allArticles.json',
    type: 'GET',
    dataType: 'json',
    success: function(data){
      //编译模板并应用json
      var html = $('#article_template').html();
      var template = Handlebars.compile(html);
      $('#articles').html(template(data));

      get_articles()     //读取文章正文内容
    },
    error: function(err){
      alert('Get articles failed!');
      console.log(err); 
    }
  });
```

*回调函数中`get_articles()`为将`md`文件中正文内容编译并插入`html`骨架中，将在下面第四点中讨论。*

-------------------
###四. 读取`md`文件，编译`markdown`正文内容为`html`并插入
 
为了编译`markdown`语句，我们这里采用`showdown.js`库，该库核心用法如下：

####1. 引入`showdown.min.js`

```
<script src="js/showdown.min.js"></script>
```

####2. 编译`markdown`字符串
```
var converter = new Showdown.converter();
var html = converter.makeHtml(markdownString);
```

<br>
为了加载`md`文件，我们仍使用`ajax`方法。整个`get_articles`函数代码如下:
 
```javascript
function get_articles(){
  //取得所有文章用于存放正文内容的元素
  $('#articles .body_text').each(function(index, element){
    $.ajax({
      url: $(this).data('article'),     //取得该文章对应md文件位置
      type: 'GET',
      success: function(data){
        var converter = new Showdown.converter();
        var htmlCode = converter.makeHtml(data);
        //将html格式的正文内容，填入'.body_text'
        $(this).html(htmlCode);
      }.bind(this),
      error: function(err){
        alert('Get article text failed!'); 
        console.log(err);
      }.bind(this)
    });
  });
}
```


*由于在回调函数中`this`值会改变，所以该处回调函数需要添加`bind(this)`*

********************

###五. (非必须)选择加入`highlight.js`增加文章内容样式

在默认情况下，用经过`markdown`生成的`html`内容(包括`<pre>`与`<code>`)，是没有样式的。因此，我们使用`highlight.js`为代码内容添加高亮(若只使用已引入的`bootstrap.css`，代码块会有背景色标注，但无代码高亮)。里面有多种代码高亮样式供选择，具体用法如下:

####1. 引入`highlight.pack.js`

```
<script src="js/highlight.pack.js"></script>
```

####2. 引入样式文件，可在多个中任选一个
```
<link href="css/highlight/default.css" rel="stylesheet">
```

####3. 在`script`调用
```
hljs.initHighlightingOnLoad();
```