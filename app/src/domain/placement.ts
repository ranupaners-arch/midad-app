import source from './placement.json' with { type: 'json' };
import { l, shuffled } from './content';
import type { Choice, Language, Question } from './types';

export function placementQuestions(level: number, language: Language): Question[] {
  return source.items.filter(item => item.marhalah === level).map(item => {
    const { id } = item;
    if (item.type === 'order-words' && item.ar && item.tr) {
      const text = l(item.ar, item.tr.id, item.tr.en);
      const words = item.ar.split(' ');
      const alternatives = id === 't07' ? ['غَدًا سَأُسَافِرُ إِلَى مَالِيزِيَا'] : [];
      return { id, kind: 'order', prompt: l('رَتِّبِ الْكَلِمَاتِ', 'Susun kata menjadi kalimat', 'Put the words in order'), text, words, orderAlternatives: alternatives };
    }
    if (item.type === 'listen-pick') {
      const options = item.options!.filter(option => typeof option !== 'string');
      const correct = options.findIndex(option => option.correct);
      const cue = options[correct];
      const choices: Choice[] = options.map((option, index) => ({ id: String(index), text: option.tr[language], lang: language }));
      return {
        id, kind: 'listen', prompt: l('اِسْتَمِعْ وَاخْتَرِ الْمَعْنَى', 'Dengarkan, lalu pilih artinya', 'Listen and choose the meaning'),
        text: l(cue.ar, cue.tr.id, cue.tr.en), choices: shuffled(choices, 20 + Number(id.slice(1))), answer: String(correct),
      };
    }
    if (item.type === 'match') {
      const pairs = item.pairs!;
      const choices: Choice[] = pairs.map((pair, index) => ({ id: String(index), text: pair.tr[language], lang: language }));
      return {
        id, kind: 'choice', prompt: l('اخْتَرْ مَعْنَى «' + pairs[0].ar + '»', 'Pilih arti «' + pairs[0].ar + '»', 'Choose the meaning of «' + pairs[0].ar + '»'),
        choices: shuffled(choices, 20 + Number(id.slice(1))), answer: '0',
      };
    }
    const choices: Choice[] = item.options!.filter(option => typeof option === 'string').map((option, index) => ({ id: String(index), text: option, lang: 'ar' }));
    return {
      id, kind: 'choice', prompt: l('اخْتَرِ الْجُمْلَةَ الصَّحِيحَةَ', item.prompt!.id, item.prompt!.en),
      choices: shuffled(choices, 20 + Number(id.slice(1))), answer: String(item.answer),
    };
  });
}

export const passesPlacement = (score: number, total: number) => total > 0 && score / total >= 0.7;
