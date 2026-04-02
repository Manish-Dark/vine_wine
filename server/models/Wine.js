const mongoose = require('mongoose');

const WineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wine name is required'],
      trim: true,
    },
    shopName: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Other'],
      default: 'Other',
    },
    region: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    country: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    vintage: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    otherExpense: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Map Mongoose _id to id in JSON
WineSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Wine', WineSchema);
