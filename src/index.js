const fs = require('fs')
const { parse } = require('yaml')
const { updateHealthStatus } = require('./health')
const { main } = require('./main')
const path = require('path')
const { app } = require('./web')
const { AppConfig } = require('./configs/app')
const { logger } = require('./logger')

app.listen(AppConfig.port, () => {
    logger.info('App listening to ' + AppConfig.port)
})

try {
    const configPath = path.join(__dirname, './configs/health.yml')
    const configFile = fs.readFileSync(configPath, 'utf8')
    const config = parse(configFile)
    try {
        main(config)
    } catch (err) {
        updateHealthStatus(false, 'cron')
        logger.error('Error in main(): ' + err.message)
    }
} catch (err) {
    updateHealthStatus(false, 'config-file')
    logger.error('Error in reading config file: ' + err.message)
}
