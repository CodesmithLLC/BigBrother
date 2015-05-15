var sa = require("superagent");

window.local_big_brother_url = "http://localhost:8001";
sa.get("/token",function(err,res){
  if(err) throw err;
  console.log(res);
  var notified = 0;
  var poller = function(){
    sa.post(local_big_brother_url+"/token",JSON.parse(res.text),function(err,ok){
      if(err){
        if(notified === 0){
          flash("Start Big Brother", "Please start Big brother in a valid git repository");
        }
        notified = (notified+1)%10;
        setTimeout(poller,1000);
      }
    });
  };
  poller();
});
