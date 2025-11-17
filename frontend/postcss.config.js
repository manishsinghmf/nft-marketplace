// ✅ Correct for Tailwind v4.x + Vite 5+
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ],
};
