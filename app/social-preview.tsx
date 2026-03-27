export function SocialPreviewCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "radial-gradient(circle at top left, rgba(125,244,195,0.16), transparent 24%), radial-gradient(circle at right, rgba(34,211,238,0.16), transparent 28%), linear-gradient(135deg, #07111f 0%, #10263a 42%, #271c4a 100%)",
        color: "#ffffff",
        padding: "54px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "28px",
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: "40px",
        }}
      >
        <div
          style={{
            width: "58%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontSize: 26,
                fontWeight: 700,
                opacity: 0.92,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: "linear-gradient(180deg, #22d3ee 0%, #14b8a6 100%)",
                  border: "2px solid rgba(125,244,195,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: "2px solid rgba(15,23,42,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: 1,
                          background: i === 3 ? "#08111f" : "rgba(8,17,31,0.72)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span>UiTM Class Canvas</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 72,
                  lineHeight: 0.94,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  maxWidth: 560,
                  gap: "4px",
                }}
              >
                <span>Build your schedule.</span>
                <span>Turn it into wallpaper.</span>
              </div>
              <div
                style={{
                  maxWidth: 520,
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: "rgba(255,255,255,0.76)",
                }}
              >
                Search UiTM subjects, choose the right groups, and export a polished class wallpaper for your phone.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              fontSize: 22,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                background: "rgba(125,244,195,0.14)",
                border: "1px solid rgba(125,244,195,0.24)",
                color: "#7df4c3",
                fontWeight: 700,
              }}
            >
              UiTM Schedule Wallpaper Tool
            </div>
            <span>uitm-timetable.vercel.app</span>
          </div>
        </div>

        <div
          style={{
            width: "34%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 300,
              height: 520,
              borderRadius: 52,
              background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.28)",
              padding: "22px 18px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: 110,
                height: 16,
                alignSelf: "center",
                borderRadius: 999,
                background: "rgba(8,17,31,0.72)",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: 12,
              }}
            >
              {[
                ["MON", "CSC584", "#38bdf8"],
                ["TUE", "MAT455", "#22c55e"],
                ["WED", "EET699", "#f59e0b"],
                ["THU", "CTU551", "#f472b6"],
              ].map(([day, code, color]) => (
                <div
                  key={code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 14px",
                    borderRadius: 22,
                    background: "rgba(8,17,31,0.40)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 44,
                      borderRadius: 999,
                      background: color,
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{code}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.66)" }}>
                      {day} • 10:00 - 12:00
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "auto",
                padding: "14px 16px",
                borderRadius: 24,
                background: "rgba(125,244,195,0.12)",
                border: "1px solid rgba(125,244,195,0.24)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#dffff4",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <span>Wallpaper Ready</span>
              <span>PNG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
