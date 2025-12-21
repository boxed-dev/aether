import type { Meta, StoryObj } from '@storybook/react';
import { LinkCard } from './LinkCard';

const meta: Meta<typeof LinkCard> = {
  title: 'Components/LinkCard',
  component: LinkCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'GitHub',
    href: 'https://github.com',
    icon: '🐙',
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'My Website',
    href: 'https://example.com',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading...',
    href: '#',
    isLoading: true,
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This is a very long title that should be truncated with ellipsis',
    href: 'https://example.com',
    icon: '🔗',
  },
};

export const LinkList: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <LinkCard title="GitHub" href="https://github.com" icon="🐙" />
      <LinkCard title="Twitter" href="https://twitter.com" icon="🐦" />
      <LinkCard title="LinkedIn" href="https://linkedin.com" icon="💼" />
      <LinkCard title="Portfolio" href="https://example.com" icon="🌐" />
    </div>
  ),
};
