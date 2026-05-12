import { getExpressionsForLanguage } from "@/lib/expressions";
import { LibraryExperience } from "@/components/library-experience";

export default async function LibraryPage() {
  const initialExpressions = getExpressionsForLanguage("en");

  return <LibraryExperience initialExpressions={initialExpressions} />;
}
