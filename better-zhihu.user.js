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
*/

//动态加载css
function loadStyle(cssStr){
	var style = document.createElement("style");
	style.setAttribute('type', 'text/css');
	style.appendChild(document.createTextNode(cssStr));
	
	var wrap = document.head || document.body;
	wrap.appendChild(style);
}


$(function(){
	
	// 添加样式
	loadStyle(multiline(function(){
		/*
			html body{
				background-color : #f1f1f1;
				font-size : 16px;
				font-family :"microsoft yahei";
			}
			.zg-wrap{
				width : 1000px;
			}
			.zu-main-content-inner{
				margin: 0 288px 0 0;
			}
			.paper-dialog-detail{
				float:right;
				visibility:hidden;
			}
			.zm-item-comment:hover .paper-dialog-detail{
				visibility:visible;
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
			.paper-dialog-detail-box-bd li p{
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
			.paper-dialog-detail-box-bd li.t-right p{
				float:right;
			} 
		*/
	}));
	
	// 加载对话初始框
	$("body").append(multiline(function(){
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
	

	// 顶栏的表现
	var $zuTop = $(".zu-top");
	var windowScrollTime = null;
	var zuTopHeigth = 45;
	
	function getScrollTop(){
		return $(document).scrollTop();
	}
	
	function wheel(event){
		if( getScrollTop() <= zuTopHeigth ){
			$zuTop.fadeIn("fast");
			return;
		}
		
		var detail = event.detail;
		
		
		if( detail > 0 ){	// 向下
			$zuTop.fadeOut("fast");
		}else{				// 向上
			$zuTop.fadeIn("fast");
		}
	}
	
	$(window).on('DOMMouseScroll', function(event){
		wheel(event.originalEvent);
	});
	
	$(window).on('scroll', function(event){
	
		windowScrollTime = setTimeout(function(){
			clearTimeout(windowScrollTime);
			
			if( getScrollTop() <= zuTopHeigth ){
				$zuTop.fadeIn("fast");
			}
		}, 100);
	});
	
	
	// 查看对话详细
	
	var $paperDialogDetailUl = $("#paper-dialog-detail-box-wrap .paper-dialog-detail-box-bd ul"); 
	
	function closePaperDialog(){
		$("#paper-dialog-detail-box-wrap").hide();
		$paperDialogDetailUl.html("");
	}
	
	$(document).on("click", ".paper-dialog-detail-box-close-btn", function(){
		closePaperDialog();
	});
	
	$(document).on("click", "#paper-dialog-detail-box-wrap", function(){
		closePaperDialog();
	});
	
	$(document).on("click", ".paper-dialog-detail-box", function(event){
		event.stopPropagation()
	});
	
	$(document).on("mouseover", ".zm-item-comment", function(){
		var $hd = $(this).find(".zm-comment-hd");
		var zmCommentHdHtml = $hd.html();
		
		if( zmCommentHdHtml.indexOf("回复") > -1 && zmCommentHdHtml.indexOf("paper-dialog-detail") == -1 ){
			$hd.append('<a class="paper-dialog-detail" href="javascript:;">查看对话</a>');
		}
	});
	
	$(document).on("mouseover", ".zm-item-comment", function(){
		var $hd = $(this).find(".zm-comment-hd");
		var zmCommentHdHtml = $hd.html();
		
		if( zmCommentHdHtml.indexOf("回复") > -1 && zmCommentHdHtml.indexOf("paper-dialog-detail") == -1 ){
			$hd.append('<a class="paper-dialog-detail" href="javascript:;">查看对话</a>');
		}
	});
	
	$(document).on("click", ".paper-dialog-detail", function(){
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
		
		$zmCommentItem.each(function(i, v){
			var $hd = $(v).find(".zm-comment-hd");
			var hdStr = $(v).find(".zm-comment-hd").text();
			
			var $content = $(v).find(".zm-comment-content");
			var contentStr = $content.html();
			
			var $people = $hd.find(".zg-link");
			
			if( $people.length == 1 && $people.html() == nameB){
				msg.push({
					from : nameB,
					to : "",
					content : contentStr
				});
			}else if( hdStr.indexOf(nameA) > -1 && hdStr.indexOf(nameB) > -1 ){
				msg.push({
					from : $people.eq(0).html(),
					to : $people.eq(1).html(),
					content : contentStr
				});
			}
			
		});
		
		if( msg.length !== 0 ){
			
			
			
			msg.forEach(function(v, i){
				
				$paperDialogDetailUl.append(multiline({
					from : v.from,
					to : v.to === "" ? "" : " -> " + v.to,
					content : v.content,
					className : v.from == nameB ? "" : "t-right"
				},function(){
					/*
						<li class="{{className}}">
							<span>{{from}}{{to}}</span>
							<p>{{content}}</p>
						</li>
					*/
				}));
			});
			
			$("#paper-dialog-detail-box-wrap").show();
			
			//console.log(msg.join("\n"));
			
		}
		
	});
	
});





