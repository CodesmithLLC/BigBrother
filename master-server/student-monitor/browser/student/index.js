var sa = require("superagent");

window.local_big_brother_url = "http://localhost:8001";
sa.get("/authtoken",function(err,token){
  if(err)
  var notified = 0;
  var poller = function(){
    ajax.post(local_big_brother_url+"/authtoken",{token:token},function(err,ok){
      if(err){
        flash("Start Big Brother", "Please start Big brother in a valid git repository");
        if(notified === 0) setTimeout(poller,1000);
        notified = (notified+1)%10;
      }
    });
  };
  poller();
});
