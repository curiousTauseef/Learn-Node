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
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String
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