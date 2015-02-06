// ==UserScript==
// @name        better-zhihu
// @namespace   better-zhihu
// @description 更好的浏览知乎
// @include     http://www.zhihu.com/*
// @version     1
// @grant       none
// @require		https://raw.githubusercontent.com/paper/javascript-multiline-string/master/multiline.js
// ==/UserScript==

/**
  一些说明：

  1）zhihu 的 jq 版本是 1.10.2 ( jQuery("body").jquery )
  2）基于 油猴 2.2 版本
  
  2015-02-06
  3) 去掉顶栏的显示与隐藏，会有点晃眼，哈哈~
 */

//动态加载css
function loadStyle(cssStr) {
  var style = document.createElement("style");
  style.setAttribute('type', 'text/css');
  style.appendChild(document.createTextNode(cssStr));
  
  var wrap = document.head || document.body;
  wrap.appendChild(style);
}

$(function () {
  
  // 添加样式
  loadStyle(multiline(function () {
    /*
    html body{
      background-color : #f1f1f1;
      font-size : 15px;
      font-family :"microsoft yahei";
    }
    .zg-wrap{
      width : 1000px;
    }
    .zu-main-content-inner{
      margin: 0 288px 0 0;
    }
    .zm-comment-box{
      font-size:14px;
    }
    
    .paper-dialog-detail{
      float:right;
      visibility:hidden;
    }
    .zm-item-comment:hover .paper-dialog-detail{
      visibility:visible;
    }
    
    .paper-long-comment-box{
      position:fixed;
      right : 10px;
      top : 55px;
      width : 360px;
      height : 570px;
      box-sizing: border-box;
      overflow : auto;
      font-size : 12px;
      z-index:100;
      margin:0;
      padding-top: 35px;
    }
    .paper-long-comment-box-hd{
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      padding: 0 10px;
      height:36px;
      line-height:36px;
      position: fixed;
      top: 56px;
      width: 322px;
      z-index: 101;
      border-radius: 5px;
    }
    .paper-long-comment-box-hd h2{
      float:left;
    }
    .paper-long-comment-box-hd h2 strong{
      color:#000;
    }
    .paper-long-comment-box-hd a{
      float:right;
    }
    
    #paper-dialog-detail-box-wrap{
      width:100%;
      position:fixed;
      z-index:80;
      height:100%;
      top:0;
      display:none;
      background:rgba(255, 255, 255, 0.2);
    }
    .paper-dialog-detail-box{
      width:550px;
      top: 50%;
      margin:-230px auto 0;
      position:relative;
      background-color:#fff;
      color:#000;
      border-radius:5px;
      box-sizing: border-box;
      padding:10px;
      box-shadow: 0 10px 100px rgba(0, 0, 0, 0.4);
    }
    .paper-dialog-detail-box-hd{
      border-bottom: 1px dashed #ccc;
      margin-bottom:10px;
    }
    .paper-dialog-detail-box-hd h5{
      padding:5px 10px 10px;
      color:#333;
    }
    .paper-dialog-detail-box-close-btn{
      background-color: #333;
      border: 3px solid #fff;
      border-radius: 30px;
      color: #fff;
      font-size: 18px;
      height: 26px;
      line-height: 22px;
      position: absolute;
      right: -16px;
      text-align: center;
      text-decoration: none;
      top: -16px;
      width: 26px;
    }
    .paper-dialog-detail-box-bd{
      padding:0 10px 10px;
      height:400px;
      overflow-y: auto;
    }
    .paper-dialog-detail-box-bd ul{
      list-style:none;
    }
    .paper-dialog-detail-box-bd li{
      padding-bottom:10px;
      font-size:12px;
      line-height: 1.5;
      clear:both;
      overflow:hidden;
    }
    .paper-dialog-detail-box-bd li span{
      color:#666;
      display:block;
      clear:both;
      padding-bottom:4px;
    }
    .paper-dialog-detail-box-bd li div{
      background:#eee;
      padding:5px 10px;
      border-radius: 5px;
      max-width: 80%;
      float:left;
      font-size:14px;
    }
    .paper-dialog-detail-box-bd li.t-right{}
    .paper-dialog-detail-box-bd li.t-right span{
      text-align:right;
    }
    .paper-dialog-detail-box-bd li.t-right div{
      float:right;
    }
     */
  }));
  
  // 加载对话初始框
  $("body").append(multiline(function () {
    /*
    <div id="paper-dialog-detail-box-wrap">
      <div class="paper-dialog-detail-box">
        <div class="paper-dialog-detail-box-hd">
          <h5>查看他们的对话 (仅供参考)</h5>
          <a class="paper-dialog-detail-box-close-btn" href="javascript:;" title="关闭"><span>x</span></a>
        </div>
        <div class="paper-dialog-detail-box-bd">
          <ul>
          
          </ul>
        </div>
      </div>
    </div>
     */
  }));
  
  // 顶部
  var $zuTop = $('.zu-top');
  var zuTopHeight = $zuTop.height();
  
  // 查看对话详细
  var $paperDialogDetailUl = $("#paper-dialog-detail-box-wrap .paper-dialog-detail-box-bd ul");
  
  function closePaperDialog() {
    $("#paper-dialog-detail-box-wrap").hide();
    $paperDialogDetailUl.html("");
  }
  
  $(document).on("click", ".paper-dialog-detail-box-close-btn", function () {
    closePaperDialog();
  });
  
  $(document).on("click", "#paper-dialog-detail-box-wrap", function () {
    closePaperDialog();
  });
  
  $(document).on("click", ".paper-dialog-detail-box", function (event) {
    event.stopPropagation();
  });
  
  $(document).on("mouseover", ".zm-item-comment", function () {
    var $hd = $(this).find(".zm-comment-hd");
    var zmCommentHdHtml = $hd.html();
    
    if (zmCommentHdHtml.indexOf("回复") > -1 && zmCommentHdHtml.indexOf("paper-dialog-detail") == -1) {
      $hd.append('<a class="paper-dialog-detail" href="javascript:;">查看对话</a>');
    }
  });
  
  // 动态生成 “查看对话” 按钮
  $(document).on("mouseover", ".zm-item-comment", function () {
    var $hd = $(this).find(".zm-comment-hd");
    var zmCommentHdHtml = $hd.html();
    
    if (zmCommentHdHtml.indexOf("回复") > -1 && zmCommentHdHtml.indexOf("paper-dialog-detail") == -1) {
      $hd.append('<a class="paper-dialog-detail" href="javascript:;">查看对话</a>');
    }
  });
  
  // 查看对话
  $(document).on("click", ".paper-dialog-detail", function () {
    var self = this;
    
    var $zmCommentHd = $(self).parent();
    var $people = $zmCommentHd.find(".zg-link");
    var nameA = $people.eq(0).html();
    var nameB = $people.eq(1).html();
    
    console.log(nameA, nameB);
    
    //找出他们的全部对话
    var $zmCommentList = $(self).parents(".zm-comment-list");
    var $zmCommentItem = $zmCommentList.find(".zm-item-comment");
    var msg = [];
    
    $zmCommentItem.each(function (i, v) {
      var $hd = $(v).find(".zm-comment-hd");
      var hdStr = $(v).find(".zm-comment-hd").text();
      
      var $content = $(v).find(".zm-comment-content");
      var contentStr = $content.html();
      
      var $people = $hd.find(".zg-link");
      
      if ($people.length == 1 && $people.html() == nameB) {
        msg.push({
          from : nameB,
          to : "",
          content : contentStr
        });
      } else if (hdStr.indexOf(nameA) > -1 && hdStr.indexOf(nameB) > -1) {
        msg.push({
          from : $people.eq(0).html(),
          to : $people.eq(1).html(),
          content : contentStr
        });
      }
      
    });
    
    if (msg.length !== 0) {
      
      msg.forEach(function (v, i) {
        
        $paperDialogDetailUl.append(multiline({
            from : v.from,
            to : v.to === "" ? "" : " -> " + v.to,
            content : v.content,
            className : v.from == nameB ? "" : "t-right"
          }, function () {
            /*
              <li class="{{className}}">
                <span>{{from}}{{to}}</span>
                <div>{{content}}</div>
              </li>
             */
          }));
      });
      
      $("#paper-dialog-detail-box-wrap").show();
      
    }
    
  });
  
  // 脱离出来显示的评论框
  var $prevCommentBox = null;
  
  // 准备显示的那个评论
  var $curItemAnswer = null;
  
  // 准备显示的评论框
  var $curCommentBox = null;
  
  var setCommentBoxHeight = function(){
    if( $prevCommentBox ){
      $prevCommentBox.css('height', $(window).height() - 20 - zuTopHeight);
    }
  }
  
  var autoSetCommentBoxHeight = (function(){
    
    var t = null;
    var d = 200;
    
    return function(){
      $(window).resize(function(){
        clearTimeout(t);
        
        t = setTimeout(function(){
          setCommentBoxHeight();
        }, d);
      });
    }
    
  })();
  
  // 显示全部评论 
  // 当点击的时候，.load-more 被删除了，导致它的父亲节点获取不到，我们得提前获取一下
  $(document).on("mouseenter", ".load-more", function () {
    $curItemAnswer = $(this).parents('.zm-item-answer');
    $curCommentBox = $curItemAnswer.find('.zm-comment-box');
  });
  
  // 显示全部评论
  // 当评论总数大于 15 个的时候，就把评论独立出来，放到右侧
  $(document).on("click", ".load-more", function () {
    var limit = 15;
    var count = $curCommentBox.attr("data-count");

    if( count <= limit ) return;
    
    if( $prevCommentBox ){
      $prevCommentBox.hide();
    }
    
    $prevCommentBox = $curCommentBox;
    
    var $author = $curItemAnswer.find('.answer-head .zm-item-answer-author-wrap a').eq(1);
    
    $curCommentBox.prepend(multiline({
      author : $author.length == 1 ? $author.html() : "匿名用户"
    }, function () {
      /*
        <div class="paper-long-comment-box-hd">
          <h2><strong>{{author}}</strong> <span>回答下面的评论<span></h2>
          <a href="javascript:;">关闭</a>
        </div>
       */
    }));
    
    // 定位到回答者的位置
    window.scroll(0, $curItemAnswer.offset().top - zuTopHeight);  
    
    setCommentBoxHeight();
    
    $curCommentBox.addClass('paper-long-comment-box').show();
  });
  
  // 关闭 右侧显示的全部评论 
  $(document).on("click", ".paper-long-comment-box-hd a", function () {
    var $this = $(this);
    
    var $CommentBox = $this.parents('.zm-comment-box');
    $CommentBox.hide();
  });
  
  autoSetCommentBoxHeight();
  
});