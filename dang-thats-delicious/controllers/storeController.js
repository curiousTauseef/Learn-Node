const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      //by default first argument of next is Error. if you pass Null, it will allow you to pass whatever arguments subsequently;
      next(null, true)
    } else {
      next({message: `That filetype isn't allowed`}, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'});
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if(!req.file) {
    next(); //skip to next middleware if no file
  }  
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  const photo = await jimp.read(req.file.buffer); // get photo 
  await photo.resize(800, jimp.AUTO); // resize
  await photo.write(`./public/uploads/${req.body.photo}`); // save to file
  // once photo saved keep going
  next();
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  
  // query db for all stores. Await results of query before moving on.
  const stores = await Store.find();

  res.render('stores', {title: 'stores', stores: stores});
}

exports.editStore = async (req, res) => {
  // Find the store given the ID
  const store = await Store.findOne({_id: req.params.id});

  // Confirm owner of the store
  // Render edit form for user to update
  res.render('editStore', {title: `Edit ${store.name}`, store: store});
}

exports.updateStore = async (req, res) => {
  //set location data to be Point
  console.log(req.body);
  req.body.location.type = 'Point';
  // 1. Find and update store
  // findOneAndUpdate accepts 3 params, query (e.g. find by ID), data (e.g. new store data), options
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // return updated store instead of old store
    runValidators: true // model must run validators
  }).exec(); // exec runs the specified query

  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href='${store.slug}'>View Store</a>`);
  // Redirect them to the store and tell them it worked.
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug});
  if (!store) return next();
  res.render('store', {store: store, title: store.name});
}


exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true } //If there is no tag default to all stores that have a tag property
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({tags: tagQuery});
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tags', {tags: tags, title: 'Tags', tag: tag, stores});
}