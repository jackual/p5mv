import "./styles/reset.css"
import "./styles/main.scss"

export const metadata = {
  title: "Next App",
  description: "Next template",
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
