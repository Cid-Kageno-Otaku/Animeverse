const ANILIST = "https://graphql.anilist.co";
const JIKAN = "https://api.jikan.moe/v4";

async function graph(query, variables = {}) {
  const response = await fetch(ANILIST, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables })
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("AniList rate limit reached. Please wait a moment and try again.");
    throw new Error(`AniList request failed (${response.status}).`);
  }
  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "AniList query failed.");
  return json.data;
}

const MEDIA_FIELDS = `
  id idMal
  title { romaji english native }
  coverImage { extraLarge large }
  bannerImage
  description(asHtml: false)
  averageScore meanScore popularity favourites
  episodes status format seasonYear startDate { year month day }
  genres
  studios(isMain: true) { nodes { name } }
  siteUrl
`;

export async function getHomeData() {
  const query = `
    query {
      trending: Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: TRENDING_DESC) { ${MEDIA_FIELDS} }
      }
      popular: Page(page: 1, perPage: 12) {
        media(type: ANIME, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
      }
      seasonal: Page(page: 1, perPage: 12) {
        media(type: ANIME, season: ${currentSeason()}, seasonYear: ${new Date().getFullYear()}, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
      }
    }
  `;
  return graph(query);
}

function currentSeason() {
  const m = new Date().getMonth() + 1;
  if (m <= 3) return "WINTER";
  if (m <= 6) return "SPRING";
  if (m <= 9) return "SUMMER";
  return "FALL";
}

export async function searchAnime(term, page = 1) {
  const query = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 18) {
        pageInfo { currentPage hasNextPage lastPage }
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} }
      }
    }
  `;
  return graph(query, { search: term, page }).then(d => d.Page);
}

export async function searchCharacters(term, page = 1) {
  const query = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 18) {
        pageInfo { currentPage hasNextPage lastPage }
        characters(search: $search, sort: SEARCH_MATCH) {
          id name { full native } image { large }
          description(asHtml: false)
          favourites siteUrl
          media(perPage: 3, sort: POPULARITY_DESC) {
            nodes { id title { romaji english } type }
          }
        }
      }
    }
  `;
  return graph(query, { search: term, page }).then(d => d.Page);
}

export async function getAnimeByGenre(genre, page = 1) {
  const query = `
    query ($genre: String, $page: Int) {
      Page(page: $page, perPage: 18) {
        pageInfo { currentPage hasNextPage lastPage }
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
      }
    }
  `;
  return graph(query, { genre, page }).then(d => d.Page);
}

export async function getAnimeDetail(id) {
  const query = `query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS}
      relations { edges { relationType(version: 2) node { id type title { romaji english } format } } }
      characters(sort: ROLE, perPage: 12) {
        edges { role node { id name { full } image { large } } }
      }
      recommendations(perPage: 6, sort: RATING) {
        nodes { mediaRecommendation { id title { romaji english } coverImage { large } averageScore } }
      }
    }
  }`;
  return graph(query, { id }).then(d => d.Media);
}

export async function getJikanNews(animeId) {
  const response = await fetch(`${JIKAN}/anime/${animeId}/news`);
  if (!response.ok) throw new Error("News source is temporarily unavailable.");
  const data = await response.json();
  return data.data || [];
}

export async function getTopJikan() {
  const response = await fetch(`${JIKAN}/top/anime?limit=12`);
  if (!response.ok) throw new Error("Jikan is temporarily unavailable.");
  const data = await response.json();
  return data.data || [];
}
