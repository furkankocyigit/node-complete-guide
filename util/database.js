const Sequalize = require('sequelize')

const sequalize = new Sequalize('node-complete','root','frockk9258', 
{
    dialect:'mysql',
    host:'localhost'
})

module.exports = sequalize;