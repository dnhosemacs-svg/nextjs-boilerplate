type SiteLogoProps = {
  className?: string;
};

export default function SiteLogo({ className }: SiteLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="35 82 430 358"
      role="img"
      aria-label="Carpintería — diseño y madera"
      className={className}
    >
      <g transform="translate(250, 220)">
        <path
          className="logo-mark"
          d="M 45,-65 L 75,-45 L 55,-25 L 85,-2 L 60,15 L 85,42 L 55,55 L 72,85 L 38,82 L 45,115 L 10,102 L 5,135 L -30,112 L -45,140 L -75,107 L -98,128 L -118,88 L -140,98 L -148,52 L -165,52 L -160,2 L -172,-15 L -155,-35 L -158,-55 L -132,-68 L -125,-90 L -92,-95 L -75,-115 L -40,-108 L -15,-125 L 15,-105 L 45,-115 L 35,-80 Z M 30,-50 A 85,85 0 1,0 30,70 L 10,45 A 55,55 0 1,1 10,-30 Z"
        />
        <path
          className="logo-mark"
          d="M 0,-15 A 35,35 0 1,0 0,35 L 0,20 A 20,20 0 1,1 0,-2 Z"
          opacity="0.85"
        />
      </g>
      <text x="253" y="388" className="logo-text" fontSize="28">
        CARPINTERÍA
      </text>
      <text x="256" y="428" className="logo-sub" fontSize="16">
        DISEÑO Y MADERA
      </text>
    </svg>
  );
}
