const config = require("../config/config")

function isBT(member){

 return member.roles.cache.has(config.btRole)

}

module.exports = { isBT }
