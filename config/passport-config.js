const localStrgy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
let user = {};


//db is the dbclient 
const init = function (passport,db) {

    passport.use(
        new localStrgy({
        usernameField: 'email',
        passwordField: 'password',
    },
        async function (username, password, done) {
            // ...

            ;
            let myquert = `SELECT idUser,Email, Password FROM user where Email = '${username}';`
            const [rows,fields] = await db.promise().query(myquert)

            //..
             
            
            if (rows[0] === undefined) {
                return done(null, false, { message: 'user not found' })
            }

            user ={
                id:rows[0]['idUser'],
                email:rows[0]['Email'],
                password:rows[0]['Password']

            }

            try {

                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "incorrect password" });
                }

            } catch (e) {
                console.log(e);
                return done(e)

            }

        }
    ));


    passport.serializeUser((user, done) => done(null,user.id));

    passport.deserializeUser((id, done) => {
        return done(null,user)
     });


}


module.exports = init