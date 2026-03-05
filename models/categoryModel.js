const mongoose = require("mongoose");
const slugify = require('slugify');

const categorySchema = mongoose.Schema({
  _id: {
    type: String,
    alias: 'relationId'
  },
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true,
    // enum: {
    //   values: ['Accessoires', 'Art', 'Cooking', 'Crocet', 'Tailor', 'Woodeny', 'Other'],
    //   message: ['categoty must be: Accessoires Art Cooking Crocet Tailor Woodeny Other']
    // }
  },
  slug: String,
  image: {
    type: String,
    default: 'default.jpg',
  },
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
  
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { uper: true });
  next();
});

categorySchema.pre('save', async function(next){
  this._id = this.name
  next();
})

//module.exports = mongoose.model("Category", cateSchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;