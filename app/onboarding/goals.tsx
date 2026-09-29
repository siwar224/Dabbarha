import { router } from "expo-router";

import { OnboardingScreen } from "@/components/OnboardingScreen";

const goalImage = require("../../assets/images/onboarding-goal.png");

export default function WelcomeGoalsScreen() {
  return (
    <OnboardingScreen
      activeStep={1}
      image={goalImage}
      title="حقّق أهدافك"
      subtitle="حدّد أهدافك وتابع تقدّمك للوصول إليها خطوة بخطوة"
      buttonLabel="التالي"
      onNext={() => router.push("/onboarding/insights")}
      onSkip={() => router.replace("/setup/monthly")}
    />
  );
}
