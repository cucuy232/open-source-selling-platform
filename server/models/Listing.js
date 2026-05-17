import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Listing title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  board: {
    type: String,
    required: [true, 'Board identifier is required']
  },
  location: {
    type: String,
    required: [true, 'Location text is required']
  },
  // Simple coordinates model for general Leaflet pins
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // Advanced 2dsphere GeoJSON index for proximity searches (e.g. "Near Me" matches)
  locationGeo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true
    }
  },
  image: {
    type: String, // Base64 or uploaded image URL
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  reports: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for advanced geospatial radius queries
listingSchema.index({ locationGeo: '2dsphere' });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
