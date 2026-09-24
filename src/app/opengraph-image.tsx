import { ImageResponse } from "next/og";

// Link preview card: shown when the site is pasted into WhatsApp, LinkedIn, iMessage, Slack, etc.
export const alt = "hari · robots that race, on land and under water";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function font(family: string, weight: number) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(woff2|truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error(`no font url for ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function OG() {
  const [archivo, mono] = await Promise.all([font("Archivo", 800), font("IBM+Plex+Mono", 400)]);
  const paper = "#f4f1eb", ink = "#15171a", teal = "#00d2be", graphite = "#4a5057";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: paper, color: ink, fontFamily: "Archivo", position: "relative" }}>
        {/* wiggly road down the left, like the site */}
        <svg width="140" height="630" viewBox="0 0 140 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M70 -20 C110 60 30 130 70 210 C110 290 30 360 70 440 C110 520 30 590 70 660" fill="none" stroke="rgba(21,23,26,0.32)" strokeWidth="30" strokeLinecap="round" />
          <path d="M70 -20 C110 60 30 130 70 210 C110 290 30 360 70 440 C110 520 30 590 70 660" fill="none" stroke="#ece8e0" strokeWidth="27" strokeLinecap="round" />
          <path d="M70 -20 C110 60 30 130 70 210 C110 290 30 360 70 440 C110 520 30 590 70 660" fill="none" stroke="rgba(21,23,26,0.32)" strokeWidth="1.2" strokeDasharray="8 9" />
        </svg>
        {/* the car, top-down, nose down */}
        <svg width="66" height="126" viewBox="0 0 44 84" style={{ position: "absolute", left: 40, top: 250, transform: "rotate(-8deg)" }}>
          <g stroke={ink} strokeWidth="1.5" fill={paper} strokeLinejoin="round">
            <rect x="6" y="6" width="32" height="5" rx="1" />
            <rect x="0" y="10" width="8" height="16" rx="2" fill={ink} />
            <rect x="36" y="10" width="8" height="16" rx="2" fill={ink} />
            <rect x="8" y="30" width="7" height="22" rx="3" />
            <rect x="29" y="30" width="7" height="22" rx="3" />
            <rect x="15" y="14" width="14" height="44" rx="6" />
            <path d="M18 58 L26 58 L25 70 L19 70 Z" />
            <rect x="0" y="56" width="7" height="14" rx="2" fill={ink} />
            <rect x="37" y="56" width="7" height="14" rx="2" fill={ink} />
            <rect x="4" y="70" width="36" height="6" rx="1" />
            <ellipse cx="22" cy="38" rx="4" ry="6" fill={teal} />
          </g>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px 0 190px", width: "100%" }}>
          <div style={{ fontFamily: "IBM Plex Mono", fontSize: 22, letterSpacing: 4, color: teal }}>SARVAJANA HARI · NTU</div>
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: 18, fontSize: 132, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>
            <span>hey, i&apos;m</span>
            <span style={{ marginLeft: 28, backgroundColor: "rgba(0,210,190,0.38)", padding: "0 14px" }}>hari</span>
            <span style={{ color: teal }}>.</span>
          </div>
          <div style={{ marginTop: 34, fontSize: 34, color: graphite, lineHeight: 1.3, maxWidth: 880 }}>robots that race, on land and under water. and small tools that fix one annoying thing.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 40, fontFamily: "IBM Plex Mono", fontSize: 20 }}>
            {["ROS 2", "LiDAR", "PyTorch", "F1TENTH", "AUVs"].map((t) => (
              <span key={t} style={{ border: `1.5px solid rgba(21,23,26,0.32)`, padding: "6px 14px", background: "#ece8e0" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", right: 60, bottom: 40, fontFamily: "IBM Plex Mono", fontSize: 20, color: graphite, letterSpacing: 2 }}>github.com/my-usernamee</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Archivo", data: archivo, weight: 800, style: "normal" }, { name: "IBM Plex Mono", data: mono, weight: 400, style: "normal" }] },
  );
}
