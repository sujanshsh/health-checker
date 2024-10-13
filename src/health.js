const { moduleHealthGuage, healthGuage } = require('./metrics')

const healthStatus = {
    isHealthy: true,
    modulesStatus: {}
}

function updateHealthStatus(newIsHealthy, module) {
    healthStatus.modulesStatus[module] = newIsHealthy
    moduleHealthGuage.set({ module }, newIsHealthy ? 1 : 0)
    for (m in healthStatus.modulesStatus) {
        console.log(healthStatus.modulesStatus[m])
        if (!healthStatus.modulesStatus[m]) {
            healthStatus.isHealthy = false
            healthGuage.set(0)
            return
        }
    }
    healthStatus.isHealthy = true
}

function getHealthStatus() {
    healthGuage.set(healthStatus.isHealthy ? 1 : 0)
    return healthStatus
}

module.exports = {
    updateHealthStatus,
    getHealthStatus,
}
