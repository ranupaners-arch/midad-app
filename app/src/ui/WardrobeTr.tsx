import data from '../domain/wardrobeTr.json';
import { Tr } from './Common';

/** Terjemahan kecil (ID/EN) di bawah nama dan istilah lemari; tampil mengikuti tombol terjemahan seperti teks lain. */
type Group = 'names' | 'animals' | 'slots' | 'ui';
export function WTr({ group, k }: { group: Group; k: string }) {
  const v = (data[group] as Record<string, { id: string; en: string }>)[k];
  return v ? <Tr text={{ ar: '', ...v }} small /> : null;
}
