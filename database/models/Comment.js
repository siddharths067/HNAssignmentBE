const Sequelize = require(`sequelize`);
const dao = require(`../database_access_object`);
const logger = require(`../../logger`);

class Comment extends Sequelize.Model {
}

Comment.init({
    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    text: {
        type: Sequelize.STRING(2000),
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING(10),
        allowNull: false,
    },
    replyto: {
        type: Sequelize.BIGINT,
        allowNull: false,
    }
}, {
    sequelize: dao,
    modelName: `comments`
});

Comment.addHook(`afterBulkDestroy`, (instance, options) => {
    logger.info(`Destroying Comment ${instance["where"]["id"]}`);

    if (instance["where"]["id"] !== undefined)
        Comment.destroy({
            where: {
                replyto: instance["where"]["id"]
            }
        }, {
            individualHooks: true
        }).catch(err => {
            logger.error(`Error Destroying Instances ${err}`);
        });
});

module.exports = Comment;