import { render, screen } from "@testing-library/react";
import NoItem from "../NoItem";

// Mock the image import so Vitest doesn't try loading a real file
vi.mock("../../../assets/k.jpg", () => ({
    default: "mock-image.jpg",
}));

describe("NoItem Component", () => {
    it("renders heading and content", () => {
        render(<NoItem heading="No NFTs" content="You have not created any NFTs yet." />);

        expect(screen.getByText("No NFTs")).toBeInTheDocument();
        expect(screen.getByText("You have not created any NFTs yet.")).toBeInTheDocument();
    });

    it("renders background image", () => {
        render(<NoItem heading="Hi" content="Test" />);

        const img = screen.getByAltText("No Item Image");

        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "mock-image.jpg");
    });
});
