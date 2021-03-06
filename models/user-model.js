/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - email
 *          - login
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *          login:
 *            type: string
 *            description: Login for the user, needs to be unique.
 *          password:
 *            type: string
 *            description: Password for the user
 *        example:
 *          email: test@email.com
 *          login: loginTest
 *          password: mdpTest
 *           
 */
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const saltRounds = 10;
const Schema = mongoose.Schema

const User = new Schema(
    {
        email: { type: String, required: true, unique: true },
        login: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
)

User.pre('save', function(next) {
    // Check if document is new or a new password has been set
    if (this.isNew || this.isModified('password')) {
      // Saving reference to this because of changing scopes
      const document = this;
      bcrypt.hash(document.password, saltRounds,
        function(err, hashedPassword) {
        if (err) {
          next(err);
        }
        else {
          document.password = hashedPassword;
          next();
        }
      });
    } else {
      next();
    }
  });

  User.methods.isCorrectPassword = function(password, callback){
    bcrypt.compare(password, this.password, function(err, same) {
      if (err) {
        callback(err);
      } else {
        callback(err, same);
      }
    });
  }

module.exports = mongoose.model('user', User)