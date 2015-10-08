//读取文章json信息文件，通过模板用handlebars生成主文章内容
(function read_json(){
  $.ajax({
    url: 'articles/allArticles.json',
    type: 'GET',
    dataType: 'json',
    success: function(data){
      var html = $('#article_template').html();
      var template = Handlebars.compile(html);
      $('#articles').html(template(data));

      get_articles()     //读取文章内容
    },
    error: function(err){
      alert('Get articles failed!');
      console.log(err); 
    }
  });
})();

//读取本地markdown txt文件，并用showdown.js生成html
function get_articles(){
  $('#articles .body_text').each(function(index, element){
    $.ajax({
      url: $(this).data('article'),
      type: 'GET',
      success: function(data){
        //根据文档中markdown生成html(使用Bootstrap所配样式)
        var converter = new Showdown.converter();
        var htmlCode = converter.makeHtml(data);
        $(this).html(htmlCode);

        //调用highlight.js(非必须)
        hljs.initHighlightingOnLoad();
        $('pre code').each(function() {
          hljs.highlightBlock(this);
        });
        catalogue();       //生成右侧固定目录，需要等文章正文内容插入后再调用
      }.bind(this),
      error: function(err){
        alert('Get article text failed!'); 
        console.log(err);
      }.bind(this)
    });
  });
}

//刷新页面后滚动条归0，防止出现下文fixed的内容错位的情况
window.onbeforeunload = function(){
  $(window).scrollTop('0');
}

$(document).ready(function(){
  top_pic_height();    //确定顶部图片的高度
  area = 1;
});

$(window).resize(function() {
  top_pic_height();
  if ($(window).scrollTop() > global_pic_height){
  // 调整窗口时，若处于area3，需重新计算fixed位置
    var new_top = parseInt( $('#catalogue').parent().offset().top)
                            - parseInt( $('#top_bar_father').offset().top );
    var new_left = parseInt( $('#catalogue').parent().offset().left) ;
    $('#catalogue').css({"position":"fixed", "top":new_top+'px', "left":new_left+'px'});
  }
});

// 通过获取顶部图片高度，从而动态确定父div高度
function top_pic_height(){
  var pic_height = $('#top_pic img').css("height");
  $('#top_pic').css({"height":pic_height});
  //把字符串后面的“px”去掉，如“500px”变成“500”
  global_pic_height = pic_height.substr(0 , pic_height.length-2); 
  //设置图片中字体高度，并显示
  $('#top_pic h1').css({"top":global_pic_height*0.35, "display":"block"});
  //设置图片中字体高度，并显示
  $('#top_pic h2').css({"top":global_pic_height*0.51, "display":"block"});
}

//生成右侧目录，并添加文章的标题
function catalogue(){
  $('#catalogue').empty();  //先清空div

  title_text = new Array();
  title_height = new Array();
  for (var i = 0 ; i < $('.titles').length ; i++) {
   //eq(n)为选择第n个元素，text方法获得文本内容,offset获取偏移距离(top,left)
    title_text[i] = $('.titles').eq(i).text();
    title_height[i] = $('.titles').eq(i).offset().top;
    //若标题过长（真实长度），截取前半部分字数
    var real_length = 0;
    
    for (var j = 0; j < title_text[i].length; j++) {
      //获取指定位置字符的 Unicode 编码，区别中英文字符长度
      var charCode = title_text[i].charCodeAt(j);  
      // 看字符是否为中文
      if (charCode >= 0 && charCode <= 128){
        real_length += 1;  
      }
      else{
        real_length += 2; 
      }
      if (real_length>21){
        title_text[i] = title_text[i].substr(0 , j) + '...';       
        break;
      }
    }

    //插入到catalogue的div中
    $('#catalogue').append('<h4 id="catalogue' + i + '">' + title_text[i] + ' </h4><br>');  
  }
  $('#catalogue').append('<h3 id="go_top"><b>返回顶部 </b></h3>')
}

//监听目录项的点击。动态生成代码不能用click事件，需要用on事件绑定
$(document).on("click" , "#catalogue h3,h4" , function(){
  var current_id = $(this).attr("id");
  //返回顶部
  if (current_id == "go_top"){
    $('html , body').animate({"scrollTop" :'0px'} 
       , {"duration":600 ,"time-function":"linear" , "queue": false});
    return ;
  }
  //截取最后一位真正id，前面的为"catalogue"
  current_id = current_id.substr(9 ,1);
  //由于top_bar变为fixed后，下面元素需要补上top_bar的高度差 
  var temp_height = parseInt(title_height[current_id]) - 80 ;  //字符串转int
  $('html , body').animate({"scrollTop" :temp_height + 'px'} 
       , {"duration":600 ,"time-function":"linear" , "queue": false});
});


//滚动触发函数
$(window).scroll(function(){
  var top_dis = $(this).scrollTop();      //滚动条滚动高度

//获得目录表相对坐标，纵坐标与顶栏对比，横坐标与父div对比
  var catalogue_top = parseInt( $('#catalogue').parent().offset().top)
                          - parseInt( $('#top_bar_father').offset().top );
  var catalogue_left = parseInt( $('#catalogue').parent().offset().left) ;

  if (top_dis >= global_pic_height && area < 3) {
    // 滚动导航栏和右侧目录的固定fixed
    $('#top_bar').css({"position":"fixed" , "top":"0px" });
    $('#catalogue').css({"position":"fixed" 
          , "top": catalogue_top + 'px' , "left": catalogue_left + 'px'});

    area = 3;
  }
  else if (top_dis < global_pic_height && area > 2){
    $('#top_bar').css({"position":"relative" });
    $('#catalogue').css({"position":"relative", "top":"0px" ,"left":"0px"});

    area = 2;
  }
//简介向右滑动效果
  if (top_dis >= 0.4* global_pic_height && area < 2){
      //可以考虑用 jQuery.fn.slideLeftShow = function( speed, callback ) {} 扩充函数
    $('#top_panel .downward').fadeOut(100 , function(){
      $('#top_panel .panel_content')
      .css({"display":"none" , "margin-left":"-10%"})
      //fadein顺序相反会出bug！！！！！！！！！！！！！！！！！！！
      .fadeIn(700)
      .queue("fade_in", function(next){
        $(this).animate({"margin-left" : "0%"} ,  {"duration": 400 , "queue": false});
        next();
      })
      .dequeue("fade_in");
    });
    area = 2;
  }
  else if (top_dis < 0.4* global_pic_height && area > 1){
    $('#top_panel .panel_content')
    .queue("go_right", function(next){
        $(this).animate({"margin-left" : "50%"} ,  {"duration": 800 , "queue": false});
        next();
      })
    .dequeue("go_right")
  //fadeOut顺序相反会出bug！！！！！！！！！！！！！！！！！！！
    .fadeOut(600 , function(){
      $('#top_panel .downward').fadeIn(150);
    });   
    area = 1 ;
  }

  //滑动到对应目录条内容时,添加星号标记
  var flag = -1;
  if (top_dis > parseInt(title_height[title_height.length -1])-150 
          && flag != title_height.length ){
    $('.active_catalogue').remove();
    $('#catalogue' + (title_height.length -1) )
        .prepend('<span class="active_catalogue glyphicon glyphicon-star"></span>');
    flag = title_height.length ;
  }
  else if (top_dis < parseInt(title_height[0])-150 && flag !=0){
    $('.active_catalogue').remove();
    flag =0;
  }
  else{
    for (var i = 1; i < title_height.length; i++) {
      if (top_dis>parseInt(title_height[i-1])-150 && top_dis<parseInt(title_height[i])-150 
            && flag!=i ){
        $('.active_catalogue').remove();
        $('#catalogue' + (i-1) )
            .prepend('<span class="active_catalogue glyphicon glyphicon-star"></span>');
        flag = i;
      }
    }
  }

});

//向下按钮滑动效果
$('.downward').click(function(){
   var height = global_pic_height + "px";
   $('html, body').animate({"scrollTop" : height} , {"duration":500 , "queue": false}); 
   // $(window).animate({scrollTop:300} ,200);
   // $(window).scrollTop('200');
});

// js原生获得浏览器scrollTop方法
// function getScrollTop() {
//     var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
//     return scrollTop;
// }
// function setScrollTop(scroll_top) {
//     document.documentElement.scrollTop = scroll_top;
//     window.pageYOffset = scroll_top;
//     document.body.scrollTop = scroll_top;
//     return "yes";
// }


// //1,3切换按钮的动画效果
// $('.button1 , .button3').mouseenter(function(){
//   //获取子代元素"a"
//   var selector = $(this).children("a");
//   //延迟100ms执行，让动画更加流畅
//   tId = setTimeout(function() {
//     // $('.button1 a').animate({"top":"0px"} , "easeInOutCubic");
//     selector.animate({"top":"0px"} , "easeInOutCubic");
//   } , 100);
// }).mouseleave(function(){
//   clearTimeout(tId);
//   // $(this).stop();   //stop方法清空动画队列,动画一半时鼠标移出
//   var selector = $(this).children("a");
//   selector.stop().animate({"top":"-48px"} , "easeInOutCubic");
// });

// //2切换按钮的动画效果
// $('.button2').mouseenter(function(){
//   tId = setTimeout(function() {
//   $('.button2 a').animate({"top":"-48px"} , "easeInOutCubic");
// } , 100);
// }).mouseleave(function(){
//   clearTimeout(tId);
//   $('.button2 a').stop().animate({"top":"0px"} , "easeInOutCubic");
//   // setInterval( function(){alert("fuck");} , 1000);
// });

