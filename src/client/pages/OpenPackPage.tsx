import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import api from '../services/apiService';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import '../styles/collection.css';

// reuse canonical rarity order here (subset is fine; ensure 'Rare' present)
const RARITY_ORDER = [
  'Common',
  'Uncommon',
  'Rare',
  'Holo Rare',
  'Rare Holo',
  'Double rare',
  'ACE SPEC Rare',
  'Amazing Rare',
  'Illustration rare',
  'Special illustration rare',
  'Ultra Rare',
  'Holo Rare V',
  'Holo Rare VMAX',
  'Holo Rare VSTAR',
  'Shiny rare',
  'Shiny Ultra Rare',
  'Shiny rare V',
  'Shiny rare VMAX',
  'Radiant Rare',
  'Hyper rare',
  'Mega Hyper Rare',
  'Secret Rare',
  'Rare PRIME',
  'Rare Holo LV.X',
  'LEGEND',
  'Full Art Trainer',
  'Classic Collection',
  'Black White Rare',
  'Crown',
  'One Diamond',
  'Two Diamond',
  'Three Diamond',
  'Four Diamond',
  'One Star',
  'Two Star',
  'Three Star',
  'One Shiny',
  'Two Shiny',
  'None'
];

const OpenPackPage: React.FC = () => {
  const { t } = useTranslation();
  const [setInfo, setSetInfo] = useState<any | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<any[]>([]);
  const [packStatus, setPackStatus] = useState<{ remaining:number; count24:number; nextAllowed?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  // available sets to open
  const SET_OPTIONS = [
    { id: 'me01', label: 'Mega Evolución (me01)' },
    { id: 'sm9', label: 'Team Up (sm9)' },
    { id: 'base1', label: 'Base Set (base1)' },
    { id: 'bw9', label: 'Plasma Freeze (bw9)' },
    { id: 'sv05', label: 'Temporal Forces (sv05)' },
  ];

  const [selectedSet, setSelectedSet] = useState<string>(SET_OPTIONS[0].id);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingSet(true);
      try {
        const resp = await api.getCardsFromTcgDexSet(selectedSet);
        if (!mounted) return;
        setSetInfo(resp);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoadingSet(false);
      }
    }
    load();
    // load pack status
    (async () => {
      const user = authService.getUser();
      if (!user || !authService.isAuthenticated()) return;
      try {
        const resp = await fetch(`http://localhost:3000/users/${encodeURIComponent(user.username||user.id)}/pack-status`, { headers: { ...authService.getAuthHeaders() } });
        if (!resp.ok) return;
        const payload = await resp.json();
        setPackStatus(payload);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [selectedSet]);

  const getLogoUrl = () => {
    if (!setInfo) return '';
    const imgs = setInfo.images || {};
    // images may be a string or an object with logo/symbol
    if (typeof imgs === 'string' && imgs) {
      let v = imgs;
      if (!/^https?:\/\//i.test(v)) {
        if (v.startsWith('/')) v = `https://assets.tcgdex.net${v}`;
        else v = `https://assets.tcgdex.net/${v}`;
      }
      if (/\/logo$/i.test(v) && !/\.png$/i.test(v)) v = `${v}.png`;
      return v;
    }
    if (imgs.symbol) return typeof imgs.symbol === 'string' ? imgs.symbol : imgs.symbol.url ?? '';
    if (setInfo.logo) return setInfo.logo;
    if (setInfo.image) return setInfo.image;
    // fallback to raw payload paths
    if (setInfo.raw?.data?.images?.logo) {
      let v = setInfo.raw.data.images.logo;
      if (v && !/^https?:\/\//i.test(v)) v = `https://assets.tcgdex.net${v.startsWith('/') ? v : `/${v}`}`;
      if (v && /\/logo$/i.test(v) && !/\.png$/i.test(v)) v = `${v}.png`;
      return v;
    }
    // final fallback: construct assets.tcgdex logo URL using set id
    const sid = setInfo?.id || selectedSet || '';
    if (sid) {
      const code = sid.slice(0,2);
      return `https://assets.tcgdex.net/en/${code}/${sid}/logo.png`;
    }
    return '';
  };

  function pickRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const openPack = async () => {
    setError(null);
    setOpening(true);
    setOpenedCards([]);
    try {
      const user = authService.getUser();
      if (!user || !authService.isAuthenticated()) {
        setError('Debes iniciar sesión para abrir sobres');
        setOpening(false);
        return;
      }
      const usernameOrId = user.username || user.id;

      // call server endpoint that applies rate limits and persists the pack
      const base = 'http://localhost:3000';
      const resp = await fetch(`${base}/users/${encodeURIComponent(usernameOrId)}/open-pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({ setId: selectedSet })
      });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => null);
        if (payload && payload.nextAllowed) {
          setError(`Rate limited. Next allowed: ${new Date(payload.nextAllowed).toLocaleString()}`);
        } else if (payload && payload.message) {
          setError(payload.message);
        } else {
          const txt = await resp.text();
          setError(txt || 'Failed to open pack');
        }
        setOpening(false);
        return;
      }

      const payload = await resp.json();
      const cards = payload.cards || [];
      // normalize for frontend display
      const normalized = cards.map((it: any) => ({ id: it.pokemonTcgId || (it.userCard && it.userCard.pokemonTcgId) || it.tcgId, name: it.name, image: it.image }));
      setOpenedCards(normalized);
      // refresh pack status
      (async () => {
        const user = authService.getUser();
        if (!user || !authService.isAuthenticated()) return;
        try {
          const resp2 = await fetch(`http://localhost:3000/users/${encodeURIComponent(user.username||user.id)}/pack-status`, { headers: { ...authService.getAuthHeaders() } });
          if (!resp2.ok) return;
          const payload2 = await resp2.json();
          setPackStatus(payload2);
        } catch (e) {}
      })();

    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="collection-page">
      <Header />
      <div className="collection-inner">
        <h2>Abrir sobre</h2>
        {loadingSet ? <div>Cargando set...</div> : (
          <div style={{display:'flex', gap:16, alignItems:'center', flexDirection: 'column'}}>
            <div style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center'}}>
              {SET_OPTIONS.map(s => (
                <button
                  key={s.id}
                  className={`CollectionButton ${selectedSet === s.id ? 'active' : ''}`}
                  onClick={() => { setSelectedSet(s.id); setOpenedCards([]); setError(null); }}
                  style={{minWidth:120}}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div style={{display:'flex', gap:16, alignItems:'center'}}>
              <div style={{textAlign:'center'}}>
                {getLogoUrl() ? (
                  <img src={getLogoUrl()} alt={setInfo?.name || 'Set'} style={{width:240, height:240, objectFit:'contain'}} />
                ) : (
                  <div style={{width:240, height:240, display:'flex', alignItems:'center', justifyContent:'center', background:'#f3f4f6'}}>Logo no disponible</div>
                )}
                <div style={{marginTop:12}}>{setInfo?.name || SET_OPTIONS.find(x=>x.id===selectedSet)?.label}</div>
              </div>

              <div>
                <button className="CollectionButton" onClick={openPack} disabled={opening}>
                  {opening ? 'Abriendo...' : 'Abrir'}
                </button>
                {/* pack status UI */}
                {packStatus && (
                  <div style={{marginTop:12, textAlign:'center'}}>
                    <div style={{fontSize:14}}>Disponibles: <strong>{packStatus.remaining}</strong></div>
                    <div style={{display:'flex', gap:4, justifyContent:'center', marginTop:6}}>
                      {[0,1].map(i => (
                        <div key={i} style={{width:24, height:10, background: i < (2 - packStatus.remaining) ? '#f97316' : '#e5e7eb', borderRadius:4}} />
                      ))}
                    </div>
                    {packStatus.nextAllowed && (
                      <div style={{fontSize:12, color:'#6b7280', marginTop:6}}>Siguiente permitido: {new Date(packStatus.nextAllowed).toLocaleString()}</div>
                    )}
                  </div>
                )}
                {/* reset control for testing (hidden behind Código button) */}
                <div style={{marginTop:10, display:'flex', gap:8, alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
                  <div style={{display:'flex', gap:8}}>
                    <button className="CollectionButton" onClick={()=>setShowReset(s => !s)}>{showReset ? 'Cerrar' : 'Código'}</button>
                  </div>
                  {showReset && (
                    <div style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}}>
                      <input value={resetCode} onChange={(e)=>setResetCode(e.target.value)} placeholder="ADMIN" style={{padding:6, fontSize:12, textTransform:'uppercase'}} />
                      <button className="CollectionButton" onClick={async ()=>{
                        setResetMessage(null);
                        setResetLoading(true);
                        try {
                          const user = authService.getUser();
                          if (!user) throw new Error('No auth');
                          // require uppercase ADMIN on client
                          if ((resetCode || 'ADMIN') !== 'ADMIN') {
                            setResetMessage('Código inválido (debe ser ADMIN en mayúsculas)');
                            setResetLoading(false);
                            return;
                          }
                          const resp = await fetch(`http://localhost:3000/users/${encodeURIComponent(user.username||user.id)}/reset-pack-limit`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() }, body: JSON.stringify({ code: resetCode || 'ADMIN' })
                          });
                          if (!resp.ok) {
                            const p = await resp.json().catch(()=>null);
                            setResetMessage(p?.message || `Error: ${resp.statusText}`);
                            setResetLoading(false);
                            return;
                          }
                          setResetMessage('Reset realizado');
                          setShowReset(false);
                          setResetCode('');
                          // refresh pack status
                          try {
                            const resp2 = await fetch(`http://localhost:3000/users/${encodeURIComponent(user.username||user.id)}/pack-status`, { headers: { ...authService.getAuthHeaders() } });
                            if (resp2.ok) {
                              const payload2 = await resp2.json();
                              setPackStatus(payload2);
                            }
                          } catch (e) {}
                        } catch (e: any) {
                          setResetMessage(e?.message ?? String(e));
                        } finally { setResetLoading(false); }
                      }} disabled={resetLoading}>{resetLoading ? 'Reset...' : 'Reset'}</button>
                    </div>
                  )}
                  {resetMessage && <div style={{fontSize:12, color: resetMessage.includes('Error') ? 'red' : 'green', marginTop:6}}>{resetMessage}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div style={{color:'red', marginTop:12}}>{error}</div>}

        {openedCards.length > 0 && (
          <div style={{marginTop:20}}>
            <h3>Cartas obtenidas</h3>
            <div className="collection-grid" style={{marginTop:12}}>
              {openedCards.map((c:any)=> (
                <div key={c.id} className="collection-card">
                  <img src={c.image} alt={c.name || c.id} />
                  <div className="card-name">{c.name || c.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default OpenPackPage;
