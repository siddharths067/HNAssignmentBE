var express = require('express');
var router = express.Router();

const {generateSha, generateApiToken} = require(`../utils/auth_utils`);

const logger = require(`../logger`);
const User = require(`../database/models/User`);


router.post(`/login`, function (req, res, next) {

    let username = req.body[`username`];
    let password = (req.body[`password`] === undefined) ? undefined : generateSha(req.body[`password`]);
    if (username === undefined || password === undefined) {
        res.status(401).send({
            status: `error`,
            code: `1`,
            message: `Null values for Username or Password`
        });
    }
    else User.findAll({
        where:{
            username: username,
            password: password
        }
    }).then(users => {
       if(users.length && users[0].getDataValue(`username`) === username && users[0].getDataValue(`password`) === password){
           let apiToken = generateSha(username + (new Date()).toString());
           generateApiToken(username, apiToken).then(status => {
               res.cookie(`HNToken`, apiToken);
               res.status(200).send({
                   status: `success`,
                   message: status,
                   token: apiToken
               });
           }).catch(error => {
               logger.error(error);
               res.status(500).send({
                   status: `error`,
                   code: `500`,
                   message: `Internal Server Error`
               });
           })


       }
       else
           res.status(401).send({
               status: `error`,
               message: `Invalid Credentials`,
               body: {
               }
           });
    }).catch(err => {
        res.status(500).send(`An Internal error occurred ${err}`);
    });
});


router.post(`/register`, function (req, res, next) {

    logger.info(`Request received for registering a user`);
    let username = req.body[`username`];
    let password = (req.body[`password`] === undefined) ? undefined : generateSha(req.body[`password`]);
    if (username === undefined || password === undefined) {
        res.send({
            status: `error`,
            code: `1`,
            message: `Null values for Username or Password`
        });
    } else {

        User.findAll({
            where: {
                username: username
            }
        }).then(users => {
            if (users.length) {
                res.status(500).send({
                    status: `error`,
                    message: `Username ${users[0].getDataValue(`username`)} already exists`
                });
            } else {
                logger.info(`Username: ${username} Password: ${password}`);
                User.create({
                    username: username,
                    password: password
                }).then(user => {
                    res.send({
                        status: `success`,
                        message: `User ${user.getDataValue(`username`)} registered successfully`
                    });
                }).catch(err => {
                    res.status(500).send({
                        status: `error`,
                        message: `Error Occurred while registering user ${err}`
                    });
                })
            }
        }).catch(err => {
            res.status(500).send(`An Internal error occurred ${err}`);
        });

    }
});


module.exports = router;