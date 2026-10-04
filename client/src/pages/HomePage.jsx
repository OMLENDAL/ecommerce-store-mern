import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Star,
  ShieldCheck,
  ChevronRight,
  Headphones,
  Laptop,
  Watch,
  ShoppingBag
} from 'lucide-react';

export const HomePage = () => {
  const { navigate } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Carousel State
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    {
      badge: '🚀 NEW FLAGSHIP RELEASE',
      title: 'AeroSound Pro Noise-Cancelling Headphones',
      subtitle: 'Pure studio fidelity, 45-hour playback, and hybrid active noise cancellation engineered for audio purists.',
      cta: 'Explore Flagship Audio',
      category: 'Audio & Sound',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
      price: '$299'
    },
    {
      badge: '✨ TITANIUM EDITION',
      title: 'Nebula Ultra Smartwatch Series X',
      subtitle: 'Sapphire crystal retina display, ECG bio-sensors, titanium grade-5 chassis, and 50m submersible depth.',
      cta: 'Shop Watches',
      category: 'Accessories & Watches',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80',
      price: '$399'
    },
    {
      badge: '⚡ PERFORMANCE ERGONOMICS',
      title: 'ErgoMotion Pro Mesh Workspace Chair',
      subtitle: 'Adaptive 4D lumbar alignment, breathable German elastomeric weave, and 135-degree reclined posture lock.',
      cta: 'Upgrade Workspace',
      category: 'Home & Workspace',
      image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=1200&q=80',
      price: '$429'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, catRes] = await Promise.all([
          api.getFeaturedProducts(),
          api.getCategories()
        ]);
        setFeaturedProducts(featRes);
        setCategories(catRes);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto cycle hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[heroSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '80px' }}>
      {/* Hero Showcase Carousel */}
      <section style={{ padding: '24px 0 0' }}>
        <div className="app-container">
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              minHeight: '520px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-subtle)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
              color: '#ffffff'
            }}
          >
            {/* Background Image Overlay with Gradient */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60%',
                height: '100%',
                backgroundImage: `url(${currentSlide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.75,
                maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                transition: 'background-image 0.8s ease-in-out'
              }}
            />

            {/* Content Left */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: '620px',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', width: 'fit-content', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: '#818cf8', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <Sparkles size={14} />
                {currentSlide.badge}
              </div>

              <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', letterSpacing: '-0.03em' }}>
                {currentSlide.title}
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                {currentSlide.subtitle}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <button
                  onClick={() => navigate('shop', { category: currentSlide.category })}
                  className="btn-primary"
                  style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
                >
                  {currentSlide.cta} <ArrowRight size={18} />
                </button>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                  from <span style={{ color: '#818cf8' }}>{currentSlide.price}</span>
                </div>
              </div>
            </div>

            {/* Carousel Slide Indicators */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '48px',
                display: 'flex',
                gap: '10px',
                zIndex: 5
              }}
            >
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroSlide(idx)}
                  style={{
                    width: heroSlide === idx ? '32px' : '10px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: heroSlide === idx ? '#818cf8' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Curated Collections
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                Shop by Category
              </h2>
            </div>
            <button
              onClick={() => navigate('shop')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.92rem' }}
            >
              View All Categories <ChevronRight size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px'
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate('shop', { category: cat.name })}
                className="glass-panel"
                style={{
                  position: 'relative',
                  height: '240px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '20px',
                    color: '#ffffff'
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    {cat.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Browse Collection</span> <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-sale">Top Rated</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Handpicked Essentials
                </span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px' }}>
                Trending & Featured Products
              </h2>
            </div>
            <button
              onClick={() => navigate('shop', { sort: 'popularity' })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.92rem' }}
            >
              See All Products <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="grid-responsive-cards">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : (
            <div className="grid-responsive-cards">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Promotional Banner */}
      <section>
        <div className="app-container">
          <div
            className="glass-panel"
            style={{
              padding: '48px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #ec4899 100%)',
              color: '#ffffff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '32px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ maxWidth: '580px', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>
                Limited Time Promo Drop
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', margin: '8px 0 14px', lineHeight: 1.2 }}>
                Save 20% On All Studio Audio & Ergonomics
              </h2>
              <p style={{ fontSize: '1rem', color: '#f1f5f9', lineHeight: 1.6, marginBottom: '24px' }}>
                Apply coupon code <code style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>SAVE20</code> at checkout to unlock instant savings on premium gear.
              </p>
              <button
                onClick={() => navigate('shop')}
                style={{
                  background: '#ffffff',
                  color: '#4338ca',
                  fontWeight: 700,
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.95rem'
                }}
              >
                Claim Discount Code <ArrowRight size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                zIndex: 2
              }}
            >
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>03</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Days</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>18</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Hours</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>42</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Mins</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
