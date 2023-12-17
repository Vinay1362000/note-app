const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const jwt_secret = 'VinayisagoodBoy'


// Route -1: Create a user using : POST "/api/auth/createuser". No login required. Doing Signup
router.post('/createuser', [
   body('name', 'Enter a valid mail').isLength({ min: 3 }),
   body('email', 'Enter a valid email').isEmail(),
   body('password', 'Password must be of atleast 5 characters. ').isLength({ min: 5 }),
], async (req, res) => {
   let success = false;

   // If there are errors , return bad request and the errors...
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
   }

   // Check whether email exists already.

   try {

      let user = await User.findOne({ email: req.body.email })
      if (user) {
         return res.status(400).json({ success,error: 'Sorry a user with this email exists already' })
      }

      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
         name: req.body.name,
         password: secPassword,
         email: req.body.email,

      })

      const data = {
         user: {
            id: user.id
         }
      }
      const authtoken = jwt.sign(data, jwt_secret);

      success = true;
      res.json({success,authtoken})

   }
   catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured.")
   }
})

// ROute-2: Authenticate a user using : POST "api/auth/login". No login required

router.post('/login', [
   body('email', 'Enter a valid email').isEmail(),
   body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
   let success = false;
   // If there are errors , return bad request and the errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
   }

   const { email, password } = req.body;      // destructuring 
   try {
      let user = await User.findOne({ email });      // to find the user .
      if (!user) {
         success = false;
         return res.status(400).json({ error: "Plese enter the correct credentials." });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
         success = false;
         return res.status(400).json({ success,error: "Plese enter the correct credentials." });

      }

      const data = {
         user: {
            id: user.id
         }
      }
      const authtoken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({success,authtoken})

   } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.")
   }
})

// Route-3: Get logged in user details POST: "/api/auth/getuser". Login reuired.
router.post('/getuser',fetchuser, async (req, res) => {
  
try { 
   userId = req.user.id;
   const user = await User.findById(userId).select("-password")
   res.send(user);
   
} catch (error) {
   console.error(error.message);
   res.status(500).send("Internal server error.")
}
})


module.exports = router