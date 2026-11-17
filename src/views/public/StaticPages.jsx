import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
          Our Heritage & Ethos
        </span>
        <h1 className="font-serif text-4xl font-bold text-charcoal-900">
          Bridging Ancient Craftsmanship with Conscious Homes
        </h1>
        <p className="text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
          KalaKart was created to restore dignity, fair compensation, and widespread appreciation to India’s master artisans, generational weavers, and rural craft clusters.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-lg border border-cream-200 aspect-[16/9] bg-cream-100">
        <img
          src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop"
          alt="Artisanal craft workshop"
          className="w-full h-full object-cover"
            onError={(e)=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=crop'}}
          />
      </div>

      <div className="space-y-6 text-sm text-charcoal-700 leading-relaxed">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">The Challenge We Solve</h2>
        <p>
          For generations, the makers of India's most extraordinary folk art—from Madhubani paintings to Khurja stoneware ceramics and Sheesham wood inlays—have had to rely on long chains of middlemen and regional merchants who take the lion's share of profits while artisans remain marginalized.
        </p>
        <p>
          Meanwhile, mindful consumers seeking authentic, sustainable, and handmade home goods are routinely exposed to mass-produced synthetic replicas labeled as "handcrafted."
        </p>

        <h2 className="font-serif text-2xl font-bold text-charcoal-900 pt-4">Our Three Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 bg-white rounded-2xl border border-cream-200 shadow-sm">
            <h3 className="font-serif font-bold text-base text-terracotta-600 mb-2">1. Authenticity</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Every seller on KalaKart is manually reviewed and approved. We verify materials, natural pigments, and genuine artisanal methods.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-cream-200 shadow-sm">
            <h3 className="font-serif font-bold text-base text-olive-700 mb-2">2. Direct Trade</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              When you purchase on KalaKart, your payment directly supports the artisan's studio and community, fostering sustainable economic empowerment.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-cream-200 shadow-sm">
            <h3 className="font-serif font-bold text-base text-amber-700 mb-2">3. Eco-Packaging</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We champion plastic-free and recycled packing materials, matching the natural, earth-conscious ethos of the crafts themselves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been received! Our support team will respond shortly.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
          Support & Inquiries
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          We’d Love to Hear From You
        </h1>
        <p className="text-sm text-charcoal-600">
          Have questions about an artisan piece, order tracking, or partnership? Connect with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 bg-cream-50 rounded-2xl border border-cream-200 space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">Artisan Support Desk</h3>
            <div className="space-y-3 text-xs text-charcoal-600">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-terracotta-600" />
                <span>support@kalakart.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-terracotta-600" />
                <span>+91 98765 43210 (Mon-Sat, 9AM-6PM)</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-terracotta-600" />
                <span>Heritage Craft Quarter, Jaipur, Rajasthan 302001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-8 rounded-2xl border border-cream-200 shadow-sm">
          {submitted ? (
            <div className="p-6 bg-olive-50 border border-olive-200 rounded-xl text-center space-y-2">
              <h4 className="font-serif font-bold text-olive-800">Thank You!</h4>
              <p className="text-xs text-olive-700">Your note has been safely logged. We will get back to you within 24 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
                  placeholder="e.g. Priya Iyer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
                  placeholder="priya@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500"
                  placeholder="How can we help you today?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: 'Are all products genuinely handmade?',
      a: 'Yes. Every listing on KalaKart is personally crafted by verified artisans, handloom weavers, or regional folk artists. We strictly disallow factory manufactured goods.',
    },
    {
      q: 'How does shipping and order tracking work?',
      a: 'Once an artisan confirms your order, they carefully prepare and package the items. You can view step-by-step timeline updates on your Orders page with dispatch dates and courier notes.',
    },
    {
      q: 'Is Cash on Delivery (COD) supported?',
      a: 'Yes! Cash on Delivery is supported for all domestic addresses across India with zero prepayment required.',
    },
    {
      q: 'Can I cancel an order?',
      a: 'You can cancel an eligible order directly from your Orders page as long as the status is "Order Placed" or "Confirmed". Once items are marked as "Dispatched", cancellations cannot be processed.',
    },
    {
      q: 'How can local artisans join the platform?',
      a: 'Artisans can submit an application via the "Become a Seller" link. Once reviewed by our curation administrators, approved sellers gain access to their dedicated dashboard to publish craft listings.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
          Knowledge Base
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-charcoal-500">
          Everything you need to know about purchasing and selling handmade goods on KalaKart
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-2">
            <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-terracotta-500 flex-shrink-0" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PolicyPage({ title, lastUpdated = 'October 2026', content }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="border-b border-cream-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">{title}</h1>
        <p className="text-xs text-charcoal-500 mt-1">Last Updated: {lastUpdated}</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-sans">
        {content}
      </div>
    </div>
  );
}
