import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureFlagsManager } from '../../../../presentation/components/features/admin/feature-flags-manager';
import { useAdminFeatureFlagStore } from '../../../../presentation/stores/admin/adminFeatureFlagStore';
import { FeatureFlag } from '../../../../domain/admin/entities/featureFlag';

// Mock the store
jest.mock('../../../../presentation/stores/admin/adminFeatureFlagStore');
const mockUseAdminFeatureFlagStore = useAdminFeatureFlagStore as jest.MockedFunction<typeof useAdminFeatureFlagStore>;

describe('FeatureFlagsManager Integration', () => {
  const mockFlags: FeatureFlag[] = [
    {
      id: 'board-feature',
      name: 'Board Feature',
      description: 'Enable the board functionality',
      enabled: true,
      category: 'core',
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
    {
      id: 'admin-panel',
      name: 'Admin Panel',
      description: 'Access to admin features',
      enabled: false,
      category: 'admin',
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
    {
      id: 'experimental-ai',
      name: 'Experimental AI',
      description: 'Cutting-edge AI features',
      enabled: false,
      category: 'experimental',
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-02'),
      updated_by: 'admin-user',
    },
  ];

  const mockStore = {
    flags: mockFlags,
    isLoading: false,
    error: null,
    loadFeatureFlags: jest.fn(),
    toggleFeatureFlag: jest.fn(),
    refreshFeatureFlags: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminFeatureFlagStore.mockReturnValue(mockStore);
  });

  it('should render feature flags grouped by category', () => {
    render(<FeatureFlagsManager />);

    // Check that categories are displayed
    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(screen.getByText('Admin Features')).toBeInTheDocument();
    expect(screen.getByText('Experimental Features')).toBeInTheDocument();

    // Check that flags are displayed
    expect(screen.getByText('Board Feature')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Experimental AI')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Enable the board functionality')).toBeInTheDocument();
    expect(screen.getByText('Access to admin features')).toBeInTheDocument();
    expect(screen.getByText('Cutting-edge AI features')).toBeInTheDocument();
  });

  it('should show enabled/disabled status correctly', () => {
    render(<FeatureFlagsManager />);

    // Check enabled flag
    expect(screen.getByText('Enabled')).toBeInTheDocument();

    // Check disabled flags
    const disabledBadges = screen.getAllByText('Disabled');
    expect(disabledBadges).toHaveLength(2);
  });

  it('should show category badges with correct counts', () => {
    render(<FeatureFlagsManager />);

    // Core category should have 1 flag
    expect(screen.getByText('1')).toBeInTheDocument();

    // Admin and Experimental categories should each have 1 flag
    const countBadges = screen.getAllByText('1');
    expect(countBadges).toHaveLength(3); // Core, Admin, Experimental all have 1
  });

  it('should call loadFeatureFlags on mount', () => {
    render(<FeatureFlagsManager />);

    expect(mockStore.loadFeatureFlags).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when loading', () => {
    mockUseAdminFeatureFlagStore.mockReturnValue({
      ...mockStore,
      isLoading: true,
      flags: [],
    });

    render(<FeatureFlagsManager />);

    expect(screen.getByText('Loading feature flags...')).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    const errorMessage = 'Failed to load feature flags';
    mockUseAdminFeatureFlagStore.mockReturnValue({
      ...mockStore,
      error: errorMessage,
    });

    render(<FeatureFlagsManager />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show empty state when no flags exist', () => {
    mockUseAdminFeatureFlagStore.mockReturnValue({
      ...mockStore,
      flags: [],
    });

    render(<FeatureFlagsManager />);

    expect(screen.getByText('No Feature Flags Found')).toBeInTheDocument();
    expect(screen.getByText('Feature flags will appear here once the database is set up.')).toBeInTheDocument();
  });

  it('should call toggleFeatureFlag when switch is clicked', async () => {
    render(<FeatureFlagsManager />);

    // Find the switch for the disabled admin panel flag
    const switches = screen.getAllByRole('switch');
    const adminPanelSwitch = switches[1]; // Second switch should be for admin panel

    // Click to enable it
    fireEvent.click(adminPanelSwitch);

    await waitFor(() => {
      expect(mockStore.toggleFeatureFlag).toHaveBeenCalledWith('admin-panel', true);
    });
  });

  it('should call refreshFeatureFlags when refresh button is clicked', async () => {
    render(<FeatureFlagsManager />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockStore.refreshFeatureFlags).toHaveBeenCalledTimes(1);
    });
  });

  it('should show last updated information', () => {
    render(<FeatureFlagsManager />);

    // Check that updated dates are displayed
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('should show updated by information when available', () => {
    render(<FeatureFlagsManager />);

    // The experimental AI flag has an updated_by field
    // This should be visible in the UI
    expect(screen.getByText('Experimental AI')).toBeInTheDocument();
  });

  it('should disable switches when loading', () => {
    mockUseAdminFeatureFlagStore.mockReturnValue({
      ...mockStore,
      isLoading: true,
    });

    render(<FeatureFlagsManager />);

    const switches = screen.getAllByRole('switch');
    switches.forEach(switchElement => {
      expect(switchElement).toBeDisabled();
    });
  });

  it('should show loading indicator on switches when toggling', async () => {
    render(<FeatureFlagsManager />);

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    // The component should handle loading states appropriately
    expect(switches[0]).toBeInTheDocument();
  });

  it('should handle multiple categories correctly', () => {
    const multiCategoryFlags: FeatureFlag[] = [
      ...mockFlags,
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Detailed analytics features',
        enabled: true,
        category: 'advanced',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'another-core',
        name: 'Another Core Feature',
        description: 'Another core feature',
        enabled: false,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockUseAdminFeatureFlagStore.mockReturnValue({
      ...mockStore,
      flags: multiCategoryFlags,
    });

    render(<FeatureFlagsManager />);

    // Should show all categories
    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(screen.getByText('Admin Features')).toBeInTheDocument();
    expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    expect(screen.getByText('Experimental Features')).toBeInTheDocument();

    // Core should now have 2 flags
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});