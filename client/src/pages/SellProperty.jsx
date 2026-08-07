import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building, MapPin, Info, Sparkles, CheckCircle, Upload, 
  Trash2, User, ShieldCheck, ChevronRight, ChevronLeft, Eye,
  AlertCircle, ShieldAlert, ArrowDown, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AuthGateModal from '../components/AuthGateModal';

export default function SellProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  
  // Auth Gate state
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Form Field States
  const [propertyType, setPropertyType] = useState('VILLA');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [locality, setLocality] = useState('Kokapet');
  const [address, setAddress] = useState('');
  const [mapPin, setMapPin] = useState('17.3980° N, 78.3414° E');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState(4);
  const [bathrooms, setBathrooms] = useState(4);
  const [balconies, setBalconies] = useState(2);
  const [area, setArea] = useState(4500);
  const [parking, setParking] = useState(2);
  const [facing, setFacing] = useState('East');
  const [floor, setFloor] = useState('0');
  const [totalFloors, setTotalFloors] = useState('2');
  const [ageOfProperty, setAgeOfProperty] = useState('0-1 Years');
  const [possessionDate, setPossessionDate] = useState('Dec 2026');
  const [price, setPrice] = useState('');
  const [maintenance, setMaintenance] = useState(5000);

  const [selectedAmenities, setSelectedAmenities] = useState(['Pool', 'Gym', 'Power Backup']);
  
  // Media Upload State
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'sky_villa_facade.jpg', size: '2.4 MB', progress: 100, previewUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=80' }
  ]);
  const [uploadingProgress, setUploadingProgress] = useState(0);

  // Owner Details
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(true);
  const [contactTime, setContactTime] = useState('9 AM - 6 PM');

  // Verification Details
  const [govIdName, setGovIdName] = useState('');
  const [ownerProofName, setOwnerProofName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingProgress(20);
      const interval = setInterval(() => {
        setUploadingProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setUploadedFiles(prev => [
              ...prev,
              { 
                name: file.name, 
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, 
                progress: 100,
                previewUrl: URL.createObjectURL(file) 
              }
            ]);
            return 0;
          }
          return p + 20;
        });
      }, 200);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    if (!agreeTerms) {
      alert('You must accept the terms of verified listings.');
      return;
    }
    if (!title || !price || !area) {
      alert('Please fill out Title, Price, and Super Area metrics.');
      return;
    }

    try {
      setErrorMsg('');
      await api.post('/properties/add', {
        title,
        projectName: 'Signature Elite Mansion',
        description,
        price,
        area,
        bedrooms,
        bathrooms,
        address,
        city,
        state,
        locality,
        type: propertyType,
        constructionStatus: 'Under Construction',
        amenities: selectedAmenities,
        images: uploadedFiles.map(f => ({ url: f.previewUrl, description: f.name }))
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit listing.');
    }
  };

  const stepsList = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Amenities' },
    { num: 5, label: 'Media' },
    { num: 6, label: 'Contact' },
    { num: 7, label: 'Verify' }
  ];

  return (
    <div className="min-h-screen bg-radial-luxury text-white font-sans">
      
      {/* 1. Hero Section */}
      <div className="relative pt-44 pb-20 overflow-hidden text-center select-none max-w-7xl mx-auto px-4">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-4 relative">
          <span className="text-3xs uppercase tracking-[0.3em] text-primary font-bold block">Sell With BuildEstate</span>
          <h1 className="text-4xl sm:text-5xl font-serif-luxury font-bold text-white uppercase tracking-tight max-w-3xl mx-auto leading-none">
            Sell Your Property with BuildEstate
          </h1>
          <p className="text-sm text-white/60 font-semibold max-w-xl mx-auto leading-relaxed">
            Reach thousands of verified premium buyers and private wealth investors across India with a certified listing.
          </p>
          <div className="pt-4">
            <a 
              href="#listing-form"
              className="btn-gold-luxury px-8 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-widest inline-flex items-center gap-1.5 shadow-lg shadow-primary/10"
            >
              <span>List Property</span>
              <ArrowDown className="h-4 w-4 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. How it works timeline section */}
      <div className="bg-[#0c0d12]/60 py-16 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-3xs uppercase tracking-widest text-primary font-bold">Process timeline</span>
            <h2 className="text-2xl font-serif-luxury font-bold text-white uppercase mt-1">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative select-none">
            {[
              { step: '1', title: 'Create Account', desc: 'Register as an individual owner or real estate developer in seconds.' },
              { step: '2', title: 'Add Property Details', desc: 'Enter pricing, specs, blueprints, and location details.' },
              { step: '3', title: 'Upload Photos & Docs', desc: 'Upload verified RERA, government IDs, and premium media.' },
              { step: '4', title: 'Receive Buyer Enquiries', desc: 'Get direct site visit notifications and chat with verified leads.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#12141d]/75 border border-white/5 p-6 rounded-3xl text-center space-y-3 relative hover:border-primary/20 transition-all flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs font-serif-luxury shadow-md">
                  {item.step}
                </div>
                <h4 className="font-bold text-sm text-white tracking-wide uppercase">{item.title}</h4>
                <p className="text-3xs text-white/50 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Wizard listing form section */}
      <div id="listing-form" className="max-w-4xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium p-8 rounded-3xl border border-white/10 bg-[#0e1017]/85 shadow-2xl relative space-y-8"
        >
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {success ? (
            <div className="text-center py-16 space-y-4">
              <div className="mx-auto h-16 w-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mb-4 shadow-lg">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold uppercase text-white tracking-wide">Property Submitted!</h3>
              <p className="text-xs text-white/60 font-semibold max-w-md mx-auto">
                Your listing details, media assets, and credentials have been received. We will notify you once verification is completed.
              </p>
              <p className="text-3xs text-primary font-bold animate-pulse uppercase tracking-widest pt-2">Redirecting to Dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitListing} className="space-y-6">
              
              {/* Wizard progress steps navigation */}
              <div className="flex justify-between items-center select-none border-b border-white/5 pb-4 text-3xs font-extrabold uppercase tracking-wider text-white/40">
                {stepsList.map(step => (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep) setCurrentStep(step.num);
                    }}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${
                      currentStep === step.num ? 'text-primary' : 
                      step.num < currentStep ? 'text-white/80 hover:text-primary' : ''
                    }`}
                  >
                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center border font-bold text-4xs ${
                      currentStep === step.num ? 'bg-primary/20 border-primary text-primary' : 
                      step.num < currentStep ? 'bg-primary text-black border-primary' : 'border-white/10 bg-white/3'
                    }`}>
                      {step.num}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                ))}
              </div>

              {/* Wizard Content Panels */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 min-h-[300px]"
                >
                  {/* STEP 1: PROPERTY TYPE */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 1</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Select Property Type</h3>
                        <p className="text-3xs text-white/50 font-semibold leading-relaxed">Choose the configuration category of your investment home.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-bold uppercase text-[10px] tracking-wider">
                        {[
                          { id: 'APARTMENT', label: 'Apartment' },
                          { id: 'VILLA', label: 'Villa' },
                          { id: 'HOUSE', label: 'Independent House' },
                          { id: 'COMMERCIAL', label: 'Commercial' },
                          { id: 'LAND', label: 'Land' },
                          { id: 'FARM', label: 'Farm House' },
                          { id: 'RETAIL', label: 'Retail Shop' },
                          { id: 'OFFICE', label: 'Office' },
                          { id: 'WAREHOUSE', label: 'Warehouse' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPropertyType(t.id)}
                            className={`p-4 rounded-2xl border text-center transition-all ${
                              propertyType === t.id 
                                ? 'bg-primary/10 border-primary text-primary shadow-md' 
                                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: LOCATION */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 2</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Location Details</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">City Name *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">State Name *</label>
                          <input
                            type="text"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Locality / Landmark *</label>
                          <input
                            type="text"
                            required
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Office/Building Address *</label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Google Map Pin Coordinates</label>
                          <input
                            type="text"
                            value={mapPin}
                            onChange={(e) => setMapPin(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PROPERTY INFORMATION */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 3</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Property Information</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div className="sm:col-span-3 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Listing Title *</label>
                          <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-3 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Listing Description *</label>
                          <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner resize-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Bedrooms Count</label>
                          <input
                            type="number"
                            value={bedrooms}
                            onChange={(e) => setBedrooms(Number(e.target.value))}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Bathrooms Count</label>
                          <input
                            type="number"
                            value={bathrooms}
                            onChange={(e) => setBathrooms(Number(e.target.value))}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Balconies Count</label>
                          <input
                            type="number"
                            value={balconies}
                            onChange={(e) => setBalconies(Number(e.target.value))}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Super Area (sqft) *</label>
                          <input
                            type="number"
                            required
                            value={area}
                            onChange={(e) => setArea(Number(e.target.value))}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Parking Slots</label>
                          <input
                            type="number"
                            value={parking}
                            onChange={(e) => setParking(Number(e.target.value))}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Facing Orientation</label>
                          <input
                            type="text"
                            value={facing}
                            onChange={(e) => setFacing(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Floor / Total Floors</label>
                          <input
                            type="text"
                            value={floor}
                            onChange={(e) => setFloor(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Property Age</label>
                          <input
                            type="text"
                            value={ageOfProperty}
                            onChange={(e) => setAgeOfProperty(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Handover Possession</label>
                          <input
                            type="text"
                            value={possessionDate}
                            onChange={(e) => setPossessionDate(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Starting Price (₹) *</label>
                          <input
                            type="number"
                            required
                            placeholder="7500000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Maintenance / Month</label>
                          <input
                            type="number"
                            value={maintenance}
                            onChange={(e) => setMaintenance(Number(e.target.value))}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: AMENITIES */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 4</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Property Amenities</h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-bold uppercase text-[10px] tracking-wider">
                        {[
                          'Pool', 'Gym', 'Clubhouse', 'Garden', 'Lift', 
                          'Power Backup', 'Security', 'Children\'s Park', 
                          'Jogging Track', 'EV Charging'
                        ].map(a => {
                          const isSelected = selectedAmenities.includes(a);
                          return (
                            <button
                              key={a}
                              type="button"
                              onClick={() => handleToggleAmenity(a)}
                              className={`p-4 rounded-2xl border text-center transition-all ${
                                isSelected 
                                  ? 'bg-primary/10 border-primary text-primary shadow-md' 
                                  : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {a}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: MEDIA UPLOAD */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 5</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Upload Media & Files</h3>
                      </div>

                      {/* Drag & Drop uploader layout */}
                      <label className="border border-dashed border-white/20 hover:border-primary/50 bg-[#12141d]/50 p-8 rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center gap-3">
                        <Upload className="h-8 w-8 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">Drag and drop files or browse</span>
                        <span className="text-[10px] text-white/40 font-semibold">Supports JPG, PNG, MP4 up to 50MB</span>
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                      </label>

                      {/* Upload progress indicator */}
                      {uploadingProgress > 0 && (
                        <div className="space-y-1 bg-[#12141d] p-3 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center text-3xs font-extrabold uppercase text-primary tracking-wider">
                            <span>Simulating upload stream...</span>
                            <span>{uploadingProgress}%</span>
                          </div>
                          <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all" style={{ width: `${uploadingProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Uploaded files preview layout */}
                      <div className="space-y-3 pt-2">
                        <span className="text-3xs uppercase tracking-widest text-white/40 font-bold block">Uploaded Files Preview ({uploadedFiles.length})</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="bg-[#12141d]/90 border border-white/5 p-3 rounded-2xl space-y-2 relative text-3xs font-bold text-white flex flex-col justify-between">
                              <img src={file.previewUrl} className="h-20 w-full object-cover rounded-xl border border-white/10" alt="" />
                              <div className="space-y-0.5">
                                <p className="truncate text-white">{file.name}</p>
                                <p className="text-white/40 font-normal">{file.size}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 border border-white/10 text-red-400 hover:text-red-300"
                                title="Delete Image"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: OWNER DETAILS */}
                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 6</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Owner Contact Details</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Contact Name *</label>
                          <input
                            type="text"
                            required
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Contact Phone *</label>
                          <input
                            type="text"
                            required
                            value={ownerPhone}
                            onChange={(e) => setOwnerPhone(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Contact Email *</label>
                          <input
                            type="email"
                            required
                            value={ownerEmail}
                            onChange={(e) => setOwnerEmail(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Preferred Contact Hours</label>
                          <input
                            type="text"
                            value={contactTime}
                            onChange={(e) => setContactTime(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6 select-none font-bold text-3xs uppercase tracking-wider text-white/80">
                          <input
                            type="checkbox"
                            checked={ownerWhatsApp}
                            onChange={(e) => setOwnerWhatsApp(e.target.checked)}
                            className="h-4 w-4 rounded accent-primary cursor-pointer"
                          />
                          <span>Allow direct WhatsApp updates</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 7: VERIFICATION */}
                  {currentStep === 7 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Step 7</span>
                        <h3 className="text-lg font-serif-luxury font-bold text-white uppercase">Ownership Verification</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Government ID Proof File</label>
                          <input
                            type="text"
                            placeholder="E.g. Aadhaar_ID.pdf"
                            value={govIdName}
                            onChange={(e) => setGovIdName(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[10px] font-bold">Ownership Sale Deed/Property Tax File</label>
                          <input
                            type="text"
                            placeholder="E.g. Sale_Deed_Registry.pdf"
                            value={ownerProofName}
                            onChange={(e) => setOwnerProofName(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5 border-t border-white/5 pt-4">
                          <label className="text-white/60 uppercase text-[10px] font-bold">RERA Registration Reference Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="PRM/KA/RERA/1251..."
                            value={reraNumber}
                            onChange={(e) => setReraNumber(e.target.value)}
                            className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-start gap-2.5 pt-4 select-none font-semibold text-2xs text-white/70 leading-relaxed">
                          <input
                            type="checkbox"
                            required
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="h-4.5 w-4.5 rounded accent-primary cursor-pointer shrink-0 mt-0.5"
                          />
                          <p>
                            I certify that the metadata, location coordinates, and ownership documents provided correspond to my legal property credentials. I authorize BuildEstate to review ID documents.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Wizard navigation button row */}
              <div className="flex justify-between items-center border-t border-white/5 pt-6 select-none font-bold uppercase tracking-wider text-3xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {currentStep === 7 ? (
                  <button
                    type="submit"
                    className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-widest flex items-center gap-1.5 shadow-lg"
                  >
                    <span>Submit Listing</span>
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-black px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

            </form>
          )}
        </motion.div>
      </div>

      {/* Auth Gate modal */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onSuccess={() => {
          setShowAuthGate(false);
          alert('Login successful! You can now submit your listing.');
        }}
      />
    </div>
  );
}
