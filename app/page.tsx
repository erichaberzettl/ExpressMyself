import { getExpressionsForLanguage } from "@/lib/expressions";
import { HomeExperience } from "@/components/home-experience";

export default async function HomePage() {
  const initialExpressions = getExpressionsForLanguage("en");

  return <HomeExperience initialExpressions={initialExpressions} />;
}
