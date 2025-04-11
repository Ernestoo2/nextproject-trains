import Image from "next/image";
import logoImg from "../../../../public/Assets/Logo.png";

export default function Logo() {
  return (
    <div className="w-1/3 h-auto ">
      <Image src={logoImg} alt="for logo" className="w-full h-auto" />
    </div>
  );
}
