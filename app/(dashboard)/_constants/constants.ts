import Review1 from "../../../public/Assets/Review1.png";
import Review2 from "../../../public/Assets/Review2.png";
import Review3 from "../../../public/Assets/Review3.png";
import back1 from "../../../public/Assets/back1.png";
import back2 from "../../../public/Assets/back2.png";
import { ReactNode } from "react";

export const IMAGES = { Review1, Review2, Review3, back1, back2 };

export interface CardProps {
  id: number;
  title: string;
  description: string;
  name: string;
  from: string;
  to: string;
  src: ReactNode;
}

export const CardData: CardProps[] = [
  {
    id: 1,
    title: '"A real sense of community, nurtured"',
    description:
      "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always, even when I was out of the country. And always available when needed.",
    name: "Olga",
    from: "Weave studio",
    to: "Kai tak",
    src: IMAGES.Review1.src,
  },
  {
    id: 2,
    title: "The facilities are superb. Clean, slick, bright.",
    description:
      "A real sense of community, nurtured”Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always, even when I was out of the country. And always available when needed.View moreOlgaWeave Studios – Kai TakGoogle",
    name: "Thomas",
    from: "Brighton hotel",
    to: "Yangon",
    src: IMAGES.Review2.src,
  },
  {
    id: 3,
    title: "“A real sense of community, nurtured”",
    description:
      "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always, even when I was out of the country. And always available when needed.",
    name: "Eliot",
    from: "Weave studios",
    to: "Kai Tak",
    src: IMAGES.Review3.src,
  },
  {
    id: 4,
    title: "“A real sense of community, nurtured”",
    description:
      "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for helping me always, even when I was out of the country. And always available when needed.",
    name: "Eliot",
    from: "Weave studios",
    to: "Kai Tak",
    src: IMAGES.Review2.src,
  },
];

export interface BackImageProps {
  id: number;
  location: string;
  description: string;
  src: string;
}

export const BackImageData: BackImageProps[] = [
  {
    id: 1,
    location: "Lagos",
    description:
      "Search Trains & Places Bookings to our most popular destinations",
    src: IMAGES.back1.src,
  },
  {
    id: 2,
    location: "Abuja",
    description:
      "Search Trains & Places Bookings to our most popular destinations",
    src: IMAGES.back2.src,
  },
];
