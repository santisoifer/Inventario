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
const html5Qrcode = require("html5-qrcode");

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

mongoose.connect("mongodb://127.0.0.1:27017/inventario");
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
    gtin: Number
}

const Item = mongoose.model("Item", itemSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
        const { productName, productBrand, productQuantity, productImgURL } = req.body;
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
                    imgIsLocal: false
                };
            } else {
                newItem = {
                    name: productName,
                    brand: productBrand,
                    quantity: productQuantity,
                    _id: uuidv4(),
                    imageName: req.file !== undefined ? req.file.filename : "",
                    imgIsLocal: true
                };
            }
            user.products.push(newItem);
            await user.save();
            console.log("Producto agregado existosamente");
            res.redirect("/");
        }
    } catch (error) {
        console.error(error);
    }
});

app.post("/addItemGTIN", async (req, res) => {
    const decodedText = req.body.decodedText;
    const decodedResult = req.body.decodedResult;

    // Haz lo que necesites con los datos aquí
    console.log(`Decoded Text: ${decodedText}`);
    console.log(`Decoded Result: ${decodedResult}`);

    // Envía una respuesta al cliente si es necesario
    res.json({ message: 'Solicitud POST recibida con éxito' });
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
        const { productName, productBrand, productQuantity, id } = req.body;
        const username = req.user.username;
        const user = await User.findOne({ username: username });
        const userProducts = user.products;
        const productToEdit = userProducts.find((item) => item._id === id);

        const index = userProducts.indexOf(productToEdit);
        if (index !== -1) {
            userProducts.splice(index, 1);
        }

        const itemChanged = {
            name: productName,
            brand: productBrand,
            quantity: productQuantity,
            _id: productToEdit._id,
            imageName: productToEdit.imageName !== undefined ? productToEdit.imageName : undefined
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
                if (item.imageName !== "") {
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
//* TODO 1.1: borrar foto cuando borro item
//! TODO 1.2: sacar fotos desde la pagina y subirla
//* TODO 1.3: subir fotos desde url
// TODO 2: Escanear qr
//* TODO 2.1: crear sistema de qr (objetos de db)
//TODO 2.2: poder agregar items:
//* TODO 2.2.1: una vez encontrado el gtin (escaneado qr) enviar form a url de /gtin
//TODO 2.2.2: con el gtin, buscar en la db y reenviar a /addItem con los values de nombre y brand
//TODO 2.2.3: el user agrega foto (opcional) y cantidad (obligtorio)
//TODO 2.3: agregar items (de casa)
//TODO 3: Emepezar con el UX/UI
//TODO 4: Emepezar con el front
//TODO 5: agergar botón de recuerdame: 
// https://www.passportjs.org/packages/passport-remember-me/

app.listen(3000, () => {
    console.log("server started on port 3000");
});