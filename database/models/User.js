const Sequelize = require(`sequelize`);
const dao = require(`../database_access_object`);

class User extends Sequelize.Model {}

User.init({
    username: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(200),
        allowNull: false
    }
}, {
    sequelize: dao,
    modelName: `users`
});

module.exports = User;