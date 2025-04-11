import CardComponent from "../CardComponent";
import { CardData } from "../../_constants/constants";

export default function Review() {
  return (
    <div className="w-full h-auto mx-4">
      <h2 className="font-semibold font-serif ">Reviews</h2>
      <p className="text-xs font-serif">
        What people says about Globe facilities
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-[30px] lg:p-0 mx-auto gap-6 p-4">
        {CardData.map((card, index: number) => (
          <div key={card.id} className="relative w-full   mx-auto">
            {/*Background div*/}
            <div
              className={`absolute top-4 left-0 right-0 h-full shadow-md rounded-md ${
                index === 3 ? "bg-[#8DD3BB66]" : "bg-[#84e9c666]"
              }`}
            ></div>

            <div className="relative right-3 z-10 bg-white shadow-lg rounded-md p-4">
              <CardComponent
                id={card.id}
                title={card.title}
                description={card.description}
                name={card.name}
                from={card.from}
                to={card.to}
                src={card.src}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
