import { TicketDetails } from "@/types/shared/tickets";

export const DEFAULT_TICKET_DETAILS: TicketDetails = {
  pnr: "1234567890",
  transactionId: "3515118519256378",
  train: "12430 - NDLS LKO AC SF",
  date: {
    departure: "Nov 16",
    arrival: "Nov 17",
  },
  time: {
    departure: "11:25 pm",
    arrival: "7:25 am",
  },
  locations: {
    departure: "Port Harcourt, Rivers",
    arrival: "Enugu, Enugu",
  },
  email: "Ejigou Izuuna (Primary)\nejigouizunna@gmail.com",
  traveller: {
    name: "Ejigou Izuuna",
    age: "24 Yrs",
    gender: "Male",
    status: "Confirmed (CNF)",
    seat: "44 (Lower berth), A1",
  },
  fare: "35000.00",
};

export const BUTTON_LABELS = {
  PRINT_TICKET: "Print Ticket (English)",
  BOOK_ANOTHER: "Book another ticket",
  DOWNLOAD_TICKET: "Download Ticket",
};

export const SUCCESS_MESSAGES = {
  TITLE: "Congratulations! You have successfully booked tickets",
  SUBTITLE: "Please carry SMS / Email sent to your contact details, along with a relevant ID proof while travelling",
  QR_CODE_INFO: "Scan the code to view in any device",
};
