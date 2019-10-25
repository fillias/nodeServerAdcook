/* get home */
exports.home = (req, res, next) => {
    res.status(200).render('home-index');
}