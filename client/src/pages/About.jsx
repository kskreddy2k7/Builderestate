import React from 'react';
import { Shield, Users, LineChart, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">About BuildEstate</h1>
        <p className="text-lg text-muted-foreground">
          BuildEstate is a state-of-the-art Real Estate and Construction Management solution created to bridge the transparency gap between property developers and end buyers.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Our Core Philosophy</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Real estate purchases are often the largest financial transactions in a buyer's life, yet they remain shadowed by paperwork delays and execution uncertainty. Developers face difficulties tracking collections, scheduling construction milestones, and listing units without heavy broker fees.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            BuildEstate solves these structural inefficiencies. By providing role-specific dashboards, we create an integrated ecosystem where builders can manage bookings, buyers can verify their unit construction progress in real-time, and admins can monitor platform health.
          </p>
        </div>
        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 text-primary w-fit rounded-lg"><Shield className="h-5 w-5" /></div>
            <h3 className="font-bold text-sm">Security First</h3>
            <p className="text-xs text-muted-foreground">Encrypted passwords and strict role verification.</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 text-primary w-fit rounded-lg"><Users className="h-5 w-5" /></div>
            <h3 className="font-bold text-sm">Role Separation</h3>
            <p className="text-xs text-muted-foreground">Tailored portals for Buyer, Builder, and Admin.</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 text-primary w-fit rounded-lg"><LineChart className="h-5 w-5" /></div>
            <h3 className="font-bold text-sm">Track Progress</h3>
            <p className="text-xs text-muted-foreground">Real-time status updates on active bookings.</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 text-primary w-fit rounded-lg"><Award className="h-5 w-5" /></div>
            <h3 className="font-bold text-sm">Elite UX</h3>
            <p className="text-xs text-muted-foreground">Glassmorphic widgets and smooth responsive design.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
