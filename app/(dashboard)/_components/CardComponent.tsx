import Image from "next/image";
import Google from "../../../public/Assets/google.png";
import { AiFillStar } from "react-icons/ai";
import { CardProps } from "../_constants/constants";

export default function CardComponent({
  title,
  description,
  name,
  from,
  to,
  src,
}: CardProps) {
  return (
    <div className="h-auto w-full  mx-auto ">
      <div className="w-full">
        {/* Title and Description */}
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="font-light text-sm text-gray-600 truncate">
          {description}
        </p>

        {/* View More Link */}
        <a
          className="font-medium text-[12px] text-end block mt-2 text-blue-500 hover:underline"
          href="/src/pages/DetailedPage/"
        >
          View more
        </a>

        {/* Star Icons */}
        <span className="flex gap-1 mt-2">
          {[...Array(5)].map((_, index) => (
            <AiFillStar key={index} className="text-yellow-500" />
          ))}
        </span>

        {/* Additional Info */}
        <div className="mt-4">
          <h1 className="font-medium">{name}</h1>
          <p className="text-sm text-gray-500">
            {from} - {to}
          </p>
          <span className="flex items-center gap-2 mt-2">
            <Image className="w-5 h-5" src={Google} alt="Google" />

            <h4 className="text-sm font-medium">Google</h4>
          </span>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full mx-auto mt-4">
        <Image
          className="w-full h-auto rounded-md"
          src={typeof src === "string" ? src : "/placeholder.jpg"}
          alt={title || "Card image"}
          width={500}
          height={300}
        />
      </div>
    </div>
  );
}
