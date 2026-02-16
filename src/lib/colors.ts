export function getColorHex(name: string): string {
  const map: Record<string, string> = {
    'Black': '#0F0A0B',
    'White': '#FDF8EC',
    'Navy': '#1B2A4A',
    'Cream': '#FDF8EC',
    'Sage': '#8B9E84',
    'Terracotta': '#C4795A',
    'Charcoal': '#2C2420',
    'Dusty Rose': '#C4636B',
    'Camel': '#BFA88E',
    'Olive': '#6B7C3F',
    'Burgundy': '#5B0E14',
    'Stone': '#E8D5B8',
    'Forest Green': '#2C5F2D',
    'Mauve': '#B57B9E',
    'Indigo': '#3F51B5',
    'Gold': '#F1E194',
    'Wine': '#8B2E35',
    'Rosewood': '#4A1A20',
    'Ivory': '#FDF8EC',
  }
  return map[name] || '#BFA88E'
}
