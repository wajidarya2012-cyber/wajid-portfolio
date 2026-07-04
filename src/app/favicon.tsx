import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size    = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:800 }}>
      W
    </div>
  );
}
