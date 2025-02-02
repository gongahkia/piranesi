"use client"

import { useState, useRef, useEffect } from "react"

interface LandingPageProps {
  onAgree: () => void
}

export default function LandingPage({ onAgree }: LandingPageProps) {
  const [canAgree, setCanAgree] = useState(false)
  const disclaimerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScroll = () => {
      if (disclaimerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = disclaimerRef.current
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setCanAgree(true)
        }
      }
    }

    const currentRef = disclaimerRef.current
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll)
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScroll)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to Piranesi</h1>
      <div ref={disclaimerRef} className="bg-white p-6 rounded-lg shadow-lg max-w-2xl max-h-96 overflow-y-auto mb-6">
        <h2 className="text-2xl font-semibold mb-4">Legal Disclaimer</h2>
        <p className="mb-4">
          Welcome to Piranesi, a virtual bookshelf application. Before you proceed, please read and agree to the
          following terms and conditions:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Piranesi is provided "as is" without any warranties, express or implied.</li>
          <li>
            The books displayed in Piranesi are for informational purposes only and do not constitute an endorsement or
            recommendation.
          </li>
          <li>Users are responsible for ensuring they have the right to access and use any copyrighted material.</li>
          <li>
            We are not responsible for the accuracy, completeness, or reliability of any book information provided
            through Piranesi.
          </li>
          <li>
            Your use of Piranesi is subject to all applicable local, state, national, and international laws and
            regulations.
          </li>
          <li>We reserve the right to modify, suspend, or discontinue Piranesi at any time without notice.</li>
          <li>By using Piranesi, you agree not to use it for any unlawful or prohibited purposes.</li>
          <li>We may collect and use your personal information in accordance with our Privacy Policy.</li>
          <li>You agree to indemnify and hold us harmless from any claims arising from your use of Piranesi.</li>
          <li>
            This disclaimer may be updated from time to time, and your continued use of Piranesi constitutes acceptance
            of any changes.
          </li>
        </ol>
        <p className="mt-4">
          By clicking "I Agree" below, you acknowledge that you have read, understood, and agree to be bound by this
          disclaimer and all applicable terms and conditions.
        </p>
      </div>
      <button
        onClick={onAgree}
        disabled={!canAgree}
        className={`px-6 py-2 rounded-lg text-white font-semibold ${
          canAgree ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        } transition-colors`}
      >
        I Agree
      </button>
    </div>
  )
}
