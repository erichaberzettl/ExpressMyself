import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeExperience } from "@/components/home-experience";
import { getExpressionsForLanguage } from "@/lib/expressions";

const loadExpressions = async () => getExpressionsForLanguage("en");

describe("HomeExperience", () => {
  it("renders the daily expression widget shell", () => {
    render(<HomeExperience initialExpressions={getExpressionsForLanguage("en")} loadExpressions={loadExpressions} />);

    expect(screen.getByText("ExpressMyself")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse library" })).toBeInTheDocument();
  });

  it("shows a different expression when next is clicked", async () => {
    const user = userEvent.setup();
    render(<HomeExperience initialExpressions={getExpressionsForLanguage("en")} loadExpressions={loadExpressions} />);

    const initialHeading = screen.getByRole("heading", { level: 2 }).textContent;
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("heading", { level: 2 }).textContent).not.toBe(initialHeading);
  });

  it("renders an audio control on the expression card", () => {
    render(<HomeExperience initialExpressions={getExpressionsForLanguage("en")} loadExpressions={loadExpressions} />);

    expect(screen.getByRole("button", { name: /listen to/i })).toBeInTheDocument();
  });

  it("speaks English with a normal preferred voice when available", async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    const cancel = vi.fn();
    const getVoices = vi.fn(() => [
      { name: "Bells", lang: "en-US" },
      { name: "Alex", lang: "en-US" },
      { name: "Samantha", lang: "en-US" },
      { name: "Google US English", lang: "en-US" }
    ]);

    class MockUtterance {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      voice?: { name: string; lang: string };

      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel, getVoices }
    });

    render(<HomeExperience initialExpressions={getExpressionsForLanguage("en")} loadExpressions={loadExpressions} />);
    const expression = screen.getByRole("heading", { level: 2 }).textContent ?? "";

    await user.click(screen.getByRole("button", { name: /listen to/i }));

    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0][0] as MockUtterance;
    expect(utterance.text).toBe(expression);
    expect(utterance.lang).toBe("en-US");
    expect(utterance.rate).toBe(1);
    expect(utterance.voice?.name).toBe("Alex");
  });

  it("does not assign an english voice to a spanish expression", async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    const cancel = vi.fn();

    class MockUtterance {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      voice?: { name: string; lang: string };

      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak,
        cancel,
        getVoices: () => [{ name: "Samantha", lang: "en-US", default: true, localService: true }],
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }
    });

    render(<HomeExperience initialExpressions={getExpressionsForLanguage("en")} loadExpressions={async (language) => getExpressionsForLanguage(language)} />);
    await user.selectOptions(screen.getByLabelText("Language"), "es");
    await user.click(screen.getByRole("button", { name: /listen to/i }));

    const utterance = speak.mock.calls.at(-1)?.[0] as MockUtterance;
    expect(utterance.lang).toBe("es-ES");
    expect(utterance.voice).toBeUndefined();
  });

  it("speaks immediately even when the browser has not loaded voices yet", async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    const cancel = vi.fn();
    const resume = vi.fn();

    class MockUtterance {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      voice?: { name: string; lang: string };

      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak,
        cancel,
        resume,
        getVoices: () => []
      }
    });

    render(<HomeExperience initialExpressions={getExpressionsForLanguage("en")} loadExpressions={loadExpressions} />);

    await user.click(screen.getByRole("button", { name: /listen to/i }));

    expect(cancel).toHaveBeenCalled();
    expect(resume).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
  });
});
