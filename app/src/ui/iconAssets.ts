// Ikon raster kurma/lentera (WebP, dibundel Vite dan masuk precache; tanpa jaringan). Kunci = nama ikon di Icon.tsx.
const files = import.meta.glob<string>('../assets/icons/*.webp', { eager: true, import: 'default', query: '?url' });

export const iconImageUrl = (name: string): string | undefined => files[`../assets/icons/${name}.webp`];
