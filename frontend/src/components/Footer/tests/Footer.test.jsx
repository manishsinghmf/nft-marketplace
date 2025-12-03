import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer Component", () => {
    it("renders footer text", () => {
        render(<Footer />);

        expect(
            screen.getByText(/Copyright © 2025 Fandom/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Mindfire Digital/)
        ).toBeInTheDocument();
    });
});
