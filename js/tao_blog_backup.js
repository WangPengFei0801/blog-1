// 通过获取顶部图片高度，从而动态确定父div高度
function top_pic_height(){
  var pic_height = $('#top_pic img').css("height");
  $('#top_pic').css({"height":pic_height});
  //把字符串后面的“px”去掉，如“500px”变成“500”
  global_pic_height = pic_height.substr(0 , pic_height.length-2);
  $('#top_pic h1').css({"top":global_pic_height*0.35});  //设置图片中字体高度
  $('#top_pic h2').css({"top":global_pic_height*0.51});  //设置图片中字体高度
}

// !!!!!!!!!!   注意ready函数与resize函数的用法不同！！！一定要像以下两种写法才不会出bug！！！
$(document).ready( top_pic_height() ) ;
$(window).resize(function() {
  top_pic_height();
});

//用于判断当前浏览器高度所属区域
area = 1;
test = parseInt(global_pic_height) + 150;

//滚动触发函数
$(window).scroll(function(){
  var top_dis = $(this).scrollTop();
// 滚动导航栏固定

  // if (top_dis >= global_pic_height + 100 && ) {
  //   $('#top_bar').css({"position":"fixed" , "top":"0px" });
  //   $('#main_div').css({"margin-top": "60px"});
  //   $('#top_panel').css({"top": "60px"});
  //   area = 3;
  // }


  if (top_dis >= global_pic_height && area < 3) {
    $('#top_bar').css({"position":"fixed" , "top":"0px" });
    $('#main_div').css({"margin-top": "60px"});
    $('#top_panel').css({"top": "60px"});
    area = 3;
  }
  // else if (top_dis >= test){
  //   // alert("test");
  //   $('#top_bar').css({"position":"relative","top":"150px" });
  //   $('#main_div').css({"margin-top": "0px"});
  //   $('#top_panel').css({"top": "0px"});
  // }
  else if (top_dis < global_pic_height && area > 2){
    $('#top_bar').css({"position":"relative" });
    $('#main_div').css({"margin-top": "0px"});
    $('#top_panel').css({"top": "0px"});
    area = 2;
  }

  if (top_dis >= 0.5* global_pic_height && area < 2){
      //可以考虑用 jQuery.fn.slideLeftShow = function( speed, callback ) {} 扩充函数
    $('#top_panel .downward').fadeOut(100 , function(){
      $('#top_panel .panel_content')
      .css({"display":"none" , "margin-left":"-10%"})
      //fadein顺序相反会出bug！！！！！！！！！！！！！！！！！！！111
      .fadeIn(700)
      .queue("fade_in", function(next){
        $(this).animate({"margin-left" : "0%"} ,  {"duration": 400 , "queue": false});
        next();
      })
      .dequeue("fade_in");
    });
    area = 2;
  }
  else if (top_dis < 0.5* global_pic_height && area > 1){
    $('#top_panel .panel_content')
    .queue("go_right", function(next){
        $(this).animate({"margin-left" : "50%"} ,  {"duration": 800 , "queue": false});
        next();
      })
    .dequeue("go_right")
    .fadeOut(600 , function(){
      $('#top_panel .downward').fadeIn(150);
    });   
    area = 1 ;
  }

});

//向下按钮滑动效果
$('#top_panel a').click(function(){
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


//1,3切换按钮的动画效果
$('.button1 , .button3').mouseenter(function(){
  //获取子代元素"a"
  var selector = $(this).children("a");
  //延迟100ms执行，让动画更加流畅
  tId = setTimeout(function() {
    // $('.button1 a').animate({"top":"0px"} , "easeInOutCubic");
    selector.animate({"top":"0px"} , "easeInOutCubic");
  } , 100);
}).mouseleave(function(){
  clearTimeout(tId);
  // $(this).stop();   //stop方法清空动画队列,动画一半时鼠标移出
  var selector = $(this).children("a");
  selector.stop().animate({"top":"-48px"} , "easeInOutCubic");
});

//2切换按钮的动画效果
$('.button2').mouseenter(function(){
  tId = setTimeout(function() {
  $('.button2 a').animate({"top":"-48px"} , "easeInOutCubic");
} , 100);
}).mouseleave(function(){
  clearTimeout(tId);
  $('.button2 a').stop().animate({"top":"0px"} , "easeInOutCubic");
  // setInterval( function(){alert("fuck");} , 1000);
});
