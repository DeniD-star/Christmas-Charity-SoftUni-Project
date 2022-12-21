function isUser() {//convenziqta za middlewarite e takava, ideqta na factory funkziite e 4e imame funkciq koqto vru6ta druga funkziq, 
    //s cel da se izpolzvat purvite skobi za priemane na eventualni parametri
    return (req, res, next) => {
        if (req.user) {
            next()
        } else {
            res.redirect('/auth/login')
        }
    }
}
function isGuest() {
    return (req, res, next) => {
        if (!req.user) {
            next()
        } else {
            res.redirect('/')
        }
    }
}

module.exports = {
    isUser,
    isGuest
}