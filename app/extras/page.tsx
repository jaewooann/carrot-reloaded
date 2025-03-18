import Image from "next/image";
import oneImage from "../../public/1.jpeg";

export default async function Extras() {
  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-metallica">Extras!</h1>
      <h2 className="font-roboto">So much more to learn!</h2>
      <Image src={oneImage} alt="" placeholder="blur" />
    </div>
  );
}
