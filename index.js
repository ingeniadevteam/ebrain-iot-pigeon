'use strict';

require('dotenv').config();
const exitHook = require('async-exit-hook');
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const CronJob = require('cron').CronJob;
const queues = require('@clysema/ebrain-iot-queues');

const logger = require('pino')({
    prettyPrint: process.env.NODE_ENV === 'development' ? true : false,
    level: process.env.LOGGER_LEVEL || 'info'
});

module.exports = async () => {
    // log start
    if (process.env.NODE_ENV === 'development') {
        logger.warn(`${process.env.APP} start in development mode`);
    } else {
        logger.info(`${process.env.APP} start`);
    }
    
    // // include modules (loaded using eval('module_name))
    // const bacnet = require('../../lib/bacnet');
    // const energy = require('../../lib/energy');
    // const meteo = require('../../lib/meteo');
    // const snmp = require('../../lib/snmp');

    // setup config dir
    let configDir = `config`;
   
    // setup app
    let app;
    try {
        app = JSON.parse(readFileSync(`${configDir}/app.json`));
    } catch (error) {
        logger.error(error.message);
        return;
    }

    logger.info(`app modules: ${app.enabled}`);
    
    // setup the logger
    app.logger = logger;
    // setup configDir
    app.configDir = configDir;
    // setup appDir
    app.appDir = __dirname;

    // get attributes config if exists
    try {
        app.attributes = JSON.parse(readFileSync(`${app.configDir}/attributes.json`));
    } catch (error) {
        logger.warn(error.message);
    }

    if (app.attributes)
        logger.info(`client attributes: ${Object.keys(app.attributes)}`);
    
    // setup if gateway or single device
    if (process.env.GATEWAY.toLocaleLowerCase() === 'true') {
        // load app.gateway if json file exists
        try {
            app.gateway = JSON.parse(readFileSync(`${app.configDir}/gateway.json`));
            logger.info(`gateway: ${Object.keys(app.gateway)}`);
        } catch (error) {
            logger.warn(error.message);
        }
    } else {
        // load app.device if json file exists
        try {
            app.device = JSON.parse(readFileSync(`${app.configDir}/device.json`));
            logger.info(`device: ${Object.keys(app.device)}`);
        } catch (error) {
            logger.warn(error.message);
        }
    }

    // // enable pigeonio
    // if (app.enabled.includes('pigeonio')) {
    //     await require('../../lib/pigeonio')(app);
    //     await new Promise(resolve => setTimeout(() => app.pigeonio.emitter && resolve(), 100));
    // }

    // queues
    if (app.enabled.includes('modbus')) {
        queues.modbus(app);
    }
    if (app.enabled.includes('mqtt-thingsboard')) {
        queues.mqtttb(app);
    }
    // if (app.enabled.includes('mqtt-zigbee')) {
    //     require('../../lib/mqtt-zigbee')(app);
    // }

    app.enabled.forEach(module => {
        // load the module
        try {
            require(`@clysema/ebrain-iot-${module}`)(app);
            logger.debug(`module ${module} loaded`);
        } catch (error) {
            logger.error(`Can't load @clysema/ebrain-iot-${module} module`);
            console.log(error);
            return;
        }

        // enable cron jobs using config in app.attributes
        if (app.attributes[module]) {
            try {
                app[module].job = new CronJob(app.attributes[module], () =>
                    require(`@clysema/ebrain-iot-${module}`)(app), null, true, 'Europe/Madrid');
                logger.info(`${module} cron: ${app.attributes[module]}`);
            } catch (error) {
                logger.error(`Can't set job for ${app.attributes[module]}`);
            }
        }
    });

    // configure exit hook
    exitHook(() => {
        try {
            if (app.gateway) {
                writeFileSync(`${app.configDir}/gateway.json`, JSON.stringify(app.gateway, null, 4));
            } else {
                writeFileSync(`${app.configDir}/device.json`, JSON.stringify(app.device, null, 4));
            }
            if (app.attributes) {
                writeFileSync(`${app.configDir}/attributes.json`, JSON.stringify(app.attributes, null, 4));
            }
        } catch (e) {
            console.error(`${process.title} stop`, e);
        }
    });

    return app;
};