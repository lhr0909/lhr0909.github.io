export function OgTemplate({ title }: { title: string }) {
  return (
    <div
    style={{
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
      position: "relative",
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
        src="https://www.divby0.io/simonliang.jpg"
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
        fontWeight: 500,
      }}
    >
      {title}
    </div>
  </div>
  );
}