/**
 *  @author James Muhoro Mucheru
 *  this contains callback function for the routes
 */
//File dependencies
const Brand = require('./models/Brand');
const User = require('./models/User');
const Product = require('./models/Product');
const Request = require('./models/Request');
const { format } = require('date-fns');
const helpers = require('./helpers');
const qr = require('qrcode');

// Callbacks
const cb = {
   home(req, res) {
      res.render('index');
   },
   async dashboard(req, res) {
      res.render('authenticate', {
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async registerUser(req, res) {
      res.render('register');
   },
   /**
    * function to processs the registration form
    * @todo login user automatically after registering
    * @todo send errors to client if email is not unique
    *
    */
   async saveUser(req, res) {
      let { email, name, category, password } = req.body;

      email = email.trim();
      name = name.trim();
      category = category.trim();
      password = password.trim();

      if (!helpers.isEmailUnique(email)) {
         //send errors

         // response
         res.send('Your email is not unique');
         return;
      }
      const code = category !== 'enduser' ? helpers.generateUserCode() : '';
      const newUser = new User({
         email,
         name,
         role: category,
         password: helpers.hashPassword(password),
         dateOfRegistration: new Date().getTime().toString(),
         code,
      });
      try {
         const saveUser = await newUser.save();
         if (saveUser) {
            // start session
            req.session.email = email;
            req.session.role = saveUser.role;
            req.session.id = saveUser._id;
            req.session.loggedIn = true;
            res.redirect('/dashboard');
            return;
         }
      } catch (e) {
         console.log(e);
      }
      res.send('Could not save, please contact the administrator');
   },
   /**
    * callback to login user
    */
   async login(req, res) {
      let { email, password } = req.body;

      email = email.trim();
      password = password.trim();
      let verifiedUser = await helpers.verifyCredentials(email, password);
      if (verifiedUser) {
         // start session
         req.session.email = email;
         req.session.role = verifiedUser.role;
         req.session.id = verifiedUser._id;
         req.session.loggedIn = true;
         res.redirect('/dashboard');
         return;
      } else {
         res.send('Wrong details cannot verify');
         return;
      }
   },
   /**
    * callback to log out the user
    */
   logout(req, res) {
      req.session.destroy(function (err) {
         if (err) console.log(err);
      });
      res.redirect('/');
   },
   async registerDrug(req, res) {
      var allBrands;
      const userEmail = req.session.email;
      try {
         const user = await User.findOne({ email: userEmail.trim() });
         allBrands = user.brands;
      } catch (e) {
         console.log(e);
      }
      allBrands = allBrands.map(brand => brand.name);
      res.render('register-drug2', {
         allBrands,
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async registerDrugPost(req, res) {
      //Extract data from requests
      let { brand, quantity } = req.body;
      quantity = Number(quantity);
      const email = req.session.email.trim();
      const dateOfRegistration = new Date().getTime();
      const expiry = 'null';

      //fetch the manufacturer.
      const manufacturer = await User.findOne({ email });

      //An array to hold the products
      let products = [];
      //generate a unique serial number
      for (let i = 1; i <= quantity; i++) {
         const serial = await helpers.generateSerialNumber(manufacturer.code);
         const qrcode = helpers.generateQuikResponseCode(serial, email, brand);
         const product = new Product({
            brand: brand.trim(),
            serial,
            dateOfRegistration,
            expiry,
            manufacturer: email,
            qrcode,
            track: { 1: email },
         });

         products.push(product.save());
      }

      // save all the products
      const allResponse = await Promise.all(products);

      res.redirect('/register-drug');
   },
   async categories(req, res) {
      var allBrands;
      const userEmail = req.session.email;

      try {
         let user = await User.findOne({ email: userEmail });
         allBrands = user.brands;
      } catch (e) {
         console.log(e);
      }

      // append more properties to the object
      let serail = 1;
      for (let brand of allBrands) {
         brand.serial = serail;
         // format the timestamp in a dd/mm/yyyy format
         brand.dateOfRegistration = format(
            new Date(Number(brand.dateOfRegistration)),
            'dd/MM/yyyy'
         );
         serail++;
      }
      res.render('categories2', {
         allBrands,
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async newBrand(req, res) {
      // brand properties
      let { brand } = req.body;
      const email = req.session.email;
      const dateOfRegistration = new Date().getTime().toString();

      const user = await User.findOne({ email: email.trim() });
      const newBrand = {
         name: brand.trim(),
         dateOfRegistration,
      };
      user.brands.push(newBrand);

      try {
         // update user
         const savedUser = await user.save();
      } catch (error) {
         // get any errors
         console.log(error);
      }
      res.redirect('/categories');
   },
   async catalog(req, res) {
      // Fetch all product for display
      const allProducts = await Product.find({
         manufacturer: req.session.email,
      });
      const allBrands = await (async function () {
         let user = await User.findOne({ email: req.session.email });
         return [...user.brands];
      })();

      let serial = 0;
      const brandsCount = allBrands.map(brand => {
         let count = allProducts.filter(
            product => product.brand === brand.name
         ).length;
         serial += 1;
         return {
            count,
            serial,
            ...brand,
         };
      });

      res.render('catalog2', {
         role: req.session.role,
         email: req.session.email,
         brands: brandsCount,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async gainCustody(req, res) {
      let { error } = req.query;
      if (error) {
         error = error.trim();
      }

      res.render('exchange-gain2', {
         role: req.session.role,
         email: req.session.email,
         error,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async releaseCustody(req, res) {
      const unapprovedRequests = await Request.find({
         /** only those that belong to the current user */
         to: req.session.email,
         /**And are unapproved */
         approval_status: false,
      });

      // fetch the brands belonging to these user
      const user = await User.findOne({ email: req.session.email });
      const brands = user.brands;

      let unapprovedRequestsCopy = JSON.parse(
         JSON.stringify(unapprovedRequests)
      );
      unapprovedRequestsCopy = unapprovedRequestsCopy.map(async item => {
         const product = await Product.findOne({ serial: item.serial });
         item.brand = product.brand;

         return item;
      });

      // resolve all promises in unapprovedRequestsCopy
      let urc = await Promise.all(unapprovedRequestsCopy);
      //console.log(unapprovedRequests);

      //unapprovedRequests.forEach(item => console.log(item._id.toString()));

      res.render('exchange-release2', {
         role: req.session.role,
         email: req.session.email,
         unapprovedRequests: urc,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async releaseCustodypost(req, res) {
      let { request_id, accepted, product_serial, requester } = req.body;

      request_id = request_id.trim();
      accepted = Boolean(Number(accepted.trim()));
      product_serial = product_serial.trim();
      requester = requester.trim(); // the node that requests custody change

      if (accepted) {
         // update request approval to true
         const changeRequest = await Request.findOne({ _id: request_id });
         changeRequest.approval_status = true;
         changeRequest.approved = true;

         await changeRequest.save();

         // update the product track object accordingly
         const product = await Product.findOne({ serial: product_serial });
         let lastKey;
         for (key in product.track) {
            lastKey = key;
         }

         const nextKey = Number(lastKey) + 1;

         product.track = {
            ...product.track,
            [nextKey]: requester,
         };

         await product.save();
      } else {
         const changeRequest = await Request.findOne({ _id: request_id });
         changeRequest.approval_status = true;
         changeRequest.approved = false;

         await changeRequest.save();
      }

      res.redirect('/exchange-release');
   },
   async gainCustodyPost(req, res) {
      let { email: lastholder, serial } = req.body;

      lastholder = lastholder.trim();
      serial = serial.trim();

      //Check if its a valid product(exists)
      const product = await Product.findOne({ serial });
      if (!product) {
         res.redirect('/exchange-gain?error=Invalid product');
         return;
      }

      // check who was the last custodian
      if (!helpers.matchLastHolder(product.track, lastholder)) {
         res.redirect('/exchange-gain?error=Mismatch for last holder');
         return;
      }

      // form a new request to the last holder
      const request = new Request({
         from: req.session.email,
         to: lastholder,
         serial: serial,
         date: new Date().getTime(),
         approval_status: false,
      });

      // persist the request
      const savedRequest = await request.save();
      res.render('request_sent', {
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   endUserPage(req, res) {
      res.render('endUserPage');
   },
   async endUserPost(req, res) {
      let { endpoint, serial } = req.body;

      endpoint = endpoint.trim();
      serial = serial.trim();

      const product = await Product.findOne({
         // as per serial
         serial,
      });
      const track = product.track;

      const productCopy = JSON.parse(JSON.stringify(product));
      const DOR = format(
         new Date(Number(productCopy.dateOfRegistration)),
         'dd/MM/yyyy'
      );
      productCopy.DOR = DOR;

      const manufacturer = await User.findOne({ email: product.manufacturer });
      productCopy.manufacturer = manufacturer.name;

      const authentic = helpers.matchLastHolder(track, endpoint);
      if (authentic) {
         // This is an authentic product
         res.render('authentic-product', {
            product: productCopy,
         });
      } else {
         // This is not authentic product
         res.render('counterfeit-product');
      }
   },
   verify(req, res) {
      console.log(req.query);
      console.log('James Muhoro, best software engineer in the world');
      res.send('Items received for verication');
   },
   async sell(req, res) {
      res.render('sell', {
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async settings(req, res) {
      res.render('settings', {
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async serials(req, res) {
      // brand
      let { brand } = req.query;

      brand = brand.trim();

      // fetch all drugs as per brand
      let products = await Product.find({
         brand,
         manufacturer: req.session.email,
      });

      // makes it possible to add new properties to the document
      products = JSON.parse(JSON.stringify(products));

      products.forEach(product => {
         const DOR = format(
            new Date(Number(product.dateOfRegistration)),
            'dd/MM/yyyy'
         );
         product.DOR = DOR;
         product.track = JSON.stringify(product.track);
      });

      res.render('brand-serials', {
         brand,
         products,
         role: req.session.role,
         email: req.session.email,
         notifications: await Request.find({
            to: req.session.email.trim(),
            approval_status: false,
         }),
      });
   },
   async track(req, res) {
      let { serial } = req.query;

      serial = serial.trim();
      const product = await Product.findOne({
         // as per serial
         serial,
      });
      if (product) {
         let track = product.track;

         let trackToRender = [];

         for (let key in track) {
            let item = track[key];

            const user = await User.findOne({ email: item });
            trackToRender.push(user);
         }

         res.render('track', {
            role: req.session.role,
            email: req.session.email,
            track: trackToRender,
            notifications: await Request.find({
               to: req.session.email.trim(),
               approval_status: false,
            }),
         });
      } else {
         res.send('The serial number does not exist');
      }
   },
   async pharmacies(req, res) {
      // fetch all users where role is pharmacy
      const pharmacies = await User.find({
         role: 'pharmacy',
      });

      res.json(pharmacies);
   },
};

module.exports = cb;
