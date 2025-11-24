import "./NoItem.css";
import image from "../../assets/k.jpg";
export default function NoItem({ heading, content }) {
  return (
    <div className="relative h-[39rem] w-full overflow-hidden">

      {/* BACKGROUND IMAGE */}
      <img
        src={image}
        alt="No Item Image"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* CENTERED TEXT */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-3xl font-medium">{heading}</h1>
          <p className="mt-2 text-lg">{content}</p>
        </div>
      </div>

    </div>
  );
}

