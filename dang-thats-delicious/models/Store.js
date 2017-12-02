const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String]
});

// Slug auto-generated before the store is saved. Requires normal function, not arrow function
storeSchema.pre('save', function(next){

  if(!this.isModified('name')){
    next(); //skip it
    return;
  }
  // Scope of this refers to store that is being saved.
  this.slug = slug(this.name);

  //todo check slugs are unique
  
  next();
})

module.exports = mongoose.model('Store', storeSchema);