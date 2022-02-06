export type ActivityDefinition = {
  maxSpeed: number;
  name: string;
  isIdle?: boolean;
};

export const Activities: ActivityDefinition[] = [
  { maxSpeed: 0.3, name: 'Idle', isIdle: true },
  { maxSpeed: 1.9, name: 'Walking' },
  { maxSpeed: 3, name: 'Running' },
  { maxSpeed: 100, name: 'Driving' },
];

export function getActivity(speed: number): ActivityDefinition {
  let activity: ActivityDefinition;
  for (activity of Activities) {
    if (speed <= activity.maxSpeed) {
      return activity;
    }
  }

  return activity;
}
