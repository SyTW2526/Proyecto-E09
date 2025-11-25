import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import api from '../services/apiService';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import '../styles/collection.css';

// reuse canonical rarity order here (subset is fine; ensure 'Rare' present)
const RARITY_ORDER = [
  'Common','Uncommon','Rare','Holo Rare','Rare Holo','Ultra Rare','Secret Rare','None'
];

const OpenPackPage: React.FC = () => {
  const { t } = useTranslation();
  const [setInfo, setSetInfo] = useState<any | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // fetch cards from selected set
  const setData = await api.getCardsFromTcgDexSet(selectedSet);
      const cards = (setData?.cards || setData?.data || setData?.cards || []) as any[];
      if (!cards || cards.length === 0) {
        setError('No se encontraron cartas en el set');
        setOpening(false);
        return;
      }

      // choose 9 random cards
      const chosen: any[] = [];
      const pool = [...cards];
      for (let i = 0; i < 9; i++) {
        if (pool.length === 0) break;
        const idx = Math.floor(Math.random() * pool.length);
        chosen.push(pool.splice(idx,1)[0]);
      }

      // choose last card guaranteed Rare or higher
      const rarityIndex = RARITY_ORDER.indexOf('Rare');
      const rarePool = cards.filter(c => {
        const r = (c.rarity || c.rarityText || '').toString();
        // consider present in RARITY_ORDER at same or higher index
        const idx = RARITY_ORDER.findIndex(x => x.toLowerCase() === r.toLowerCase());
        return idx >= 0 && idx >= rarityIndex;
      });

      let lastCard: any = null;
      if (rarePool.length > 0) lastCard = pickRandom(rarePool);
      else lastCard = pickRandom(cards);

      const pack = [...chosen, lastCard];
      const normalized = pack.map(c => {
        // try multiple shapes for image
        let image = c.images?.large || c.images?.small || c.imageUrl || c.image || c.tcg?.images?.large || c.tcg?.images?.small || '';
        if (!image && c.card && typeof c.card === 'object') {
          image = c.card.images?.large || c.card.images?.small || c.card.imageUrl || c.card.image || '';
        }
        if (!image && (c.id || c.pokemonTcgId)) {
          const tcgId = c.id || c.pokemonTcgId;
          const [setCode, num] = tcgId.split('-');
          const m = setCode ? String(setCode).match(/^[a-zA-Z]+/) : null;
          const series = m ? m[0] : (setCode ? setCode.slice(0,2) : '');
          if (setCode && num) image = `https://assets.tcgdex.net/en/${series}/${setCode}/${num}/high.png`;
        }

        // ensure we point to high.png variant when possible
        if (!image) return { ...c, image: '' };
        try {
          // if already ends with known size png, switch to high.png
          if (/\/(?:small|large|high|low)\.png$/i.test(image)) {
            image = image.replace(/\/(?:small|large|high|low)\.png$/i, '/high.png');
          }
          // if it's a direct image url with extension, return as-is
          if (/\.(png|jpe?g|gif|webp)$/i.test(image)) return { ...c, image };
          // otherwise append /high.png
          return { ...c, image: image.endsWith('/') ? `${image}high.png` : `${image}/high.png` };
        } catch (e) {
          return { ...c, image };
        }
      });

      setOpenedCards(normalized);

      // persist each card to user's collection via API (autoFetch)
      const promises = normalized.map(async (card) => {
        const tcgId = card.id || card.pokemonTcgId || '';
        if (!tcgId) return false;
        return await api.addCardToUserCollectionByTcgId(usernameOrId, tcgId);
      });

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r).length;
      if (failed > 0) setError(`${failed} cartas no pudieron añadirse a la colección`);

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
