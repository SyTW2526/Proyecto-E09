import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import '../styles/collection.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserCollection } from '../features/collection/collectionSlice';
import { RootState, AppDispatch } from '../store/store';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20;

const CollectionPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const collection = useSelector((s: RootState) => s.collection.cards) as any[];
  const loading = useSelector((s: RootState) => s.collection.loading);
  const [query, setQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);

  const user = authService.getUser();
  const username = user?.username;

  useEffect(() => {
    if (!username) return;
    dispatch(fetchUserCollection(username));
  }, [dispatch, username]);

  // derive filter options from collection
  const sets = useMemo(() => {
    const s = new Set<string>();
    (collection || []).forEach((c: any) => { if (c.series) s.add(c.series); if (c.set) s.add(c.set); });
    return Array.from(s).filter(Boolean).sort();
  }, [collection]);

  const rarities = useMemo(() => {
    const s = new Set<string>();
    (collection || []).forEach((c: any) => { if (c.rarity) s.add(c.rarity); });
    return Array.from(s).filter(Boolean).sort();
  }, [collection]);

  const types = useMemo(() => {
    const s = new Set<string>();
    (collection || []).forEach((c: any) => { if (c.types && Array.isArray(c.types)) c.types.forEach((t: string) => s.add(t)); });
    return Array.from(s).filter(Boolean).sort();
  }, [collection]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    (collection || []).forEach((c: any) => { if (c.category) s.add(c.category); });
    return Array.from(s).filter(Boolean).sort();
  }, [collection]);

  const filtered = useMemo(() => {
  let items = (collection || []).slice();
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(c => (c.name || '').toLowerCase().includes(q) || (c.series||'').toLowerCase().includes(q) || (c.set||'').toLowerCase().includes(q));
    }
  if (selectedSet) items = items.filter((c:any) => (c.set === selectedSet) || (c.series === selectedSet));
  if (selectedRarity) items = items.filter((c:any) => c.rarity === selectedRarity);
  if (selectedType) items = items.filter((c:any) => c.types?.includes(selectedType));
  if (selectedCategory) items = items.filter((c:any) => (c.category || c.type || '').toString() === selectedCategory);
    return items;
  }, [collection, query, selectedSet, selectedRarity, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, selectedSet, selectedRarity, selectedType, selectedCategory]);

  return (
    <div className="collection-page">
      <Header />
      <div className="collection-inner">
        <div className="collection-controls">
          <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
            <h2 style={{margin:0}}>{t('Colección')}</h2>
            <p style={{margin:0, marginLeft:'.75rem', color:'var(--text-secondary)'}}>{collection.length} {t('cartas')}</p>
          </div>

          <div className="collection-filters">
            <input placeholder={t('buscar')} value={query} onChange={(e)=>setQuery(e.target.value)} className="header-search" />

            <select value={selectedSet} onChange={(e)=>setSelectedSet(e.target.value)}>
              <option value="">{t('Sets')||'Set'}</option>
              {sets.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={selectedRarity} onChange={(e)=>setSelectedRarity(e.target.value)}>
              <option value="">{t('Rareza')||'Rarity'}</option>
              {rarities.map(r=> <option key={r} value={r}>{r}</option>)}
            </select>

            <select value={selectedType} onChange={(e)=>setSelectedType(e.target.value)}>
              <option value="">{t('Tipo')||'Type'}</option>
              {types.map(ti=> <option key={ti} value={ti}>{ti}</option>)}
            </select>
            <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)}>
              <option value="">{t('Categoría')||'Category'}</option>
              {categories.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="collection-empty">{t('loading') || 'Cargando...'}</div>
        ) : pageItems.length === 0 ? (
          <div className="collection-empty">{t('collection.empty') || 'No hay cartas con esos filtros'}</div>
        ) : (
          <div className="collection-grid">
            {pageItems.map((c:any)=> (
              <div key={c.id} className="collection-card">
                <img src={c.image} alt={c.name} />
                <div className="card-name">{c.name}</div>
              </div>
            ))}
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
}

export default CollectionPage;
