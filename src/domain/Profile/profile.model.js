const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likedProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    likedCourse: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
