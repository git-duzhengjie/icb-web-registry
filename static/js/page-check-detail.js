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
          addDel();
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


    function clear(){
        Source=document.body.firstChild.data;
        document.open();
        document.close();
        document.body.innerHTML=Source;
}


}(jQuery));