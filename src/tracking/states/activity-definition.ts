export type ActivityDefinition = {
  maxSpeed: number;
  name: string;
  isIdle?: boolean;
};

export const Activities: ActivityDefinition[] = [
  { maxSpeed: 0.6, name: 'Idle', isIdle: true },
  { maxSpeed: 1.7, name: 'Walking' },
  { maxSpeed: 3.5, name: 'Running' },
  { maxSpeed: 100, name: 'Driving' },
];
