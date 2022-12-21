//register, login, logout that we gonna add as a functionality to req ctx, and also to verify token and if is valid to attach it to do req ctx for move it into the actions
//convention to middle-ware function that is factory function that she return another function, so we'll initialize function init that return our function

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const {TOKEN_SECRET, COOKIE_NAME} = require('../config/index')

//res.cookie -v res
//req.cookies - v req

module.exports =()=> (req, res, next)=>{
        //attach functions to context
        if(parseToken(req, res)){
            req.auth = {
                async register( username, email, password){
                        const token = await register( username, email, password);
                        res.cookie(COOKIE_NAME, token);
                },
                 async login(email, password){
                    const token = await login(email, password);
                    res.cookie(COOKIE_NAME, token);
                },
                logout(){
                    res.clearCookie(COOKIE_NAME);
                }
            }
            //now we have to make a function that will parse the cookie in the req, and is gonna be called before we call next(). That function
            //will verify token and will add the data into the request, will decor it , 
            //if we cant verify token, we have the redirect to login page, is mean that token is not ok, and so
            //if we redirect to login page, ew don't have to arrive to next() function
            next()
        
        }

       
}

async function register(username, email, password){
    const existingUsername = await userService.getUserByUsername(username);
    const existingEmail = await userService.getUserByEmail(email);

    if(existingUsername){
        throw new Error ('Username is taken!')
    }
    if(existingEmail){
        throw new Error ('Email is taken!')
    }

    //if is not existing we register him, 
    //1. we hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //i sega go suzdavame
    const user = await userService.createUser(username, email, hashedPassword);

    return generateToken(user);
}
async function login( email, password){
    const user = await userService.getUserByEmail(email);
   
 //if we don't find such user in database
    if(!user){
        const err = new Error ('No such user!');
        err.type = 'credential';
        throw err;//taq gre6ka e za nas, tq 6te bude catchnata ot controllera i ve4e controllera 6te re6i kakva gre6ka da vurne na potrebitelq
    }

   //if is there, then we compare passwords
    const hasMatch = await bcrypt.compare( password, user.hashedPassword);
    
//if is there is no match
    if(!hasMatch){
        const err = new Error ('Incorrect password!')
        err.type = 'credential';
        throw err;//taq gre6ka e za nas, tq 6te bude catchnata ot controllera i ve4e controllera 6te re6i kakva gre6ka da vurne na potrebitelq
    }

    //if there is a match we have to do 2 things
    //- we have to generate token and to return it as a cookie to the user 
    //-and to attach to user to the session, but in this case is not necessary to do that

    return generateToken(user)
 
 
}

function generateToken(userData){
return jwt.sign({
    _id: userData._id,
    email: userData.email,
    username: userData.username,
  
}, TOKEN_SECRET)
}


function parseToken(req, res){
    const token = req.cookies[COOKIE_NAME];

    if(token){
        
        try {
            const userData = jwt.verify(token, TOKEN_SECRET);
            req.user = userData;
            res.locals.user = userData;
           
        } catch (err) {
            res.clearCookie(COOKIE_NAME);
            res.redirect('/auth/login');
    
            return false;
        }
    }

   return true;
   
}