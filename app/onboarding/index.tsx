import { router } from "expo-router";

import { OnboardingScreen } from "@/components/OnboardingScreen";

const walletImage = require("../../assets/images/onboarding-wallet.png");

export default function WelcomeMoneyScreen() {
  return (
    <OnboardingScreen
      activeStep={0}
      image={walletImage}
      title="دبّرها"
      subtitle="نظّم فلوسك ببساطة"
      featureTitle="تحكم في مصاريفك"
      featureBody="سجّل مصاريفك اليومية وتابع على وين تروح فلوسك"
      buttonLabel="التالي"
      onNext={() => router.push("/onboarding/goals")}
      onSkip={() => router.replace("/setup/monthly")}
    />
  );
}
