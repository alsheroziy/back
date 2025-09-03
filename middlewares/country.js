
const { getCountryByIp } = require("../utils/getCountryByIp")

const ALLOWLIST = [
  "UZ",
  "KG",
  "TJ",
  "AF",
  "KZ",
  "RU",
  "TM" 
]



async function countryMiddleware(req, res, next) {
  try {
    //console.log(req)
    req.country = await getCountryByIp(req.ip)
    req.allowedCountry = ALLOWLIST.indexOf(req.country) !== -1
    console.log(req.country, req.ip)
    // allowList = process.env.ALLOWLIST
  } finally {
    next()
  }
}

module.exports.countryMiddleware = countryMiddleware
