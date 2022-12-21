const toyService = require('../services/toyService')

module.exports = ()=> (req, res, next)=>{
    req.storage = {
            ...toyService
    };
    next()
}