var express = require('express');
var router = express.Router();

const {isAuthenticated} = require(`../utils/auth_utils`);

const logger = require(`../logger`);
const Comment = require(`../database/models/Comment`);
const redis = require("async-redis");

router.post(`/`, (req, res, next) => {
    if (req.body[`text`] === undefined) {
        res.status(400).send({
            status: `error`,
            code: `400`,
            message: `Comment Text not present`
        })
    } else {
        isAuthenticated((req.cookies[`HNToken`] || req.body['HNToken'])).then(isAuth => {
            logger.info(isAuth);
            if (isAuth) {
                Comment.create({
                    text: req.body[`text`].substring(0, 2000),
                    username: isAuth,
                    replyto: (req.body[`replyto`] === undefined || isNaN(req.body[`replyto`])) ? -1 : req.body[`replyto`]
                }).then(result => {
                    logger.info(`Successfully inserted Comment`);
                    res.status(200).send({
                        status: `ok`,
                        code: 200,
                        message: `Comment Posted by ${isAuth}`
                    })
                }).catch((err) => {
                    logger.error(err);
                    res.status(500).send({
                        status: `error`,
                        code: `500`,
                        message: `Internal Server Error`
                    })
                });
            } else res.status(400).send({
                status: `error`,
                code: `400`,
                message: `Not Authenticated`
            })
        }).catch(err => {
            logger.error(err);
            res.status(500).send({
                status: `error`,
                code: `500`,
                message: `Internal Server Error`
            })
        })
    }
});

router.post(`/get`, (req, res, next) => {
    console.log(req.body['replyto']);
    console.log(req.body[`HNToken`]);
    isAuthenticated((req.cookies[`HNToken`] || req.body['HNToken'])).then(isAuth => {
        if (isAuth)
            Comment.findAll({
                where: {
                    replyto: (req.body[`replyto`] === undefined || isNaN(req.body[`replyto`])) ? -1 : req.body[`replyto`]
                }
            }).then(results => {
                const responseObject = results.map(e => e.dataValues);
                res.status(200).send({
                    status: `success`,
                    code: 200,
                    comments: responseObject
                });
            }).catch(error => {
                logger.error(error);
                res.status(400).send({
                    status: `error`,
                    code: 400,
                    comments: []
                });
            });
        else res.status(400).send({
            status: `error`,
            code: `400`,
            message: `Not Authenticated`
        })
    }).catch(err => {
        logger.error(err);
        res.status(500).send({
            status: `error`,
            code: `500`,
            message: `Internal Server Error`
        })
    });
});

router.delete(`/`, (req, res, next) => {
    if (req.body[`id`] === undefined) {
        res.status(400).send({
            status: `error`,
            code: `400`,
            message: `comment id not present`
        })
    } else isAuthenticated((req.cookies[`HNToken`] || req.body['HNToken'])).then(isAuth => {
        if (isAuth)
            Comment.destroy({
                where: {
                    id: req.body[`id`]
                }
            }, {
                individualHooks: true
            }).then(results => {
                res.status(200).send({
                    status: `success`,
                    code: 200,
                    message: `Comment Deleted`
                });
            }).catch(error => {
                logger.error(error);
                res.status(400).send({
                    status: `error`,
                    code: 400,
                    comments: []
                });
            });
        else res.status(400).send({
            status: `error`,
            code: `400`,
            message: `Not Authenticated`
        })
    }).catch(err => {
        logger.error(err);
        res.status(500).send({
            status: `error`,
            code: `500`,
            message: `Internal Server Error`
        })
    });
});

router.post(`/vote`, (req, res, next) => {
    if (req.body[`type`] === undefined || req.body['id'] === undefined || (req.body[`type`] !== "upvote" && req.body[`type`] !== "downvote")) {
        res.status(400).send({
            status: `error`,
            code: `400`,
            message: `vote type or comment id not present`
        })
    } else isAuthenticated((req.cookies[`HNToken`] || req.body['HNToken'])).then(isAuth => {
        if (isAuth)
            Comment.findAll({
                where: {
                    id: req.body[`id`]
                }
            }).then(results => {
                if (results.length) {
                    const client = redis.createClient();
                    client.srem(`CP${req.body[`id`]}`, isAuth).then(()=> {
                        client.srem(`CN${req.body[`id`]}`, isAuth).then(() => {
                            client.sadd(`C${(req.body['type']==="upvote")?"P":"N"}${req.body[`id`]}`, isAuth);
                        });
                    });

                    res.status(200).send({
                        status: "success",
                        code: 200,
                        message: `Request for Upvote Submitted`
                    });
                } else
                    res.status(400).send({
                        status: `error`,
                        code: 400,
                        message: `The Post doesn't exist`
                    });
            });
        else res.status(400).send({
            status: `error`,
            code: `400`,
            message: `Not Authenticated`
        })
    }).catch(err => {
        logger.error(err);
        res.status(500).send({
            status: `error`,
            code: `500`,
            message: `Internal Server Error`
        })
    });
});


router.post(`/vote/get`, (req, res, next) => {
    if (req.body['id'] === undefined) {
        res.status(400).send({
            status: `error`,
            code: `400`,
            message: `comment id not present`
        })
    } else isAuthenticated((req.cookies[`HNToken`] || req.body['HNToken'])).then(isAuth => {
        if (isAuth)
            Comment.findAll({
                where: {
                    id: req.body[`id`]
                }
            }).then(results => {
                if (results.length) {
                    const client = redis.createClient();
                    client.scard(`CP${req.body["id"]}`).then(positive => {
                        client.scard(`CN${req.body["id"]}`).then(negative => {
                            res.status(200).send({
                                status: "success",
                                code: 200,
                                upvotes: positive,
                                downvotes: negative
                            });
                        });
                    });
                } else
                    res.status(400).send({
                        status: `error`,
                        code: 400,
                        message: `The Post doesn't exist`
                    });
            });
        else res.status(400).send({
            status: `error`,
            code: `400`,
            message: `Not Authenticated`
        })
    }).catch(err => {
        logger.error(err);
        res.status(500).send({
            status: `error`,
            code: `500`,
            message: `Internal Server Error`
        })
    });
});


module.exports = router;