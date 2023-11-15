import { BasicLayout } from 'layouts/basicLayout'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <title>OpenWeightlifting</title>
        <body className="min-h-screen bg-background font-sans antialiased">
          <BasicLayout>
            <Main />
            <NextScript />
          </BasicLayout>
        </body>
    </Html>
  )
}