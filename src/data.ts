import type { Listing, Boards } from './types';

export const BOARDS: Boards = {
  "Marketplace": [
    { id: 'all', name: 'All Listings' },
    { id: 'recent', name: 'Recently Added' },
    { id: 'featured', name: 'Featured Items' },
    { id: 'free', name: 'Free Stuff' },
    { id: 'wanted', name: 'Wanted Items' }
  ],
  "Vehicles": [
    { id: 'cars', name: 'Cars' },
    { id: 'bikes', name: 'Bikes' },
    { id: 'commercial', name: 'Commercial & Spares' },
    { id: 'parts', name: 'Auto Parts' },
    { id: 'rvs', name: 'RVs & Campers' },
    { id: 'boats', name: 'Boats & Watercraft' }
  ],
  "Properties": [
    { id: 'prop', name: 'Properties' },
    { id: 'rentals', name: 'Rentals' },
    { id: 'commercial-prop', name: 'Commercial Prop' },
    { id: 'land', name: 'Land & Plots' },
    { id: 'vacation', name: 'Vacation Homes' }
  ],
  "Electronics": [
    { id: 'mobiles', name: 'Mobiles' },
    { id: 'electronics', name: 'Electronics & Appliances' },
    { id: 'computers', name: 'Computers & Laptops' },
    { id: 'cameras', name: 'Cameras & Lenses' },
    { id: 'games', name: 'Video Games & Consoles' },
    { id: 'audio', name: 'Audio & Video' }
  ],
  "Lifestyle": [
    { id: 'furniture', name: 'Furniture' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'pets', name: 'Pets' },
    { id: 'books', name: 'Books, Sports & Hobbies' },
    { id: 'kids', name: 'Kids & Toys' },
    { id: 'beauty', name: 'Health & Beauty' },
    { id: 'garden', name: 'Home & Garden' }
  ]
};

export const CATEGORIES = Object.values(BOARDS).flat().map(b => b.id);

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 1,
    subject: "Vintage IBM Model M Keyboard",
    name: "Anonymous",
    body: ">be me\n>found this in attic\n>clicks are louder than a gun\nWorks perfectly, slight yellowing but adds character. No missing caps.",
    price: "₹12,500",
    images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60"],
    time: "05/13/26(Wed)14:20:00",
    category: "electronics",
    location: "Bangalore, KA",
    coordinates: [12.9716, 77.5946],
    likes: 12,
    sponsored: true,
    createdAt: 1778682000000 // May 13, 2026
  },
  {
    id: 2,
    subject: "1994 Toyota Supra Turbo",
    name: "SpeedDemon",
    body: "Is that a Supra?!\nSelling my baby. Twin turbo, 2JZ-GTE. \nStock condition except for the exhaust.\nLow miles, no lowballers I know what I have.",
    price: "₹75,00,000",
    images: ["https://images.unsplash.com/photo-1610448721566-47369c768e70?w=500&auto=format&fit=crop&q=60"],
    time: "05/13/26(Wed)12:05:12",
    category: "cars",
    location: "Mumbai, MH",
    coordinates: [19.0760, 72.8777],
    likes: 5,
    sponsored: true,
    createdAt: 1778673912000 // May 13, 2026
  },
  {
    id: 3,
    subject: "Penthouse in Neo-Delhi",
    name: "HighRise",
    body: ">25th floor\n>View of the entire city skyline\n>Full smart home integration\nLooking for a quick buyer.",
    price: "₹15,00,00,000",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60"],
    time: "05/12/26(Tue)23:55:40",
    category: "prop",
    location: "Gurugram, HR",
    coordinates: [28.4595, 77.0266],
    likes: 42,
    sponsored: true,
    createdAt: 1778630140000 // May 12, 2026
  }
];
