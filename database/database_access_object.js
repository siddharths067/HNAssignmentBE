const Sequelize = require(`sequelize`);
const logger = require(`../logger`);

const DAO = new Sequelize(`hndb`, `root`, `password`, {
    host: `localhost`,
    dialect: `mysql`,
    port: 3306
});

DAO.authenticate().then(() => {
    logger.info(`Connection established to MySQL Server Correctly`);
}).catch(err => {
    logger.error(`Cannot connect to SQL Server`);
    logger.error(err);
});


module.exports = DAO;