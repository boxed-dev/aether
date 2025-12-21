import type { Meta, StoryObj } from '@storybook/react';
import { ProfileHeader } from './ProfileHeader';

const meta: Meta<typeof ProfileHeader> = {
  title: 'Components/ProfileHeader',
  component: ProfileHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    displayName: 'John Doe',
    bio: 'Full-stack developer passionate about building beautiful experiences.',
  },
};

export const WithAvatar: Story = {
  args: {
    displayName: 'Jane Smith',
    bio: 'Designer & Developer',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
  },
};

export const Loading: Story = {
  args: {
    displayName: '',
    isLoading: true,
  },
};

export const NoBio: Story = {
  args: {
    displayName: 'Minimal User',
  },
};

export const LongBio: Story = {
  args: {
    displayName: 'Verbose User',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
};
