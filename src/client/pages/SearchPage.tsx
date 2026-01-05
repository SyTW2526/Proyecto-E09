/**
 * @file SearchPage.tsx
 * @description Página de búsqueda de cartas
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import { normalizeImageUrl } from '../utils/imageHelpers';
import '../styles/collection.css';
import '../styles/search.css';
import api from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../features/whislist/whislistSlice';
import { authService } from '../services/authService';
import { RootState, AppDispatch } from '../store/store';
import { useSearchParams } from 'react-router-dom';
import { useLoadingError } from '../hooks';
// Número de resultados por página
const PAGE_SIZE = 12;
// Orden de rarezas
const RARITY_ORDER = [
  'Common',
  'Uncommon',
  'Rare',
  'Holo Rare',
  'Rare Holo',
  'Ultra Rare',
  'Secret Rare',
];
// Página de búsqueda de cartas
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
  const { loading, error, startLoading, stopLoading, handleError } =
    useLoadingError();

  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');

  const [allSets, setAllSets] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [hoverDetails, setHoverDetails] = useState<Record<string, any>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [setOpen, setSetOpen] = useState(false);
  const [setSearch, setSetSearch] = useState('');
  const [rarityOpen, setRarityOpen] = useState(false);
  const [raritySearch, setRaritySearch] = useState('');

  const setWrapRef = useRef<HTMLDivElement | null>(null);
  const rarityWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(qParam);
    setPage(1);
  }, [qParam]);

  useEffect(() => {
    const user = authService.getUser();
    if (!user || !authService.isAuthenticated()) return;
    dispatch(fetchWishlist(user.username || user.id));
  }, [dispatch]);

  useEffect(() => {
    const s = new Set<string>();
    (wishlistState || []).forEach((it: any) => {
      if (it.pokemonTcgId) s.add(it.pokemonTcgId);
      if (it.id) s.add(it.id);
    });
    setWishlistSet(s);
  }, [wishlistState]);

  useEffect(() => {
    const load = async () => {
      if (!query) {
        setResults([]);
        setTotal(0);
        return;
      }
      startLoading();
      try {
        const resp = await api.searchTcgCards(
          query,
          page,
          PAGE_SIZE,
          selectedSet,
          selectedRarity
        );
        setResults(resp.data || []);
        setTotal(resp.total || 0);
      } catch (e) {
        handleError(e);
        setResults([]);
        setTotal(0);
      } finally {
        stopLoading();
      }
    };
    load();
  }, [query, page, selectedSet, selectedRarity]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const payload: any = await api.getTcgDexSets();
        if (!mounted || !payload) return;

        let arr: any[] = [];
        if (Array.isArray(payload)) arr = payload;
        else if (Array.isArray(payload.data)) arr = payload.data;
        else if (Array.isArray(payload.sets)) arr = payload.sets;

        const normalized = arr
          .map((s: any) => {
            const id = s.id || s.code || s.setId || s.setCode || s.name || '';
            const name = s.name || s.title || s.setName || id;
            return { id: String(id), name: String(name) };
          })
          .filter((s: any) => s.id);

        const map = new Map<string, string>();
        normalized.forEach((s: any) => map.set(s.id, s.name));
        setAllSets(
          Array.from(map.entries()).map(([id, name]) => ({ id, name }))
        );
      } catch (e) {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil((total || results.length) / PAGE_SIZE)
  );

  const setsOptions = useMemo(() => {
    const map = new Map<string, string>();
    (allSets || []).forEach((s) => {
      if (s && s.id) map.set(s.id, s.name || s.id);
    });
    if (Array.isArray(results)) {
      results.forEach((r) => {
        const id = r.setId || r.set || '';
        const name = r.set || '';
        if (id) map.set(id, name || id);
      });
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [results, allSets]);

  const raritiesOptions = useMemo(() => {
    const s = new Set<string>();
    if (Array.isArray(results)) {
      results.forEach((r) => {
        if (r.rarity) s.add(r.rarity);
      });
    }
    const arr = Array.from(s).filter(Boolean);
    const fallback = RARITY_ORDER.slice();
    const finalArr = arr.length ? arr : fallback;

    const orderMap = new Map(RARITY_ORDER.map((v, i) => [v.toLowerCase(), i]));
    finalArr.sort((a, b) => {
      const ai = orderMap.has(a.toLowerCase())
        ? orderMap.get(a.toLowerCase())!
        : 1e6;
      const bi = orderMap.has(b.toLowerCase())
        ? orderMap.get(b.toLowerCase())!
        : 1e6;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
    return finalArr;
  }, [results]);

  const selectedSetLabel = useMemo(() => {
    if (!selectedSet) return '';
    const found = setsOptions.find((s) => s.id === selectedSet);
    return found?.name || selectedSet;
  }, [selectedSet, setsOptions]);

  const filteredSetsOptions = useMemo(() => {
    const q = setSearch.trim().toLowerCase();
    if (!q) return setsOptions;
    return setsOptions.filter((s) =>
      (s.name || s.id).toLowerCase().includes(q)
    );
  }, [setsOptions, setSearch]);

  const filteredRarityOptions = useMemo(() => {
    const q = raritySearch.trim().toLowerCase();
    if (!q) return raritiesOptions;
    return raritiesOptions.filter((r) => r.toLowerCase().includes(q));
  }, [raritiesOptions, raritySearch]);

  useEffect(() => {
    if (!setOpen && !rarityOpen) return;

    const onDown = (e: MouseEvent) => {
      const setEl = setWrapRef.current;
      const rarEl = rarityWrapRef.current;
      const target = e.target;

      if (!(target instanceof Node)) return;

      const clickInSet = !!setEl && setEl.contains(target);
      const clickInRarity = !!rarEl && rarEl.contains(target);

      if (!clickInSet) setSetOpen(false);
      if (!clickInRarity) setRarityOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSetOpen(false);
        setRarityOpen(false);
      }
    };

    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [setOpen, rarityOpen]);

  return (
    <div className="collectionPage searchPage">
      <Header />

      <div className="collectionMain">
        <div className="searchHeader">
          <div className="searchHeaderTitleRow">
            <h2 className="collectionTitle collectionTitleWord">
              {t('common.results')}
            </h2>
            <span className="collectionTitleCount">{total}</span>
          </div>
        </div>

        <div className="collectionToolbar">
          <div className="toolbarRightGroup">
            <input
              placeholder={t('common.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="header-search"
            />

            <div className="selectWrap searchSetWrap" ref={setWrapRef}>
              <button
                type="button"
                className="selectTrigger searchSelectTrigger"
                onClick={() => {
                  setSetOpen((v) => !v);
                  setRarityOpen(false);
                }}
              >
                <span
                  className={`selectValue ${
                    !selectedSet ? 'isPlaceholder' : ''
                  }`}
                >
                  {selectedSet ? selectedSetLabel : t('common.set')}
                </span>
                <span className="selectChevron" aria-hidden="true" />
              </button>

              {setOpen && (
                <div className="selectPopover selectPopover--natural searchSelectPopover">
                  <div className="selectSearchRow">
                    <input
                      className="selectSearch"
                      value={setSearch}
                      onChange={(e) => setSetSearch(e.target.value)}
                      placeholder={t('common.searchSet')}
                      autoFocus
                    />
                  </div>

                  <div
                    className="selectList"
                    style={{ ['--popMaxH' as any]: '360px' }}
                  >
                    <button
                      type="button"
                      className={`selectItem ${selectedSet === '' ? 'isActive' : ''}`}
                      onClick={() => {
                        setSelectedSet('');
                        setPage(1);
                        setSetOpen(false);
                      }}
                    >
                      <span>{t('common.set')}</span>
                      <span />
                    </button>

                    {filteredSetsOptions.length === 0 ? (
                      <div className="selectEmpty">{t('common.noResults')}</div>
                    ) : (
                      filteredSetsOptions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`selectItem ${selectedSet === s.id ? 'isActive' : ''}`}
                          onClick={() => {
                            setSelectedSet(s.id);
                            setPage(1);
                            setSetOpen(false);
                          }}
                        >
                          <span>{s.name || s.id}</span>
                          <span />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="selectWrap searchRarityWrap" ref={rarityWrapRef}>
              <button
                type="button"
                className="selectTrigger searchSelectTrigger"
                onClick={() => {
                  setRarityOpen((v) => !v);
                  setSetOpen(false);
                }}
              >
                <span
                  className={`selectValue ${
                    !selectedRarity ? 'isPlaceholder' : ''
                  }`}
                >
                  {selectedRarity ? selectedRarity : t('common.rarity')}
                </span>
                <span className="selectChevron" aria-hidden="true" />
              </button>

              {rarityOpen && (
                <div className="selectPopover selectPopover--natural searchSelectPopover">
                  <div className="selectSearchRow">
                    <input
                      className="selectSearch"
                      value={raritySearch}
                      onChange={(e) => setRaritySearch(e.target.value)}
                      placeholder={t('common.searchRarity')}
                      autoFocus
                    />
                  </div>

                  <div
                    className="selectList"
                    style={{ ['--popMaxH' as any]: '360px' }}
                  >
                    <button
                      type="button"
                      className={`selectItem ${selectedRarity === '' ? 'isActive' : ''}`}
                      onClick={() => {
                        setSelectedRarity('');
                        setPage(1);
                        setRarityOpen(false);
                      }}
                    >
                      <span>{t('common.rarity')}</span>
                      <span />
                    </button>

                    {filteredRarityOptions.length === 0 ? (
                      <div className="selectEmpty">{t('common.noResults')}</div>
                    ) : (
                      filteredRarityOptions.map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`selectItem ${selectedRarity === r ? 'isActive' : ''}`}
                          onClick={() => {
                            setSelectedRarity(r);
                            setPage(1);
                            setRarityOpen(false);
                          }}
                        >
                          <span>{r}</span>
                          <span />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loadingState searchStateCenter">
            {t('common.loading')}
          </div>
        ) : error ? (
          <div className="loadingState isError searchStateCenter">{error}</div>
        ) : !Array.isArray(results) || results.length === 0 ? (
          <div className="loadingState searchStateCenter">
            {t('common.noResults')}
          </div>
        ) : (
          <div className="cardsGrid">
            {results
              .filter((c: any) => {
                const rawImage =
                  (c.images && (c.images.large || c.images.small)) || '';
                const image =
                  normalizeImageUrl(rawImage) ||
                  (c.imageUrl ? normalizeImageUrl(c.imageUrl) : '');
                return image && image.endsWith('/high.png');
              })
              .map((c: any) => {
                const isFlipped = hoveredId === c.id;
                const rawImage =
                  (c.images && (c.images.large || c.images.small)) || '';
                const image =
                  normalizeImageUrl(rawImage) ||
                  (c.imageUrl ? normalizeImageUrl(c.imageUrl) : '');

                return (
                  <div key={c.id} className="cardTileBig">
                    <div
                      className={`flipCard ${isFlipped ? 'isFlipped' : ''}`}
                      onMouseEnter={async () => {
                        setHoveredId(c.id);
                        if (hoverDetails[c.id]) return;

                        const tcg = c.pokemonTcgId || c.id;
                        if (!tcg) return;

                        let d = await api
                          .getCachedCardByTcgId(tcg)
                          .catch(() => null);

                        if (!d) {
                          try {
                            const [setCode, number] = String(tcg).split('-');
                            if (setCode && number) {
                              const raw = await api
                                .getTcgDexCard(setCode, number)
                                .catch(() => null);
                              const payload = raw?.data ?? raw ?? null;
                              d = payload;
                            }
                          } catch (e) {
                            d = null;
                          }
                        }

                        const normalizeDetail = (x: any) => {
                          if (!x) return null;
                          const out: any = {};
                          out.set =
                            x.set?.name ||
                            x.set ||
                            x.series ||
                            x.setName ||
                            x.setCode ||
                            '';
                          out.rarity =
                            x.rarity ||
                            x.rarityText ||
                            x.rarity_name ||
                            x.set?.rarity ||
                            '';
                          out.illustrator =
                            x.illustrator || x.artist || x?.authors || '';
                          out.images =
                            x.images ||
                            (x.imageUrl
                              ? { small: x.imageUrl, large: x.imageUrl }
                              : x.image
                                ? { small: x.image, large: x.image }
                                : {});
                          out.price =
                            x.price && x.price.avg
                              ? x.price
                              : x.prices
                                ? x.prices
                                : x?.cardmarket
                                  ? x.cardmarket
                                  : null;

                          out.price = out.price || {
                            avg:
                              x.avg ??
                              x.cardmarketAvg ??
                              x.tcgplayerMarketPrice ??
                              null,
                          };
                          return out;
                        };

                        const nd = normalizeDetail(d);
                        setHoverDetails((prev) => ({ ...prev, [c.id]: nd }));
                      }}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="flipFace flipFront">
                        <div className="cardImageWrap">
                          <img src={image} alt={c.name} />
                        </div>
                      </div>

                      <div className="flipFace flipBack">
                        <div className="backBody">
                          <h3 className="backTitle">{c.name}</h3>

                          <div className="backAttrGrid">
                            <div className="backAttrBox">
                              <span className="backAttrLabel">
                                {t('common.rarity')}
                              </span>
                              <div className="backAttrValue">
                                {hoverDetails[c.id]?.rarity || c.rarity || '—'}
                              </div>
                            </div>

                            <div className="backAttrBox">
                              <span className="backAttrLabel">
                                {t('common.set')}
                              </span>
                              <div className="backAttrValue">
                                {hoverDetails[c.id]?.set || c.set || '—'}
                              </div>
                            </div>
                          </div>

                          <div className="backSection">
                            <span className="backSectionTitle">
                              {t('common.illustrator')}
                            </span>
                            <div className="backSectionValue">
                              {(hoverDetails[c.id] &&
                                hoverDetails[c.id].illustrator) ||
                                '—'}
                            </div>
                          </div>

                          <div className="backPrice">
                            {hoverDetails[c.id] ? (
                              (() => {
                                const d = hoverDetails[c.id];
                                const avg =
                                  d?.price?.avg ??
                                  d?.price?.average ??
                                  d?.avg ??
                                  d?.cardmarketAvg ??
                                  null;

                                return (
                                  <div className="priceRow">
                                    <div className="priceLabel">
                                      {t('common.average')}
                                    </div>
                                    <div className="priceValue">
                                      {avg == null
                                        ? '—'
                                        : `${Number(avg).toFixed(2)}€`}
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="loadingTiny">
                                {t('common.loading')}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const user = authService.getUser();
                              if (!user || !authService.isAuthenticated()) {
                                window.alert(t('common.mustLogin'));
                                return;
                              }
                              const tcgId = c.pokemonTcgId || c.id;
                              const isFav =
                                wishlistSet.has(tcgId) || wishlistSet.has(c.id);

                              if (!isFav) {
                                dispatch(
                                  addToWishlist({
                                    userId: user.username || user.id,
                                    cardId: tcgId,
                                  } as any)
                                );
                                setWishlistSet((prev) =>
                                  new Set(prev).add(tcgId)
                                );
                              } else {
                                dispatch(
                                  removeFromWishlist({
                                    userId: user.username || user.id,
                                    cardId: tcgId,
                                  } as any)
                                );
                                setWishlistSet((prev) => {
                                  const copy = new Set(prev);
                                  copy.delete(tcgId);
                                  return copy;
                                });
                              }
                            }}
                            className="wishlistBtn"
                            aria-label={t('common.wishlist')}
                          >
                            <span style={{ fontSize: 20 }}>
                              {wishlistSet.has(c.pokemonTcgId || c.id)
                                ? '❤️'
                                : '🤍'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cardCaption">{c.name}</div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="collectionPagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="CollectionButton"
          >
            {t('common.prev')}
          </button>

          <div>
            {page} / {totalPages}
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="CollectionButton"
          >
            {t('common.next')}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
