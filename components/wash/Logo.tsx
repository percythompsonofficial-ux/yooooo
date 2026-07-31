import { IconFan } from "./icons";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <IconFan
        className={`w-[22px] h-[22px] ${dark ? "text-spray-lit" : "text-spray"}`}
      />
      <span className="leading-none">
        <span
          className={`block font-display text-[1.15rem] font-bold tracking-[-0.03em] ${
            dark ? "text-chalk" : "text-prussian"
          }`}
        >
          Saltline
        </span>
        <span
          className={`spec block text-[0.5625rem] ${
            dark ? "text-efflor/80" : "text-stone/80"
          }`}
        >
          Surface Co.
        </span>
      </span>
    </span>
  );
}
