import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mintSchema } from "../../utils/mintFormValidation";

import MintImageUpload from "./MintImageUpload";
import MintAttributes from "./MintAttributes";

export default React.memo(function MintForm({ onSubmit }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(mintSchema),
        defaultValues: {
            name: "",
            description: "",
            quantity: 1,
            rarity: 1,
            style: 1,
            beauty: 1,
            comedy: 1,
            action: 1,
            image: null,
        },
    });

    const image = watch("image");

    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            {/* === FIRST ROW (IMAGE + NAME) === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 form-background">

                {/* IMAGE UPLOAD */}
                <MintImageUpload
                    image={image}
                    onChange={(file) => setValue("image", file)}
                    error={errors.image?.message}
                />

                {/* NFT NAME */}
                <div>
                    <input
                        {...register("name")}
                        placeholder="NFT Name"
                        className="item-1 mt-5 form-control"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                </div>

            </div>

            {/* === DESCRIPTION FIELD === */}
            <textarea
                {...register("description")}
                placeholder="NFT Description"
                className="form-control col-12 row-3 input-group text mt-5"
            />
            {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}

            {/* === ATTRIBUTE GRID === */}
            <div className="mt-8">
                <MintAttributes register={register} errors={errors} />
            </div>

            {/* SUBMIT */}
            <div className="text-center mt-10">
                <button type="submit" className="sc-button">
                    Mint NFT
                </button>
            </div>
        </form>
    );
});
