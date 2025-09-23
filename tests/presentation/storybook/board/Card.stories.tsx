import type { Meta, StoryObj } from '@storybook/nextjs'
import Card from '../../../../presentation/components/features/board/Card'
import { Project } from '../../../../domain/board/schemas/project.schema'


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
      status: 'idea',
      technologies: [],
      tags: [],
      tasks: []
    },
    fromCol: 'ideas',
    index: 0,
  },
}
