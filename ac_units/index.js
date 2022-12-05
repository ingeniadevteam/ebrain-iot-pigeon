'use strict';

const round = require('round-to');
const Hysteresis = require('hysteresis')

const init = async (app) => {
    app.ac_units = {
        AC1: {
            setpoint: app.attributes.CONSIGNA,
            offset: app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS'],
            output: 'ONOFF MAQUINA AUXILIAR 1',
            check: Hysteresis([
                app.attributes.CONSIGNA,
                app.attributes.CONSIGNA + app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS']
            ])
        },
        AC2: {
            setpoint: app.attributes.CONSIGNA,
            offset: 2 * app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS'],
            output: 'ONOFF MAQUINA AUXILIAR 2',
            check: Hysteresis([
                app.attributes.CONSIGNA,
                app.attributes.CONSIGNA + 2 * app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS']
            ])
        }
    }
}

const checkReconfig = (app) => {
    const currentSetpoint = app.ac_units.AC1.setpoint;
    const currentOffset = app.ac_units.AC1.offset;

    // check setpoint
    if (currentSetpoint !== app.attributes.CONSIGNA) {
        init(app);
        app.logger.info(`AC setpoint changed ${currentSetpoint} => ${app.attributes.CONSIGNA}`);
    }

    // check offset
    if (currentOffset !== app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS']) {
        init(app);
        app.logger.info(`AC offset changed ${currentSetpoint} => ${app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS']}`);
    }
}

const run = async (app) => {
    // check reconfiguration
    checkReconfig(app);

    if (app.w1.data) {
        const tRight = app.w1.data['TEMPERATURA DERECHA'];
        const tLeft = app.w1.data['TEMPERATURA IZQUIERDA'];
        // get the max temperature
        const max = Math.max(...[tRight, tLeft]);
        // check AC1
        const Ac1DidCross = app.ac_units.AC1.check(Number(max));
        if (Ac1DidCross) {
            const Ac1Action = ['release', 'ignite'][Ac1DidCross - 1];

            if (Ac1Action === 'ignite') {
                await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 1', 1);
                app.device.values['ESTADO MAQUINA AUXILIAR 1'] = 1;
            } else {
                await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 1', 0);
                app.device.values['ESTADO MAQUINA AUXILIAR 1'] = 0;
            }
            app.logger.info(`AC1 ${Ac1Action}`);
        }
        
        // check AC2
        const Ac2DidCross = app.ac_units.AC2.check(Number(max));
        if (Ac2DidCross) {
            const Ac2Action = ['release', 'ignite'][Ac2DidCross - 1];

            if (Ac2Action === 'ignite') {
                await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 2', 1);
                app.device.values['ESTADO MAQUINA AUXILIAR 2'] = 1;
            } else {
                await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 2', 0);
                app.device.values['ESTADO MAQUINA AUXILIAR 2'] = 0;
            }
            app.logger.info(`AC2 ${Ac2Action}`);
        }
    }
}


module.exports = {
    init,
    run
};