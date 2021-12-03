const passport      = require('passport');//autantication library
const express       = require('express'); //server 
const session       = require('express-session');
const bcrypt        = require('bcrypt'); //use to encrypt password
const flash         = require('express-flash');
const dotenv        = require('dotenv').config();
const methodedOR    = require('method-override')
const mysql         = require('mysql2');
//gloable variable 
const PORT = process.env.PORT || 5000;
//all the configration for passport is in the below folder
const initPP        = require('./config/passport-config');

//logging function
function logger(message, level) {
    console.log(message)
}
//initializing mySql connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'akkilah',
    password: 'adadad',
    database: 'mydb'
});

//connecting to database
db.connect((err) => { console.log('connected to database'); });

//get a user data by email
function selectUser(email) {
    let myquert = `SELECT * FROM mydb.User where Email = '${email}';`
    db.query(myquert, (err, results, fields) => {
        if (err) {
            console.log(`there is a connection err ${err}`);
            return;

        }

        console.log(results); // results contains rows returned by server
        //console.log(fields); // fields contains extra meta data about results, if available
    }
    );
}

//initializing passport
//passing the db client + the passport client  
initPP(passport,db);
const app = express();
app.set('view engine', 'ejs')

//MW to be able to encode data coming from the forms
//with this you can access <form> <input> from express 
//request  
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false

}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodedOR('_method'))
// app.use((req,res,next)=>{
//     req.locals.success_msg  =req.flash('success_msg');
//     req.locals.error_msg    =req.flash('error_msg')
// })
app.get('/', checkAuthanticate, (req, res) => {

    res.render('index');

})

app.get('/login', checkNotAuthanticate, (req, res) => {

    res.render('login')

});
app.post('/login', checkNotAuthanticate, passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }))

app.get('/register', checkNotAuthanticate, (req, res) => {

    res.render('register');

})

app.post('/register', checkNotAuthanticate, async (req, res) => {

    try {

        //refactering the value from the furm  
        const { name, Fname, Lname, email, phone, password, password2 } = req.body
        // creating array to file with error messages
        const Error = []

        //check if the password less than 6 character 
        if (password.length < 6) {
            Error.push({ msg: 'Password must be more than 6 characters ' })
        }
        //check for mis-matching password 
        if (password !== password2) {
            Error.push({ msg: 'Your password are not matching' })
        }

        //Check if the user name is used befor
        let query = `SELECT count(*) FROM User where UserName = '${name}';`
        db.promise().query(query)
            .then((row, filed) => {

                if (row[0][0]['count(*)'] > 0) {

                    Error.push({ msg: 'Username is taken use a different username' });
                }

                query = `SELECT count(*) FROM User where email = '${email}';`
                return db.promise().query(query)
            })
            .then((row, filed) => {

                if (row[0][0]['count(*)'] > 0) {

                    Error.push({ msg: 'Email is taken use a different email' });
                    return
                }

            }).then(async () => {

                if (Error.length > 0) {
                    logger(Error)
                    res.render('register', {
                        Error,
                        name,
                        email,
                        Fname,
                        Lname,
                        phone,
                        password,
                        password2

                    });

                }
                else {

                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
                    query = `INSERT INTO User(UserName,FirstName,LastName,Email,Phone,Password)
                        VALUES ('${name}','${Fname}','${Lname}','${email}','${phone}','${hashedPassword}')`

                    db.query(query, (err, results, fields) => {
                        
                        if (err) {
                            logger(`There is a connection err ${err}`);
                            Error.push('There is a connection error')
                            res.redirect('/register',)
                            return;
                        }else
                        {
                            req.flash('success', 'You now register, contact admin for activation');
                            res.redirect('/login')
                        }

                        logger(results); // results contains rows returned by server
                    }
                    );

                    
                }


            }).catch(err => logger(err))

    } catch (err) {
        logger(err);
        res.redirect('/register')
    }


})


app.get('/server',(req,res)=>{
    res.render('server')
})

app.delete('/logout', (req, res) => {

    req.logOut()
    res.redirect('/login')


})


//creating MW function for express
//to check if the user is autanticated or no
function checkAuthanticate(req, res, next) {
    //pre define function from passport
    if (req.isAuthenticated())
        return next()

    res.redirect('/login')


}

function checkNotAuthanticate(req, res, next) {
    if (req.isAuthenticated())
        return res.redirect('/')

    next()
}

app.listen(PORT, logger(`the server is on port ${PORT}`))