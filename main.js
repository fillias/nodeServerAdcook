const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');

const app = express();
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'apps', 'newByznys', 'views')]);

// app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));



app.use( (req, res, next) => {
    console.log('');
    console.log('=============== new request ================');
    console.log('');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

const mainRoutes = require('./routes/mainRoutes');
const newByznysRoutes = require('./apps/newByznys/routes/newByznysRoutes');


app.use('/newByznys', newByznysRoutes); 

app.use(mainRoutes);



app.get('/500', errorController.get500);
app.use(errorController.get404);  

app.use( (error, req, res, next) => {
  //muzeme pouzit treba custom metody v error objectu:  
   // res.status(error.httpStatusCode).render(...)
    console.log('----- error handler error: -----');
    console.log(error);
    errorController.get500;
} );
console.log('=============== app start ================');
app.listen(8000);
