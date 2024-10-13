const promclinet = require('prom-client')
const { AppConfig } = require('./configs/app')

const metricsPrefix = 'health_checker_'

const registry = new promclinet.Registry()

const healthGuage = new promclinet.Gauge({
    name: metricsPrefix + 'health',
    help: 'Indicates whether this service is healthy (= 1) or not (= 0)',
    registers: [registry],
})

const moduleHealthGuage = new promclinet.Gauge({
    name: metricsPrefix + '_module_health',
    help: 'Indicates whether a module of this service is healthy (= 1) or not (= 0)',
    registers: [registry],
    labelNames: ['module'],
})

healthGuage.set(1)
moduleHealthGuage.set({module: 'cron'}, 1)

registry.registerMetric(healthGuage)
registry.registerMetric(moduleHealthGuage)

registry.setDefaultLabels({
    env: AppConfig.appEnv,
})

const metricsRoute = async (req, res) => {
    res.set('Content-Type', registry.contentType)
    res.end(await registry.metrics())
}

module.exports = {
    healthGuage,
    moduleHealthGuage,
    metricsRoute,
}
