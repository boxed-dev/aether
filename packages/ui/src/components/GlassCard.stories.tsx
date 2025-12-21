import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from './GlassCard';

const meta: Meta<typeof GlassCard> = {
  title: 'Components/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'solid'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="text-white">
        <h3 className="text-lg font-semibold">Glass Card</h3>
        <p className="text-white/70">A beautiful glassmorphism card component.</p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="text-white">
        <h3 className="text-lg font-semibold">Elevated Card</h3>
        <p className="text-white/70">More prominent glass effect.</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div className="text-white">
        <h3 className="text-lg font-semibold">Interactive Card</h3>
        <p className="text-white/70">Hover and click me!</p>
      </div>
    ),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: null,
  },
};

export const Error: Story = {
  args: {
    hasError: true,
    errorMessage: 'Failed to load content',
    children: null,
  },
};

export const LongText: Story = {
  args: {
    children: (
      <div className="text-white max-w-sm">
        <h3 className="text-lg font-semibold">Long Content Card</h3>
        <p className="text-white/70">
          This card contains a lot of text to test how the component handles longer content.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <GlassCard size="sm">
        <span className="text-white">Small</span>
      </GlassCard>
      <GlassCard size="md">
        <span className="text-white">Medium</span>
      </GlassCard>
      <GlassCard size="lg">
        <span className="text-white">Large</span>
      </GlassCard>
    </div>
  ),
};
