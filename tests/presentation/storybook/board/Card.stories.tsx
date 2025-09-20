import type { Meta, StoryObj } from '@storybook/nextjs'
<<<<<<<< HEAD:tests/presentation/stories/.storybook/board/Card.stories.tsx
import Card from '../../../../../presentation/components/board/Card'
========
import Card from '../../../../presentation/components/board/Card'
>>>>>>>> origin/master:tests/presentation/storybook/board/Card.stories.tsx

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
