import { router } from "expo-router";

import { OnboardingScreen } from "@/components/OnboardingScreen";

const insightsImage = require("../../assets/images/onboarding-insights.png");

export default function WelcomeInsightsScreen() {
  return (
    <OnboardingScreen
      activeStep={2}
      image={insightsImage}
      title="صورة واضحة لفلوسك"
      subtitle="شوف تقارير بسيطة ومقارنة الأشهر باش تبقى دايمًا على الخطة"
      buttonLabel="إبدأ الآن"
      onNext={() => router.replace("/setup/monthly")}
      onSkip={() => router.replace("/(tabs)")}
    />
  );
}
