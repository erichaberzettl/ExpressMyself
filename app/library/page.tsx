import { getExpressionsForLanguageDb } from "@/lib/expression-repository";
import { LibraryExperience } from "@/components/library-experience";

export default async function LibraryPage() {
  const initialExpressions = await getExpressionsForLanguageDb("en");

  return <LibraryExperience initialExpressions={initialExpressions} />;
}
