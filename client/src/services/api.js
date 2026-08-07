import axios from 'axios';

// Helper to determine if we should run in mock mode
const shouldUseMock = () => {
  return (
    window.location.hostname.includes('github.io') ||
    window.location.href.includes('mock=true') ||
    localStorage.getItem('use_mock_mode') === 'true'
  );
};

const setMockMode = (active) => {
  if (active) {
    localStorage.setItem('use_mock_mode', 'true');
  } else {
    localStorage.removeItem('use_mock_mode');
  }
};

// Initialize the local storage mock database with seeded values
const initMockDb = () => {
  if (!localStorage.getItem('mock_db_initialized')) {
    // 1. Users
    const users = [
      { id: 'usr-admin', name: 'Prestige Platform Manager', email: 'admin@buildestate.in', phone: '+919876543210', role: 'ADMIN' },
      { id: 'usr-builder', name: 'Prestige Group Developers', email: 'builder@buildestate.in', phone: '+919999988888', role: 'BUILDER' },
      { id: 'usr-buyer', name: 'Rohan Sharma', email: 'buyer@buildestate.in', phone: '+918888877777', role: 'BUYER' }
    ];
    localStorage.setItem('mock_users', JSON.stringify(users));

    // 2. Projects
    const projects = [
      { id: 'proj-1', name: 'Prestige Kokapet Lakefront', description: 'Premium integrated township under development by top architects, offering elite amenities in the heart of Kokapet, Hyderabad.', location: 'Kokapet, Hyderabad', builderId: 'usr-builder' },
      { id: 'proj-2', name: 'DLF Celestial Towers', description: 'Premium integrated township under development by top architects, offering elite amenities in the heart of Financial District, Hyderabad.', location: 'Financial District, Hyderabad', builderId: 'usr-builder' },
      { id: 'proj-3', name: 'Sobha Royal Meadows', description: 'Premium integrated township under development by top architects, offering elite amenities in the heart of Whitefield, Bengaluru.', location: 'Whitefield, Bengaluru', builderId: 'usr-builder' },
      { id: 'proj-4', name: 'Brigade Golden Vista', description: 'Premium integrated township under development by top architects, offering elite amenities in the heart of Hebbal, Bengaluru.', location: 'Hebbal, Bengaluru', builderId: 'usr-builder' },
      { id: 'proj-5', name: 'Lodha Crown Worli Seafront', description: 'Premium integrated township under development by top architects, offering elite amenities in the heart of Worli, Mumbai.', location: 'Worli, Mumbai', builderId: 'usr-builder' },
      { id: 'proj-6', name: 'Godrej Noida Golf Meadows', description: 'Premium integrated township under development by top architects, offering elite amenities in the heart of Noida, Delhi NCR.', location: 'Noida, Delhi NCR', builderId: 'usr-builder' }
    ];
    localStorage.setItem('mock_projects', JSON.stringify(projects));

    // 3. Properties (24 premium mock listings across target Indian cities)
    const CITIES = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Pune', 'Chennai', 'Delhi NCR'];
    const LOCATIONS = {
      'Hyderabad': ['Kokapet', 'Financial District', 'Gachibowli'],
      'Bengaluru': ['Whitefield', 'Hebbal', 'Sarjapur'],
      'Mumbai': ['Worli', 'BKC', 'Bandra'],
      'Pune': ['Hinjewadi', 'Baner', 'Kharadi'],
      'Chennai': ['OMR', 'ECR', 'Velachery'],
      'Delhi NCR': ['Gurgaon', 'Noida', 'Dwarka Expressway']
    };
    const BUILDERS = ['Prestige Group', 'Brigade Group', 'Sobha Realty', 'Godrej Properties', 'Lodha', 'DLF'];
    const TYPES = [
      { name: 'Sky Villa', prismaType: 'VILLA', displayType: 'Sky Villa' },
      { name: 'Luxury Villa', prismaType: 'VILLA', displayType: 'Luxury Villa' },
      { name: 'Premium Apartment', prismaType: 'APARTMENT', displayType: 'Premium Apartment' },
      { name: 'Penthouse', prismaType: 'VILLA', displayType: 'Penthouse' }
    ];
    const IMAGES = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'
    ];

    const properties = [];
    for (let i = 1; i <= 24; i++) {
      const city = CITIES[i % CITIES.length];
      const locs = LOCATIONS[city];
      const loc = locs[i % locs.length];
      const builderName = BUILDERS[i % BUILDERS.length];
      const typeInfo = TYPES[i % TYPES.length];
      const price = (typeInfo.displayType === 'Penthouse' || typeInfo.displayType === 'Sky Villa')
        ? 45000000 + (i * 1000000)
        : 15000000 + (i * 500000);
      const area = (i % 3 + 2) * 1100 + (i * 50);
      const bedrooms = i % 3 + 3;
      const bathrooms = bedrooms + 1;
      const project = projects.find(p => p.location.includes(city));

      const tourImages = [
        IMAGES[i % IMAGES.length],
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
      ];

      const constructionStatus = i % 3 === 0 ? 'Ready to Move' : i % 3 === 1 ? 'Under Construction' : 'New Launch';
      const possessionDate = constructionStatus === 'Ready to Move' ? 'Ready' : `Dec 202${i % 4 + 6}`;

      properties.push({
        id: `prop-${i}`,
        title: `${builderName} ${typeInfo.displayType} in ${loc}`,
        projectName: project ? project.name : `${builderName} Meadows`,
        builderName,
        description: `This exclusive ${typeInfo.displayType.toLowerCase()} offers an unmatched living experience in the premium locality of ${loc}, ${city}. Designed with gold accents, large floor-to-ceiling windows, private access elevators, modular kitchens, and private balconies overlooking the city skyline.`,
        price,
        address: `${i * 12 + 4}, Gold Avenue, ${loc}`,
        city,
        type: typeInfo.prismaType,
        bedrooms,
        bathrooms,
        area,
        status: i === 5 ? 'SOLD' : 'AVAILABLE',
        builderId: 'usr-builder',
        projectId: project ? project.id : null,
        images: tourImages.map(url => ({ url })),
        amenities: ['Infinity Pool', 'Private Elevator', 'Smart Automation', 'Clubhouse', 'EV Charging Bay', 'Technogym Health Club', '24/7 Concierge'],
        possessionDate,
        constructionStatus,
        reraNumber: `RERA-IND-${100000 + i}`,
        rating: parseFloat((4.2 + (i % 8) * 0.1).toFixed(1)),
        featured: i % 4 === 0,
        tour360Url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b',
        videoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
        floorPlanUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
        nearby: {
          metro: `${loc} Central Metro Station - ${300 + i * 50}m`,
          school: `Oakridge & DPS International - ${1.2 + i * 0.2} km`,
          hospital: `Manipal Super Speciality Hospital - ${1.5 + i * 0.3} km`,
          airport: `International Airport - ${25 + i} km`
        },
        paymentPlan: [
          { step: 'Initial Token / Booking Amount', percent: '10%' },
          { step: 'Completion of Excavation & Foundation work', percent: '15%' },
          { step: 'On Slab 1 Pouring Milestone', percent: '15%' },
          { step: 'Superstructure Framework Completion', percent: '20%' },
          { step: 'Internal Plastering & Wiring milestones', percent: '20%' },
          { step: 'Possession Handover & Key transfer', percent: '20%' }
        ],
        faqs: [
          { q: 'Is this property RERA approved?', a: `Yes, this property is fully RERA approved under registry registration code RERA-IND-${100000 + i}.` },
          { q: 'What payment options/plans are supported?', a: 'We offer standard construction-linked payment plans as well as customizable 10:90 bank subvention options.' },
          { q: 'Are maintenance fees included in the starting price?', a: 'No, maintenance is billed separately at ₹3.5 per sq.ft annually, covering security, pool maintenance, and common lobbies.' }
        ],
        reviews: [
          { name: 'Vikram Reddy', rating: 5, comment: 'Incredible construction quality. Very upscale design aesthetics, gold accents look phenomenal.' },
          { name: 'Deepa Sen', rating: 4, comment: 'Extremely spacious room layouts. Located right in the IT corridor with smooth access to highways.' }
        ],
        downloadsCount: 15 + i * 2,
        enquiriesCount: 8 + i,
        visitsCount: i * 3
      });
    }
    localStorage.setItem('mock_properties', JSON.stringify(properties));

    // 4. Bookings
    const bookings = [
      {
        id: 'book-1',
        propertyId: 'prop-5',
        buyerId: 'usr-buyer',
        amount: 4500000,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        preferredDate: '2026-08-15',
        preferredTime: '11:00 AM',
        visitorName: 'Rohan Sharma',
        phone: '+918888877777',
        email: 'buyer@buildestate.in',
        visitorsCount: 2,
        notes: 'Would like to explore structural framing updates.'
      }
    ];
    localStorage.setItem('mock_bookings', JSON.stringify(bookings));

    // 5. Payments
    const payments = [
      {
        id: 'pay-1',
        bookingId: 'book-1',
        amount: 4500000,
        status: 'SUCCESS',
        reference: 'TXN-INDIA-9827110',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('mock_payments', JSON.stringify(payments));

    // 6. Buyer wishlist (Saved properties IDs)
    localStorage.setItem('mock_wishlist', JSON.stringify(['prop-2', 'prop-6']));

    // 7. Buyer saved searches
    const savedSearches = [
      { id: 'search-1', query: '?city=Hyderabad&type=Sky%20Villa', name: 'Hyderabad Sky Villas Only' }
    ];
    localStorage.setItem('mock_saved_searches', JSON.stringify(savedSearches));

    // 8. Buyer price alerts (property IDs)
    localStorage.setItem('mock_price_alerts', JSON.stringify(['prop-1', 'prop-3']));

    // 9. Buyer recently viewed properties IDs
    localStorage.setItem('mock_recently_viewed', JSON.stringify(['prop-1', 'prop-2', 'prop-5', 'prop-6']));

    // 10. General Enquiries (Callback calls, chats, brochures requests)
    const enquiries = [
      { id: 'enq-1', propertyId: 'prop-3', type: 'CALLBACK', name: 'Rohan Sharma', phone: '+918888877777', email: 'buyer@buildestate.in', message: 'Request callback for price negotiation.', status: 'PENDING', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('mock_enquiries', JSON.stringify(enquiries));

    // 11. Customer Messages
    const messages = [
      { id: 'msg-1', sender: 'Sanjay Rawat (Sales Manager)', receiver: 'usr-buyer', content: 'Dear Rohan, I have shared the requested construction blueprint for Prestige Sky Villas. Let me know if you would like to schedule a virtual tour.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), attachment: null },
      { id: 'msg-2', sender: 'usr-buyer', receiver: 'Sanjay Rawat (Sales Manager)', content: 'Thank you Sanjay. I am reviewing the layout specs. What is the down payment flexibility?', timestamp: new Date(Date.now() - 3600000).toISOString(), attachment: null },
      { id: 'msg-3', sender: 'Sanjay Rawat (Sales Manager)', receiver: 'usr-buyer', content: 'We can offer a custom construction-linked plan (10:90 subvention scheme). Let me know if that works.', timestamp: new Date().toISOString(), attachment: null }
    ];
    localStorage.setItem('mock_messages', JSON.stringify(messages));

    // 12. Customer Notifications
    const notifications = [
      { id: 'not-1', title: 'Price Drop Alert!', description: 'Prestige Kokapet Sky Villas starting price dropped by 2%. Check updated payment plans.', date: new Date().toISOString(), read: false },
      { id: 'not-2', title: 'Site Visit Confirmed', description: 'Your private site visit to DLF CyberCity Glass Tower has been confirmed by the builder.', date: new Date(Date.now() - 86400000).toISOString(), read: true }
    ];
    localStorage.setItem('mock_notifications', JSON.stringify(notifications));

    localStorage.setItem('mock_db_initialized', 'true');
  }
};

// Client-side Mock Router
const handleMockRequest = async (config) => {
  initMockDb();

  let path = config.url;
  // Strip base URL
  if (path.startsWith(config.baseURL)) {
    path = path.slice(config.baseURL.length);
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const method = config.method.toUpperCase();
  const [urlPath, queryStr] = path.split('?');

  const query = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      query[k] = decodeURIComponent(v || '');
    });
  }
  const params = { ...query, ...config.params };

  let reqData = {};
  if (config.data) {
    try {
      reqData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch (e) {
      reqData = {};
    }
  }

  // Get current logged-in user from headers
  const authHeader = config.headers?.Authorization || config.headers?.authorization;
  let currentUser = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('mock-token-')) {
      const userId = token.substring(11);
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      currentUser = users.find(u => u.id === userId);
    }
  }

  // Database helper shortcuts
  const getUsers = () => JSON.parse(localStorage.getItem('mock_users') || '[]');
  const setUsers = (data) => localStorage.setItem('mock_users', JSON.stringify(data));
  const getProperties = () => JSON.parse(localStorage.getItem('mock_properties') || '[]');
  const setProperties = (data) => localStorage.setItem('mock_properties', JSON.stringify(data));
  const getProjects = () => JSON.parse(localStorage.getItem('mock_projects') || '[]');
  const setProjects = (data) => localStorage.setItem('mock_projects', JSON.stringify(data));
  const getBookings = () => JSON.parse(localStorage.getItem('mock_bookings') || '[]');
  const setBookings = (data) => localStorage.setItem('mock_bookings', JSON.stringify(data));
  const getPayments = () => JSON.parse(localStorage.getItem('mock_payments') || '[]');
  const setPayments = (data) => localStorage.setItem('mock_payments', JSON.stringify(data));
  const getWishlist = () => JSON.parse(localStorage.getItem('mock_wishlist') || '[]');
  const setWishlist = (data) => localStorage.setItem('mock_wishlist', JSON.stringify(data));
  const getSavedSearches = () => JSON.parse(localStorage.getItem('mock_saved_searches') || '[]');
  const setSavedSearches = (data) => localStorage.setItem('mock_saved_searches', JSON.stringify(data));
  const getPriceAlerts = () => JSON.parse(localStorage.getItem('mock_price_alerts') || '[]');
  const setPriceAlerts = (data) => localStorage.setItem('mock_price_alerts', JSON.stringify(data));
  const getRecentlyViewed = () => JSON.parse(localStorage.getItem('mock_recently_viewed') || '[]');
  const setRecentlyViewed = (data) => localStorage.setItem('mock_recently_viewed', JSON.stringify(data));
  const getEnquiries = () => JSON.parse(localStorage.getItem('mock_enquiries') || '[]');
  const setEnquiries = (data) => localStorage.setItem('mock_enquiries', JSON.stringify(data));
  const getMessages = () => JSON.parse(localStorage.getItem('mock_messages') || '[]');
  const setMessages = (data) => localStorage.setItem('mock_messages', JSON.stringify(data));
  const getNotifications = () => JSON.parse(localStorage.getItem('mock_notifications') || '[]');
  const setNotifications = (data) => localStorage.setItem('mock_notifications', JSON.stringify(data));

  let resData = null;
  let resStatus = 200;

  // ROUTER LOGIC
  try {
    // 1. AUTH ROUTES
    if (urlPath === '/auth/login' && method === 'POST') {
      const { email, password } = reqData;
      const users = getUsers();
      const user = users.find(u => u.email === email);
      if (user && password === 'Password@123') {
        resData = {
          token: `mock-token-${user.id}`,
          user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        };
      } else {
        resStatus = 401;
        resData = { message: 'Invalid email or password' };
      }
    } 
    
    else if (urlPath === '/auth/register' && method === 'POST') {
      const { name, email, phone, password, role } = reqData;
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        resStatus = 400;
        resData = { message: 'Email already registered' };
      } else {
        const newUser = {
          id: `usr-${Date.now()}`,
          name,
          email,
          phone,
          role: role || 'BUYER'
        };
        users.push(newUser);
        setUsers(users);
        resData = {
          token: `mock-token-${newUser.id}`,
          user: newUser
        };
      }
    } 
    
    else if (urlPath === '/auth/me' && method === 'GET') {
      if (currentUser) {
        resData = currentUser;
      } else {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      }
    }

    // 2. PROPERTIES ROUTES
    else if (urlPath === '/properties' && method === 'GET') {
      let list = getProperties();
      // Apply filters
      if (params.status) {
        list = list.filter(p => p.status === params.status);
      }
      if (params.city) {
        list = list.filter(p => p.city.toLowerCase() === params.city.toLowerCase());
      }
      if (params.type) {
        list = list.filter(p => p.title.toLowerCase().includes(params.type.toLowerCase()) || p.type.toLowerCase() === params.type.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
      }
      if (params.bedrooms) {
        list = list.filter(p => p.bedrooms === parseInt(params.bedrooms));
      }
      resData = list;
    } 
    
    else if (urlPath.match(/^\/properties\/[a-zA-Z0-9_-]+$/) && method === 'GET') {
      const id = urlPath.split('/').pop();
      const list = getProperties();
      const prop = list.find(p => p.id === id);
      if (prop) {
        // Save to recently viewed
        if (currentUser) {
          const viewed = getRecentlyViewed();
          const filtered = viewed.filter(vId => vId !== id);
          filtered.unshift(id); // push to start
          setRecentlyViewed(filtered.slice(0, 8)); // keep top 8
        }
        const projects = getProjects();
        const project = projects.find(p => p.id === prop.projectId);
        resData = { ...prop, project };
      } else {
        resStatus = 404;
        resData = { message: 'Property not found' };
      }
    }

    else if (urlPath === '/properties' && method === 'POST') {
      if (!currentUser || currentUser.role !== 'BUILDER') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const properties = getProperties();
        const newProp = {
          id: `prop-${Date.now()}`,
          ...reqData,
          builderId: currentUser.id,
          status: 'AVAILABLE',
          projectName: reqData.projectName || reqData.title,
          builderName: currentUser.name.split(' ')[0] + ' Realty',
          images: reqData.images || [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80' }
          ],
          amenities: reqData.amenities || ['Infinity Pool', 'Smart Automation', 'Concierge'],
          possessionDate: reqData.possessionDate || 'Dec 2027',
          constructionStatus: reqData.constructionStatus || 'Under Construction',
          reraNumber: reqData.reraNumber || `RERA-IND-${Date.now()}`,
          rating: 4.8,
          featured: reqData.featured || false,
          downloadsCount: 0,
          enquiriesCount: 0,
          visitsCount: 0
        };
        properties.push(newProp);
        setProperties(properties);
        resData = newProp;
      }
    }

    else if (urlPath.match(/^\/properties\/[a-zA-Z0-9_-]+$/) && method === 'DELETE') {
      if (!currentUser || (currentUser.role !== 'BUILDER' && currentUser.role !== 'ADMIN')) {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const id = urlPath.split('/').pop();
        let properties = getProperties();
        properties = properties.filter(p => p.id !== id);
        setProperties(properties);
        resData = { success: true };
      }
    }

    // 3. PROJECTS ROUTES
    else if (urlPath === '/projects/builder' && method === 'GET') {
      if (!currentUser || currentUser.role !== 'BUILDER') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const projects = getProjects();
        resData = projects.filter(p => p.builderId === currentUser.id);
      }
    }

    else if (urlPath === '/projects' && method === 'POST') {
      if (!currentUser || currentUser.role !== 'BUILDER') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const projects = getProjects();
        const newProj = {
          id: `proj-${Date.now()}`,
          ...reqData,
          builderId: currentUser.id
        };
        projects.push(newProj);
        setProjects(projects);
        resData = newProj;
      }
    }

    // 4. BOOKINGS & PAYMENTS ROUTES
    else if (urlPath === '/bookings/buyer' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const bookings = getBookings();
        const properties = getProperties();
        const payments = getPayments();
        
        const buyerBookings = bookings.filter(b => b.buyerId === currentUser.id);
        resData = buyerBookings.map(b => {
          const property = properties.find(p => p.id === b.propertyId);
          const payment = payments.find(p => p.bookingId === b.id);
          return { ...b, property, payments: payment ? [payment] : [] };
        });
      }
    }

    else if (urlPath === '/bookings/builder' && method === 'GET') {
      if (!currentUser || currentUser.role !== 'BUILDER') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const bookings = getBookings();
        const properties = getProperties();
        const users = getUsers();
        const payments = getPayments();

        const builderProperties = properties.filter(p => p.builderId === currentUser.id);
        const propIds = builderProperties.map(p => p.id);

        const builderBookings = bookings.filter(b => propIds.includes(b.propertyId));
        resData = builderBookings.map(b => {
          const property = properties.find(p => p.id === b.propertyId);
          const buyer = users.find(u => u.id === b.buyerId);
          const payment = payments.find(p => p.bookingId === b.id);
          return {
            ...b,
            property,
            buyer: buyer ? { name: buyer.name, email: buyer.email, phone: buyer.phone } : null,
            payments: payment ? [payment] : []
          };
        });
      }
    }

    else if (urlPath === '/bookings' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const bookings = getBookings();
        const properties = getProperties();

        // Increment visit count
        const props = getProperties();
        const pIndex = props.findIndex(p => p.id === reqData.propertyId);
        if (pIndex !== -1) {
          props[pIndex].visitsCount = (props[pIndex].visitsCount || 0) + 1;
          setProperties(props);
        }

        const newBooking = {
          id: `book-${Date.now()}`,
          propertyId: reqData.propertyId,
          buyerId: currentUser.id,
          amount: reqData.amount || 100000,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          preferredDate: reqData.preferredDate || new Date().toISOString().split('T')[0],
          preferredTime: reqData.preferredTime || '10:00 AM',
          visitorName: reqData.visitorName || currentUser.name,
          phone: reqData.phone || currentUser.phone,
          email: reqData.email || currentUser.email,
          visitorsCount: reqData.visitorsCount || 1,
          notes: reqData.notes || ''
        };
        bookings.push(newBooking);
        setBookings(bookings);
        resData = newBooking;
      }
    }

    else if (urlPath === '/bookings/pay' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const bookings = getBookings();
        const payments = getPayments();
        const properties = getProperties();

        const booking = bookings.find(b => b.id === reqData.bookingId);
        if (booking) {
          booking.status = 'CONFIRMED';
          setBookings(bookings);

          const prop = properties.find(p => p.id === booking.propertyId);
          if (prop) {
            prop.status = 'SOLD';
            setProperties(properties);
          }

          const newPayment = {
            id: `pay-${Date.now()}`,
            bookingId: booking.id,
            amount: booking.amount,
            status: 'SUCCESS',
            reference: `TXN-MOCK-${Math.floor(1000000 + Math.random() * 9000000)}`,
            createdAt: new Date().toISOString()
          };
          payments.push(newPayment);
          setPayments(payments);
          resData = { success: true, payment: newPayment };
        } else {
          resStatus = 404;
          resData = { message: 'Booking not found' };
        }
      }
    }

    else if (urlPath.match(/^\/bookings\/[a-zA-Z0-9_-]+\/status$/) && method === 'PUT') {
      if (!currentUser || currentUser.role !== 'BUILDER') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const id = urlPath.split('/')[2];
        const bookings = getBookings();
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          booking.status = reqData.status;
          setBookings(bookings);
          resData = booking;
        } else {
          resStatus = 404;
          resData = { message: 'Booking not found' };
        }
      }
    }

    // 5. WISHLIST & PREFERENCE ROUTES
    else if (urlPath === '/wishlist' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const wishlistIds = getWishlist();
        const properties = getProperties();
        resData = properties.filter(p => wishlistIds.includes(p.id));
      }
    }

    else if (urlPath === '/wishlist' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const { propertyId } = reqData;
        let wishlistIds = getWishlist();
        let saved = false;
        if (wishlistIds.includes(propertyId)) {
          wishlistIds = wishlistIds.filter(id => id !== propertyId);
        } else {
          wishlistIds.push(propertyId);
          saved = true;
        }
        setWishlist(wishlistIds);
        resData = { success: true, saved, wishlist: wishlistIds };
      }
    }

    else if (urlPath === '/saved-searches' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        resData = getSavedSearches();
      }
    }

    else if (urlPath === '/saved-searches' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const searches = getSavedSearches();
        const newSearch = {
          id: `search-${Date.now()}`,
          name: reqData.name || `Search - ${new Date().toLocaleDateString()}`,
          query: reqData.query
        };
        searches.push(newSearch);
        setSavedSearches(searches);
        resData = newSearch;
      }
    }

    else if (urlPath === '/alerts' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        resData = getPriceAlerts();
      }
    }

    else if (urlPath === '/alerts' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const { propertyId } = reqData;
        let alerts = getPriceAlerts();
        let active = false;
        if (alerts.includes(propertyId)) {
          alerts = alerts.filter(id => id !== propertyId);
        } else {
          alerts.push(propertyId);
          active = true;
        }
        setPriceAlerts(alerts);
        resData = { success: true, active, alerts };
      }
    }

    else if (urlPath === '/recently-viewed' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const viewedIds = getRecentlyViewed();
        const properties = getProperties();
        resData = viewedIds.map(id => properties.find(p => p.id === id)).filter(Boolean);
      }
    }

    // 5.5 MESSAGES, NOTIFICATIONS & PROFILE ROUTES
    else if (urlPath === '/messages' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        resData = getMessages();
      }
    }

    else if (urlPath === '/messages' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const messages = getMessages();
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender: currentUser.id,
          receiver: reqData.receiver || 'Sanjay Rawat (Sales Manager)',
          content: reqData.content,
          timestamp: new Date().toISOString(),
          attachment: reqData.attachment || null
        };
        messages.push(newMsg);
        setMessages(messages);
        resData = newMsg;
      }
    }

    else if (urlPath === '/notifications' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        resData = getNotifications();
      }
    }
    else if (urlPath === '/auth/forgot-password' && method === 'POST') {
      resData = { message: 'Password reset link sent to your registered email address.' };
    }

    else if (urlPath === '/auth/reset-password' && method === 'POST') {
      const { email, password } = reqData;
      const users = getUsers();
      const idx = users.findIndex(u => u.email === email);
      if (idx !== -1) {
        users[idx].password = password;
        setUsers(users);
        resData = { message: 'Password has been reset successfully.' };
      } else {
        resStatus = 404;
        resData = { message: 'Registered user not found.' };
      }
    }

    else if (urlPath === '/properties/add' && method === 'POST') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const properties = getProperties();
        const newProp = {
          id: `prop-${Date.now()}`,
          builderId: currentUser.id,
          builderName: currentUser.name,
          title: reqData.title,
          projectName: reqData.projectName || 'BuildEstate Elite Residences',
          description: reqData.description,
          price: Number(reqData.price),
          area: Number(reqData.area),
          bedrooms: Number(reqData.bedrooms || 0),
          bathrooms: Number(reqData.bathrooms || 0),
          address: reqData.address,
          city: reqData.city,
          state: reqData.state,
          locality: reqData.locality,
          type: reqData.type || 'VILLA',
          constructionStatus: reqData.constructionStatus || 'Under Construction',
          amenities: reqData.amenities || ['Power Backup', 'Security', 'Lift'],
          rating: 4.8,
          reviewsCount: 0,
          viewsCount: 120,
          enquiriesCount: 0,
          downloadsCount: 0,
          images: reqData.images || [
            { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', description: 'Hero Image' }
          ]
        };
        properties.push(newProp);
        setProperties(properties);
        resData = newProp;
      }
    }
    else if (urlPath === '/auth/profile' && method === 'PUT') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx].name = reqData.name || users[idx].name;
          users[idx].phone = reqData.phone || users[idx].phone;
          users[idx].email = reqData.email || users[idx].email;
          setUsers(users);
          resData = users[idx];
        } else {
          resStatus = 404;
          resData = { message: 'User not found' };
        }
      }
    }

    // 6. ENQUIRIES ROUTES
    else if (urlPath === '/enquiries' && method === 'GET') {
      if (!currentUser) {
        resStatus = 401;
        resData = { message: 'Unauthenticated' };
      } else if (currentUser.role === 'BUILDER') {
        const enquiries = getEnquiries();
        const properties = getProperties();
        const builderProperties = properties.filter(p => p.builderId === currentUser.id);
        const propIds = builderProperties.map(p => p.id);
        resData = enquiries.filter(e => propIds.includes(e.propertyId)).map(e => {
          const property = properties.find(p => p.id === e.propertyId);
          return { ...e, property };
        });
      } else {
        // Buyer
        const enquiries = getEnquiries();
        const properties = getProperties();
        const buyerEnquiries = enquiries.filter(e => e.email === currentUser.email || e.phone === currentUser.phone);
        resData = buyerEnquiries.map(e => {
          const property = properties.find(p => p.id === e.propertyId);
          return { ...e, property };
        });
      }
    }

    else if (urlPath === '/enquiries' && method === 'POST') {
      const enquiries = getEnquiries();
      
      // Increment enquiry count
      const props = getProperties();
      const pIndex = props.findIndex(p => p.id === reqData.propertyId);
      if (pIndex !== -1) {
        props[pIndex].enquiriesCount = (props[pIndex].enquiriesCount || 0) + 1;
        if (reqData.type === 'BROCHURE') {
          props[pIndex].downloadsCount = (props[pIndex].downloadsCount || 0) + 1;
        }
        setProperties(props);
      }

      const newEnq = {
        id: `enq-${Date.now()}`,
        propertyId: reqData.propertyId,
        type: reqData.type || 'CALLBACK', // CALLBACK, CHAT, WHATSAPP, CALL, BROCHURE
        name: reqData.name || (currentUser ? currentUser.name : 'Guest User'),
        phone: reqData.phone || (currentUser ? currentUser.phone : ''),
        email: reqData.email || (currentUser ? currentUser.email : ''),
        message: reqData.message || '',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      enquiries.push(newEnq);
      setEnquiries(enquiries);
      resData = newEnq;
    }

    else if (urlPath.match(/^\/enquiries\/[a-zA-Z0-9_-]+\/status$/) && method === 'PUT') {
      if (!currentUser || currentUser.role !== 'BUILDER') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const id = urlPath.split('/')[2];
        const enquiries = getEnquiries();
        const enq = enquiries.find(e => e.id === id);
        if (enq) {
          enq.status = reqData.status;
          setEnquiries(enquiries);
          resData = enq;
        } else {
          resStatus = 404;
          resData = { message: 'Enquiry not found' };
        }
      }
    }

    // 7. REVIEW ROUTES
    else if (urlPath.match(/^\/properties\/[a-zA-Z0-9_-]+\/reviews$/) && method === 'POST') {
      const propId = urlPath.split('/')[2];
      const properties = getProperties();
      const propIndex = properties.findIndex(p => p.id === propId);
      if (propIndex !== -1) {
        const prop = properties[propIndex];
        const newReview = {
          name: currentUser ? currentUser.name : reqData.name || 'Anonymous',
          rating: parseInt(reqData.rating),
          comment: reqData.comment,
          createdAt: new Date().toISOString()
        };
        prop.reviews = prop.reviews || [];
        prop.reviews.push(newReview);
        // Calculate new rating
        const totalRating = prop.reviews.reduce((sum, r) => sum + r.rating, 0);
        prop.rating = parseFloat((totalRating / prop.reviews.length).toFixed(1));
        
        setProperties(properties);
        resData = { success: true, reviews: prop.reviews, rating: prop.rating };
      } else {
        resStatus = 404;
        resData = { message: 'Property not found' };
      }
    }

    // 8. ADMIN ROUTES
    else if (urlPath === '/admin/stats' && method === 'GET') {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const properties = getProperties();
        const bookings = getBookings();
        const payments = getPayments();
        const users = getUsers();

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        
        // Group by city
        const cityRev = {};
        payments.forEach(p => {
          const booking = bookings.find(b => b.id === p.bookingId);
          const prop = booking ? properties.find(pr => pr.id === booking.propertyId) : null;
          if (prop) {
            cityRev[prop.city] = (cityRev[prop.city] || 0) + p.amount;
          }
        });
        const revenueByCity = Object.keys(cityRev).map(city => ({ city, revenue: cityRev[city] }));

        // Bookings status
        const statusMap = {};
        bookings.forEach(b => {
          statusMap[b.status] = (statusMap[b.status] || 0) + 1;
        });
        const bookingsByStatus = Object.keys(statusMap).map(status => ({ status, count: statusMap[status] }));

        // Property type distribution
        const typeMap = {};
        properties.forEach(p => {
          typeMap[p.type] = (typeMap[p.type] || 0) + 1;
        });
        const propertyTypeDistribution = Object.keys(typeMap).map(type => ({ type, count: typeMap[type] }));

        resData = {
          totalRevenue,
          totalBookings: bookings.length,
          totalProperties: properties.length,
          totalUsers: users.length,
          revenueByCity,
          bookingsByStatus,
          propertyTypeDistribution
        };
      }
    }

    else if (urlPath === '/admin/users' && method === 'GET') {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        resData = getUsers().map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role }));
      }
    }

    else if (urlPath.match(/^\/admin\/users\/[a-zA-Z0-9_-]+$/) && method === 'DELETE') {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        resStatus = 403;
        resData = { message: 'Forbidden' };
      } else {
        const id = urlPath.split('/').pop();
        let users = getUsers();
        users = users.filter(u => u.id !== id);
        setUsers(users);
        resData = { success: true };
      }
    } 
    
    else {
      resStatus = 404;
      resData = { message: `Endpoint ${method} ${urlPath} not found in mock router` };
    }
  } catch (err) {
    resStatus = 500;
    resData = { message: 'Internal mock server error', error: err.message };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Axios response structure
  const response = {
    data: resData,
    status: resStatus,
    statusText: resStatus === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
    config,
    request: {}
  };

  if (resStatus >= 200 && resStatus < 300) {
    return response;
  } else {
    const axiosError = new Error(`Request failed with status code ${resStatus}`);
    axiosError.response = response;
    axiosError.config = config;
    throw axiosError;
  }
};

// Create Axios Instance
const api = axios.create({
  baseURL: '/api',
});

// Configure Custom Adapter for client-side routing fallback
api.defaults.adapter = async (config) => {
  if (shouldUseMock()) {
    return handleMockRequest(config);
  }

  // Fallback to real HTTP requests
  const defaultAdapter = axios.defaults.adapter || axios.getAdapter;
  try {
    return await defaultAdapter(config);
  } catch (err) {
    // If backend is down (network connection failed), automatically activate mock mode
    if (!err.response) {
      console.warn('Builderestate API backend is unreachable. Failing over to local mock mode database.');
      setMockMode(true);
      return handleMockRequest(config);
    }
    throw err;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
