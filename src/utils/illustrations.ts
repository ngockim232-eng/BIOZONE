import mascotExplorerImg from '../assets/images/biozone_mascot_explorer_1794571394648.jpg';
import plantCellCuteImg from '../assets/images/biozone_plant_cell_cute_1794571395067.jpg';
import ecosystemCuteImg from '../assets/images/biozone_ecosystem_cute_1794571396089.jpg';
import microscopeCuteImg from '../assets/images/biozone_microscope_cute_1794571396616.jpg';

export const BIOZONE_ILLUSTRATIONS = {
  mascot: mascotExplorerImg,
  plantCell: plantCellCuteImg,
  ecosystem: ecosystemCuteImg,
  microscope: microscopeCuteImg,
};

const ILLUSTRATION_POOL = [
  plantCellCuteImg,
  ecosystemCuteImg,
  microscopeCuteImg,
  mascotExplorerImg,
];

export function getRoomIllustration(codeOrTheme = '', index = 0): string {
  const key = codeOrTheme.toLowerCase();
  if (key.includes('bio') || key.includes('tế bào') || key.includes('sinh học')) {
    return plantCellCuteImg;
  }
  if (key.includes('eco') || key.includes('sinh thái') || key.includes('môi trường') || key.includes('rừng')) {
    return ecosystemCuteImg;
  }
  if (key.includes('stem') || key.includes('kính') || key.includes('vi sinh') || key.includes('thí nghiệm')) {
    return microscopeCuteImg;
  }
  return ILLUSTRATION_POOL[index % ILLUSTRATION_POOL.length];
}

export function getThemeIllustration(themeId: string, index = 0): string {
  switch (themeId) {
    case 'bio-stem':
    case 'arts':
      return plantCellCuteImg;
    case 'environment':
    case 'geography':
      return ecosystemCuteImg;
    case 'stem':
    case 'botany-micro':
    case 'tech':
      return microscopeCuteImg;
    default:
      return ILLUSTRATION_POOL[index % ILLUSTRATION_POOL.length];
  }
}

export function getFallbackProductImage(seed = ''): string {
  const sum = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return ILLUSTRATION_POOL[sum % ILLUSTRATION_POOL.length];
}
