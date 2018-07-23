;(function($){
    $(function(){
          check();
          $("form").submit(function(){
                sign_in();
          });
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
          $(".online").click(function(){
            var href = $(this).children("a").attr("rel");
            if(confirm("发布版本" + href.split('?')[1].split("=")[1] + "到k8s?")){
                window.location.href=href;
            }
          });
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
            $(".del").show();
            $(".online").show();
            $("#user-span").show();
        }else{
            $("#btn-login").show();
            $(".del").hide();
            $(".online").hide();
            $("#user-span").hide();
        }

    }


}(jQuery));