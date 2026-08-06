import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Eye, Scale, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '../components/OptimizedImage';
import { fetchPublicJson, normalizeProperty } from '../services/publicData';

const MOCK_PROPERTIES = [
  // Hyderabad
  {
    id: 'prop-1',
    title: 'Prestige Kokapet Sky Villas',
    address: 'Kokapet',
    city: 'Hyderabad',
    price: 48000000,
    type: 'Sky Villa',
    status: 'AVAILABLE',
    rera: 'P02400008891',
    bedrooms: 4,
    bathrooms: 5,
    area: 4800,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80&sig=hyd_1',
    amenities: ['Infinity Pool', 'Private Elevator', 'Smart Automation']
  },
  {
    id: 'prop-2',
    title: 'DLF CyberCity Glass Tower',
    address: 'HITEC City',
    city: 'Hyderabad',
    price: 125000000,
    type: 'Commercial',
    status: 'AVAILABLE',
    rera: 'P02400009981',
    bedrooms: 0,
    bathrooms: 8,
    area: 12500,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80&sig=hyd_2',
    amenities: ['Executive Suites', 'Fiber Optic', 'Triple Basement Parking']
  },
  {
    id: 'prop-3',
    title: 'Sobha Royal Meadows',
    address: 'Tellapur',
    city: 'Hyderabad',
    price: 36000000,
    type: 'Luxury Villa',
    status: 'AVAILABLE',
    rera: 'P02400007781',
    bedrooms: 4,
    bathrooms: 4,
    area: 3900,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80&sig=hyd_3',
    amenities: ['Private Garden', 'Clubhouse', 'EV Charging']
  },
  {
    id: 'prop-4',
    title: 'Aurobindo Gachibowli Penthouses',
    address: 'Gachibowli',
    city: 'Hyderabad',
    price: 62000000,
    type: 'Penthouse',
    status: 'AVAILABLE',
    rera: 'P02400006611',
    bedrooms: 5,
    bathrooms: 6,
    area: 5800,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80&sig=hyd_4',
    amenities: ['Terrace Lounge', 'Private Helipad', 'Concierge Service']
  },
  // Bengaluru
  {
    id: 'prop-5',
    title: 'Brigade Whitefield Smart Homes',
    address: 'Whitefield',
    city: 'Bengaluru',
    price: 21000000,
    type: 'Smart Home',
    status: 'AVAILABLE',
    rera: 'PRM/KA/RERA/1251/446',
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80&sig=blr_1',
    amenities: ['Home Automation', 'EV Charger', 'Borewell Supply']
  },
  {
    id: 'prop-6',
    title: 'Sobha Sarjapur Sanctuary',
    address: 'Sarjapur',
    city: 'Bengaluru',
    price: 42000000,
    type: 'Luxury Villa',
    status: 'AVAILABLE',
    rera: 'PRM/KA/RERA/1251/550',
    bedrooms: 4,
    bathrooms: 4,
    area: 4200,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80&sig=blr_2',
    amenities: ['1-Acre Forest Park', 'Smart Lockers', 'Infinity Pool']
  },
  {
    id: 'prop-7',
    title: 'Brigade Hebbal Residency',
    address: 'Hebbal',
    city: 'Bengaluru',
    price: 31000000,
    type: 'Premium Apartment',
    status: 'AVAILABLE',
    rera: 'PRM/KA/RERA/1251/660',
    bedrooms: 3,
    bathrooms: 3,
    area: 3150,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80&sig=blr_3',
    amenities: ['Sky Garden', 'Badminton Court', 'Kids Play Area']
  },
  {
    id: 'prop-8',
    title: 'Prestige Koramangala Suites',
    address: 'Koramangala',
    city: 'Bengaluru',
    price: 58000000,
    type: 'Penthouse',
    status: 'AVAILABLE',
    rera: 'PRM/KA/RERA/1251/770',
    bedrooms: 4,
    bathrooms: 5,
    area: 4500,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80&sig=blr_4',
    amenities: ['Rooftop Deck', 'Central AC', 'Private Concierge']
  },
  // Mumbai
  {
    id: 'prop-9',
    title: 'Lodha Worli Seafront Mansion',
    address: 'Worli',
    city: 'Mumbai',
    price: 185000000,
    type: 'Sky Villa',
    status: 'AVAILABLE',
    rera: 'P51900001339',
    bedrooms: 5,
    bathrooms: 5,
    area: 8400,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80&sig=mum_1',
    amenities: ['Worli Sea View', 'Private Helipad', 'Infinity Pool']
  },
  {
    id: 'prop-10',
    title: 'Godrej BKC Capital Tower',
    address: 'BKC',
    city: 'Mumbai',
    price: 320000000,
    type: 'Commercial',
    status: 'AVAILABLE',
    rera: 'P51900001990',
    bedrooms: 0,
    bathrooms: 12,
    area: 32000,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80&sig=mum_2',
    amenities: ['Premium Coworking', 'Double Height Lobby', 'EV Charging']
  },
  {
    id: 'prop-11',
    title: 'L&T Powai Blue Lakefront',
    address: 'Powai',
    city: 'Mumbai',
    price: 38000000,
    type: 'Premium Apartment',
    status: 'AVAILABLE',
    rera: 'P51900002231',
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    image: 'https://images.unsplash.com/photo-1493397862567-47fed77dc59a?auto=format&fit=crop&w=1000&q=80&sig=mum_3',
    amenities: ['Lake View', 'Clubhouse', 'Yoga Lawn']
  },
  {
    id: 'prop-12',
    title: 'Prestige Lower Parel Suites',
    address: 'Lower Parel',
    city: 'Mumbai',
    price: 95000000,
    type: 'Penthouse',
    status: 'AVAILABLE',
    rera: 'P51900005510',
    bedrooms: 4,
    bathrooms: 4,
    area: 5500,
    image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?auto=format&fit=crop&w=1000&q=80&sig=mum_4',
    amenities: ['Private Sky Deck', 'Automated Parking', '24/7 Security']
  },
  // Chennai
  {
    id: 'prop-13',
    title: 'Sobha ECR Coastal Sanctuary',
    address: 'ECR',
    city: 'Chennai',
    price: 52000000,
    type: 'Luxury Villa',
    status: 'AVAILABLE',
    rera: 'TN/01/Building/0082/2026',
    bedrooms: 4,
    bathrooms: 4,
    area: 5200,
    image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80&sig=chn_1',
    amenities: ['Coastal Ocean View', 'Yacht Dock', 'Biophilic Garden']
  },
  {
    id: 'prop-14',
    title: 'DLF OMR Capital Tower',
    address: 'OMR',
    city: 'Chennai',
    price: 85000000,
    type: 'Commercial',
    status: 'AVAILABLE',
    rera: 'TN/01/Building/0099/2026',
    bedrooms: 0,
    bathrooms: 6,
    area: 8500,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80&sig=chn_2',
    amenities: ['Integrated Food Court', 'Helipad', 'Dedicated EV Points']
  },
  {
    id: 'prop-15',
    title: 'Brigade Velachery Springs',
    address: 'Velachery',
    city: 'Chennai',
    price: 28000000,
    type: 'Premium Apartment',
    status: 'AVAILABLE',
    rera: 'TN/01/Building/0055/2026',
    bedrooms: 3,
    bathrooms: 3,
    area: 2400,
    image: 'https://images.unsplash.com/photo-1600585154526-990dccd4db7d?auto=format&fit=crop&w=1000&q=80&sig=chn_3',
    amenities: ['Jogging Track', 'Tennis Court', 'Swimming Pool']
  },
  {
    id: 'prop-16',
    title: 'Prestige Sholinganallur Penthouses',
    address: 'Sholinganallur',
    city: 'Chennai',
    price: 49000000,
    type: 'Penthouse',
    status: 'AVAILABLE',
    rera: 'TN/01/Building/0022/2026',
    bedrooms: 4,
    bathrooms: 4,
    area: 4400,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80&sig=chn_4',
    amenities: ['Skyline View', 'Central Lounge', 'Smart Security']
  },
  // Pune
  {
    id: 'prop-17',
    title: 'Prestige Hinjewadi TechCounty',
    address: 'Hinjewadi',
    city: 'Pune',
    price: 68000000,
    type: 'Commercial',
    status: 'AVAILABLE',
    rera: 'P52100004421',
    bedrooms: 0,
    bathrooms: 8,
    area: 7500,
    image: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1000&q=80&sig=pun_1',
    amenities: ['Fiber Internet', 'Conference Rooms', 'Cafe Lounge']
  },
  {
    id: 'prop-18',
    title: 'Brigade Baner Palms',
    address: 'Baner',
    city: 'Pune',
    price: 24000000,
    type: 'Premium Apartment',
    status: 'AVAILABLE',
    rera: 'P52100005510',
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80&sig=pun_2',
    amenities: ['Swimming Pool', 'EV Parking', 'Borewell Supply']
  },
  {
    id: 'prop-19',
    title: 'Sobha Kharadi Meadows',
    address: 'Kharadi',
    city: 'Pune',
    price: 31000000,
    type: 'Smart Home',
    status: 'AVAILABLE',
    rera: 'P52100006620',
    bedrooms: 3,
    bathrooms: 3,
    area: 3100,
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=80&sig=pun_3',
    amenities: ['Modular Kitchen', 'Automated Lighting', 'Sky Deck']
  },
  {
    id: 'prop-20',
    title: 'Koregaon Park Sky Villas',
    address: 'Wakad',
    city: 'Pune',
    price: 48000000,
    type: 'Sky Villa',
    status: 'AVAILABLE',
    rera: 'P52100007710',
    bedrooms: 4,
    bathrooms: 5,
    area: 4500,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80&sig=pun_4',
    amenities: ['Infinity Pool', 'Private Lift', 'Modular Fittings']
  },
  // Delhi NCR
  {
    id: 'prop-21',
    title: 'DLF Gurgaon Cyber Mansion',
    address: 'Gurgaon',
    city: 'Delhi NCR',
    price: 145000000,
    type: 'Luxury Villa',
    status: 'AVAILABLE',
    rera: 'GGM/2026/902',
    bedrooms: 5,
    bathrooms: 5,
    area: 7200,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80&sig=ncr_1',
    amenities: ['Private Lawn', 'Rooftop Lounge', 'Central AC']
  },
  {
    id: 'prop-22',
    title: 'Godrej Noida Golf Meadows',
    address: 'Noida',
    city: 'Delhi NCR',
    price: 82000000,
    type: 'Penthouse',
    status: 'AVAILABLE',
    rera: 'NOI/2026/441',
    bedrooms: 4,
    bathrooms: 4,
    area: 5100,
    image: 'https://images.unsplash.com/photo-1600585154526-990dccd4db7d?auto=format&fit=crop&w=1000&q=80&sig=ncr_2',
    amenities: ['Golf Course View', 'Infinity Pool', 'Valet Parking']
  },
  {
    id: 'prop-23',
    title: 'DLF Dwarka Expressway Enclave',
    address: 'Dwarka Expressway',
    city: 'Delhi NCR',
    price: 39000000,
    type: 'Premium Apartment',
    status: 'AVAILABLE',
    rera: 'GGM/2026/880',
    bedrooms: 3,
    bathrooms: 3,
    area: 3200,
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80&sig=ncr_3',
    amenities: ['Clubhouse', 'Smart Locks', 'Dual Parking']
  },
  {
    id: 'prop-24',
    title: 'Greater Noida Smart Township',
    address: 'Greater Noida',
    city: 'Delhi NCR',
    price: 18000000,
    type: 'Smart Home',
    status: 'AVAILABLE',
    rera: 'NOI/2026/110',
    bedrooms: 2,
    bathrooms: 2,
    area: 1600,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80&sig=ncr_4',
    amenities: ['App Controls', 'EV Charging', 'Central Security']
  }
];

export default function Properties() {
  const location = useLocation();
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [loading, setLoading] = useState(false);

  // Layout View State: grid or list
  const [viewType, setViewType] = useState('GRID');

  // Filters State
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  // Quick View State
  const [quickViewProp, setQuickViewProp] = useState(null);

  // Property Comparison list
  const [compareList, setCompareList] = useState([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('search')) setSearch(query.get('search'));
    if (query.get('city')) setCity(query.get('city'));
    if (query.get('type')) setType(query.get('type'));
  }, [location.search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const jsonData = await fetchPublicJson('data/properties.json');
      const sourceList = (jsonData || []).map(normalizeProperty);
      let filtered = sourceList.length ? sourceList : MOCK_PROPERTIES;

      filtered = filtered.filter((item) => item.status === 'AVAILABLE');

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
        );
      }
      if (city) {
        filtered = filtered.filter((p) => p.city.toLowerCase() === city.toLowerCase());
      }
      if (type) {
        filtered = filtered.filter((p) => p.type.toLowerCase().includes(type.toLowerCase()));
      }
      if (minPrice) {
        filtered = filtered.filter((p) => Number(p.price) >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => Number(p.price) <= Number(maxPrice));
      }
      if (bedrooms) {
        filtered = filtered.filter((p) => Number(p.bedrooms) >= Number(bedrooms));
      }
      setProperties(filtered);
    } catch (error) {
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, city, type, minPrice, maxPrice, bedrooms]);

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setProperties(MOCK_PROPERTIES);
  };

  const handleToggleCompare = (prop) => {
    const exists = compareList.find((p) => p.id === prop.id);
    if (exists) {
      setCompareList(compareList.filter((p) => p.id !== prop.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 properties at a time.');
        return;
      }
      setCompareList([...compareList, prop]);
      setShowCompareDrawer(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Luxury Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-1">Explore ready-to-move apartments, sky villas, and weekends farm houses.</p>
        </div>
        
        {/* Grid/List View Toggler */}
        <div className="flex bg-secondary p-1 rounded-xl w-fit border border-border">
          <button
            onClick={() => setViewType('GRID')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewType === 'GRID' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewType('LIST')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewType === 'LIST' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="glass-premium p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Filters</span>
            </h2>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline font-semibold">
              Clear All
            </button>
          </div>

          <div className="space-y-4 text-xs font-bold">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-2xs tracking-wider">Search Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Prestige, Sobha"
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-3 pr-10 focus:ring-1 focus:ring-primary focus:outline-none text-white text-xs"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-2xs tracking-wider">Indian Metro City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-white text-xs select-custom"
              >
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-2xs tracking-wider">Property Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-white text-xs select-custom"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Premium Apartment</option>
                <option value="VILLA">Sky Villa / Penthouse</option>
                <option value="LAND">Weekend Villa / Plot</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-2xs tracking-wider">Price Bounds (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-background border border-border rounded-xl py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-white text-xs"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-background border border-border rounded-xl py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-white text-xs"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase text-2xs tracking-wider">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none text-white text-xs select-custom"
              >
                <option value="">Any</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <div className={viewType === 'GRID' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
              {properties.map((prop) => {
                const isCompared = compareList.some((p) => p.id === prop.id);
                return (
                  <motion.div
                    layout
                    key={prop.id}
                    className={`group bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm flex ${
                      viewType === 'GRID' ? 'flex-col justify-between' : 'flex-col sm:flex-row'
                    }`}
                  >
                    <div className={`relative overflow-hidden bg-muted ${
                      viewType === 'GRID' ? 'h-48 w-full' : 'h-48 sm:h-auto sm:w-64 shrink-0'
                    }`}>
                      <OptimizedImage
                        src={prop.image || prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                        alt={prop.title}
                        className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                        sizes={viewType === 'GRID' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 320px'}
                      />
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider">
                        {prop.type}
                      </span>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-3xs text-muted-foreground flex items-center gap-1 font-semibold">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            {prop.address}, {prop.city}
                          </span>
                          <button
                            onClick={() => handleToggleCompare(prop)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isCompared ? 'bg-primary/20 border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                            title="Compare specifications"
                          >
                            <Scale className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{prop.description}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-border">
                        <div className="flex justify-between text-2xs text-muted-foreground font-semibold">
                          <span>{prop.bedrooms > 0 ? `${prop.bedrooms} BHK` : 'Commercial Layout'}</span>
                          <span>{prop.bathrooms > 0 ? `${prop.bathrooms} Baths` : 'Utility Area'}</span>
                          <span>{prop.area} sqft</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-primary font-bold">₹{prop.price.toLocaleString('en-IN')}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setQuickViewProp(prop)}
                              className="bg-secondary text-secondary-foreground p-2 rounded-xl hover:bg-border transition-colors"
                              title="Quick View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/properties/${prop.id}`}
                              className="bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-primary/95 transition-all shadow-md"
                            >
                              Explore
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {properties.length === 0 && (
                <div className="col-span-2 text-center py-20 text-muted-foreground space-y-2">
                  <p className="font-bold">No active listings match your filter specifications.</p>
                  <button onClick={clearFilters} className="text-primary hover:underline text-sm font-semibold">
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProp && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card text-card-foreground border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-4 font-semibold text-xs"
            >
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <span className="bg-secondary text-secondary-foreground text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded">{quickViewProp.type}</span>
                  <h3 className="font-bold text-lg mt-2 text-white">{quickViewProp.title}</h3>
                </div>
                <button onClick={() => setQuickViewProp(null)} className="p-1 rounded-lg hover:bg-secondary"><X className="h-5 w-5" /></button>
              </div>
              <OptimizedImage
                src={quickViewProp.image || quickViewProp.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                className="w-full h-48 object-cover rounded-xl"
                alt={quickViewProp.title}
                sizes="(max-width: 768px) 100vw, 512px"
              />
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">{quickViewProp.description}</p>
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-border text-center text-xs font-semibold">
                <div>{quickViewProp.bedrooms > 0 ? `${quickViewProp.bedrooms} BHK` : 'Urban Layout'}</div>
                <div>{quickViewProp.bathrooms > 0 ? `${quickViewProp.bathrooms} Baths` : 'Utility'}</div>
                <div>{quickViewProp.area} sqft</div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-primary font-bold text-lg">₹{quickViewProp.price.toLocaleString('en-IN')}</span>
                <Link
                  to={`/properties/${quickViewProp.id}`}
                  onClick={() => setQuickViewProp(null)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Full Page View
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {showCompareDrawer && compareList.length > 0 && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl p-6 glass-premium"
          >
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm uppercase text-primary flex items-center gap-1.5">
                  <Scale className="h-4.5 w-4.5 text-primary" /> Property Comparison Checklist ({compareList.length})
                </h3>
                <div className="flex gap-4">
                  <button onClick={() => setCompareList([])} className="text-xs text-muted-foreground hover:text-foreground">Clear All</button>
                  <button onClick={() => setShowCompareDrawer(false)} className="p-1 rounded hover:bg-secondary"><X className="h-4.5 w-4.5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {compareList.map((p) => (
                  <div key={p.id} className="bg-background/80 p-4 rounded-xl border border-border flex justify-between items-center text-xs font-semibold">
                    <div>
                      <p className="font-bold text-foreground line-clamp-1">{p.title}</p>
                      <p className="text-2xs text-muted-foreground mt-0.5">₹{p.price.toLocaleString('en-IN')} • {p.bedrooms} BHK • {p.area} sqft</p>
                    </div>
                    <button onClick={() => handleToggleCompare(p)} className="p-1 text-destructive hover:bg-destructive/10 rounded-lg">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
