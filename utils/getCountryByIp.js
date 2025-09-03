const axios = require('axios')
const { LRUCache } = require('lru-cache')

const ipToCountryCache = new LRUCache({ max: 500 })

async function getCountryByIp(ip /** string */) {
    if (ipToCountryCache.has(ip)) {
        return ipToCountryCache.get(ip)
    }
    try {
        const { data } = await axios.get("http://ip-api.com/json/" + ip)
        ipToCountryCache.set(ip, data.countryCode)
        return data.countryCode
    } catch (error) {
        //console.log(error)
        return "unknown"
    }
}

module.exports.getCountryByIp = getCountryByIp
