import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  Star,
  Check,
  RotateCcw
} from 'lucide-react';

export const ShopPage = () => {
  const { pageParams, navigate } = useApp();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState(pageParams.keyword || '');
  const [selectedCategory, setSelectedCategory] = useState(pageParams.category || 'all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(800);
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(pageParams.sort || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile filters drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (pageParams.category) {
      setSelectedCategory(pageParams.category);
    }
    if (pageParams.keyword) {
      setKeyword(pageParams.keyword);
    }
  }, [pageParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort: sortBy
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedBrand && selectedBrand !== 'all') params.brand = selectedBrand;
      if (minPrice > 0) params.minPrice = minPrice;
      if (maxPrice < 800) params.maxPrice = maxPrice;
      if (minRating) params.rating = minRating;
      if (inStockOnly) params.inStock = 'true';

      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
      if (res.availableCategories) setCategories(res.availableCategories);
      if (res.availableBrands) setBrands(res.availableBrands);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, minRating, inStockOnly, sortBy, page, keyword]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice(0);
    setMaxPrice(800);
    setMinRating('');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    keyword !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    minPrice > 0 ||
    maxPrice < 800 ||
    minRating !== '' ||
    inStockOnly;

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      {/* Header Breadcrumb & Title */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('home')}>Home</span> / <span>Shop Catalog</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Explore Collection</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Showing {products.length} of {totalCount} curated items
            </p>
          </div>

          {/* View Toggles & Mobile Filter Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Filter size={16} /> Filters {hasActiveFilters && <span className="badge badge-sale">•</span>}
            </button>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>

            {/* Grid/List View Mode */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: viewMode === 'list' ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="badge badge-featured" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Category: {selectedCategory}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('all')} />
              </span>
            )}
            {selectedBrand !== 'all' && (
              <span className="badge badge-featured" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Brand: {selectedBrand}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedBrand('all')} />
              </span>
            )}
            {minRating !== '' && (
              <span className="badge badge-featured" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                ★ {minRating}+ Stars
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMinRating('')} />
              </span>
            )}
            {inStockOnly && (
              <span className="badge badge-featured" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                In Stock Only
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setInStockOnly(false)} />
              </span>
            )}
            {keyword && (
              <span className="badge badge-featured" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Search: "{keyword}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setKeyword('')} />
              </span>
            )}
            <button
              onClick={handleResetFilters}
              style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}
            >
              <RotateCcw size={12} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="shop-grid-layout">
        {/* Desktop Sidebar Filters */}
        <aside className="shop-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Keyword Search */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Search Products</h4>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                placeholder="Filter by keyword..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                style={{ width: '100%', paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => { setSelectedCategory('all'); setPage(1); }}
                style={{
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: selectedCategory === 'all' ? 700 : 500,
                  color: selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  padding: '4px 0'
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  style={{
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '4px 0'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Price Range</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
              <span>${minPrice}</span>
              <span>${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="800"
              step="10"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Customer Rating Filter */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Minimum Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '4.5 & up', val: 4.5 },
                { label: '4.0 & up', val: 4.0 },
                { label: '3.5 & up', val: 3.5 }
              ].map(r => (
                <button
                  key={r.val}
                  onClick={() => { setMinRating(minRating === r.val ? '' : r.val); setPage(1); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    color: minRating === r.val ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: minRating === r.val ? 700 : 500
                  }}
                >
                  <Star size={14} fill={minRating === r.val ? '#f59e0b' : 'none'} color="#f59e0b" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
              In Stock Items Only
            </label>
          </div>
        </aside>

        {/* Product Cards Grid or List */}
        <main>
          {loading ? (
            <div className="grid-responsive-cards">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid-responsive-cards">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              /* List View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {products.map(p => (
                  <div
                    key={p.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '20px',
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-secondary)',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={(p.images && p.images[0]) || ''}
                      alt={p.name}
                      style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                      onClick={() => navigate('product-detail', { id: p.id })}
                    />
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{p.category}</span>
                      <h3
                        style={{ fontSize: '1.15rem', fontWeight: 700, margin: '4px 0 6px', cursor: 'pointer' }}
                        onClick={() => navigate('product-detail', { id: p.id })}
                      >
                        {p.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#f59e0b' }}>
                        <Star size={14} fill="#f59e0b" /> {p.rating || '5.0'} ({p.numReviews || 0} reviews)
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${p.price}</div>
                      <button
                        onClick={() => navigate('product-detail', { id: p.id })}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No products found</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                We couldn't find any products matching your specific filter criteria.
              </p>
              <button onClick={handleResetFilters} className="btn-primary">
                Clear Filters & Show All
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                <button
                  key={pNum}
                  onClick={() => { setPage(pNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    background: page === pNum ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: page === pNum ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-medium)',
                    boxShadow: page === pNum ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  {pNum}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .shop-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .shop-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
