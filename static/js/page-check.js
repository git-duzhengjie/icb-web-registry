;(function($){
    $(function(){
          check();
          $("form").submit(function(){
                sign_in();
          });
           $(".online").click(function(){
            var href = $(this).children("a").attr("rel");
            if(confirm("发布版本" + href.split('?')[1].split("=")[1] + "到k8s?")){
                window.location.href=href;
            }
          });

          $("#search-text").bind("input propertychange change", function(event){
             if($("#search-text").val().trim() != ""){
                 $.ajax({
                    url:'/search',
                    type:'POST',
                    data:{'key':$("#search-text").val()},
                    dataType:'JSON',
                    success:function (callback) {
                            $('tbody').empty();
                            var page_cont=callback.page_content;
                            var page_count=callback.page_count;
                            $('#last_page').text(page_count);
                            $('tbody').append(page_cont);
                            keywordHighlight("tbody", $("#search-text").val())
                            $('#pageLimit').hide();
                            addDel();
                        }
                })
            }
            else{

                $.ajax({
                url:'/task_list_page',
                type:'POST',
                data:{'page':1},
                dataType:'JSON',
                success:function (callback) {
                        $('tbody').empty();
                        var page_count=callback.page_count;
                        var page_cont=callback.page_content;
                        $('tbody').append(page_cont);
                        $('#last_page').text(page_count);
                        $("tbody").mLoading("hide");
                        $('#pageLimit').show();
                        addDel();
                    }

            })
            }
         });
          addDel();
          $('#pageLimit').bootstrapPaginator({
            currentPage: 1,
            totalPages: $("#pageCount").text(),
            size:"normal",
            bootstrapMajorVersion: 3,
            alignment:"right",
            numberOfPages:$("#pageCount").text(),
            itemTexts: function (type, page, current) {
                switch (type) {
                case "first": return "首页";
                case "prev": return "上一页";
                case "next": return "下一页";
                case "last": return "末页";
                case "page": return page;
                }//默认显示的是第一页。
            },
        onPageClicked: function (event, originalEvent, type, page){//给每个页眉绑定一个事件，其实就是ajax请求，其中page变量为当前点击的页上的数字。
            $("tbody").mLoading({
                text:"",//加载文字，默认值：加载中...
                icon:"",//加载图标，默认值：一个小型的base64的gif图片
                html:false,//设置加载内容是否是html格式，默认值是false
                content:"",//忽略icon和text的值，直接在加载框中显示此值
                mask:true//是否显示遮罩效果，默认显示
            });
            $("tbody").mLoading("show");
            $.ajax({
                url:'/task_list_page',
                type:'POST',
                data:{'page':page},
                dataType:'JSON',
                success:function (callback) {
                        $('tbody').empty();
                        var page_count=callback.page_count;
                        var page_cont=callback.page_content;
                        $('tbody').append(page_cont);
                        $('#last_page').text(page_count);
                        $("tbody").mLoading("hide");
                        addDel();
                    }

            })
        }
});
        });


    function sign_in(){
        var storage = window.localStorage;
        if($("#remember-me").is(':checked')){
            //存储到localStage
            storage["username"] = $("#inputUserName").val();
            storage["password"] = $("#inputPassword").val();
            storage["iStorage"] =  "yes";
        }else{
            storage["username"] = "";
            storage["password"] = "";
            storage["iStorage"] = "no";
        }
        $.post("/sign-in",
            {
                username: $("#inputUserName").val(),
                password: $("#inputPassword").val()
            },
            function(data, status){
                if(data == "0")
                    window.location.href = "/";
                else if(data == "1")
                    alert("用户名不存在");
                else if(data == "2")
                    alert("密码错误");
            }
        );
        if(isFireFox())
            sleep(500);
    }
    function isFireFox(){
        var explorer = navigator.userAgent ;
        if(explorer.indexOf("Firefox") >= 0)
            return true;
        else
            return false;
    }

    function keyLight(tag, key, bgColor){
       var oDiv = $(tag),
           sText = oDiv.html(),
           bgColor = bgColor || "orange",
           sKey = "<span style='background-color: "+bgColor+";'>"+key+"</span>",
           num = -1,
           rStr = new RegExp(key, "g"),
           rHtml = new RegExp("\<.*?\>","ig"), //匹配html元素
           aHtml = sText.match(rHtml); //存放html元素的数组
           sText = sText.replace(rHtml, '{~}');  //替换html标签
           sText = sText.replace(rStr,sKey); //替换key
           sText = sText.replace(/{~}/g,function(){  //恢复html标签
         num++;
         return aHtml[num];
       });
       oDiv.innerHTML = sText;
     }
      function keywordHighlight(idHtmlContent,keyword) {
	var content= $(idHtmlContent).html();//获取内容
	if ($.trim(keyword)==""){
		return;//关键字为空则返回
	}
	var htmlReg = new RegExp("\<.*?\>", "i");
	var arrA = new Array();
	//替换HTML标签
	for (var i = 0; true; i++) {
		var m = htmlReg.exec(content);
		if (m) {
			arrA[i] = m;
		}else {
			break;
		}
		content = content.replace(m, "{[(" + i + ")]}");
	}
	words = unescape(keyword.trim().replace(/\+/g, ' ')).split(/\s+/);
	//替换关键字
	for (w = 0; w < words.length; w++) {
		var r = new RegExp("(" + words[w].replace(/[(){}.+*?^$|\\\[\]]/g, "\\$&") + ")", "ig");
		content = content.replace(r, "<b><span style='color:orange;font-size:14px;'><u>"+words[w]+"</u></span></b>");//关键字样式
	}
	//恢复HTML标签
	for (var i = 0; i < arrA.length; i++) {
		content = content.replace("{[(" + i + ")]}", arrA[i]);
	}
	 $(idHtmlContent).html(content);
}
    function addDel(){
        $(".del").click(function(){
            var href = $(this).children("a").attr("rel");
            if(href.search("tag=") != -1){
                if(confirm("确定删除版本" + href.split('?')[1].split("=")[1] + "?")){
                    window.location.href=href;
                }
            }
            else{
                if(confirm("确定删除镜像" + href.split('/').slice(2,).join('/') + "?")){
                    window.location.href=href;
                }
            }
          });

    }
    function sleep(n) {
            var start = new Date().getTime();
            while (true) if (new Date().getTime() - start > n) break;
        }

    function check(){
        var storage = window.localStorage;
        if("yes" == storage["iStorage"]){
         $("#remember-me").attr("checked", true);
         $("#inputUserName").val(storage["username"]);
         $("#inputPassword").val(storage["password"]);
        }
        if($("#user").text().trim() != "None")
        {
            $("#btn-login").hide();
            $("#user-span").show();
        }else{
            $("#btn-login").show();
            $("#user-span").hide();
        }

    }

    function clear(){
        Source=document.body.firstChild.data;
        document.open();
        document.close();
        document.body.innerHTML=Source;
}


}(jQuery));