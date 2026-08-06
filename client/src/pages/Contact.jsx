import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill out all fields.');
      return;
    }
    // Mock submit
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground text-sm">Have queries about BuildEstate? Get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="glass p-8 rounded-2xl border border-border space-y-8 md:col-span-1 h-fit">
          <h2 className="text-xl font-bold">Contact Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Address</p>
                <p className="text-xs text-muted-foreground">Sector 62, Noida, Uttar Pradesh, 201301</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Phone</p>
                <p className="text-xs text-muted-foreground">+91 99999 99999</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Email</p>
                <p className="text-xs text-muted-foreground">info@buildestate.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border md:col-span-2">
          <h2 className="text-xl font-bold mb-6">Send us a message</h2>
          {submitted ? (
            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-4 rounded-xl text-center font-medium">
              Thank you! Your message has been received. We will respond shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              
              <button
                type="submit"
                className="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold shadow-md hover:bg-primary/95 transition-all w-fit"
              >
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
