const { response } = require('express');
var express = require('express');
const fileUpload = require('express-fileupload');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/admin-login', (req, res) => {
  res.render('admin/admin-login', { admin: true })
})
router.post('/login', (req, res) => {
  productHelper.doLogin(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.loggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    }
    else {
      res.redirect('./admin-login')
    }
  })
})
router.get('/', function (req, res, next) {
  let admin = req.session.admin
  console.log(admin);
  if (admin) {
    productHelper.getAllProducts().then((products) => {
      res.render('admin/view-products', { admin: true, products, admin, status: true })
    })
  }
  else {
    productHelper.getAllProducts().then((products) => {
      res.render('admin/view-products', { admin: true, products, status: false })
    })
  }

});
router.get('/admin-logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin')
})
router.get('/all-products', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('admin/all-products', { admin: true, products })
  })
});
router.get('/all-orders', (req, res) => {
  res.render('admin/all-orders', { admin: true })
})
router.get('/all-users', (req, res) => {
  res.render('admin/all-users', { admin: true })
})
router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { admin: true })
});
router.post('/add-product', (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    }
    var file = req.files.mFile;
  }
  catch (e) {
    console.log(e);
  }
  productHelper.addProduct(req.body, (id) => {
    file.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product", { admin: true })
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})
router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product', { admin: true, product })
})
router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id;
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    var file = req.files.mFile;
    if (file) {
      file.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
module.exports = router;
