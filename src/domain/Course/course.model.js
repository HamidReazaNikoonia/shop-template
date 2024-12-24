const mongoose = require('mongoose');
const Upload = require('../../services/uploader/uploader.model');
const { Schema } = mongoose;


// Category Schema
const CourseCategorySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  sub_title: String,
  tumbnail_image: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Upload',
    autopopulate: true,
  },
  sample_media: {
    type: [
      {
        media_type: String,
        media_title: String,
        url_address: String,
        file: {
          type: Schema.Types.ObjectId,
          ref: 'Upload',
        },
      },
    ],
    required: true,
    validate: {
      validator: (array) => array.length > 0, // Ensures at least one object exists in the array
      message: 'At least one sample media is required.',
    },
  },
  price: {
    type: Number,
    required: true,
    min: [10000, 'Price must be at least 10,000.'], // Minimum value
  },
  member: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  max_member_accept: {
    type: Number,
    default: 10,
    min: [1, 'Max members must be at least 1.'], // Minimum value
    validate: {
      validator: (value) => Number.isInteger(value),
      message: 'Max members must be an integer.',
    },
  },
  course_language: String,
  course_duration: Number,
  course_type: {
    type: String,
    required: true,
    enum: ['HOZORI', 'OFFLINE'],
  },
  course_subject_header: Number,
  educational_level: Number,
  is_have_licence: {
    type: Boolean,
    default: false,
  },
  course_views: Number,
  score: Number,
  course_category: {
    type: Schema.Types.ObjectId,
    ref: 'Course_Category',
    autopopulate: true,
  },
  coach_id: {
    type: Schema.Types.ObjectId,
    ref: 'Coach',
    autopopulate: true,
  },
  course_objects: [
    {
      subject_title: String,
      status: {
        type: String,
        enum: ['FREE', 'PAYED'],
        default: 'PAYED'
      },
      duration: Number, // minute
      files: {
        type: Schema.Types.ObjectId,
        ref: 'Upload',
        autopopulate: true,
      },
    },
  ],
  course_status: {
    type: Boolean,
    default: true
  },
  slug: String,
  course_expire: Boolean,
});

// Pre-save hook
courseSchema.pre('save', async function (next) {
  const course = this;

  if (course.isNew && course.sample_media) {
    for (const media of course.sample_media) {
      if (media.file) {
        // Fetch the Upload document by its ObjectId
        const uploadDoc = await Upload.findById(media.file);
        if (uploadDoc) {
          // Generate a new URL using the file name
          const fileName = uploadDoc?.file_name; // Adjust field name to match your Upload model
          const generatedUrl = `http://localhost:9000/file/${fileName}`;
          media.url_address = generatedUrl; // Assign the generated URL
        }
      }
    }
  }

  next(); // Proceed to save the document
});


courseSchema.plugin(require('mongoose-autopopulate'));

const Course = mongoose.model('Course', courseSchema);
const CourseCategory = mongoose.model('Course_Category', CourseCategorySchema);

module.exports = {Course, CourseCategory};
