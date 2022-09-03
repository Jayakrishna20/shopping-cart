const { response } = require('express');
var express = require('express');
const fileUpload = require('express-fileupload');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/admin-login', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin')
  }
  else {
    res.render('admin/admin-login', { admin: true, "loginErr": req.session.adminLoginErr })
    req.session.userLoginErr = false
  }

})
router.post('/login', (req, res) => {
  productHelper.doLogin(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    }
    else {
      req.session.adminLoginErr = true
      res.redirect('./admin-login')
    }
  })
})
router.get('/', function (req, res, next) {
  let admin = req.session.admin  
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
  req.session.admin = null
  req.session.adminLoggedIn = false
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
  productHelper.getAllUsers().then((user)=>{
    console.log(user[0]);
    res.render('admin/all-users', { admin: true , user})
  })
  
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
