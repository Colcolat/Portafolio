// Original day/night pixel art supplied by Juan. Never infer day/night from a clock.
export const developerRoomArtwork = Object.freeze({
  light: Object.freeze({ file: 'images/developer-desk-day.png', width: 1024, height: 765, light: 'sunlight', caption: 'A little sunlight on the workbench.' }),
  dark: Object.freeze({ file: 'images/developer-desk-night.jpg', width: 2400, height: 1792, light: 'moonlight', caption: 'A little moonlight on the workbench.' }),
});

export function developerRoomScene(theme, baseURL = '/') {
  const appearance = theme === 'dark' ? 'dark' : 'light';
  const artwork = developerRoomArtwork[appearance];
  return { ...artwork, theme: appearance, src: `${String(baseURL || '/').replace(/\/?$/, '/')}${artwork.file}` };
}
