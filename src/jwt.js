const jwt = require('jsonwebtoken');

const secretKey = process.env.secret_key;

function generateToken(username){
    console.log(username);
    let payload = {
        username: username
    }
    let token = jwt.sign(payload, secretKey, {expiresIn: "20m"});
    return token;
}

function validateToken(req, res, next){
    console.log(req.headers.authorization);
    
    const token = req.headers.authorization.split(' ')[1]
    console.log('validateToken ',token);

    if (!token) return res.status(401).json({ message: 'Token required' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
          }
          return res.status(403).json({ message: 'Invalid token' });
        }
        console.log('user',user);
        // req.user = user;
        next();
    });
}

module.exports = {
    generateToken, validateToken
}