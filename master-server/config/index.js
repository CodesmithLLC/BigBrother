var config = {
  //Requires a url to call
  "db":{},
  //Port to speciy a port
  //ip to specify a particular interface to listen to, defaults "" which = INADDR_ANY
  "http":{},
  //nothing to specify, possibly modules to include as globals
  "polyfill":{},
  //session_secret
  "user":{}
};
var configKeys = Object.keys(config);
//Can specify debug globally or only per service
var globalConfigs = ["debug"];
var path = require("path");
var cpath = path.normalize(__dirname+"/config.json");


//We can specify Terminal arguments
//For now these are Environment variables
//however we are probably better off with commander in the long run
parseTerminalArguments();

//We can specify a CONFIG environment variable which will load ENV_VAR-config.json
//Otherwise we use config.json if available
//default-config is always applied
applyDefaultConfigs();

//Global configurations are global properties that get spread to each of the others
//Unless they already have values
applyGlobalConfigurations();

//For now we only check if theres a db url.
//If there is not, then there is a bigger problem
validateConfig();

module.exports = config;


function parseTerminalArguments(){
  if(process.env.PORT){
    config.http.port = process.env.PORT;
  }
  if(process.env.DB){
    config.db.url = process.env.DB;
  }
  if(process.env.SESSION_SECRET){
    config.user.session_secret = process.env.SESSION_SECRET;
  }
}

function applyDefaultConfigs(){
  if(process.env.CONFIG){
    defaults(config,require("./"+process.env.CONFIG+"-config.json"));
  }else{
    console.error("process.env.CONFIG is not set");
    try{
      defaults(config,require(cpath));
    }catch(e){
      console.error(cpath+" is not available.");
    }
  }
  try{
    defaults(config, require("./default-config.json"));
  }catch(e){
    console.log("no default config specified, no problem");
  }
}


function applyGlobalConfigurations(){
  globalConfigs.forEach(function(gconfig){
    if(!(gconfig in config)) return;
    hardcodedKeys.forEach(function(key){
      if(gconfig in config[key]) return;
      config[key][gconfig] = config[gconfig];
    });
  });
}

function defaults(ob1,ob2){
  Object.keys(ob2).forEach(function(key){
    if(typeof ob1[key] === "object" && typeof ob2[key] === "object"){
      defaults(ob1[key],ob2[key]);
    }
    if(key in ob1) return;
    ob1[key] = ob2[key];
  });

}


function validateConfig(){
  console.log(config);
  if(!config.db.url){
    throw new Error("There will not be a default database url");
  }
}
