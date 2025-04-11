import { BackImageData } from "../../_constants/constants";
import BackImage from "./_components/BackImagePage";

export default function BackImageUi() {
  return (
    <div className=" w-full  md:w-2/3 h-auto flex flex-col text-center gap-[20px] mx-auto px-[40px] pt-16 ">
      <div className="w-full">
        <h1 className="font-semibold text-black text-base">
          Popular Route Destinations!
        </h1>
      </div>
      <div className="w-full h-auto flex  md:flex-row gap-[20px]">
        {BackImageData.map((card) => (
          <BackImage
            key={card.id}
            id={card.id}
            location={card.location}
            description={card.description}
            src={card.src}
          />
        ))}
      </div>
    </div>
  );
}
