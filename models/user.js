var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99
  },
  email: { // TODO: Need to add email validation
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 99
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 99
  }
});

// Override 'toJSON' to prevent the password from being returned with the user
// WARN toJSON is a method for the user model, so it's something from Mongoose
userSchema.set('toJSON', {
  transform: function(doc, user, options) {
    var returnJson = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    return returnJson;
  }
});

userSchema.methods.authenticated = function(password) {
  return bcrypt.compareSync(password, this.password);
}

/* NOTE next is pausing the function and hashSync is pausing the db save
 * next prevents the next function from executing and hashSync prevents the
 * next call from being sent too early */
// Mongoose's version of a beforeCreate hook
userSchema.pre('save', function(next) {
  var hash = bcrypt.hashSync(this.password, 10);
  // store the hash as the user's password
  this.password = hash;
  next();
});

module.exports = mongoose.model('User', userSchema);
