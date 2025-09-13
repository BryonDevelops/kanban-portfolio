import { render, screen } from '@testing-library/react'
import Card from '../components/Card'

describe('Card', () => {
  it('renders a task title', () => {
    render(<Card task={{ id: '1', title: 'Test Task' }} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })
})
