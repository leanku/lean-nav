import { ref, computed } from 'vue'

const FAV_KEY = 'leannav:favorites:v1'
const RECENT_KEY = 'leannav:recent:v1'
const MAX_RECENT = 8

const state = {
  favorites: ref([]),
  recent: ref([]),
  ready: ref(false),
}

function read(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value)
      ? value.filter((site) => site && site.url && site.title).map((site) => ({
          title: String(site.title).slice(0, 60),
          url: String(site.url),
          desc: String(site.desc || '').slice(0, 120),
        }))
      : []
  } catch (error) {
    return []
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (error) {}
}

export function useFavorites() {
  const { favorites, recent, ready } = state

  function init() {
    if (ready.value || typeof window === 'undefined') return
    favorites.value = read(FAV_KEY)
    recent.value = read(RECENT_KEY)
    ready.value = true
  }

  const favoriteUrls = computed(() => new Set(favorites.value.map((site) => site.url)))
  const isFavorite = (url) => favoriteUrls.value.has(url)

  function toggle(site) {
    init()
    if (isFavorite(site.url)) favorites.value = favorites.value.filter((item) => item.url !== site.url)
    else favorites.value = [{ title: site.title, url: site.url, desc: site.desc || '' }, ...favorites.value]
    write(FAV_KEY, favorites.value)
  }

  function remove(url) {
    favorites.value = favorites.value.filter((item) => item.url !== url)
    write(FAV_KEY, favorites.value)
  }

  function recordVisit(site) {
    init()
    recent.value = [
      { title: site.title, url: site.url, desc: site.desc || '' },
      ...recent.value.filter((item) => item.url !== site.url),
    ].slice(0, MAX_RECENT)
    write(RECENT_KEY, recent.value)
  }

  return { favorites, recent, init, isFavorite, toggle, remove, recordVisit }
}
