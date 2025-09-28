// Test script to verify feature flag filtering
import { getFeatureFlags } from '../lib/feature-flags';
import { sidebarConfig } from '../presentation/components/layout/sidebar';

// Helper function to filter navigation items based on feature flags
function getFilteredNavItems(items: typeof sidebarConfig.navMain) {
  const flags = getFeatureFlags();
  return items.filter(item => {
    if (!item.featureFlag) return true; // No feature flag means always show
    return flags[item.featureFlag as keyof typeof flags] === true;
  });
}

console.log('Feature Flags:', getFeatureFlags());
console.log('All Nav Items:', sidebarConfig.navMain.map(item => ({ title: item.title, featureFlag: item.featureFlag })));
console.log('Filtered Nav Items:', getFilteredNavItems(sidebarConfig.navMain).map(item => ({ title: item.title, featureFlag: item.featureFlag })));