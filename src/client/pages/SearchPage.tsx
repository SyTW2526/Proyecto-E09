import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import '../styles/collection.css';
import api from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../features/whislist/whislistSlice';
import { authService } from '../services/authService';
import { RootState, AppDispatch } from '../store/store';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 12;

const RARITY_ORDER = [ 'Common','Uncommon','Rare','Holo Rare','Rare Holo','Ultra Rare','Secret Rare' ];

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const wishlistState = useSelector((s: RootState) => s.wishlist.cards);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [params] = useSearchParams();
  const qParam = params.get('q') || '';

  const [query, setQuery] = useState(qParam);
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [hoverDetails, setHoverDetails] = useState<Record<string, any>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => { setQuery(qParam); setPage(1); }, [qParam]);

  // load wishlist for heart state
  useEffect(() => {
    const user = authService.getUser();
    if (!user || !authService.isAuthenticated()) return;
    dispatch(fetchWishlist(user.username || user.id));
  }, [dispatch]);

  useEffect(() => {
    const s = new Set<string>();
    (wishlistState || []).forEach((it:any)=>{ if (it.pokemonTcgId) s.add(it.pokemonTcgId); if (it.id) s.add(it.id); });
    setWishlistSet(s);
  }, [wishlistState]);

  function normalizeImageUrl(url?: string) {
    if (!url) return '';
    const s = String(url);
    if (/\/(?:small|large|high|low)\.png$/i.test(s)) return s.replace(/\/(?:small|large|high|low)\.png$/i, '/high.png');
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(s)) return s;
    return s.endsWith('/') ? `${s}high.png` : `${s}/high.png`;
  }

  useEffect(() => {
    const load = async () => {
      if (!query) { setResults([]); setTotal(0); return; }
      setLoading(true);
      try {
        const resp = await api.searchTcgCards(query, page, PAGE_SIZE, selectedSet, selectedRarity);
        setResults(resp.data || []);
        setTotal(resp.total || 0);
      } catch (e) {
        // ignore
      } finally { setLoading(false); }
    };
    load();
  }, [query, page, selectedSet, selectedRarity]);

  const totalPages = Math.max(1, Math.ceil((total || results.length) / PAGE_SIZE));

  const setsOptions = useMemo(() => [], []);

  return (
    <div className="collection-page">
      <Header />
      <div className="collection-inner">
        <div className="collection-controls">
          <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
            <h2 style={{margin:0}}>{t('Buscar cartas')}</h2>
            <p style={{margin:0, marginLeft:'.75rem', color:'var(--text-secondary)'}}>{total} resultados</p>
          </div>

          <div className="collection-filters">
            <input placeholder={t('searchPlaceholder') || 'Buscar por nombre...'} value={query} onChange={(e)=>setQuery(e.target.value)} className="header-search" />
            <select value={selectedSet} onChange={(e)=>{ setSelectedSet(e.target.value); setPage(1); }}>
              <option value="">Set</option>
            </select>
            <select value={selectedRarity} onChange={(e)=>{ setSelectedRarity(e.target.value); setPage(1); }}>
              <option value="">Rareza</option>
              {RARITY_ORDER.map(r=> <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="collection-empty">Cargando...</div>
        ) : results.length === 0 ? (
          <div className="collection-empty">No hay resultados</div>
        ) : (
          <div className="collection-grid">
            {results.map((c:any)=>{
              const isFlipped = hoveredId === c.id;
              const rawImage = (c.images && (c.images.large || c.images.small)) || '';
              const image = normalizeImageUrl(rawImage) || (c.imageUrl ? normalizeImageUrl(c.imageUrl) : '');
              return (
                <div key={c.id} className="collection-card">
                  <div
                    className={`card-flip ${isFlipped ? 'is-flipped' : ''}`}
                    onMouseEnter={async ()=>{
                      setHoveredId(c.id);
                      if (hoverDetails[c.id]) return;
                      const tcg = c.pokemonTcgId || c.id;
                      if (!tcg) return;
                      // try cached first
                      let d = await api.getCachedCardByTcgId(tcg).catch(()=>null);
                      if (!d) {
                        // fallback: fetch directly from TCGdex (do not persist)
                        try {
                          const [setCode, number] = String(tcg).split('-');
                          if (setCode && number) {
                            const raw = await api.getTcgDexCard(setCode, number).catch(()=>null);
                            const payload = raw?.data ?? raw ?? null;
                            d = payload;
                          }
                        } catch(e) { d = null; }
                      }
                      setHoverDetails(prev => ({ ...prev, [c.id]: d }));
                    }}
                    onMouseLeave={()=> setHoveredId(null)}
                  >
                    <div className="card-front">
                      <img src={image} alt={c.name} />
                    </div>
                    <div className="card-back">
                      <div className="card-back-inner collection-back-inner">
                        <h3 className="back-name collection-back-name">{c.name}</h3>
                        <div className="back-row collection-back-row"><div className="back-label">Rareza</div><div className="back-value">{c.rarity||'—'}</div></div>
                        <div className="back-row collection-back-row"><div className="back-label">Set</div><div className="back-value">{c.set||'—'}</div></div>
                        <div className="back-row collection-back-row"><div className="back-label">Ilustrador</div><div className="back-value">{(hoverDetails[c.id] && (hoverDetails[c.id].illustrator || hoverDetails[c.id].artist)) || '—'}</div></div>
                        <div className="back-price collection-back-price">
                          {hoverDetails[c.id] ? (()=>{
                            const d = hoverDetails[c.id];
                            const avg = d?.price?.avg ?? d?.avg ?? d?.price?.cardmarketAvg ?? null;
                            return (<div className="price-grid collection-price-grid"><div style={{fontWeight:700}}>Average:</div><div>{avg==null?'—':`${Number(avg).toFixed(2)}€`}</div></div>);
                          })() : (<div className="loading">Cargando...</div>)}
                        </div>
                        <div style={{position:'absolute', top:8, right:8}}>
                          <button
                            onClick={async (e)=>{
                              e.stopPropagation();
                              const user = authService.getUser();
                              if (!user || !authService.isAuthenticated()) { window.alert('Debes iniciar sesión'); return; }
                              const tcgId = c.pokemonTcgId || c.id;
                              const isFav = wishlistSet.has(tcgId) || wishlistSet.has(c.id);
                              if (!isFav) {
                                dispatch(addToWishlist({ userId: user.username || user.id, cardId: tcgId } as any));
                                setWishlistSet(prev=> new Set(prev).add(tcgId));
                              } else {
                                dispatch(removeFromWishlist({ userId: user.username || user.id, cardId: tcgId } as any));
                                setWishlistSet(prev=> { const copy = new Set(prev); copy.delete(tcgId); return copy; });
                              }
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-30"
                          >
                            <span style={{fontSize:20}}>{(wishlistSet.has(c.pokemonTcgId || c.id) ? '❤️' : '🤍')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-name">{c.name}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="collection-pagination">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="CollectionButton">Prev</button>
          <div style={{alignSelf:'center'}}>{page} / {totalPages}</div>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="CollectionButton">Next</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
