import "./globals.css";

export const metadata = {
  title: "ระบบการฝึกประสบการณ์ด้านบริการวิชาการแก่ชุมชน 150 ชั่วโมง คณะวิทยาศาสตร์การกีฬา มหาวิทยาลัยบูรพา",
  description: "บันทึกสะสมชั่วโมงฝึกประสบการณ์ คณะวิทยาศาสตร์การกีฬา มหาวิทยาลัยบูรพา",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="font-body bg-bg min-h-screen">
        <div className="mx-auto max-w-md min-h-screen bg-bg relative">{children}</div>
      </body>
    </html>
  );
}
