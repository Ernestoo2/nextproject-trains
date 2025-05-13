import { useBooking } from "@/app/_context/BookingContext";
import { BookingDetails } from "@/types/shared/booking";

export default function BookingRight() {
  const { state, dispatch } = useBooking();
  const bookingDetails = state.currentBooking as BookingDetails;

  const handleToggle20PercentOffer = () => {
    dispatch({ type: "SET_PROMO", payload: "WELCOME20" });
  };

  const handleToggle50PercentOffer = () => {
    dispatch({ type: "SET_PROMO", payload: "SEASONAL50" });
  };

  const handleApplyPromo = (code: string) => {
    dispatch({ type: "SET_PROMO", payload: code });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Offers & Discounts</h2>

      <div className="space-y-4">
        {/* 20% Offer */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div>
            <h3 className="font-medium text-green-800">
              20% Off Special Offer
            </h3>
            <p className="text-sm text-green-600">Limited time offer</p>
          </div>
          <button
            onClick={handleToggle20PercentOffer}
            className={`px-4 py-2 rounded-md ${
              bookingDetails.has20PercentOffer
                ? "bg-green-600 text-white"
                : "bg-white text-green-600 border border-green-600"
            }`}
          >
            {bookingDetails.has20PercentOffer ? "Applied" : "Apply"}
          </button>
        </div>

        {/* 50% Seasonal Offer */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
          <div>
            <h3 className="font-medium text-yellow-800">
              50% Seasonal Discount
            </h3>
            <p className="text-sm text-yellow-600">
              Limited time seasonal offer
            </p>
          </div>
          <button
            onClick={handleToggle50PercentOffer}
            className={`px-4 py-2 rounded-md ${
              bookingDetails.has50PercentOffer
                ? "bg-yellow-600 text-white"
                : "bg-white text-yellow-600 border border-yellow-600"
            }`}
          >
            {bookingDetails.has50PercentOffer ? "Applied" : "Apply"}
          </button>
        </div>

        {/* Promo Code Section */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Promo Codes</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleApplyPromo("WELCOME20")}
              className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              WELCOME20 - 20% Off
            </button>
            <button
              onClick={() => handleApplyPromo("WELCOME10")}
              className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              WELCOME10 - 10% Off
            </button>
            <button
              onClick={() => handleApplyPromo("SEASONAL50")}
              className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              SEASONAL50 - 50% Off
            </button>
          </div>
        </div>
      </div>

      {/* Bill Details */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Bill Details</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Fare</span>
            <span>₦{bookingDetails.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST</span>
            <span>₦{bookingDetails.taxAndGST.toFixed(2)}</span>
          </div>
          {bookingDetails.has20PercentOffer && (
            <div className="flex justify-between text-green-600">
              <span>20% Discount</span>
              <span>-₦{(bookingDetails.baseFare * 0.2).toFixed(2)}</span>
            </div>
          )}
          {bookingDetails.has50PercentOffer && (
            <div className="flex justify-between text-yellow-600">
              <span>50% Seasonal Discount</span>
              <span>-₦{(bookingDetails.baseFare * 0.5).toFixed(2)}</span>
            </div>
          )}
          {bookingDetails.promoDiscount > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Promo Discount</span>
              <span>
                -₦
                {(
                  bookingDetails.baseFare * bookingDetails.promoDiscount
                ).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₦{bookingDetails.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
