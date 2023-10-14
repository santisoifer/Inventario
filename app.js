const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require("dotenv").config()
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/data/uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const fs = require('fs');
const { nextTick } = require("process");
const { log } = require("console");

const app = express();
app.use(express.static("public"));
app.use('/node_modules', express.static('node_modules'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@inventario.3mgos1g.mongodb.net/inventario");
// https://mongoosejs.com/docs/api/model.html

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    products: Array
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

const itemSchema = {
    name: String,
    brand: String,
    gtin: Number,
    imgURL: String
}

const Item = mongoose.model("Item", itemSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.redirect("/inventario");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, err => {
        if (err) {
            console.log(err);
            res.redirect("/inventario");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/inventario");
            })
        }
    });

});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register({ username: req.body.username, products: [] }, req.body.password, (err, user) => {
        if (!err) {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/inventario");
            });
        } else {
            console.log(err);
            res.redirect("/register");
        }
    });
});

app.get("/inventario", async (req, res) => {
    if (req.isAuthenticated()) {
        const products = req.user.products;
        res.render("index", { products: products });
    } else {
        res.redirect("/login")
    }
});

app.get("/addItem", (req, res) => {
    res.render("addItem");
});

app.post("/addItem", upload.single("productImg"), async (req, res, next) => {
    try {
        const { productName, productBrand, productQuantity, productImgURL, productGTIN, productMinQuantity } = req.body;
        const username = req.user.username
        const user = await User.findOne({ username: username });
        if (!user) {
            console.log(`Usuario con el username "${username}" no encontrado`);
        } else {
            let newItem;
            if (productImgURL !== "") {
                newItem = {
                    name: productName,
                    brand: productBrand,
                    quantity: productQuantity,
                    _id: uuidv4(),
                    imageName: req.file !== undefined ? req.file.filename : productImgURL,
                    imgIsLocal: false,
                    minQuantity: productMinQuantity,
                    gtin: productGTIN
                };
            } else {
                newItem = {
                    name: productName,
                    brand: productBrand,
                    quantity: productQuantity,
                    _id: uuidv4(),
                    imageName: req.file !== undefined ? req.file.filename : "",
                    imgIsLocal: true,
                    minQuantity: productMinQuantity,
                    gtin: productGTIN
                };
            }
            user.products.push(newItem);
            await user.save();
            const itemInDbGTIN = await Item.findOne({ gtin: productGTIN });
            if (productGTIN !== "" && itemInDbGTIN === null) {
                const newItemGTIN = new Item({
                    name: newItem.name,
                    brand: newItem.brand,
                    gtin: productGTIN,
                    imgURL: productImgURL !== "" ? productImgURL : ""
                });

                await newItemGTIN.save();

            }
            console.log("Producto agregado existosamente");
            res.redirect("/");
        }
    } catch (error) {
        console.error(error);
    }
});

app.post("/addItemGTIN", async (req, res) => {
    const productGTINToCheck = req.body.decodedText;
    const foundedItem = await Item.findOne({ gtin: productGTINToCheck }).exec();
    res.json({ foundedItem });
});

app.post("/getIdToChange", async (req, res) => {
    const { productId } = req.body;
    const username = req.user.username
    const user = await User.findOne({ username: username });
    const userProducts = user.products;
    const productToEdit = userProducts.find((item) => item._id === productId);
    res.render("editItem", { product: productToEdit });
});

app.post("/editItem", async (req, res) => {
    try {
        const { productName, productBrand, productQuantity, id, productMinQuantity, gtin, productID } = req.body;
        const username = req.user.username;
        const user = await User.findOne({ username: username });
        const userProducts = user.products;
        let productToEdit;
        if (productID === undefined) {
            productToEdit = userProducts.find((item) => item._id === id);
        } else {
            productToEdit = userProducts.find((item) => item._id === productID);
        }
        const index = userProducts.indexOf(productToEdit);
        if (index !== -1) {
            userProducts.splice(index, 1);
        }
        const itemChanged = {
            name: productName,
            brand: productBrand,
            quantity: productQuantity,
            _id: productToEdit._id,
            imageName: productToEdit.imageName !== undefined ? productToEdit.imageName : undefined,
            minQuantity: productMinQuantity,
            gtin: productToEdit.gtin
        };
        user.products.push(itemChanged);
        await user.save();
        console.log("Producto cambiado existosamente");
        res.redirect("/");

    } catch (error) {
        console.error(error)
    }
});

app.post("/deleteItem", async (req, res) => {
    try {
        const { productId } = req.body;
        const username = req.user.username
        const user = await User.findOne({ username: username });
        let userProducts = user.products;
        const newUserProducts = userProducts.filter(item => {
            if (item._id === productId) {
                if (item.imageName !== "" && item.imageName !== undefined) {
                    const nombreImagen = item.imageName;
                    const rutaImagen = `${__dirname}/public/data/uploads/${nombreImagen}`;
                    try {
                        fs.unlinkSync(rutaImagen);
                    } catch (error) {
                        console.log(error);
                    }
                }
                return false; // No incluir en el nuevo array
            }
            return true; // Mantener los demás 
        });
        user.products = newUserProducts;
        await user.save();
        console.log("Producto eliminado existosamente");
        res.redirect("/");

    } catch (error) {
        console.error(error)
    }
});

app.get("/editItemByQR", async (req, res) => {
    res.render("findByQR");
});

app.post("/editItemByQR", async (req, res) => {
    const productGTINToEdit = req.body.decodedText;
    const username = req.user.username;
    const user = await User.findOne({ username: username });
    const userProducts = user.products;
    const productToEdit = userProducts.find((item) => item.gtin === productGTINToEdit);
    if (productGTINToEdit !== undefined) {
        res.json({ product: productToEdit });
    } else {
        res.send(undefined);
    }
});

app.get("/addItems", async (req, res) => {
    res.render("addItems");
});

//TODO: resolver problema de que solo se guarda una sola cantidad
app.post("/shoppingArrived", async (req, res) => {
    try {
        const productsToUpdate = [
            {
                _id: "25f2a48c-2eda-4b0c-ac4d-d2642c830e92",
                newQuantity: 4
            },
            {
                _id: "99fd0a8c-01a1-45ea-a45d-22c9bace21bd",
                newQuantity: 4
            }
        ];
    const userId = req.user._id;
    const user = await User.findOne({ _id: userId });
    const newUserProducts = user.products;

    // let originalProduct = newUserProducts.find(item => item._id === updatedProduct._id);
    // products.forEach(async updatedProduct => {
    //     const originalProduct = newUserProducts.find(item => item._id === updatedProduct._id);
    //     if (originalProduct) {
    //         originalProduct.quantity = updatedProduct.newQuantity;
    //     }
    //     user.products = [newUserProducts];
    //     user.products = user.products[0];
    //     await user.save();
    // });
    productsToUpdate.forEach(async updatedProduct => {
        const originalProduct = newUserProducts.find(item => item._id === updatedProduct._id);
        if (originalProduct) {
            originalProduct.quantity = updatedProduct.newQuantity;
        }
    });

    user.products = [newUserProducts];
    user.products = user.products[0];
    await user.save();

    res.json({ statusCode: 200 });
    console.log("Compras añadidas exitosamente");
}
    catch (err) {
    console.error(err);
    res.json({ statusCode: 400 });
}
});

app.post("/logout", (req, res) => {
    req.logOut(err => {
        if (!err) {
            res.redirect("/");
        } else {
            return err;
        }
    });
});

//* TODO 1 : agregar imagenes (ver subida de imagenes a la db):
// https://www.npmjs.com/package/multer
//*     TODO 1.1: borrar foto cuando borro item
//*     TODO 1.2: sacar fotos desde la pagina y subirla -> desde algunos dispositivos se puede sacar una foto y usar esa
//*     TODO 1.3: subir fotos desde url
//* TODO 2: Escanear qr
//*     TODO 2.1: crear sistema de qr (objetos de db)
//*     TODO 2.2: poder agregar items:
//*         TODO 2.2.1: una vez encontrado el gtin (escaneado qr) enviar form a url de /gtin
//*         TODO 2.2.2: con el gtin, buscar en la db y reenviar a /addItem con los values de nombre y brand
//*         TODO 2.2.3: el user agrega foto (opcional) y cantidad (obligtorio)
//* TODO 3: Agregar campo de stock mínimo en los items
//* TODO 4: Agregar botón que sea "Editar item", que en vez de agregar nuevo item, busca uno en la db por qr para cuando llegan nuevos prodcutos
//TODO 5: Agregar botones de "Llegó la compra" y "Hacer la compra"
//?  TODO 5.1: Llegó la compra -> poder agregar items más rápido: escanear todos los prodcutos y despues agregarlos todos de una
//  TODO 5.2: Hacer la compra -> en base al stock mínimo y stock actual, calcular cuántos hay que comprar
//TODO 6: Emepezar con el UX/UI
//TODO 7: Emepezar con el front
//  TODO 7.1: poder elegir ente vistas (por ejemplo, una de cuadrados y otra de lista)
//  TODO 7.2: poder ordenar los prodcutos en base a variables (stock, nombre, etc)
//  TODO 7.3: Reemplazar el 'feedback' de cuando escaneo qr por bootstrapp modals
//TODO 8: agregar items (de casa) -> para 1/10 aprox
// https://www.passportjs.org/packages/passport-remember-me/

app.listen(port, () => {
    console.log("server started on port 3000");
});