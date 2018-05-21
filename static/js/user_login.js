function sign-in(){
    //判断是否保存用户名
    var storage = window.localStorage;
    if($("#remember-me").is(':checked')){
        //存储到loaclStage
        storage["username"] = $("#inputUserName").val();
        storage["password"] = $("#inputPassword").val();
        storage["iStorage"] =  "yes";
    }else{
        storage["username"] = "";
        storage["password"] = "";
        storage["iStorage"] = "no";
    }
}

function check(){
    //判断是否存在过用户
    var storage = window.localStorage;
    if("yes" == storage["iStorage"]){
     $("#remember-me").attr("checked", true);
     $("#username").val(storage["username"]);
     $("#password").val(storage["password"]);
    }
}