const crypto = require(`crypto`);
const redis = require(`async-redis`);

module.exports = {
    generateSha: function generateSha(value) {
        const shaSum = crypto.createHash(`sha1`);
        return shaSum.update(value).digest(`hex`);
    },
    generateApiToken : function (username, value){
        const client = redis.createClient();
        return client.set(value, username).then(status => {
            // 24 Hours expiration
            return client.expire(value, 60*60*24)
        });
    },
    isAuthenticated: function(value){
        console.log(value);
        const client = redis.createClient();
        return client.get(value).then(result => {
            console.log(result);
            if(result === `null`)
                return false;
            else return result;
        });
    }
};