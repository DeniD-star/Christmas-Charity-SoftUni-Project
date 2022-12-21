const Toy = require('../models/Toy');
const User = require('../models/User');

async function getAllToys() {
    return Toy.find({}).lean()
}
async function createToy(toyData) {
    const toy = await new Toy(toyData);
    return toy.save()
}

async function getToyById(id) {
    return Toy.findById(id).lean()
}
async function editToy(toyId, newData) {
    const toy = await Toy.findById(toyId);
    toy.title = newData.title.trim();
    toy.charity = newData.charity.trim();
    toy.description = newData.description.trim();
    toy.category = newData.category.trim();
    toy.price = Number(newData.price);

    return toy.save()
}

async function deleteToy(id) {
    return Toy.findByIdAndDelete(id)
}
async function buyToy(toyId, userId) {
    const toy = await Toy.findById(toyId);
    const user = await User.findById(userId);

    if (toy.owner == user._id) {
        throw new Error('Cannot buy your own toy!');
    }

    toy.buyingList.push(user);
    return Promise.all([user.save(), toy.save()])
}

async function getAllSearches(search) {


    let regex = new RegExp(search, 'i');
    const filtered = await Toy.find({ $and: [{ $or: [{ title: regex }, { charity: regex }] }] })
    if (search) {
        // return Toy
        //     .find({ title : { $regex: search, $options: 'i' } }, { charity : { $regex: search, $options: 'i' } })
        //     .lean();
        return filtered;
    }
}
module.exports = {
    getAllToys,
    createToy,
    getToyById,
    editToy,
    deleteToy,
    buyToy,
    getAllSearches
}