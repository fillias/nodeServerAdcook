/* get 404 page */
exports.get404 = (req, res, next) => {
    res.status(404).send('<h1>404 Page not found</h1>');
}


exports.get500 = (req, res, next) => {
    res.status(500).send('<h1>500 server error</h1>');
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
}