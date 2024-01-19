import type { Meta, StoryObj } from '@storybook/svelte';

import NimbusBar from '$lib/components/visual/preference-interaction/NIMBUSBar.svelte';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'DESDEO Components/Nimbus Bar',
  component: NimbusBar,
  tags: ['autodocs'],
  argTypes:{
    lowerBound: { control: 'number' },
    higherBound: { control: 'number' },
    barName: { control: 'text' },
    solutionValue: { control: 'number' },
    selectedValue: { control: 'number' },
    previousValue: { control: 'number' },
    lowerIsBetter: { control: 'boolean' },
    barColor: { control: 'color' },
    arrowMode: { control: 'boolean' },
    decimalPrecision: { control: 'number' },
  }
} satisfies Meta<NimbusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const ChangeFreely: Story = {
  args: {
    lowerBound: 1,
    higherBound: 100,
    barName: "Objective X",
    solutionValue: 50,
    selectedValue: 50,
    previousValue: 70,
    lowerIsBetter: true,
    barColor: "blue",
    arrowMode: true,
    decimalPrecision: 3,
  },
};

/* export const Secondary: Story = {
  args: {
    label: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
}; */
