import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import { authService } from "../services/authService";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import "../styles/discover.css";

interface ApiCardNormalized {
  id: string;
  name: string;
  image: string;
  hp: string;
  set?: string;
  rarity: string;
  price?: {
    low?: number;
    mid?: number;
    high?: number;
  };
  illustrator?: string;
  series?: string;
}

interface TradeOwnerInfo {
  username: string;
  quantity: number;
  condition?: string;
}

interface TradeCard extends ApiCardNormalized {
  owners: TradeOwnerInfo[];
}

const SETS_PER_PAGE = 3;

const DiscoverTradeCards: React.FC = () => {
  const { t } = useTranslation();

  const tt = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const [tradeCards, setTradeCards] = React.useState<TradeCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [priceOrder, setPriceOrder] = React.useState<"" | "asc" | "desc">("");
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);

  const [selectedCardForTrade, setSelectedCardForTrade] =
    React.useState<TradeCard | null>(null);
  const [selectedOwner, setSelectedOwner] = React.useState<string>("");
  const [tradeNote, setTradeNote] = React.useState<string>("");

  const user = authService.getUser();
  const currentUsername = user?.username;

  React.useEffect(() => {
    if (selectedCardForTrade) {
      const firstOwner = selectedCardForTrade.owners[0]?.username || "";
      setSelectedOwner(firstOwner);
      setTradeNote("");
    } else {
      setSelectedOwner("");
      setTradeNote("");
    }
  }, [selectedCardForTrade]);

  const normalizeImageUrl = (url: string | undefined) => {
    if (!url) return "";
    if (/\/(?:small|large|high|low)\.png$/i.test(url)) {
      return url.replace(/\/(?:small|large|high|low)\.png$/i, "/high.png");
    }
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) return url;
    return url.endsWith("/") ? `${url}high.png` : `${url}/high.png`;
  };

  const normalizeApiCard = (raw: any): ApiCardNormalized => {
    const id = raw.pokemonTcgId || raw._id || raw.id || "";

    let rawImage =
      (raw.images && (raw.images.large || raw.images.small)) ||
      raw.imageUrl ||
      raw.image ||
      "";

    if (!rawImage && id) {
      const [setCode, number] = id.split("-");
      const series = setCode ? setCode.slice(0, 2) : "";
      if (setCode && number) {
        rawImage = `https://assets.tcgdex.net/en/${series}/${setCode}/${number}/high.png`;
      }
    }

    const setName =
      raw.set?.name || raw.set?.series || raw.set || raw.series || "";

    let priceObj:
      | { low?: number; mid?: number; high?: number }
      | undefined = undefined;

    if (raw.price) {
      priceObj = {
        low:
          raw.price.cardmarketAvg ??
          raw.price.tcgplayerMarketPrice ??
          undefined,
        mid:
          raw.price.avg ??
          raw.price.tcgplayerMarketPrice ??
          raw.price.cardmarketAvg ??
          undefined,
        high:
          raw.price.cardmarketAvg ??
          raw.price.tcgplayerMarketPrice ??
          undefined,
      };
    } else if (raw.prices) {
      priceObj = {
        low: raw.prices.low ?? raw.prices.mid ?? raw.prices.high,
        mid: raw.prices.mid ?? raw.prices.low ?? raw.prices.high,
        high: raw.prices.high ?? raw.prices.mid ?? raw.prices.low,
      };
    } else if (raw.tcg?.prices) {
      priceObj = {
        low:
          raw.tcg.prices.low ??
          raw.tcg.prices.mid ??
          raw.tcg.prices.high,
        mid:
          raw.tcg.prices.mid ??
          raw.tcg.prices.low ??
          raw.tcg.prices.high,
        high:
          raw.tcg.prices.high ??
          raw.tcg.prices.mid ??
          raw.tcg.prices.low,
      };
    } else if (typeof raw.marketPrice === "number") {
      priceObj = {
        low: raw.marketPrice,
        mid: raw.marketPrice,
        high: raw.marketPrice,
      };
    }

    return {
      id,
      name: raw.name || "",
      image: normalizeImageUrl(rawImage),
      hp: raw.hp || "",
      set: setName || "",
      rarity: raw.rarity || "",
      price: priceObj,
      illustrator: raw.illustrator || raw.artist || "",
      series: raw.set?.series || raw.series || "",
    };
  };
  React.useEffect(() => {
    let mounted = true;

    const fetchTradeCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const base = "http://localhost:3000";

        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "200");
        if (currentUsername) {
          params.set("excludeUsername", currentUsername);
        }

        const resp = await fetch(
          `${base}/usercards/discover?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...authService.getAuthHeaders(),
            },
          }
        );

        if (!resp.ok) {
          throw new Error(
            tt("trade.loadError", "Error al cargar cartas de intercambio")
          );
        }

        const payload = await resp.json();
        const rawItems: any[] = payload.cards || [];

        if (!rawItems.length) {
          if (!mounted) return;
          setTradeCards([]);
          setLoading(false);
          return;
        }

        const ids = rawItems
          .map((item) => item.pokemonTcgId)
          .filter(Boolean) as string[];
        const uniqueIds = Array.from(new Set(ids));

        const detailPromises = uniqueIds.map(async (tcgId) => {
          const resp = await fetch(`${base}/cards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tcgId }),
          });
          if (!resp.ok) {
            console.warn("Error al cargar detalles de carta", tcgId);
            return { tcgId, card: null as ApiCardNormalized | null };
          }
          const data = await resp.json();
          const rawCard = data.card || data;
          return { tcgId, card: normalizeApiCard(rawCard) };
        });

        const detailed = await Promise.all(detailPromises);

        const cardMap = new Map<string, ApiCardNormalized>();
        detailed.forEach(({ tcgId, card }) => {
          if (tcgId && card) cardMap.set(tcgId, card);
        });

        const grouped = new Map<string, TradeCard>();

        for (const item of rawItems) {
          const tcgId: string = item.pokemonTcgId || "";
          if (!tcgId) continue;

          const owner = item.userId || {};
          const username: string = owner.username || "";
          const quantity: number = item.quantity ?? 1;
          const condition: string = item.condition || "";

          const baseCard: ApiCardNormalized =
            cardMap.get(tcgId) ||
            ({
              id: tcgId,
              name: "",
              image: "",
              hp: "",
              set: "",
              rarity: "",
              price: undefined,
              illustrator: "",
              series: "",
            } as ApiCardNormalized);

          const ownerInfo: TradeOwnerInfo = {
            username,
            quantity,
            condition,
          };

          const existing = grouped.get(tcgId);
          if (!existing) {
            grouped.set(tcgId, {
              ...baseCard,
              owners: [ownerInfo],
            });
          } else {
            existing.owners.push(ownerInfo);
          }
        }

        const merged = Array.from(grouped.values());

        if (!mounted) return;
        setTradeCards(merged);
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTradeCards();
    return () => {
      mounted = false;
    };
  }, [currentUsername]);

  const setsData = React.useMemo(() => {
    let list = [...tradeCards];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const name = c.name || "";
        const set = c.set || "";
        const rarity = c.rarity || "";
        const owners = c.owners || [];
        const priceMid = c.price?.mid;

        const ownerMatch = owners.some((o) =>
          (o.username || "").toLowerCase().includes(q)
        );

        let priceMatch = false;
        if (priceMid != null) {
          const priceStr = priceMid.toFixed(2);
          if (priceStr.includes(q)) priceMatch = true;
        }

        return (
          name.toLowerCase().includes(q) ||
          set.toLowerCase().includes(q) ||
          rarity.toLowerCase().includes(q) ||
          ownerMatch ||
          priceMatch
        );
      });
    }

    const bySet = new Map<string, TradeCard[]>();
    for (const card of list) {
      const setName = card.set || tt("trade.otherSets", "Otros");
      if (!bySet.has(setName)) bySet.set(setName, []);
      bySet.get(setName)!.push(card);
    }

    const getPrice = (c: TradeCard) =>
      c.price?.mid != null ? Number(c.price.mid) : NaN;

    const orderedSetNames = Array.from(bySet.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    for (const setName of orderedSetNames) {
      let cardsInSet = bySet.get(setName)!;
      if (priceOrder === "asc") {
        cardsInSet = [...cardsInSet].sort((a, b) => {
          const pa = getPrice(a);
          const pb = getPrice(b);
          const va = isNaN(pa) ? Infinity : pa;
          const vb = isNaN(pb) ? Infinity : pb;
          return va - vb;
        });
      } else if (priceOrder === "desc") {
        cardsInSet = [...cardsInSet].sort((a, b) => {
          const pa = getPrice(a);
          const pb = getPrice(b);
          const va = isNaN(pa) ? -Infinity : pa;
          const vb = isNaN(pb) ? -Infinity : pb;
          return vb - va;
        });
      } else {
        cardsInSet = [...cardsInSet].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
      }
      bySet.set(setName, cardsInSet);
    }

    return { bySet, orderedSetNames };
  }, [tradeCards, search, priceOrder]);

  const totalSets = setsData.orderedSetNames.length;
  const totalPages = Math.max(1, Math.ceil(totalSets / SETS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startSetIndex = (safePage - 1) * SETS_PER_PAGE;
  const endSetIndex = safePage * SETS_PER_PAGE;
  const pageSetNames = setsData.orderedSetNames.slice(
    startSetIndex,
    endSetIndex
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, priceOrder]);
  const TradeFlipCard = ({
    card,
    onProposeTrade,
  }: {
    card: TradeCard;
    onProposeTrade: (card: TradeCard) => void;
  }) => {
    const [isFlipped, setIsFlipped] = React.useState(false);

    const mainOwner = card.owners[0];
    const extraOwnersCount = card.owners.length - 1;

    const totalQuantity =
      card.owners.reduce((sum, o) => sum + (o.quantity || 0), 0) ||
      card.owners.length;

    const displayNameBack = card.name || "—";
    const displayRarity = card.rarity || "—";
    const displaySet = card.set || "—";
    const displayHP = card.hp || "—";
    const displayIllustrator = card.illustrator || "—";
    const displayPrice =
      card.price && card.price.mid != null
        ? `${Number(card.price.mid).toFixed(2)}€`
        : "—";

    return (
      <div
        className="discover-card-inner"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div className="relative w-full">
          {!isFlipped ? (
            <div className="pokemon-card discover-front-card overflow-hidden cursor-pointer">
              <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                <span className="bg-white/90 rounded-full px-2 py-1 text-xs font-semibold shadow-md flex items-center gap-1">
                  🔁 {tt("trade.available", "Intercambio")}
                </span>
              </div>

              <img
                src={card.image}
                alt={card.name || "card"}
                className="pokemon-card-image"
              />
            </div>
          ) : (
            <div className="pokemon-card-back text-gray-100 dark:bg-gray-800 p-4 min-h-80">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-100">
                    {displayNameBack}
                  </h3>

                  {mainOwner && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {tt("trade.offeredBy", "Ofrecida por")}{" "}
                      <span className="font-semibold">
                        @{mainOwner.username}
                      </span>
                      {extraOwnersCount > 0 && (
                        <>
                          {" "}
                          {tt("trade.andOthers", "y")} {extraOwnersCount}{" "}
                          {extraOwnersCount === 1
                            ? tt("trade.moreUser", "usuario más")
                            : tt("trade.moreUsers", "usuarios más")}
                        </>
                      )}
                    </p>
                  )}

                  {card.owners.length > 1 && (
                    <ul className="text-xs text-gray-600 dark:text-gray-300 mb-3 space-y-1">
                      {card.owners.slice(0, 3).map((o, idx) => (
                        <li key={idx}>
                          • @{o.username} ({o.quantity} uds
                          {o.condition ? `, ${o.condition}` : ""})
                        </li>
                      ))}
                      {card.owners.length > 3 && <li>…</li>}
                    </ul>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {tt("trade.rarity", "Rareza")}
                      </div>
                      <div className="font-semibold text-gray-600 dark:text-gray-100 discover-card-stat-value">
                        {displayRarity}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {tt("trade.set", "Set")}
                      </div>
                      <div className="font-semibold text-gray-600 dark:text-gray-100 discover-card-stat-value">
                        {displaySet}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        HP
                      </div>
                      <div className="font-semibold text-gray-600 dark:text-gray-100 discover-card-stat-value">
                        {displayHP}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {tt("trade.totalQuantity", "Total disponible")}
                      </div>
                      <div className="font-semibold text-gray-600 dark:text-gray-100 discover-card-stat-value">
                        {totalQuantity}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {tt("trade.illustrator", "Ilustrador")}:{" "}
                      {displayIllustrator}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-gray-600">
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-100 discover-price-label">
                          {tt("trade.estimatedPrice", "Precio estimado:")}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 discover-price-value">
                          {displayPrice}
                        </span>
                      </div>
                    </div>

                    <button
                      className="w-full mt-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProposeTrade(card);
                      }}
                    >
                      {tt("trade.startTrade", "Proponer intercambio")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const handleSendTradeRequest = async () => {
    const loggedUser = authService.getUser();
    if (!loggedUser || !authService.isAuthenticated()) {
      window.alert(tt("trade.mustLogin", "Debes iniciar sesión para proponer un intercambio"));
      return;
    }
    if (!selectedCardForTrade || !selectedOwner) return;

    try {
      const base = "http://localhost:3000";

      const resp = await fetch(`${base}/trade-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          receiverIdentifier: selectedOwner,
          pokemonTcgId: selectedCardForTrade.id,
          cardName: selectedCardForTrade.name,
          cardImage: selectedCardForTrade.image,
          note: tradeNote,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(
          data.error || tt("trade.errorSending", "Error enviando solicitud")
        );
      }

      window.alert(tt("trade.requestSent", "Solicitud de intercambio enviada."));
      setSelectedCardForTrade(null);
    } catch (e: any) {
      window.alert(e.message || tt("trade.errorSending", "Error enviando solicitud"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 px-4 py-10 md:px-10 lg:px-16">
        <div className="discover-header">
          <h2 className="featured-title">
            {tt("trade.discoverTitle", "Descubrir cartas de intercambio")}
          </h2>
          <p className="discover-subtitle">
            {tt(
              "trade.discoverSubtitle",
              "Explora las cartas que otros usuarios han marcado como disponibles para intercambio."
            )}
          </p>
        </div>

        <div className="discover-toolbar">
          <div className="discover-search">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tt(
                "trade.searchPlaceholder",
                "Buscar por carta, set, rareza, usuario o precio…"
              )}
              className="discover-search-input"
            />
            <Search className="discover-search-icon" />
          </div>

          <div className="discover-filter-wrapper">
            <button
              type="button"
              className="discover-filter-button"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{tt("trade.filters", "Filtros")}</span>
            </button>

            {showFilters && (
              <div className="discover-filter-panel">
                <label className="discover-filter-label">
                  {tt("trade.sort.label", "Ordenar por precio")}
                </label>
                <select
                  value={priceOrder}
                  onChange={(e) =>
                    setPriceOrder(e.target.value as "" | "asc" | "desc")
                  }
                  className="discover-filter-select"
                >
                  <option value="">
                    {tt("trade.sort.default", "Orden por set / nombre")}
                  </option>
                  <option value="asc">
                    {tt("trade.sort.priceAsc", "Precio: más bajo primero")}
                  </option>
                  <option value="desc">
                    {tt("trade.sort.priceDesc", "Precio: más alto primero")}
                  </option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="discover-sets">
          {loading && (
            <div className="discover-empty">
              {tt("trade.loadingCards", "Cargando cartas de intercambio...")}
            </div>
          )}

          {error && !loading && (
            <div className="discover-error">{error}</div>
          )}

          {!loading && !error && totalSets === 0 && (
            <div className="discover-empty">
              {tt("trade.empty", "No hay cartas de intercambio con esos filtros.")}
            </div>
          )}

          {!loading && !error && totalSets > 0 && (
            <>
              {pageSetNames.map((setName) => {
                const cards = setsData.bySet.get(setName)!;
                return (
                  <section key={setName} className="discover-set-section">
                    <div className="discover-set-header">
                      <h3 className="discover-set-title">{setName}</h3>
                      <span className="discover-set-count">
                        {cards.length}{" "}
                        {cards.length === 1
                          ? tt("trade.card", "carta")
                          : tt("trade.cards", "cartas")}
                      </span>
                    </div>

                    <div className="discover-set-grid">
                      {cards.map((card) => (
                        <div
                          key={`${card.id}-${card.owners
                            .map((o) => o.username)
                            .join(",")}`}
                          className="discover-card-wrapper"
                        >
                          <TradeFlipCard
                            card={card}
                            onProposeTrade={(c) => setSelectedCardForTrade(c)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}

              <div className="discover-pagination">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="CollectionButton"
                >
                  {tt("trade.prev", "Anterior")}
                </button>
                <span className="discover-pagination-info">
                  {safePage} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="CollectionButton"
                >
                  {tt("trade.next", "Siguiente")}
                </button>
              </div>
            </>
          )}
        </div>

        {selectedCardForTrade && (
          <div className="trade-request-overlay">
            <div className="trade-request-panel">
              <div className="trade-request-header">
                <h3>{tt("trade.startTrade", "Proponer intercambio")}</h3>
                <button
                  className="trade-request-close"
                  onClick={() => setSelectedCardForTrade(null)}
                >
                  ✕
                </button>
              </div>

              <div className="trade-request-body">
                <div className="trade-request-card">
                  <img
                    src={selectedCardForTrade.image}
                    alt={selectedCardForTrade.name}
                  />
                  <div className="trade-request-card-info">
                    <p className="trade-request-card-name">
                      {selectedCardForTrade.name}
                    </p>
                    <p className="trade-request-card-set">
                      {selectedCardForTrade.set}
                    </p>
                    <p className="trade-request-card-owners">
                      {tt("trade.availableBy", "Disponible por")}{" "}
                      {selectedCardForTrade.owners.length === 1
                        ? `@${selectedCardForTrade.owners[0].username}`
                        : `${selectedCardForTrade.owners.length} ${tt(
                            "trade.users",
                            "usuarios"
                          )}`}
                    </p>
                  </div>
                </div>

                <div className="trade-request-form">
                  <label className="trade-request-label">
                    {tt(
                      "trade.selectedUser",
                      "Usuario con el que quieres intercambiar"
                    )}
                  </label>
                  <select
                    className="trade-request-select"
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                  >
                    {selectedCardForTrade.owners.map((o) => (
                      <option key={o.username} value={o.username}>
                        @{o.username}{" "}
                        {o.quantity > 1
                          ? `(${o.quantity} ${tt("trade.units", "uds")})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <label className="trade-request-label">
                    {tt(
                      "trade.message",
                      "Carta que ofreces / mensaje"
                    )}
                  </label>
                  <textarea
                    className="trade-request-textarea"
                    value={tradeNote}
                    onChange={(e) => setTradeNote(e.target.value)}
                    placeholder={tt(
                      "trade.messagePlaceholder",
                      "Describe la carta que ofreces o los términos del intercambio…"
                    )}
                  />

                  <div className="trade-request-actions">
                    <button
                      className="trade-request-cancel"
                      type="button"
                      onClick={() => setSelectedCardForTrade(null)}
                    >
                      {tt("trade.cancel", "Cancelar")}
                    </button>
                    <button
                      className="trade-request-submit"
                      type="button"
                      onClick={handleSendTradeRequest}
                    >
                      {tt("trade.send", "Enviar solicitud")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverTradeCards;
