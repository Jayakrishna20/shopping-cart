const { response } = require('express');
var express = require('express');
const fileUpload = require('express-fileupload');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products })
  })
});
router.get('/add-product', function (req, res) {
  res.render('admin/add-product')
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
        res.render("admin/add-product")
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
  res.render('admin/edit-product', { product })
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