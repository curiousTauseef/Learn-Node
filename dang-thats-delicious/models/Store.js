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
storeSchema.pre('save', async function(next){

  if(!this.isModified('name')){
    next(); //skip it
    return;
  }
  // Scope of this refers to store that is being saved.

  this.slug = slug(this.name);

  // check slugs are unique
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({slug: slugRegEx});
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

storeSchema.statics.getTagsList = function() {
  // Not arrow function, scope of this must be bound to the model
  // Pass the aggregate method an array of mongodb pipeline operators.
  return this.aggregate([
    {$unwind: '$tags'}, // create store object for each tag
    {$group: {
      _id: '$tags', // group by tag
      count: {$sum: 1} // add new property count and add 1 for every time it groups
    }},
    {$sort: { count: -1 }} // Sort by the count property. 1 = ascending, 2 = descending. 
  ]);
}

module.exports = mongoose.model('Store', storeSchema);