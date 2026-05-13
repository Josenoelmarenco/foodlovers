import type { Platform } from '../types/api';

interface Props {
  platform: Pick<Platform, 'name' | 'brandColor'>;
  size?: 'sm' | 'md';
}

export function PlatformBadge({ platform, size = 'md' }: Props) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium text-white ${padding}`}
      style={{ backgroundColor: platform.brandColor }}
    >
      {platform.name}
    </span>
  );
}
