import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/presentation/components/shared/theme-provider'
import { ModeToggle } from '@/presentation/components/shared/mode-toggle'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark', 'system']
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ThemeProvider: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <div {...props}>{children}</div>
}))

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})

describe('ModeToggle', () => {
  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )

    // Check if the toggle button is rendered
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })
})