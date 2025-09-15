import type { Meta, StoryObj } from '@storybook/nextjs'
import Card from './Card'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    project: {
      id: '1',
      title: 'Sample Project',
      description: 'Optional description',
      status: 'idea'
    },
    fromCol: 'ideas',
    index: 0,
  },
}
