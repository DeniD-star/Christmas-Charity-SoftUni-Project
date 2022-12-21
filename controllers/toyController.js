const { isUser } = require('../middlewares/guards');
const { parseError } = require('../util/parse')
const router = require('express').Router();

router.get('/catalog', async (req, res) => {
    const toys = await req.storage.getAllToys();

    res.render('catalog', { toys })
})


router.get('/create', isUser(), (req, res) => {
    res.render('create')
})
router.post('/create', isUser(), async (req, res) => {
    try {
        const toyData = {
            title: req.body.title.trim(),
            charity: req.body.charity.trim(),
            imageUrl: req.body.imageUrl.trim(),
            description: req.body.description.trim(),
            category: req.body.category.trim(),
            price: Number(req.body.price),
            buyingList: [],
            owner: req.user._id,
        }

        await req.storage.createToy(toyData);
        res.redirect('/toys/catalog')
    } catch (err) {
        console.log(err.message);
        const ctx = {
            errors: parseError(err),
            toyData: {
                title: req.body.title.trim(),
                charity: req.body.charity.trim(),
                imageUrl: req.body.imageUrl,
                description: req.body.description.trim(),
                category: req.body.category.trim(),
                price: Number(req.body.price),
            }
        }

        res.render('create', ctx)
    }
})


router.get('/details/:id', async (req, res) => {
    try {

        const toy = await req.storage.getToyById(req.params.id);
        toy.hasUser = Boolean(req.user);
        toy.isAuthor = req.user && req.user._id == toy.owner;
        toy.bought = req.user && toy.buyingList.find(x => x == req.user._id)
        res.render('details', { toy })
    } catch (err) {
        console.log(err.message);
        res.redirect('/toys/404')
    }
})

router.get('/404', (req, res) => {
    res.render('404')
})
router.get('/edit/:id', isUser(), async (req, res) => {
    try {
        const toy = await req.storage.getToyById(req.params.id);
        res.render('edit', { toy })
    } catch (err) {
        console.log(err.message);
        res.redirect('/toys/404')
    }
})
router.post('/edit/:id', isUser(), async (req, res) => {
    try {
        const toy = await req.storage.getToyById(req.params.id);

        if (toy.owner != req.user._id) {
            throw new Error('You cannot edit a toy that is not your own!')
        }
        await req.storage.editToy(req.params.id, req.body)
        res.redirect('/toys/details/' + req.params.id)
    } catch (err) {
        let errors;
        if (err.errors) {
            errors = Object.values(err.errors).map(e => e.properties.message);
        } else {
            errors = [err.message]
        }

        const ctx = {
            errors,
            toy: {
                _id: req.params.id,
                title: req.body.title.trim(),
                charity: req.body.charity.trim(),
                description: req.body.description.trim(),
                category: req.body.category.trim(),
                price: Number(req.body.price),
            }
        }

        res.render('edit', ctx)
    }
})

router.get('/delete/:id', isUser(), async(req, res)=>{
    try {
        const toy = await req.storage.getToyById(req.params.id);

        if (toy.owner != req.user._id) {
            throw new Error('You cannot delete a toy that is not your own!')
        }
        await req.storage.deleteToy(req.params.id)
        res.redirect('/toys/catalog')
    } catch (err) {
        console.log(err.message);
        res.redirect('/toys/404')
    }
})

router.get('/buy/:id', isUser(), async(req, res)=>{
    try {

        await req.storage.buyToy(req.params.id, req.user._id);

        res.redirect('/toys/details/' + req.params.id);

    } catch (err) {
        console.log(err.message);
        res.redirect('/');
    }
})

router.get('/search', isUser(), async (req, res) => {

    
    const toys = await req.storage.getAllToys()
    res.render('search-page', {toys})

})


router.post('/search', isUser(), async(req, res) => {

    try {
        const matches = await req.storage.getAllSearches(req.body.search)
        res.render('search', { matches })
    } catch (err) {
            console.log(err.message);
            res.redirect('/toys/404')
    }
})
module.exports = router;