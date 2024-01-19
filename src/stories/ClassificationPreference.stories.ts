import type { Meta, StoryObj } from '@storybook/svelte';

import ClassificationPreference from '$lib/components/visual/preference-interaction/ClassificationPreference.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'DESDEO Components/Classification Preference',
  component: ClassificationPreference,
  tags: ['autodocs'],
} satisfies Meta<ClassificationPreference>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const ChangeFreely: Story = {
  args: {
    objective_names: ["Objective 1", "Objective 2", "Objective 3"],
    is_maximized: [false, false, true],
    lower_bounds: [0, -5, 10],
    upper_bounds: [1, 5, 20],
    solutionValue: [0.5, 2, 14],
    previousValue: [0.6, 1, 15],
    preference: [0.9, 0.8, 11],
    decimalPrecision: 4,
  },
};

