const mongoose = require('mongoose');
const { Schema } = mongoose;

const coachSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  family: {
    type: String,
    required: true,
    trim: true,
  },
});

const Coach = mongoose.model('Coach', coachSchema);
module.exports = Coach;
