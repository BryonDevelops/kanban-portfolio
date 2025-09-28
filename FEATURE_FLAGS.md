# Feature Flags

This application uses a comprehensive feature flag system to control which features are enabled or disabled. This allows you to easily turn features on/off without code changes.

## How It Works

Feature flags are controlled through environment variables. When a feature is disabled:

1. **Navigation**: Menu items are hidden from the sidebar
2. **Routes**: Accessing disabled routes returns a 404 error
3. **Components**: Certain UI components are conditionally rendered
4. **Analytics**: Tracking and performance monitoring can be disabled

## Configuration

Add these environment variables to your `.env.local` file:

### Core Features

```bash
# Enable/disable main application features
NEXT_PUBLIC_FEATURE_BOARD=true          # Kanban board (/Board)
NEXT_PUBLIC_FEATURE_MICROBLOG=true      # Microblog (/microblog)
NEXT_PUBLIC_FEATURE_PROJECTS=true       # Projects page (/projects)
NEXT_PUBLIC_FEATURE_ABOUT=true          # About page (/about)
NEXT_PUBLIC_FEATURE_CONTACT=true        # Contact page (/contact)
```

### Admin Features

```bash
# Enable/disable administrative features
NEXT_PUBLIC_FEATURE_ADMIN=true              # Admin dashboard (/admin)
NEXT_PUBLIC_FEATURE_USER_MANAGEMENT=true    # User management (/admin/users)
NEXT_PUBLIC_FEATURE_SYSTEM_SETTINGS=true    # System settings (/admin/settings)
```

### Advanced Features

```bash
# Enable/disable advanced functionality
NEXT_PUBLIC_FEATURE_ANALYTICS=true      # Vercel Analytics & Speed Insights
NEXT_PUBLIC_FEATURE_PWA=true             # PWA install prompt
NEXT_PUBLIC_FEATURE_OFFLINE=true         # Offline page (/offline)
```

### Experimental Features

```bash
# Enable/disable experimental features (default: disabled)
NEXT_PUBLIC_FEATURE_AI_ASSISTANT=false  # AI assistant features
NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH=false # Advanced search functionality
```

## Examples

### Disable Microblog Feature

```bash
NEXT_PUBLIC_FEATURE_MICROBLOG=false
```

This will:

- Hide "Microblog" from the sidebar navigation
- Return 404 when accessing `/microblog`
- Prevent any microblog-related components from rendering

### Disable All Admin Features

```bash
NEXT_PUBLIC_FEATURE_ADMIN=false
NEXT_PUBLIC_FEATURE_USER_MANAGEMENT=false
NEXT_PUBLIC_FEATURE_SYSTEM_SETTINGS=false
```

### Enable Experimental Features

```bash
NEXT_PUBLIC_FEATURE_AI_ASSISTANT=true
NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH=true
```

## Default Behavior

If no environment variables are set, all features are **enabled by default**. This ensures the application works out-of-the-box.

## Development

### Testing Feature Flags

You can test feature flags by:

1. Setting environment variables in `.env.local`
2. Restarting the development server
3. Checking that navigation items are hidden
4. Verifying that disabled routes return 404

### Adding New Features

To add a new feature flag:

1. Add the flag to the `FeatureFlags` interface in `lib/feature-flags.ts`
2. Add a default value in `defaultFeatureFlags`
3. Add environment variable loading logic
4. Add route protection in `middleware.ts` if needed
5. Add navigation filtering in `presentation/components/layout/sidebar.ts`
6. Update this documentation

## Production Deployment

Feature flags work the same in production. Set the environment variables in your deployment platform (Vercel, Netlify, etc.) to control features in production.

## Benefits

- **Gradual Rollouts**: Enable features for specific users or environments
- **A/B Testing**: Test new features with subsets of users
- **Maintenance**: Disable broken features without deployments
- **Security**: Disable admin features in public deployments
- **Performance**: Reduce bundle size by disabling unused features
