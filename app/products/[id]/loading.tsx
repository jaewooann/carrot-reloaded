import { PhotoIcon } from "@heroicons/react/24/solid";

export default function Loading() {
  return (
    <div className="p-5 animate-pulse flex flex-col gap-5">
      <div className="flex justify-center items-center text-neutral-700 aspect-square border-neutral-700 border-4 border-dashed rounded-md">
        <PhotoIcon className="size-28" />
      </div>
      <div className="flex gap-2 items-center">
        <div className="size-14 rounded-full bg-neutral-700" />
        <div className="flex flex-col gap-1">
          <div className="h-5 w-40 bg-neutral-700 rounded-md" />
          <div className="h-5 w-20 bg-neutral-700 rounded-md" />
        </div>
      </div>
      <div className="h-5 w-80 bg-neutral-700 rounded-md" />
    </div>
  );
}
