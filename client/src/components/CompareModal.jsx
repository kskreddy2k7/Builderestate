import React from 'react';
import { X, Scale, Star, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompareModal({ isOpen, onClose, compareList, onRemove }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#0e1017] border border-primary/30 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(212,175,55,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1.5 border-b border-white/10 pb-4 mb-4">
          <span className="text-3xs uppercase tracking-widest text-primary font-bold flex items-center gap-1">
            <Scale className="h-3.5 w-3.5" /> SPECIFICATION GRID
          </span>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">Compare Properties</h2>
          <p className="text-white/60 text-2xs font-normal">Review details side-by-side to make your choice.</p>
        </div>

        {compareList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-white/50 space-y-2">
            <p className="font-bold text-sm">No properties selected for comparison.</p>
            <p className="text-xs font-normal">Close this window and select "Compare" on listing cards.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto border border-white/10 rounded-2xl bg-white/2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-primary font-bold uppercase tracking-wider text-[10px] w-1/4">Specs / Attributes</th>
                  {compareList.map(p => (
                    <th key={p.id} className="p-4 font-bold text-white w-1/4 relative border-l border-white/10 min-w-[200px]">
                      <div className="flex justify-between items-start gap-4">
                        <span className="line-clamp-2">{p.title}</span>
                        <button 
                          onClick={() => onRemove(p)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                {/* Images */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Image</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      <img 
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80'} 
                        className="w-full h-24 object-cover rounded-xl border border-white/10" 
                        alt=""
                      />
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="bg-primary/2">
                  <td className="p-4 text-[10px] text-primary uppercase font-bold">Starting Price</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10 text-primary font-extrabold text-sm">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {/* Builder */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Builder Name</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10 text-white font-bold">
                      {p.builderName}
                    </td>
                  ))}
                </tr>

                {/* Project Name */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Project Registry</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10 text-white font-bold">
                      {p.projectName}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Property Rating</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      <div className="flex items-center gap-1.5 text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" />
                        <span>{p.rating || 4.8} / 5</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* RERA */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">RERA Number</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      <div className="flex items-center gap-1 text-2xs text-white/80 font-mono">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>{p.reraNumber || p.rera}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Location</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      <div className="flex items-center gap-1 text-2xs text-white/70">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{p.address}, {p.city}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Layout */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Configuration</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      {p.bedrooms > 0 ? `${p.bedrooms} BHK Suites` : 'Commercial Layout'}
                    </td>
                  ))}
                </tr>

                {/* Super Area */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Super Area</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      {p.area} sq.ft
                    </td>
                  ))}
                </tr>

                {/* Construction Status */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Construction Status</td>
                  {compareList.map(p => (
                    <td key={p.id} className={`p-4 border-l border-white/10 text-2xs font-extrabold uppercase tracking-wider ${
                      p.constructionStatus === 'Ready to Move' ? 'text-green-400' : p.constructionStatus === 'New Launch' ? 'text-primary' : 'text-blue-400'
                    }`}>
                      {p.constructionStatus || 'Under Construction'}
                    </td>
                  ))}
                </tr>

                {/* Possession Date */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Possession Date</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10">
                      {p.possessionDate || 'Dec 2027'}
                    </td>
                  ))}
                </tr>

                {/* Amenities */}
                <tr>
                  <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Amenities Included</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 border-l border-white/10 font-normal">
                      <div className="flex flex-wrap gap-1.5">
                        {(p.amenities || ['Infinity Pool', 'Automation']).map((a, idx) => (
                          <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/70">
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
