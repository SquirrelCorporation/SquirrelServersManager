// utils/variants.ts
export const containerVariants = {
  hidden: { opacity: 1 }, // Keep container visible
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger the animations of its children
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, x: 50 }, // Start with opacity 0 and positioned 50px to the right
  visible: { opacity: 1, x: 0 }, // Animate to opacity 1 and original position
  exit: { opacity: 0, x: -50 }, // Animate to opacity 0 and to the left on removal
};
