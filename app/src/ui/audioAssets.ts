const recordings = import.meta.glob<string>('../assets/audio/*/*.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
});

export function recordingFor(key?: string): string | undefined {
  return key ? recordings[`../assets/audio/${key}.mp3`] : undefined;
}
