const { Schema, model } = require('mongoose');

const schema = new Schema({
    title: { type: String, minLength: [10, 'Title must be at least 10 characters long!'] },
    charity: { type: String, minLength: [2, 'Charity must be at least 2 characters long!'] },
    imageUrl: { type: String, required: [true, 'Image is required!'], match: [/^https?/, 'Image must be a valid URL!'] },
    description: { type: String, minLength: [10, 'Description must be at least 10 characters long!'], maxLength: [100, 'Description must be maximum 100 characters long!']},
    category: { type: String, minLength: [5, 'Category must be at least 10 characters long!'] },
    price: { type: Number, min: [0 , 'Price should be a positive number!']},
    buyingList: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' }

})

module.exports = model('Toy', schema);