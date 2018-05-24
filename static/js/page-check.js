;(function($){
    $(function(){
          check();
          $("form").submit(function(){
          sign_in();
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
            $("#user-span").show();
        }else{
            $("#btn-login").show();
            $(".del").hide();
            $("#user-span").hide();
        }
    }


}(jQuery));