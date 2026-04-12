export const branches = [...Array(6)].map((_, i) => ({
  id: i,

  // 📍 position
  y: 260 + i * 240,
  side: i % 2 === 0 ? 1 : -1,

  // 🧾 content
  title: `Phase ${i + 1}`,

  subtitle: [
    "Foundation Setup",
    "Core Development",
    "System Optimization",
    "Performance Scaling",
    "Advanced Integration",
    "Final Deployment",
  ][i],

  date: [
    "Jan 10, 2024",
    "Feb 18, 2024",
    "Mar 25, 2024",
    "Apr 30, 2024",
    "May 20, 2024",
    "Jun 15, 2024",
  ][i],

  description: `This phase focuses on ${
    [
      "setting up the base architecture and initial workflows",
      "building core modules and key functionalities",
      "improving system performance and stability",
      "scaling features for real-world usage",
      "integrating advanced systems and optimizations",
      "final testing, deployment, and launch readiness",
    ][i]
  }. All major milestones and goals are achieved in this stage.`,
}));