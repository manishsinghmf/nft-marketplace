export default function MintImageUpload({ image, onChange, error }) {
    return (
        <div className="upload-wrapper">
            <label className="uploadFile cursor-pointer">
                <span className="filename">
                    {image ? image.name : "Choose Image"}
                </span>

                <input
                    type="file"
                    accept="image/*"
                    className="inputfile"
                    onChange={(e) => onChange(e.target.files?.[0])}
                />
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
