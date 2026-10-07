import { component$, useSignal } from '@builder.io/qwik';
import type { AvailabilitySlot } from '@room-booking/core';
import type { Meta, StoryObj } from 'storybook-framework-qwik';
import { SlotPicker } from './slot-picker';

const slots: AvailabilitySlot[] = [
  { startTime: '2026-10-12T09:00:00Z', endTime: '2026-10-12T09:30:00Z', available: true },
  { startTime: '2026-10-12T09:30:00Z', endTime: '2026-10-12T10:00:00Z', available: true },
  { startTime: '2026-10-12T10:00:00Z', endTime: '2026-10-12T10:30:00Z', available: false },
  { startTime: '2026-10-12T10:30:00Z', endTime: '2026-10-12T11:00:00Z', available: true },
];

const SlotPickerExample = component$(() => {
  const selection = useSignal<{ start: number; end: number } | null>(null);
  return <SlotPicker day="2026-10-12" slots={slots} selection={selection} />;
});

const meta = {
  title: 'SlotPicker',
  component: SlotPicker,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => <SlotPickerExample />,
};

export const Empty: Story = {
  render: () => <SlotPicker day="2026-10-12" slots={[]} selection={{ value: null }} />,
};
