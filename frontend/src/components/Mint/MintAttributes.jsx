const FIELDS = [
    { key: "quantity", label: "Quantity", max: 100 },
    { key: "rarity", label: "Rarity", max: 10 },
    { key: "style", label: "Style", max: 10 },
    { key: "beauty", label: "Beauty", max: 10 },
    { key: "comedy", label: "Comedy", max: 10 },
    { key: "action", label: "Action", max: 10 },
];

export default function MintAttributes({ register, errors }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
            {FIELDS.map((f) => (
                <div className="text-center" key={f.key}>
                    <label>{f.label}</label>
                    <div className="mt-3 flex justify-center">
                        <input
                            type="number"
                            className="form-control nft-input-rating"
                            {...register(f.key, { valueAsNumber: true })}
                        />

                        <span className="mx-2">of</span>

                        <input
                            className="form-control nft-input-rating"
                            value={f.max}
                            disabled
                        />
                    </div>

                    {errors[f.key] && (
                        <p className="text-red-500">{errors[f.key].message}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
