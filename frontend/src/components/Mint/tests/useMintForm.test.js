import { renderHook, act } from "@testing-library/react-hooks/dom";
import useMintForm from "../useMintForm";

describe("useMintForm hook", () => {
    test("initial state is correct", () => {
        const { result } = renderHook(() => useMintForm());

        expect(result.current.nftImage).toBe(null);
        expect(result.current.imageName).toBe("");
        expect(result.current.nftInfo).toEqual({
            name: "",
            description: "",
            quantity: 1,
            rarity: 1,
            style: 1,
            beauty: 1,
            comedy: 1,
            action: 1,
        });
    });

    test("setNftImage updates image", () => {
        const { result } = renderHook(() => useMintForm());
        const fakeFile = new File(["dummy"], "test.png", { type: "image/png" });

        act(() => {
            result.current.setNftImage(fakeFile);
        });

        expect(result.current.nftImage).toBe(fakeFile);
    });

    test("setImageName updates image name", () => {
        const { result } = renderHook(() => useMintForm());

        act(() => {
            result.current.setImageName("avatar.png");
        });

        expect(result.current.imageName).toBe("avatar.png");
    });

    test("setNftInfo updates fields", () => {
        const { result } = renderHook(() => useMintForm());

        act(() => {
            result.current.setNftInfo((prev) => ({
                ...prev,
                name: "My NFT",
                quantity: 7,
            }));
        });

        expect(result.current.nftInfo.name).toBe("My NFT");
        expect(result.current.nftInfo.quantity).toBe(7);
    });
});
