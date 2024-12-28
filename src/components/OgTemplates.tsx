import fs from "node:fs";

const image = fs.readFileSync("./src/content/images/simonliang.jpg");
const imageDataUrl = `data:image/jpeg;base64,${image.toString("base64")}`;

export function HomeOgTemplate() {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        justifyContent: "center",
        backgroundColor: "#fff",
        color: "#0f172a",
        fontSize: 48,
        fontWeight: 600,
        fontFamily: "Inter",
        letterSpacing: "-0.05em",
        fontFeatureSettings: "'liga' 1, 'calt' 1",
      }}
    >
      <img
        style={{ borderRadius: "12px" }}
        src="https://www.divby0.io/simonliang.jpg"
        width="192"
        height="192"
      />
      <div>Simon Liang</div>
    </div>
  );
}

export function PostOgTemplate({ title }: { title: string }) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        color: "#0f172a",
        fontSize: 32,
        fontWeight: 600,
        fontFamily: "Inter",
        letterSpacing: "-0.05em",
        fontFeatureSettings: "'liga' 1, 'calt' 1",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "40px",
          alignItems: "center",
          position: "absolute",
          top: 60,
          left: 60,
        }}
      >
        <img
          style={{ borderRadius: "12px" }}
          src={imageDataUrl}
          // src="https://www.divby0.io/simonliang.jpg"
          width="128"
          height="128"
        />
        <div>Simon Liang</div>
      </div>
      <div
        style={{
          padding: "150px",
          marginTop: "150px",
          fontSize: 48,
          fontWeight: 600,
        }}
      >
        {title}
      </div>
    </div>
  );
}
