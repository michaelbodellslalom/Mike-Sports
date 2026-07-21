import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "@/app/page";
import { usePreferencesStore } from "@/store/preferencesStore";

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createMockFetch({
  sportsOk = true,
  sportsGames = [],
  newsOk = true,
  newsItems = [],
  watchOk = true,
  watchOptions = [],
}: {
  sportsOk?: boolean;
  sportsGames?: unknown[];
  newsOk?: boolean;
  newsItems?: unknown[];
  watchOk?: boolean;
  watchOptions?: unknown[];
}) {
  return jest.fn(async (input: RequestInfo | URL): Promise<MockResponse> => {
    const url = String(input);

    if (url.includes("/api/sports")) {
      return {
        ok: sportsOk,
        status: sportsOk ? 200 : 500,
        json: async () => ({ league: "NFL", games: sportsGames }),
      };
    }

    if (url.includes("/api/news")) {
      return {
        ok: newsOk,
        status: newsOk ? 200 : 500,
        json: async () => ({ items: newsItems }),
      };
    }

    if (url.includes("/api/watch")) {
      return {
        ok: watchOk,
        status: watchOk ? 200 : 500,
        json: async () => ({ options: watchOptions }),
      };
    }

    throw new Error(`Unhandled fetch URL: ${url}`);
  });
}

describe.skip("Home page", () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferencesStore.setState({
      favorites: [
        "Minnesota Vikings",
        "Minnesota Twins",
        "Minnesota Wild",
        "Minnesota Timberwolves",
        "University of Minnesota football",
        "University of Minnesota basketball",
        "PGA",
        "UFC",
      ],
      zipCode: "80222",
      watchPriority: "favorites-first",
    });
  });

  it("renders key sections and default ZIP", async () => {
    global.fetch = createMockFetch({}) as unknown as typeof fetch;

    render(<Home />);

    expect(screen.getByRole("heading", { name: /today snapshot/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /scores/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /news/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /daily watch plan/i })).toBeInTheDocument();

    const zipInput = screen.getByLabelText(/zip code/i);
    expect(zipInput).toHaveValue("80222");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /green bay packers at minnesota vikings/i })).toBeInTheDocument();
    });
  });

  it("updates selected favorites count when toggling a favorite", async () => {
    global.fetch = createMockFetch({}) as unknown as typeof fetch;

    render(<Home />);

    expect(screen.getByText(/selected favorites: 8/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Minnesota Vikings" }));

    expect(screen.getByText(/selected favorites: 7/i)).toBeInTheDocument();
  });

  it("shows explicit API error messages on failure", async () => {
    global.fetch = createMockFetch({
      sportsOk: false,
      newsOk: false,
      watchOk: false,
    }) as unknown as typeof fetch;

    render(<Home />);

    expect(await screen.findByText(/sports api returned 500/i)).toBeInTheDocument();
    expect(await screen.findByText(/news api returned 500/i)).toBeInTheDocument();
  });

  it("shows empty states when APIs return no records", async () => {
    global.fetch = createMockFetch({
      sportsGames: [],
      newsItems: [],
      watchOptions: [],
    }) as unknown as typeof fetch;

    render(<Home />);

    expect(await screen.findByText(/vikings lean into explosive play-action packages/i)).toBeInTheDocument();
    expect(await screen.findByText(/fallback coverage suggestion while live provider data is limited/i)).toBeInTheDocument();
    const ticketHints = await screen.findAllByText(/ticketmaster search for zip 80222/i);
    expect(ticketHints.length).toBeGreaterThan(0);
  });
});
