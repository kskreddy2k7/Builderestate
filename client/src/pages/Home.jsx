import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Building, MapPin, ChevronRight, ChevronDown, 
  ArrowUpRight, BookOpen, Quote, Sparkles, MousePointer,
  ShieldCheck, Award, CheckCircle2, Waves, Dumbbell, 
  Trees, Car, Compass, PhoneCall, Download, Calendar, X, MessageCircle
} from 'lucide-react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import OptimizedImage from '../components/OptimizedImage';
import { fetchPublicJson, getPublicAssetPath, normalizeProperty } from '../services/publicData';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;
const INITIAL_PRELOAD_FRAMES = 24;

const CITY_IMAGES = {
  Hyderabad: 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&w=800&q=80',
  Bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  Mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  Pune: 'https://images.unsplash.com/photo-1601961405399-801fb1f34581?auto=format&fit=crop&w=800&q=80',
  Chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  'Delhi NCR': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
};

const AMENITY_ICONS = {
  Recreation: Waves,
  Luxury: Sparkles,
  Wellness: Trees,
  Elite: Award,
};

const AMENITY_DESCRIPTIONS = {
  'Infinity Pool': 'Temperature-controlled rooftop pool overlooking skyline views.',
  'Rooftop Sky Lounge': 'Elevated executive lounge with private concierge service.',
  'Zen Landscaped Garden': 'Curated green pathways and tranquil biophilic spaces.',
  'Helipad Access': 'Dedicated rooftop helipad access for premium residents.',
};

const STAGES = [
  { percent: 0, title: 'Build Tomorrow.', desc: 'Building India\'s Future with luxury Obsidian & Gold PropTech.' },
  { percent: 25, title: 'Designed for Modern India.', desc: 'Fusing luxury design with premium structural engineering.' },
  { percent: 50, title: 'Luxury Living.', desc: 'Crafted with precision, inspired by India\'s high-end architecture.' },
  { percent: 75, title: 'Where Dreams Become Addresses.', desc: 'Premium sky villas and weekend farms in target cities.' },
  { percent: 100, title: 'Experience Smart Living.', desc: 'Discover India\'s Obsidian & Gold PropTech marketplace.' }
];

const INDIAN_CITIES = [
  { name: 'Hyderabad', locCount: 12, projects: 'Prestige Kokapet, Financial District', image: 'https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bengaluru', locCount: 15, projects: 'Sobha Royal Meadows, Whitefield', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Mumbai', locCount: 10, projects: 'Worli Waterfront, Bandra West', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pune', locCount: 8, projects: 'Koregaon Park Sky Suites', image: 'https://images.unsplash.com/photo-1601961405399-801fb1f34581?auto=format&fit=crop&w=600&q=80' },
  { name: 'Chennai', locCount: 7, projects: 'ECR Seafront Villas', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80' },
  { name: 'Delhi NCR', locCount: 11, projects: 'Golf Course Road Penthouses', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' }
];

const AMENITIES = [
  { name: 'Infinity Pool', desc: 'Temperature-controlled rooftop pool overlooking skyline views.', icon: Waves },
  { name: 'Clubhouse', desc: '50,000 sq.ft private lounge with fine dining and cigar room.', icon: Building },
  { name: 'Fitness Center', desc: 'Technogym-equipped state-of-the-art health club.', icon: Dumbbell },
  { name: 'Sky Lounge', desc: 'Elevated executive lounge on the 45th floor.', icon: Compass },
  { name: 'Landscaped Gardens', desc: 'Zen gardens, water bodies, and organic flora walkways.', icon: Trees },
  { name: 'EV Charging', desc: 'Dedicated fast EV charging bays for every residence.', icon: Car },
  { name: 'Smart Security', desc: 'Biometric access control, AI surveillance, and 24/7 concierge.', icon: ShieldCheck },
  { name: 'Co-working Suites', desc: 'Private video pods and high-speed fiber executive offices.', icon: Building },
  { name: 'Spa & Wellness', desc: 'Hydrotherapy pools, saunas, and holistic massage suites.', icon: Sparkles },
  { name: 'Sports Courts', desc: 'Indoor squash court, tennis arena, and virtual golf simulator.', icon: Award },
  { name: 'Children\'s Play Park', desc: 'Padded adventure zone with CCTV parent monitoring.', icon: CheckCircle2 },
  { name: 'Jogging Track', desc: 'Elevated 1-km rubberized sky jogging circuit.', icon: Compass }
];

const MOCK_FEATURED = [
  {
    id: 'prop-1',
    title: 'Prestige Kokapet Sky Villas',
    address: 'Financial District',
    city: 'Hyderabad',
    price: 48000000,
    type: 'Sky Villa',
    status: 'Under Construction',
    rera: 'P02400008891',
    bedrooms: 4,
    bathrooms: 5,
    area: 4800,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Infinity Pool', 'Private Elevator', 'Smart Automation']
  },
  {
    id: 'prop-2',
    title: 'Sobha Royal Meadows',
    address: 'Whitefield',
    city: 'Bengaluru',
    price: 32000000,
    type: 'Luxury Villa',
    status: 'Ready to Move',
    rera: 'PRM/KA/RERA/1251/446',
    bedrooms: 4,
    bathrooms: 4,
    area: 3900,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Private Garden', 'Clubhouse', 'EV Charging']
  },
  {
    id: 'prop-3',
    title: 'Lodha Worli Seafront Penthouse',
    address: 'Worli Sea Face',
    city: 'Mumbai',
    price: 95000000,
    type: 'Penthouse',
    status: 'Under Construction',
    rera: 'P51900001339',
    bedrooms: 5,
    bathrooms: 6,
    area: 6200,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Sea View', 'Helipad Access', 'Concierge Service']
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [buildersData, setBuildersData] = useState([]);
  const [amenitiesData, setAmenitiesData] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('ALL');
  const [activeFaq, setActiveFaq] = useState(null);

  // Modals state
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [selectedProjectForBrochure, setSelectedProjectForBrochure] = useState(null);
  const [visitFormData, setVisitFormData] = useState({ name: '', phone: '', email: '', date: '', city: 'Hyderabad' });
  const [visitSubmitted, setVisitSubmitted] = useState(false);

  // Hero references
  const trackRef = useRef(null);
  const pinnedWrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const activeImgRef = useRef(null);

  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const imagesRef = useRef([]);
  const frameTrackerRef = useRef({ current: 1, target: 1 });
  const lastDrawnFrameRef = useRef(0);

  function getFramePath(index, extension = 'jpg') {
    const paddedIndex = String(index).padStart(4, '0');
    return getPublicAssetPath(`videos/WITH-OUT-ANY-TEXT-I-WANT-A-PRI/${paddedIndex}.${extension}`);
  }

  function getFrameSources(index) {
    return [getFramePath(index, 'avif'), getFramePath(index, 'webp'), getFramePath(index, 'jpg')];
  }

  useEffect(() => {
    // 1. Listen for global modal triggers
    const handleOpenVisit = () => setShowVisitModal(true);
    window.addEventListener('openBookVisitModal', handleOpenVisit);

    // 2. Fetch static public data for GitHub Pages-compatible rendering
    const fetchPublicData = async () => {
      try {
        const [propertiesJson, citiesJson, projectsJson, buildersJson, amenitiesJson] = await Promise.all([
          fetchPublicJson('data/properties.json'),
          fetchPublicJson('data/cities.json'),
          fetchPublicJson('data/projects.json'),
          fetchPublicJson('data/builders.json'),
          fetchPublicJson('data/amenities.json'),
        ]);

        const normalizedProperties = (propertiesJson || []).map(normalizeProperty);
        const availableProperties = normalizedProperties.filter((item) => item.status === 'AVAILABLE');

        if (isMounted) {
          setProperties(availableProperties.length ? availableProperties : MOCK_FEATURED);
          setCitiesData(citiesJson || []);
          setProjectsData(projectsJson || []);
          setBuildersData(buildersJson || []);
          setAmenitiesData(amenitiesJson || []);
        }
      } catch (err) {
        if (isMounted) {
          setProperties(MOCK_FEATURED);
        }
      }
    };
    fetchPublicData();

    // 3. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const gsapTickerFunc = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(gsapTickerFunc);
    gsap.ticker.lagSmoothing(0);

    // 4. Preload frame images
    let loadedCount = 0;
    let isMounted = true;

    const loadImage = (index) => {
      return new Promise((resolve) => {
        if (imagesRef.current[index]) return resolve();

        const sources = getFrameSources(index);
        let sourceIndex = 0;

        const tryLoadSource = () => {
          const src = sources[sourceIndex];
          if (!src) {
            loadedCount++;
            if (isMounted) setPreloadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
            resolve();
            return;
          }

          const img = new Image();
          img.src = src;

          const complete = () => {
            imagesRef.current[index] = img;
            loadedCount++;
            if (isMounted) {
              setPreloadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
            }
            resolve();
          };

          const fallback = () => {
            sourceIndex += 1;
            tryLoadSource();
          };

          img.onload = () => {
            if (img.decode) {
              img.decode().then(complete).catch(complete);
            } else {
              complete();
            }
          };
          img.onerror = fallback;
        };

        tryLoadSource();
      });
    };

    let animationFrameId;

    const loadAllFrames = async () => {
      // 1. Load first frame immediately for instant display
      await loadImage(1);
      if (isMounted) {
        setIsPreloaded(true);
        resizeCanvas();
        drawFrame(1);
      }

      // Safety timeout to guarantee Home page is visible in <= 300ms
      const safetyTimer = setTimeout(() => {
        if (isMounted) setIsPreloaded(true);
      }, 300);

      // 2. Setup GSAP ScrollTrigger to pin hero until full 240 frame video completes
      if (isMounted) {
        const st = ScrollTrigger.create({
          trigger: trackRef.current,
          start: 'top top',
          end: '+=7000',
          pin: true,
          pinSpacing: true,
          scrub: 0.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!isMounted) return;
            const progress = self.progress;
            setScrollProgress(progress);
            if (progress > 0.01) setHasScrolled(true);

            const targetFrame = Math.max(
              1, 
              Math.min(TOTAL_FRAMES, Math.round(progress * (TOTAL_FRAMES - 1)) + 1)
            );
            frameTrackerRef.current.target = targetFrame;
            drawFrame(targetFrame);
          }
        });

        const tick = () => {
          if (!isMounted) return;
          const target = frameTrackerRef.current.target;
          const delta = target - frameTrackerRef.current.current;
          
          if (Math.abs(delta) > 0.001) {
            frameTrackerRef.current.current += delta * 0.4;
            const roundedFrame = Math.round(frameTrackerRef.current.current);
            if (roundedFrame !== lastDrawnFrameRef.current) {
              drawFrame(roundedFrame);
              lastDrawnFrameRef.current = roundedFrame;
            }
          }
          animationFrameId = requestAnimationFrame(tick);
        };
        tick();
      }

      // 3. Preload initial sequence window for smooth start
      const preloadWindow = [];
      for (let i = 2; i <= INITIAL_PRELOAD_FRAMES; i++) {
        preloadWindow.push(loadImage(i));
      }
      await Promise.all(preloadWindow);

      // 4. Lazy load remaining frames in background asynchronously
      const batchSize = 12;
      for (let i = INITIAL_PRELOAD_FRAMES + 1; i <= TOTAL_FRAMES; i += batchSize) {
        if (!isMounted) return;
        const promises = [];
        const end = Math.min(i + batchSize - 1, TOTAL_FRAMES);
        for (let j = i; j <= end; j++) {
          promises.push(loadImage(j));
        }
        await Promise.all(promises);
        await new Promise((resume) => {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(() => resume(), { timeout: 180 });
          } else {
            setTimeout(resume, 40);
          }
        });
      }

      clearTimeout(safetyTimer);
    };

    loadAllFrames();

    // 5. Hardware Sharp Canvas Rendering
    const drawFrame = (frameIndex) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { alpha: false });
      let img = imagesRef.current[frameIndex];
      if (!img || !img.complete) {
        for (let offset = 1; offset < 8; offset += 1) {
          const before = imagesRef.current[frameIndex - offset];
          const after = imagesRef.current[frameIndex + offset];
          if (before?.complete) {
            img = before;
            break;
          }
          if (after?.complete) {
            img = after;
            break;
          }
        }
      }
      if (!img || !img.complete) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const imgWidth = img.naturalWidth || 1280;
      const imgHeight = img.naturalHeight || 720;
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, Math.floor(drawX), Math.floor(drawY), Math.floor(drawWidth), Math.floor(drawHeight));
      ctx.restore();

      if (activeImgRef.current) {
        activeImgRef.current.src = img.src;
      }
    };

    const resizeCanvas = () => {
      drawFrame(Math.round(frameTrackerRef.current.current));
    };

    window.addEventListener('resize', resizeCanvas);

    return () => {
      isMounted = false;
      window.removeEventListener('openBookVisitModal', handleOpenVisit);
      window.removeEventListener('resize', resizeCanvas);
      gsap.ticker.remove(gsapTickerFunc);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    if (type) params.append('type', type);
    navigate(`/properties?${params.toString()}`);
  };

  const handleVisitSubmit = (e) => {
    e.preventDefault();
    setVisitSubmitted(true);
    setTimeout(() => {
      setVisitSubmitted(false);
      setShowVisitModal(false);
      setVisitFormData({ name: '', phone: '', email: '', date: '', city: 'Hyderabad' });
    }, 2500);
  };

  const getSegmentedProperties = () => {
    const list = properties.length > 0 ? properties : MOCK_FEATURED;
    if (selectedSegment === 'ALL') return list.slice(0, 3);
    if (selectedSegment === 'READY') return list.filter(p => p.status === 'Ready to Move' || p.price > 35000000).slice(0, 3);
    return list.filter(p => p.status === 'Under Construction' || p.price <= 35000000).slice(0, 3);
  };

  const getCityShowcase = () => {
    if (!citiesData.length) return INDIAN_CITIES;
    return citiesData.map((cityItem) => {
      const cityProjects = projectsData.filter((project) => project.city === cityItem.name);
      return {
        name: cityItem.name,
        locCount: cityItem.localities?.length || 0,
        projects: cityProjects.slice(0, 2).map((item) => item.name).join(', ') || 'Premium Launches',
        image: CITY_IMAGES[cityItem.name] || CITY_IMAGES.Hyderabad,
      };
    });
  };

  const getAmenitiesShowcase = () => {
    if (!amenitiesData.length) return AMENITIES;
    return amenitiesData.map((amenity) => ({
      name: amenity.name,
      desc: AMENITY_DESCRIPTIONS[amenity.name] || `${amenity.category} lifestyle feature available across premium listings.`,
      icon: AMENITY_ICONS[amenity.category] || Sparkles,
    }));
  };

  return (
    <div className="space-y-32 pb-24 aurora-bg bg-[#0b0c10] text-white font-sans">
      {/* Top Progression Glow Line */}
      <div 
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-75 shadow-[0_0_12px_#d4af37]" 
        style={{ width: `${scrollProgress * 100}%` }} 
      />

      {/* Preloading Screen */}
      {!isPreloaded && (
        <div className="fixed inset-0 bg-[#0b0c10] flex flex-col justify-center items-center z-50 gap-6">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Building className="h-6 w-6 text-primary absolute animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="font-serif-luxury text-xl tracking-widest text-white uppercase">CRAFTING LUXURY EXPERIENCE</h2>
            <p className="text-xs font-bold tracking-[0.25em] text-primary">
              PRELOADING ARCHITECTURAL ASSETS... {preloadProgress}%
            </p>
          </div>
        </div>
      )}

      {/* 1. HERO TRACK - Pinned lock full screen until frame sequence finishes */}
      <div ref={trackRef} className="relative w-full bg-black">
        <div ref={pinnedWrapperRef} className="h-screen w-full relative overflow-hidden flex items-center justify-center">
          
          {/* Direct Hardware Accelerated Sharp Image Layer */}
          <img
            ref={activeImgRef}
            src={getFramePath(1)}
            alt="Hero Cinematic Architecture"
            className="absolute inset-0 w-full h-full object-cover block"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.08) saturate(1.05) brightness(1.02)',
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)'
            }}
          />

          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full block object-cover opacity-0 pointer-events-none" 
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />

          {/* High Contrast Clean Gradient Overlay for Crystal Clear Visibility */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.25) 100%)',
            }} 
          />

          {/* TOP RIGHT: Scroll Hint */}
          <div 
            className={`fixed top-24 right-8 z-40 pointer-events-none transition-all duration-700 ${
              hasScrolled ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="glass-premium px-4 py-2 rounded-full border border-primary/30 flex items-center space-x-2.5 shadow-2xl bg-black/60 backdrop-blur-xl">
              <span className="text-3xs font-extrabold uppercase tracking-[0.2em] text-white">
                Scroll to Navigate
              </span>
              <MousePointer className="h-3.5 w-3.5 text-primary animate-bounce" />
            </div>
          </div>

          {/* HERO CONTENT OVERLAYS */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-16 z-20 pointer-events-none">
            
            {/* DAMAC/Sobha Style Luxury Headline */}
            <div className="pt-28 max-w-2xl space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2.5 glass-premium px-4 py-2 rounded-full border border-primary/50 text-3xs font-extrabold uppercase tracking-[0.25em] text-primary shadow-2xl bg-black/60 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span className="drop-shadow">BUILDING INDIA'S LANDMARKS</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Build the Future. <br />
                <span className="gold-gradient-text drop-shadow-[0_4px_20px_rgba(212,175,55,0.3)]">Live the Extraordinary.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-semibold max-w-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Discover luxury villas, premium apartments, and iconic commercial developments crafted for modern lifestyles across India's most prestigious locations.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4 pointer-events-auto">
                <Link
                  to="/properties"
                  className="btn-gold-luxury px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-2xl"
                >
                  <span>Explore Projects</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={() => setShowVisitModal(true)}
                  className="btn-outline-glass px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/30 text-white hover:border-primary hover:text-primary"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Book Site Visit</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM FLOATING SEARCH PANEL */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-4xl pointer-events-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-[#0e1017]/95 p-3.5 sm:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border border-primary/40 backdrop-blur-2xl transition-transform duration-300"
              style={{ transform: `scale(${Math.min(1.03, 1 + scrollProgress * 0.02)})` }}
            >
              {/* City */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold tracking-wider text-primary px-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#161924] border border-white/20 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner"
                >
                  <option value="">All Metropolises</option>
                  {(citiesData.length ? citiesData : INDIAN_CITIES).map((entry) => (
                    <option key={entry.name} value={entry.name}>{entry.name}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold tracking-wider text-primary px-1">Property Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#161924] border border-white/20 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner"
                >
                  <option value="">All Categories</option>
                  <option value="Sky Villa">Sky Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Commercial">Commercial Tower</option>
                  <option value="Gated Community">Gated Community</option>
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold tracking-wider text-primary px-1">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#161924] border border-white/20 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner"
                >
                  <option value="">Any Range</option>
                  <option value="1-3">₹1 Cr – ₹3 Cr</option>
                  <option value="3-5">₹3 Cr – ₹5 Cr</option>
                  <option value="5-10">₹5 Cr – ₹10 Cr</option>
                  <option value="10+">₹10 Cr+</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold tracking-wider text-primary px-1">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-[#161924] border border-white/20 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner"
                >
                  <option value="">Any Layout</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK Suite</option>
                </select>
              </div>

              {/* Submit Search */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full btn-gold-luxury py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl h-[38px]"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* 2. FEATURED PROJECTS (DAMAC / Sobha Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-16" id="projects">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-6">
          <div className="space-y-2">
            <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">FLAGSHIP REGISTRY</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">Featured Architectural Developments</h2>
            <p className="text-white/60 text-xs sm:text-sm font-medium">Verified RERA developments available for instant reservation.</p>
          </div>
          
          <div className="flex bg-[#12141a] p-1.5 rounded-2xl border border-white/10 w-fit">
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'READY', label: 'Ready to Move' },
              { id: 'CONSTRUCT', label: 'Under Construction' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSegment(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedSegment === tab.id ? 'bg-primary text-black shadow-lg font-extrabold' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {getSegmentedProperties().map((prop) => (
            <motion.div
              layout
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group glass-card-luxury rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative h-64 w-full overflow-hidden">
                <OptimizedImage
                  src={prop.image || prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80'}
                  alt={prop.title}
                  className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-black/30" />
                
                <span className="absolute top-4 left-4 glass-premium px-3.5 py-1.5 rounded-full text-3xs font-extrabold text-primary uppercase tracking-widest border border-primary/30">
                  {prop.type || 'Sky Villa'}
                </span>

                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-3xs font-bold tracking-wider border border-white/15">
                  {prop.status || 'Verified'}
                </span>

                <div className="absolute bottom-3 left-4 text-3xs text-white/80 font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>RERA: {prop.rera || 'P02400008891'}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center text-xs text-primary font-semibold gap-1.5 uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{prop.address}, {prop.city}</span>
                  </div>
                  <h3 className="font-serif-luxury text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {prop.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(prop.amenities || ['Infinity Pool', 'Smart Automation']).map((am, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-3xs text-white/80 font-medium">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs text-white/60 font-semibold">
                    <span>{prop.bedrooms > 0 ? `${prop.bedrooms} BHK Suites` : 'Commercial'}</span>
                    <span>{prop.area} sq.ft</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Starting Price</p>
                      <p className="font-serif-luxury text-lg font-bold text-primary">
                        ₹{(prop.price || 35000000).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProjectForBrochure(prop);
                          setShowBrochureModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-white hover:text-primary hover:border-primary/50 transition-colors"
                        title="Download Brochure"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <Link
                        to={`/properties/${prop.id}`}
                        className="btn-gold-luxury px-4 py-2.5 rounded-xl text-xs uppercase font-extrabold flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. BRAND STORYTELLING & ABOUT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-12" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">OUR LEGACY & VISION</span>
            
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Crafting Landmarks. <br />
              <span className="gold-gradient-text">Creating Legacies.</span>
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
              At BuildEstate, real estate is not merely construction—it is high architectural art. For over two decades, we have shaped India's skyline by fusing sustainable structural engineering, gold-standard materials, and timeless aesthetic precision.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-1.5 border-l-2 border-primary pl-4">
                <p className="font-serif-luxury text-2xl font-bold text-white">100% RERA</p>
                <p className="text-xs text-white/60 font-semibold">Verified Transparency</p>
              </div>
              <div className="space-y-1.5 border-l-2 border-primary pl-4">
                <p className="font-serif-luxury text-2xl font-bold text-white">Zero Delay</p>
                <p className="text-xs text-white/60 font-semibold">On-Time Completion Track</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowVisitModal(true)}
                className="btn-gold-luxury px-8 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider"
              >
                Schedule Private Consultation
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Architectural Legacy"
              className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8 glass-premium p-6 rounded-2xl border border-primary/30 flex items-center space-x-4">
              <Award className="h-10 w-10 text-primary shrink-0" />
              <div>
                <h4 className="font-serif-luxury text-sm font-bold text-white uppercase tracking-wider">Awwwards Excellence 2026</h4>
                <p className="text-xs text-white/70">Recognized for World-Class Sustainable PropTech Architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (8 Core Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">THE BUILDESTATE ADVANTAGE</span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">Why Discerning Buyers Choose Us</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Trusted Developer', desc: 'Over 20 years of unblemished delivery credentials and financial transparency.' },
            { title: 'Prime Metropolises', desc: 'Strategically acquired land parcels in Financial District, Whitefield, & Worli.' },
            { title: 'Luxury Architecture', desc: 'Designed in collaboration with global Award-winning master architects.' },
            { title: 'On-Time Delivery', desc: 'Guaranteed milestone enforcement backed by escrow RERA validation.' },
            { title: 'Sustainable Design', desc: 'IGBC Green-Certified layouts with rainwater harvesting and solar grids.' },
            { title: 'World-Class Amenities', desc: 'Private helipads, sky lounges, temperature-controlled pools, & spas.' },
            { title: 'Smart Home Automation', desc: 'Integrated IoT touch panels, voice control, & biometric security.' },
            { title: 'High Investment Yield', desc: 'Consistent 18%+ CAGR appreciation across all flagship enclaves.' }
          ].map((pillar, idx) => (
            <div key={idx} className="glass-card-luxury p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 w-fit text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-white">{pillar.title}</h3>
              <p className="text-xs text-white/70 leading-relaxed font-medium">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LUXURY AMENITIES (12 World-Class Features) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">UNRIVALED LIFESTYLE</span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">World-Class Amenities</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getAmenitiesShowcase().map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card-luxury p-5 rounded-2xl border border-white/10 space-y-3 group hover:border-primary/50 transition-all">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-primary group-hover:bg-primary group-hover:text-black transition-all w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif-luxury text-sm font-bold text-white">{item.name}</h3>
                <p className="text-3xs text-white/60 leading-normal font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. INTERACTIVE CITY SHOWCASE & ANIMATED STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* City Showcase */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">PRESTIGIOUS DESTINATIONS</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">Explore Target Metropolises</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {getCityShowcase().map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  const params = new URLSearchParams();
                  params.append('city', c.name);
                  navigate(`/properties?${params.toString()}`);
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden relative h-60 border border-white/15 shadow-xl"
              >
                <OptimizedImage
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 space-y-1">
                  <h3 className="font-serif-luxury text-2xl font-bold text-white group-hover:text-primary transition-colors">{c.name}</h3>
                  <p className="text-3xs text-white/70 font-semibold">{c.locCount} Premium Localities • {c.projects}</p>
                </div>

                <span className="absolute top-4 right-4 glass-premium p-2 rounded-full text-white/80 group-hover:text-primary transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Statistics Grid */}
        <div className="glass-premium rounded-3xl p-10 border border-primary/30 grid grid-cols-2 lg:grid-cols-6 gap-8 text-center">
          {[
            { num: `${projectsData.length || 50}+`, label: 'Luxury Developments' },
            { num: '20+', label: 'Years Legacy' },
            { num: '12,000+', label: 'Happy Families' },
            { num: `${citiesData.length || 8}+`, label: 'Target Cities' },
            { num: `${buildersData.length || 6}+`, label: 'Trusted Builders' },
            { num: '6M+', label: 'Sq.ft Delivered' }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="font-serif-luxury text-3xl sm:text-4xl font-extrabold gold-gradient-text">{stat.num}</p>
              <p className="text-xs uppercase font-bold tracking-wider text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">VERIFIED TESTIMONIALS</span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white">Words From Our Homeowners</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Booking our Kokapet Penthouse through BuildEstate was effortless. The architectural finish, private elevator speed, and RERA transparency exceeded our highest expectations.",
              author: "Ananya Sharma",
              role: "VP at FinTech Hyderabad"
            },
            {
              quote: "The Sobha Royal Meadows villa in Whitefield offers an unmatched sanctuary. The landscaping, EV infrastructure, and 24/7 concierge service are truly world-class.",
              author: "Karthik Ramachandran",
              role: "Principal Architect, Bengaluru"
            },
            {
              quote: "A billion-dollar luxury standard. From structural progress logs to final key handover, BuildEstate represents the pinnacle of Indian PropTech innovation.",
              author: "Vikram Malhotra",
              role: "Real Estate Investor, Mumbai"
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-card-luxury p-8 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
              <Quote className="h-8 w-8 text-primary/60" />
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">"{item.quote}"</p>
              <div className="pt-4 border-t border-white/10">
                <p className="font-serif-luxury text-sm font-bold text-white">{item.author}</p>
                <p className="text-3xs text-primary font-semibold uppercase tracking-wider">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CALL TO ACTION & BROCHURE MODAL BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-premium rounded-3xl p-10 sm:p-16 text-center border border-primary/40 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          
          <span className="text-3xs font-extrabold uppercase tracking-[0.25em] text-primary font-serif-luxury">RESERVE YOUR ADDRESS</span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white">Experience Unrivaled Luxury</h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto font-medium leading-relaxed">
            Schedule a private VIP site tour with our senior architectural consultants or download our complete 2026 Project Portfolio brochure.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => setShowVisitModal(true)}
              className="btn-gold-luxury px-8 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider shadow-xl"
            >
              Book Site Visit
            </button>
            <button
              onClick={() => {
                setSelectedProjectForBrochure(MOCK_FEATURED[0]);
                setShowBrochureModal(true);
              }}
              className="btn-outline-glass px-8 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider"
            >
              Download Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* FLOATING WHATSAPP CTA */}
      <a
        href="https://wa.me/919999999999?text=Hello%20BuildEstate,%20I%20would%20like%20to%20inquire%20about%20luxury%20projects."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-500 text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="WhatsApp Concierge"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* BOOK SITE VISIT MODAL */}
      <AnimatePresence>
        {showVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-premium p-8 rounded-3xl border border-primary/30 max-w-lg w-full space-y-6 relative shadow-2xl"
            >
              <button
                onClick={() => setShowVisitModal(false)}
                className="absolute top-5 right-5 text-white/60 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-2">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-primary font-serif-luxury">VIP ACCESS</span>
                <h3 className="font-serif-luxury text-2xl font-bold text-white">Book Private Site Visit</h3>
                <p className="text-xs text-white/70">Coordinated chauffeur transportation and personal project executive.</p>
              </div>

              {visitSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto animate-bounce" />
                  <p className="font-serif-luxury text-lg font-bold text-white">Visit Scheduled Successfully!</p>
                  <p className="text-xs text-white/70">Our concierge desk will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleVisitSubmit} className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-white/80 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={visitFormData.name}
                      onChange={(e) => setVisitFormData({ ...visitFormData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={visitFormData.phone}
                      onChange={(e) => setVisitFormData({ ...visitFormData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={visitFormData.date}
                      onChange={(e) => setVisitFormData({ ...visitFormData, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-gold-luxury py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider pt-3"
                  >
                    Confirm Booking
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOWNLOAD BROCHURE MODAL */}
      <AnimatePresence>
        {showBrochureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-premium p-8 rounded-3xl border border-primary/30 max-w-md w-full space-y-6 relative shadow-2xl text-center"
            >
              <button
                onClick={() => setShowBrochureModal(false)}
                className="absolute top-5 right-5 text-white/60 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>

              <Download className="h-12 w-12 text-primary mx-auto" />

              <div className="space-y-2">
                <h3 className="font-serif-luxury text-xl font-bold text-white">
                  Download {selectedProjectForBrochure?.title || 'Architectural'} Brochure
                </h3>
                <p className="text-xs text-white/70">Includes floor plans, specification sheets, and payment schedules.</p>
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Brochure PDF downloading...');
                  setShowBrochureModal(false);
                }}
                className="block w-full btn-gold-luxury py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider"
              >
                Download PDF Portfolio
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
