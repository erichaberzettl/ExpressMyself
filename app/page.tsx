import { getExpressionsForLanguageDb } from "@/lib/expression-repository";
import { HomeExperience } from "@/components/home-experience";

export default async function HomePage() {
  const initialExpressions = await getExpressionsForLanguageDb("en");

  return <HomeExperience initialExpressions={initialExpressions} />;
}
