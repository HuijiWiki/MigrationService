
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'file',
      filename: '/var/log/migrate-service/access.log', 
      maxLogSize: 204600,
      backups: 3, 
      category: 'http-access' 
    },

    { type: 'file',
      filename: '/var/log/migrate-service/out.log', 
      maxLogSize: 204600,
      backups: 3, 
      category: 'out' 
    }, 
    { type: 'file',
      filename: '/var/log/migrate-service/service.log', 
      maxLogSize: 204600,
      backups: 3, 
      category: 'service' 
    }


  ]
});

module.exports.accessLogger = log4js.getLogger('http-access');
module.exports.outLogger = log4js.getLogger('out');
module.exports.serviceLogger = log4js.getLogger('service');



