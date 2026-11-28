// URL gambar latar dan emoji (dibundel oleh Vite, masuk precache; tanpa jaringan).
const scenes = import.meta.glob<string>('../assets/vocab/*.webp', { eager: true, import: 'default', query: '?url' });
const emojis = import.meta.glob<string>('../assets/emoji/*.svg', { eager: true, import: 'default', query: '?url' });

export const sceneUrl = (scene: string): string | undefined => scenes[`../assets/vocab/${scene}.webp`];
export const emojiUrl = (name: string): string | undefined => emojis[`../assets/emoji/${name}.svg`];
