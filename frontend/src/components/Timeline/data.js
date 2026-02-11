
export const branches = [...Array(6)].map((_, i) => ({
  id: i,
  y: 260 + i * 240,
  side: i % 2 === 0 ? 1 : -1,
  cardX: i % 2 === 0 ? 520 : 80,
  title: `Phase ${i + 1}`,
  description:
    `This card contain information of Phase ${i + 1}.
    Detailed description about the milestones and goals achieved in this phase.`,
}));

