import express from 'express';
import Listing from '../models/Listing.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/listings
// @desc    Retrieve all listings with filter, sorting, and geospatial proximity queries
router.get('/', async (req, res) => {
  const { search, category, board, lat, lng, maxDistance, sort } = req.query;

  try {
    let filterQuery = {};

    // 1. Board / Category filtering
    if (board && board !== 'all') {
      filterQuery.board = board;
    }
    if (category && category !== 'all' && category !== 'landing') {
      filterQuery.category = category;
    }

    // 2. Text Search index regex matching
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Advanced MongoDB 2dsphere proximity matching (Radius Search)
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const distanceLimit = parseFloat(maxDistance || '50000'); // Default range limit: 50 kilometers (50,000 meters)

      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        filterQuery.locationGeo = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat] // GeoJSON format [longitude, latitude]
            },
            $maxDistance: distanceLimit
          }
        };
      }
    }

    // 4. Dynamic Sorting Pipeline
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'likes') {
      sortOption = { likes: -1 };
    }

    // Proximity $near query automatically sorts by distance, so we override sorting if geo-query is present
    const listings = (lat && lng) 
      ? await Listing.find(filterQuery).populate('user', 'username isPremium')
      : await Listing.find(filterQuery).populate('user', 'username isPremium').sort(sortOption);

    res.status(200).json({ success: true, count: listings.length, listings });

  } catch (error) {
    console.error('Fetch Listings Error:', error);
    res.status(500).json({ success: false, message: 'Server database failure retrieving marketplace listings' });
  }
});

// @route   POST api/listings
// @desc    Publish a new marketplace listing (Requires JWT Authentication)
router.post('/', auth, async (req, res) => {
  const { title, price, description, category, board, location, coordinates, image } = req.body;

  try {
    // 1. Input field validation
    if (!title || price === undefined || !description || !category || !board || !location || !coordinates) {
      return res.status(400).json({ success: false, message: 'All listing parameters are required' });
    }

    const parsedPrice = parseFloat(price);
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (isNaN(parsedPrice) || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Invalid pricing or coordinates format' });
    }

    // 2. Create Mongoose Listing
    const newListing = new Listing({
      title,
      price: parsedPrice,
      description,
      category,
      board,
      location,
      coordinates: { lat, lng },
      // Set GeoJSON coordinates format for geospatial range queries
      locationGeo: {
        type: 'Point',
        coordinates: [lng, lat] // Order: [longitude, latitude]
      },
      image: image || '',
      user: req.user.id // Taken securely from decoding the JWT token middleware context
    });

    await newListing.save();

    const populatedListing = await Listing.findById(newListing._id).populate('user', 'username isPremium');

    res.status(201).json({ success: true, listing: populatedListing });

  } catch (error) {
    console.error('Publish Listing Error:', error);
    res.status(500).json({ success: false, message: 'Server database failure publishing listing' });
  }
});

// @route   POST api/listings/:id/like
// @desc    Increment like counter of a listing
router.post('/:id/like', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, likes: listing.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server database failure incrementing likes' });
  }
});

// @route   POST api/listings/:id/report
// @desc    Increment report counter of a listing
router.post('/:id/report', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { reports: 1 } },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, reports: listing.reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server database failure reporting listing' });
  }
});

export default router;
