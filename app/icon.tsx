import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            border: "2px solid #7df4c3",
            background: "linear-gradient(180deg, #22d3ee 0%, #14b8a6 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              right: 4,
              bottom: 4,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 1,
                  background: i === 3 ? "#0f172a" : "rgba(15,23,42,0.78)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
