export function SocialPreviewCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #07111f 0%, #10263a 45%, #271c4a 100%)",
        color: "#ffffff",
        padding: "52px",
        gap: "32px",
      }}
    >
      <div
        style={{
          width: "62%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "14px",
                background: "#14b8a6",
                border: "2px solid #7df4c3",
                fontSize: "20px",
                fontWeight: 800,
                color: "#07111f",
              }}
            >
              CC
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                fontWeight: 700,
                color: "#f8fafc",
              }}
            >
              UiTM Class Canvas
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                lineHeight: "1",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                maxWidth: "560px",
              }}
            >
              Build your schedule.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                lineHeight: "1",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                maxWidth: "560px",
                color: "#7df4c3",
              }}
            >
              Turn it into wallpaper.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              maxWidth: "560px",
              fontSize: "28px",
              lineHeight: "1.35",
              color: "rgba(255,255,255,0.78)",
            }}
          >
            Search UiTM subjects, choose the right groups, and export a polished class wallpaper for your phone.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "12px 18px",
              borderRadius: "999px",
              background: "rgba(125,244,195,0.16)",
              border: "1px solid rgba(125,244,195,0.28)",
              color: "#7df4c3",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            UiTM Schedule Wallpaper Tool
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              color: "rgba(255,255,255,0.70)",
            }}
          >
            uitm-timetable.vercel.app
          </div>
        </div>
      </div>

      <div
        style={{
          width: "34%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "300px",
            height: "500px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "28px 22px",
            borderRadius: "44px",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.16)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "center",
              width: "110px",
              height: "14px",
              borderRadius: "999px",
              background: "rgba(7,17,31,0.78)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {[
              { day: "MON", code: "CSC584", color: "#38bdf8" },
              { day: "TUE", code: "MAT455", color: "#22c55e" },
              { day: "WED", code: "EET699", color: "#f59e0b" },
              { day: "THU", code: "CTU551", color: "#f472b6" },
            ].map((item) => (
              <div
                key={item.code}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  borderRadius: "20px",
                  background: "rgba(7,17,31,0.42)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "10px",
                    height: "42px",
                    borderRadius: "999px",
                    background: item.color,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    {item.code}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.68)",
                    }}
                  >
                    {`${item.day} • 10:00 - 12:00`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: "22px",
              background: "rgba(125,244,195,0.14)",
              border: "1px solid rgba(125,244,195,0.24)",
              color: "#dffff4",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            <div style={{ display: "flex" }}>Wallpaper Ready</div>
            <div style={{ display: "flex" }}>PNG</div>
          </div>
        </div>
      </div>
    </div>
  );
}
