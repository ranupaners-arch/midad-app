/**
 * Bendera demo: untuk build demo/lomba SEMUA opsi companion terbuka (hewan, warna, mata, kepala/leher/tangan, skin semua tingkat)
 * tanpa membeli atau membuka lewat kurma/level. Default ON.
 *
 * Cara mematikan:
 *  - saat build: `VITE_DEMO_UNLOCK_ALL=0 npm run build` (atau `=false`), atau ubah DEFAULT_DEMO_UNLOCK_ALL di bawah;
 *  - saat jalan (uji): tambahkan `?demo=0` di URL, mis. `http://127.0.0.1:4174/?demo=0#/wardrobe` (`?demo=1` memaksa ON).
 *
 * Bendera ini TIDAK mengubah ekonomi asli dan TIDAK menulis apa pun ke localStorage: kepemilikan "efektif" dihitung saat dipakai.
 * Kurma, daftar owned*, dan progres pengguna tetap utuh. Bila bendera dimatikan, tampilan kembali ke aturan asli; pilihan yang
 * dipakai lewat demo dan belum benar-benar dimiliki dikembalikan ke bawaan oleh parseProfile (data tidak rusak).
 */
const env: string | undefined = import.meta.env?.VITE_DEMO_UNLOCK_ALL;
export const DEFAULT_DEMO_UNLOCK_ALL: boolean = env !== '0' && env !== 'false';

export function demoUnlockAll(): boolean {
  try {
    const q = new URLSearchParams(globalThis.location?.search ?? '').get('demo');
    if (q === '0') return false;
    if (q === '1') return true;
  } catch { /* di luar browser: pakai bawaan */ }
  return DEFAULT_DEMO_UNLOCK_ALL;
}
