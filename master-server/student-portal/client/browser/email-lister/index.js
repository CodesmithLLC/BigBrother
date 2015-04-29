var emailTemplate = find("email-template");
var emailList = find("email-notifications");
MASTER_SERVER.get("emails",function(err,emails){
  emails.forEach(function(email){
    email = applyTemplate(email);
    emailList.append(email);
  });
});
MASTER_SERVER.on("new-email",function(email){
  email = applyTemplate(email);
  emailList.prepend(email);
  desktopNotifications.notify("You have recieved a new Email");
});
