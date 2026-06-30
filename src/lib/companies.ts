export type { Company } from '../data/companies';
export { companies, getCompany, getAllSlugs, getComparisons } from '../data/companies';
import { companies } from '../data/companies';

export function getCompanies() {
  return companies;
}

// Update these keys/labels to match the service categories in your niche
export const SERVICE_LABELS: Record<string, string> = {
  'custom-build':   'Custom Build',
  'consulting':     'Consulting',
  'integration':    'Integration',
  'staff-aug':      'Staff Aug',
  'fixed-price':    'Fixed Price',
  'dedicated-team': 'Dedicated Team',
};
