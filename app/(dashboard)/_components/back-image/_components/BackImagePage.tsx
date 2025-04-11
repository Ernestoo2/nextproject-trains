import Link from "next/link";
import "../globals.css";
import { IoIosSend } from "react-icons/io";
import { BackImageProps } from "../../../_constants/constants";

export default function BackImage({
  location,
  description,
  src,
}: BackImageProps) {
  return (
    <div
      className="imgWrap w-full cursor-pointer h-70 rounded-md mx-auto"
      data-src={src}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: "pointer",
      }}
    >
      <div className="mt-32">
        <h1 className="text-white font-bold text-lg">{location}</h1>
        <p className="text-white font-semibold text-sm">{description}</p>

        <Link
          href="/train-search"
          className="mt-2 bg-[#8DD3BB] text-black px-2 py-2 rounded flex items-center justify-center gap-2"
        >
          <IoIosSend size={24} />
          Show Route
        </Link>
      </div>
    </div>
  );
}
