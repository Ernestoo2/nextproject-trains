export const LOGIN_CONSTANTS = {
  TITLE: "Login",
  SUBTITLE: "Login to access your Golobe account.",
  REMEMBER_ME: "Remember me",
  FORGOT_PASSWORD: "Forgot Password",
  LOGIN_BUTTON: "Login",
  NO_ACCOUNT: "Don't have an account?",
  SIGN_UP: "Sign up",
  OR_LOGIN_WITH: "Or login with",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "john.doe@gmail.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "●●●●●●●●",
};
export const LOGIN_FORM_CONSTANTS = {
  LABELS: {
    EMAIL: "Email",
    PASSWORD: "Password",
  },
  PLACEHOLDERS: {
    EMAIL: "Enter your email",
    PASSWORD: "Enter your password",
  },
  ERRORS: {
    INVALID_EMAIL: "Please enter a valid email",
    REQUIRED: "This field is required",
  },
};

export const TICKETS = [
  {
    id: 1,
    departure: "Newark (EWR)",
    arrival: "Newark (EWR)",
    time: "12:00 PM - 6:00 PM",
    date: "12-11-2022",
    gate: "A12",
    seat: "128",
    airlineLogo: "/Assets/emir.png",
  },
  {
    id: 2,
    departure: "Newark (EWR)",
    arrival: "Newark (EWR)",
    time: "1:00 PM - 7:00 PM",
    date: "13-11-2022",
    gate: "B14",
    seat: "132",
    airlineLogo: "/Assets/emir.png",
  },
];

export const METHODS = [
  {
    id: 1,
    name: "Credit Card",
    icon: "/Assets/creditcard.png",
    description: "Pay with your credit card.",
    isSelected: false,
  },
  {
    id: 2,
    name: "PayPal",
    icon: "/Assets/paypal.jpeg",
    description: "Pay via PayPal.",
    isSelected: false,
  },
];
export const USER = {
  name: "Eze Ernest",
  email: "ezeernest@gmail.com",
  phone: "+234 70 466 479 41",
  address: "Umuchima, Futo",
  dob: "17-08-2008",
};
