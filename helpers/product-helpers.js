var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectID
var brcypt = require('bcrypt')
module.exports = {
    doLogin: (adminData) => {

        adminEmail = "admin001@gmail.com"
        return new Promise(async (resolve, reject) => {
            if (adminData.Email == adminEmail) {
                let response = {}
                let admin = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: adminData.Email })
                if (admin) {
                    brcypt.compare(adminData.Password, admin.Password).then((status) => {
                        if (status) {
                            response.admin = admin
                            response.status = true
                            resolve(response)
                        } else {
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log("login failed");
                }
            }
            else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    addProduct: (product, callback) => {
        product.Price = parseInt(product.Price)
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.ops[0]._id)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: productDetails.Name,
                        Category: productDetails.Category,
                        Price: productDetails.Price,
                        Description: productDetails.Description
                    }
                }).then((response) => {
                    resolve()
                })
        })
    }
}
