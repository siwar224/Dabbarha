export type GoalImpact = {
  deficit: number;
  nextMonthRequiredSavings: number;
  canCompensateNextMonth: boolean;
  oldEstimatedCompletionDate?: string;
  newEstimatedCompletionDate?: string;
  delayInMonths: number;
  message: string;
};

export function calculateGoalImpact(): GoalImpact {
  throw new Error("calculateGoalImpact will be implemented with the expense screen.");
}
