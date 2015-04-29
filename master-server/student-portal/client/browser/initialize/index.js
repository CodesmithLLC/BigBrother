window.BIG_BROTHER = void(0);
window.local_big_brother_url = "http://localhost:"+big_brother_port;
window.on("load",function(){
  MASTER_SERVER.get("authtoken",function(err,token){
    var notified = 0;
    var poller = function(){
      ajax.post(local_big_brother_url,{token:token},function(err,ok){
        if(!err){
          BIG_BROTHER = establishPersistantConnection(local_big_brother_url);
          return;
        }
        if(notified > 0){
          notified--;
        }else{
          desktopNotifications.notify("Please start big brother in a valid git directory");
          notified = 10;
        }
        setTimeout(poller,1000);
      });
    };
  });
});
