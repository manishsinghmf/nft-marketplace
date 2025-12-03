import { render, screen } from "@testing-library/react";
import Home from "../Home";

// Mock image import
vi.mock("../../../assets/robo.png", () => ({
    default: "mock-robot-image.png",
}));

describe("Home Component", () => {
    it("renders the main heading", () => {
        render(<Home />);

        expect(
            screen.getByText(/discover and collect your favourite digital nfts/i)
        ).toBeInTheDocument();
    });

    it("renders the robot image", () => {
        render(<Home />);

        const img = screen.getByAltText("NFT Robot");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "mock-robot-image.png");
    });

    it("renders layout elements correctly", () => {
        const { container } = render(<Home />);

        // ensure main wrapper exists
        expect(container.querySelector(".Home")).toBeTruthy();

        // ensure grid layout exists
        expect(container.querySelector(".grid")).toBeTruthy();
    });
});
