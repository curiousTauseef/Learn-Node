const mongoose = require('mongoose');
const Store = mongoose.model('Store');


exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'});
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