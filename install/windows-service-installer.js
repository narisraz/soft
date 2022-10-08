const Service = require('node-windows').Service;
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const _ = require('lodash')
const log4js = require('log4js')

log4js.configure({
  appenders: [
    { type: 'console' },
    {
      type: 'file',
      filename: __dirname + '/windows-service-installer.log',
      maxLogSize: 1000000,
      backups: 10,
    }
  ]
});

const logger = log4js.getLogger();

let envPath;
if (argv.e) {
  envPath = path.isAbsolute(argv.e) ? argv.e : `./${argv.e}`;
} else {
  envPath = './windows.env.js';
}

const env = require(envPath);

// Create a new service object
const serviceConfig = {
  name: 'LysaSoftServer',
  description: 'The LysaSoftServer web server',
  script: `${__dirname}\\..\\server\\app.js`,
  env: _(env).toPairs().map(a => ({name: a[0], value: a[1]})).value()
}
logger.info('Service config:', serviceConfig);
const svc = new Service(serviceConfig);

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
  logger.info('Service installed, starting service...');
  svc.start();
});

svc.on('start', () => { 
  logger.info('Service started')
})

svc.on('alreadyinstalled', () => { 
  logger.error('Service already installed')
})

svc.on('invalidinstallation', () => { 
  logger.error('Invalid installation')
})

svc.on('error', err => { 
  logger.error('Error:', err)
})

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
  logger.info('Uninstall complete.');
  logger.info('The service exists: ', svc.exists);
});

if (argv._.includes('install')) {
  svc.install();
} else if (argv._.includes('uninstall')) {
  svc.uninstall();
}
