var s=__dirname,d='node_modules/app',fs=require('fs');
if(!fs.existsSync(d)) fs.symlinkSync(s,d,'dir');
