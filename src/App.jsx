import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Compass, Sparkles, Newspaper, Heart, Menu, X, ChevronLeft,
  ChevronRight, Star, Play, CalendarDays, Layers, UserRound, Flame,
  Globe2, ArrowUpRight, RefreshCw, Filter, Bookmark, ExternalLink
} from "lucide-react";
import { getHomeData, searchAnime, searchCharacters, getAnimeByGenre, getAnimeDetail, getJikanNews, getTopJikan } from "./api";

const GENRES = ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];
const translations = {
  en: {
    home:"Home", discover:"Discover", characters:"Characters", genres:"Genres", news:"Anime News", favorites:"Favorites",
    search:"Search anime, characters, genres...", heroKicker:"YOUR GATEWAY TO ANIME", heroTitle:"Discover your next", heroAccent:"favorite story.", heroText:"Explore thousands of anime, meet unforgettable characters, and find your next obsession.",
    trending:"Trending now", popular:"Popular anime", seasonal:"This season", explore:"Explore anime", seeAll:"See all", searchTitle:"Search the universe", searchHint:"Find anime titles or characters by name.", anime:"Anime", character:"Characters", genre:"Genre", results:"Results", noResults:"No results found. Try another search.", loading:"Loading the anime universe…", retry:"Try again", score:"Score", episodes:"Episodes", year:"Year", studio:"Studio", status:"Status", synopsis:"Synopsis", charactersIn:"Characters", recommendations:"You may also like", readMore:"Read more", saved:"Saved", save:"Save", remove:"Remove", newsHint:"Recent articles from Jikan's anime news feed.", topRated:"Top rated", random:"Surprise me", viewDetails:"View details", prev:"Previous", next:"Next", footer:"Made for anime fans, by anime fans.", apiNote:"Data provided by AniList and Jikan.", emptyFav:"Your list is waiting for its first anime.", searchPlaceholder:"Type at least 2 characters…", allGenres:"Choose a genre", animeNews:"Latest anime updates", noNews:"No recent articles found for this title.", openSource:"Open source", airing:"Airing", finished:"Finished", notYet:"Not yet aired", unknown:"Unknown", language:"Language"
  },
  fa: {
    home:"خانه", discover:"کشف انیمه", characters:"شخصیت‌ها", genres:"ژانرها", news:"اخبار انیمه", favorites:"علاقه‌مندی‌ها",
    search:"جستجوی انیمه، شخصیت یا ژانر...", heroKicker:"دروازه ورود به دنیای انیمه", heroTitle:"داستان موردعلاقه بعدی‌ات را", heroAccent:"کشف کن.", heroText:"هزاران انیمه را بگرد، با شخصیت‌های فراموش‌نشدنی آشنا شو و انیمه بعدی‌ات را پیدا کن.",
    trending:"محبوب‌های داغ", popular:"محبوب‌ترین انیمه‌ها", seasonal:"فصل جاری", explore:"کاوش در انیمه‌ها", seeAll:"مشاهده همه", searchTitle:"در جهان انیمه جستجو کن", searchHint:"نام انیمه یا شخصیت موردنظرت را وارد کن.", anime:"انیمه", character:"شخصیت‌ها", genre:"ژانر", results:"نتایج", noResults:"نتیجه‌ای پیدا نشد. عبارت دیگری را امتحان کن.", loading:"در حال بارگذاری دنیای انیمه…", retry:"تلاش دوباره", score:"امتیاز", episodes:"قسمت", year:"سال", studio:"استودیو", status:"وضعیت", synopsis:"خلاصه داستان", charactersIn:"شخصیت‌ها", recommendations:"شاید این‌ها را هم دوست داشته باشی", readMore:"ادامه مطلب", saved:"ذخیره شد", save:"ذخیره", remove:"حذف", newsHint:"خبرهای تازه از فید خبری Jikan.", topRated:"بالاترین امتیاز", random:"یه چیزی پیشنهاد بده", viewDetails:"جزئیات", prev:"قبلی", next:"بعدی", footer:"ساخته‌شده برای طرفداران انیمه.", apiNote:"اطلاعات از AniList و Jikan دریافت می‌شود.", emptyFav:"هنوز انیمه‌ای به فهرستت اضافه نکرده‌ای.", searchPlaceholder:"حداقل دو حرف وارد کن…", allGenres:"یک ژانر انتخاب کن", animeNews:"آخرین خبرهای انیمه", noNews:"خبر تازه‌ای برای این عنوان پیدا نشد.", openSource:"مشاهده منبع", airing:"در حال پخش", finished:"پایان‌یافته", notYet:"هنوز پخش نشده", unknown:"نامشخص", language:"زبان"
  }
};

function titleOf(item, lang) {
  return item?.title?.english || item?.title?.romaji || item?.title?.native || "Untitled";
}
function statusText(status, t) {
  return ({ RELEASING:t.airing, FINISHED:t.finished, NOT_YET_RELEASED:t.notYet })[status] || t.unknown;
}
function cleanDescription(text = "") {
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&amp;/g,"&").replace(/&#039;/g,"'").replace(/&quot;/g,'"');
}

function Poster({ item, onClick, saved, onSave, lang }) {
  const t = translations[lang];
  const image = item?.coverImage?.large || item?.coverImage?.extraLarge || item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url;
  const title = item?.title ? titleOf(item, lang) : item?.title || item?.name || "Unknown";
  const score = item?.averageScore ? (item.averageScore / 10).toFixed(1) : item?.score;
  return <article className="poster-card">
    <button className="poster-image" onClick={onClick} aria-label={title}>
      {image ? <img src={image} alt={title} loading="lazy" /> : <div className="poster-placeholder"><Sparkles size={30}/></div>}
      <span className="poster-overlay"><span><Play size={15} fill="currentColor"/> {t.viewDetails}</span></span>
      {score && <span className="score-pill"><Star size={12} fill="currentColor"/> {score}</span>}
    </button>
    <div className="poster-info">
      <div className="poster-title-row"><button className="poster-title" onClick={onClick}>{title}</button>
      <button className={`save-mini ${saved ? "active":""}`} onClick={onSave} title={saved ? t.remove : t.save}><Heart size={16} fill={saved ? "currentColor":"none"}/></button></div>
      <div className="poster-meta">{item?.seasonYear || item?.year || item?.aired?.prop?.from?.year || "—"} <span>•</span> {item?.episodes ? `${item.episodes} ${t.episodes}` : item?.type || "TV"}</div>
    </div>
  </article>;
}

function Section({ title, subtitle, children, onSeeAll, t }) {
  return <section className="content-section">
    <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {onSeeAll && <button className="text-link" onClick={onSeeAll}>{t.seeAll} <ArrowUpRight size={15}/></button>}
    </div>
    {children}
  </section>;
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("av-lang") || "en");
  const [page, setPage] = useState("home");
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("anime");
  const [results, setResults] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [resultPage, setResultPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("av-favorites") || "[]"));
  const [news, setNews] = useState([]);
  const [newsBusy, setNewsBusy] = useState(false);
  const [newsLoaded, setNewsLoaded] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const t = translations[lang];
  const rtl = lang === "fa";

  useEffect(() => { localStorage.setItem("av-lang", lang); document.documentElement.lang = lang; document.documentElement.dir = rtl ? "rtl":"ltr"; }, [lang, rtl]);
  useEffect(() => { localStorage.setItem("av-favorites", JSON.stringify(favorites)); }, [favorites]);

  async function loadHome() {
    setLoading(true); setError("");
    try { setHome(await getHomeData()); }
    catch (e) { setError(e.message || "Could not load catalog."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadHome(); }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map(x => x.id)), [favorites]);
  function toggleFavorite(item) {
    setFavorites(old => old.some(x => x.id === item.id) ? old.filter(x => x.id !== item.id) : [...old, {
      id:item.id, title:item.title, coverImage:item.coverImage, averageScore:item.averageScore, seasonYear:item.seasonYear, episodes:item.episodes, siteUrl:item.siteUrl
    }]);
  }

  async function openDetail(item) {
    if (!item?.id) return;
    setDetailLoading(true); setDetail(item);
    try { setDetail(await getAnimeDetail(item.id)); }
    catch { setDetail(item); }
    finally { setDetailLoading(false); }
  }

  async function runSearch(term = query, type = searchType, p = 1) {
    if (!term.trim()) return;
    setPage("search"); setBusy(true); setError(""); setResultPage(p);
    try {
      const data = type === "character" ? await searchCharacters(term.trim(), p) : await searchAnime(term.trim(), p);
      setResults(type === "character" ? data.characters : data.media);
      setPageInfo(data.pageInfo);
    } catch (e) { setError(e.message); setResults([]); }
    finally { setBusy(false); }
  }

  async function chooseGenre(genre, p = 1) {
    setSelectedGenre(genre); setPage("genre"); setBusy(true); setError(""); setResultPage(p);
    try { const data = await getAnimeByGenre(genre, p); setResults(data.media); setPageInfo(data.pageInfo); }
    catch (e) { setError(e.message); setResults([]); }
    finally { setBusy(false); }
  }

  async function loadNews() {
    if (newsLoaded || newsBusy) return;
    setNewsBusy(true);
    try {
      const top = await getTopJikan();
      const candidates = top.slice(0, 5);
      const batches = await Promise.all(candidates.map(async a => {
        try { return (await getJikanNews(a.mal_id)).map(n => ({...n, animeTitle:a.title, animeImage:a.images?.jpg?.image_url})); }
        catch { return []; }
      }));
      const merged = batches.flat().sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0, 18);
      setNews(merged); setNewsLoaded(true);
    } catch (e) { setError(e.message); }
    finally { setNewsBusy(false); }
  }

  function navigate(next) { setPage(next); setMobileMenu(false); setError(""); if (next === "news") loadNews(); }
  function randomAnime() {
    const pool = home?.trending?.media || home?.popular?.media || [];
    if (pool.length) openDetail(pool[Math.floor(Math.random()*pool.length)]);
  }

  const navItems = [
    ["home",t.home,Compass],["discover",t.discover,Search],["characters",t.characters,UserRound],
    ["genres",t.genres,Layers],["news",t.news,Newspaper],["favorites",t.favorites,Heart]
  ];

  function renderGrid(items, characterMode = false) {
    if (!items?.length) return <div className="empty-state"><Search size={28}/><p>{t.noResults}</p></div>;
    return <div className="poster-grid">{items.map(item => characterMode ? <article className="character-card" key={item.id}>
      <img src={item.image?.large} alt={item.name?.full} loading="lazy"/>
      <div className="character-copy"><h3>{item.name?.full}</h3><p>{(item.media?.nodes || []).map(m => m.title.english || m.title.romaji).filter(Boolean).join(" · ")}</p>
      {item.siteUrl && <a href={item.siteUrl} target="_blank" rel="noreferrer">{t.openSource} <ExternalLink size={13}/></a>}</div>
    </article> : <Poster key={item.id} item={item} lang={lang} saved={favoriteIds.has(item.id)} onSave={() => toggleFavorite(item)} onClick={() => openDetail(item)}/>)}</div>;
  }

  return <div className={`app-shell ${rtl ? "rtl":""}`}>
    <aside className={`sidebar ${mobileMenu ? "show":""}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><span>ANIME<span className="brand-accent">VERSE</span></span><button className="mobile-close" onClick={()=>setMobileMenu(false)}><X/></button></div>
      <div className="side-label">{rtl ? "منو":"MENU"}</div>
      <nav>{navItems.map(([id,label,Icon]) => <button key={id} className={`nav-item ${page===id ? "selected":""}`} onClick={()=>navigate(id)}><Icon size={18}/><span>{label}</span>{id==="favorites" && favorites.length>0 && <small>{favorites.length}</small>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="side-promo"><div className="promo-icon"><Flame size={18}/></div><strong>{rtl ? "دنیای انیمه منتظرته":"The anime world awaits"}</strong><p>{rtl ? "ماجراجویی بعدی‌ات را پیدا کن.":"Find your next adventure."}</p><button onClick={randomAnime}>{t.random} <ArrowUpRight size={14}/></button></div>
        <div className="sidebar-foot">ANIMEVERSE <span>v1.0</span></div>
      </div>
    </aside>

    {mobileMenu && <button className="scrim" onClick={()=>setMobileMenu(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMobileMenu(true)}><Menu/></button>
        <div className="breadcrumb"><span>ANIMEVERSE</span><ChevronRight size={14}/><strong>{navItems.find(n=>n[0]===page)?.[1] || (page==="genre"?selectedGenre:t.discover)}</strong></div>
        <div className="top-actions">
          <button className="language-btn" onClick={()=>setLang(lang==="en"?"fa":"en")}><Globe2 size={16}/>{lang==="en"?"فارسی":"English"}</button>
          <button className="avatar" onClick={()=>navigate("favorites")} title={t.favorites}><Heart size={17}/></button>
        </div>
      </header>

      <div className="page-content">
        {page==="home" && <>
          <section className="hero">
            <div className="hero-content"><div className="eyebrow"><span className="eyebrow-dot"/> {t.heroKicker}</div>
              <h1>{t.heroTitle}<br/><em>{t.heroAccent}</em></h1><p>{t.heroText}</p>
              <div className="hero-actions"><button className="primary-btn" onClick={()=>navigate("discover")}><Search size={17}/>{t.explore}</button><button className="ghost-btn" onClick={randomAnime}><Sparkles size={17}/>{t.random}</button></div>
            </div>
            <div className="hero-art"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-glow"/><div className="hero-poster hero-poster-back">{home?.trending?.media?.[2]?.coverImage?.extraLarge && <img src={home.trending.media[2].coverImage.extraLarge}/>}</div><div className="hero-poster hero-poster-front">{home?.trending?.media?.[0]?.coverImage?.extraLarge && <img src={home.trending.media[0].coverImage.extraLarge}/>}</div><div className="floating-tag"><Sparkles size={14}/> ANIME DISCOVERY</div></div>
          </section>
          <div className="quick-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runSearch()} placeholder={t.search}/><button onClick={()=>runSearch()}>{t.discover}</button></div>
          {error && <div className="error-banner">{error}<button onClick={loadHome}>{t.retry}</button></div>}
          {loading ? <Loading text={t.loading}/> : <>
            <Section title={t.trending} subtitle={rtl?"انیمه‌هایی که همین حالا همه درباره‌شان صحبت می‌کنند":"What everyone is watching right now"} onSeeAll={()=>navigate("discover")} t={t}>
              {renderGrid(home?.trending?.media?.slice(0,6))}
            </Section>
            <Section title={t.popular} subtitle={rtl?"انتخاب‌های محبوب طرفداران":"Fan favorites across the anime universe"} onSeeAll={()=>navigate("discover")} t={t}>
              {renderGrid(home?.popular?.media?.slice(0,6))}
            </Section>
            <Section title={t.seasonal} subtitle={rtl?"تازه‌های فصل جاری":"Currently airing and upcoming"} onSeeAll={()=>navigate("discover")} t={t}>
              {renderGrid(home?.seasonal?.media?.slice(0,6))}
            </Section>
          </>}
        </>}

        {(page==="discover" || page==="search") && <section className="listing-page">
          <PageTitle kicker="DISCOVER" title={t.searchTitle} subtitle={t.searchHint}/>
          <div className="search-panel"><div className="search-field"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runSearch()} placeholder={t.searchPlaceholder}/><button onClick={()=>runSearch()}>{t.discover}</button></div>
            <div className="filter-tabs"><button className={searchType==="anime"?"active":""} onClick={()=>setSearchType("anime")}>{t.anime}</button><button className={searchType==="character"?"active":""} onClick={()=>setSearchType("character")}>{t.characters}</button></div></div>
          {busy ? <Loading text={t.loading}/> : <><div className="results-head"><h2>{t.results}</h2>{pageInfo && <span>{pageInfo.currentPage} / {pageInfo.lastPage}</span>}</div>{error ? <ErrorBox error={error} retry={()=>runSearch()}/> : renderGrid(results,searchType==="character")}{pageInfo && <Pagination pageInfo={pageInfo} page={resultPage} onChange={p=>runSearch(query,searchType,p)} t={t}/>}</>}
        </section>}

        {page==="characters" && <section className="listing-page"><PageTitle kicker="CHARACTER DATABASE" title={t.characters} subtitle={t.searchHint}/><div className="search-panel"><div className="search-field"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runSearch(query,"character")} placeholder={t.searchPlaceholder}/><button onClick={()=>{setSearchType("character");runSearch(query,"character");}}>{t.discover}</button></div></div>{busy?<Loading text={t.loading}/>:renderGrid(results,true)}</section>}

        {page==="genres" && <section className="listing-page"><PageTitle kicker="EXPLORE BY MOOD" title={t.genres} subtitle={rtl?"حال‌وهوای موردعلاقه‌ات را انتخاب کن":"Pick a mood and find your next watch."}/><div className="genre-grid">{GENRES.map((g,i)=><button key={g} className={`genre-chip genre-${i%6} ${selectedGenre===g?"active":""}`} onClick={()=>chooseGenre(g)}><span>{["⚔️","🧭","😂","🎭","✨","🌙"][i%6]}</span>{g}<ArrowUpRight size={15}/></button>)}</div>{selectedGenre && <div className="genre-results"><div className="results-head"><h2>{selectedGenre}</h2>{pageInfo && <span>{pageInfo.currentPage} / {pageInfo.lastPage}</span>}</div>{busy?<Loading text={t.loading}/>:renderGrid(results)}{pageInfo&&<Pagination pageInfo={pageInfo} page={resultPage} onChange={p=>chooseGenre(selectedGenre,p)} t={t}/>}</div>}</section>}

        {page==="favorites" && <section className="listing-page"><PageTitle kicker="YOUR COLLECTION" title={t.favorites} subtitle={rtl?"انیمه‌هایی که برای بعد ذخیره کرده‌ای":"Your personal watchlist, saved in this browser."}/>{favorites.length ? <div className="poster-grid">{favorites.map(item=><Poster key={item.id} item={item} lang={lang} saved onSave={()=>toggleFavorite(item)} onClick={()=>openDetail(item)}/>)}</div> : <div className="empty-state large"><Heart size={34}/><h3>{t.emptyFav}</h3><button className="primary-btn" onClick={()=>navigate("discover")}>{t.explore}</button></div>}</section>}

        {page==="news" && <section className="listing-page"><PageTitle kicker="THE LATEST" title={t.animeNews} subtitle={t.newsHint}/>{newsBusy?<Loading text={t.loading}/>:error?<ErrorBox error={error} retry={()=>{setNewsLoaded(false);loadNews();}}/>:news.length ? <div className="news-grid">{news.map((n,i)=><article className="news-card" key={n.mal_id || i}><div className="news-image">{n.animeImage?<img src={n.animeImage} alt=""/>:<div className="poster-placeholder"><Newspaper/></div>}<span>{n.animeTitle}</span></div><div className="news-copy"><small>{n.date ? new Date(n.date).toLocaleDateString(lang==="fa"?"fa-IR":"en-US"):""}</small><h3>{n.title}</h3><p>{n.excerpt || n.title}</p><a href={n.url} target="_blank" rel="noreferrer">{t.readMore} <ExternalLink size={14}/></a></div></article>)}</div>:<div className="empty-state"><Newspaper/><p>{t.noNews}</p><button className="ghost-btn" onClick={()=>{setNewsLoaded(false);loadNews();}}><RefreshCw size={15}/>{t.retry}</button></div>}</section>}
      </div>
      <footer className="footer"><span>© 2026 ANIMEVERSE</span><span>{t.footer}</span><span>{t.apiNote}</span></footer>
    </main>

    {detail && <div className="modal-backdrop" onClick={()=>setDetail(null)}><section className="detail-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={()=>setDetail(null)}><X/></button>
      <div className="detail-banner" style={{backgroundImage:`linear-gradient(0deg,#11111b 0%,rgba(17,17,27,.25) 100%),url(${detail.bannerImage || detail.coverImage?.extraLarge || ""})`}}/>
      <div className="detail-main">
        <img className="detail-cover" src={detail.coverImage?.extraLarge || detail.coverImage?.large} alt=""/>
        <div className="detail-title-block"><div className="eyebrow"><span className="eyebrow-dot"/>{detail.format || "ANIME"} · {detail.seasonYear || "—"}</div><h2>{titleOf(detail,lang)}</h2><p className="native-title">{detail.title?.native || detail.title?.romaji}</p><div className="detail-actions"><button className="primary-btn" onClick={()=>toggleFavorite(detail)}><Heart size={16} fill={favoriteIds.has(detail.id)?"currentColor":"none"}/>{favoriteIds.has(detail.id)?t.saved:t.save}</button>{detail.siteUrl&&<a className="ghost-btn" href={detail.siteUrl} target="_blank" rel="noreferrer">{t.openSource}<ExternalLink size={14}/></a>}</div></div>
      </div>
      <div className="detail-stats">{[[Star,t.score,detail.averageScore?`${(detail.averageScore/10).toFixed(1)} / 10`:"—"],[Play,t.episodes,detail.episodes ?? "—"],[CalendarDays,t.year,detail.seasonYear ?? "—"],[Layers,t.status,statusText(detail.status,t)]].map(([I,l,v])=><div key={l}><I size={16}/><small>{l}</small><strong>{v}</strong></div>)}</div>
      <div className="detail-body"><div><h3>{t.synopsis}</h3><p className="synopsis">{cleanDescription(detail.description) || t.unknown}</p><div className="detail-genres">{detail.genres?.map(g=><span key={g}>{g}</span>)}</div>{detail.studios?.nodes?.length>0&&<p className="studio-line"><b>{t.studio}:</b> {detail.studios.nodes.map(s=>s.name).join(", ")}</p>}</div>
      {detail.characters?.edges?.length>0&&<div><h3>{t.charactersIn}</h3><div className="mini-characters">{detail.characters.edges.slice(0,8).map(({node})=><div key={node.id}><img src={node.image?.large} alt=""/><span>{node.name.full}</span></div>)}</div></div>}
      </div>
      {detailLoading&&<div className="detail-loading">{t.loading}</div>}
    </section></div>}
  </div>;
}

function PageTitle({kicker,title,subtitle}) { return <div className="page-title"><div className="eyebrow"><span className="eyebrow-dot"/>{kicker}</div><h1>{title}</h1><p>{subtitle}</p></div>; }
function Loading({text}) { return <div className="loading-state"><div className="loader"/><p>{text}</p></div>; }
function ErrorBox({error,retry}) { return <div className="error-banner">{error}<button onClick={retry}>Retry</button></div>; }
function Pagination({pageInfo,page,onChange,t}) { return <div className="pagination"><button disabled={page<=1} onClick={()=>onChange(page-1)}><ChevronLeft size={16}/>{t.prev}</button><span>{page} / {pageInfo.lastPage}</span><button disabled={!pageInfo.hasNextPage} onClick={()=>onChange(page+1)}>{t.next}<ChevronRight size={16}/></button></div>; }
