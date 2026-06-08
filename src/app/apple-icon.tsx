import { ImageResponse } from "next/og";
import { AppIconSvg } from "@/lib/branding/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppIconSvg size={180} iconSize={80} radius={40} />
      </div>
    ),
    { ...size },
  );
}
