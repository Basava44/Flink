const PremiumBadge = ({ size = "sm" }) => {
  const sizes = {
    sm: { wrapper: "w-5 h-5", ring: "ring-2" },
    md: { wrapper: "w-7 h-7", ring: "ring-[3px]" },
  };

  const s = sizes[size] || sizes.sm;

  return (
    <span className={`inline-flex items-center justify-center flex-shrink-0 ${s.wrapper} ${s.ring} ring-white dark:ring-zinc-950 rounded-full bg-gradient-to-br from-pink-500 to-purple-500`} title="Premium">
      <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
        <path
          d="M6 13l4 4 8-9"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

export default PremiumBadge;
