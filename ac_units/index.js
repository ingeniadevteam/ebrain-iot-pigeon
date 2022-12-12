'use strict';

const round = require('round-to');
const Hysteresis = require('hysteresis')

const init = async (app) => {
    app.device.values['ESTADO MAQUINA AUXILIAR 1'] = 0;
    app.device.values['ESTADO MAQUINA AUXILIAR 2'] = 0;
    app.device.values['ESTADO MAQUINA AUXILIAR 3'] = 0;

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
        },
        AC3: {
            setpoint: app.attributes.CONSIGNA,
            offset: 2 * app.attributes['OFFSET TEMPERATURA ARRANQUE MAQUINAS'],
            output: 'ONOFF MAQUINA AUXILIAR 3',
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
                try {
                    await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 1', 0);
                    app.device.values['ESTADO MAQUINA AUXILIAR 1'] = 1;
                } catch (error) {
                    app.logger.error(error.message);
                }
            } else {
                try {
                    await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 1', 1);
                    app.device.values['ESTADO MAQUINA AUXILIAR 1'] = 0;
                } catch (error) {
                    app.logger.error(error.message);
                }
            }
            app.logger.info(`AC1 ${Ac1Action}`);
        }
        
        // check AC2
        const Ac2DidCross = app.ac_units.AC2.check(Number(max));
        if (Ac2DidCross) {
            const Ac2Action = ['release', 'ignite'][Ac2DidCross - 1];

            if (Ac2Action === 'ignite') {
                try {
                    await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 2', 0);
                    app.device.values['ESTADO MAQUINA AUXILIAR 2'] = 1;
                } catch (error) {
                    app.logger.error(error.message);
                }
            } else {
                try {
                    await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 2', 1);
                    app.device.values['ESTADO MAQUINA AUXILIAR 2'] = 0;
                } catch (error) {
                    app.logger.error(error.message);
                }
            }
            app.logger.info(`AC2 ${Ac2Action}`);
        }

        // check AC3
        const Ac3DidCross = app.ac_units.AC3.check(Number(max));
        if (Ac3DidCross) {
            const Ac3Action = ['release', 'ignite'][Ac3DidCross - 1];

            if (Ac3Action === 'ignite') {
                try {
                    await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 3', 0);
                    app.device.values['ESTADO MAQUINA AUXILIAR 3'] = 1;
                } catch (error) {
                    app.logger.error(error.message);
                }
            } else {
                try {
                    await app.pigeonio.write('ONOFF MAQUINA AUXILIAR 3', 1);
                    app.device.values['ESTADO MAQUINA AUXILIAR 3'] = 0;
                } catch (error) {
                    app.logger.error(error.message);
                }
            }
            app.logger.info(`AC3 ${Ac3Action}`);
        }
    }
}


module.exports = {
    init,
    run
};