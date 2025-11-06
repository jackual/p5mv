import "./styles/main.scss"

export const metadata = {
  title: "p5mv",
  description: "p5.js music video timeline editor",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
