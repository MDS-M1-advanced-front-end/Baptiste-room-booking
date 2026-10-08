import type { Room } from "@room-booking/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { RoomCard, RoomPhoto } from "./room-card";

const room: Room = {
  id: "00000000-0000-4000-8000-100000000001",
  name: "Salle Agora",
  location: "Paris 11e",
  capacity: 12,
  equipment: ["Écran", "Wi-Fi", "Tableau blanc"],
  pricePerHour: 35,
  status: "ACTIVE",
  imageUrl: "",
};

const inactiveRoom: Room = {
  ...room,
  id: "00000000-0000-4000-8000-100000000002",
  name: "Salle Atlas",
  status: "INACTIVE",
  imageUrl: "",
};

const meta = {
  title: "RoomCard",
  component: RoomCard,
} satisfies Meta<typeof RoomCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <RoomCard room={room} />,
};

export const Inactive: Story = {
  render: () => <RoomCard room={inactiveRoom} />,
};

export const PhotoVariants: Story = {
  render: () => (
    <div class="grid w-[min(48rem,90vw)] gap-(--space-4) md:grid-cols-3">
      <RoomPhoto room={room} variant="thumb" />
      <RoomPhoto room={room} variant="card" />
      <RoomPhoto room={room} variant="hero" />
    </div>
  ),
};
