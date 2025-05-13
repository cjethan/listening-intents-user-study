'use client';

import { useRouter } from 'next/navigation';

export default function ConsentForm() {
  const router = useRouter();

  const handleConsent = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('consentGiven', 'true');
    }
    router.push('/'); // Redirect to the main app page
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Consent Form</h1>
        <p className="mb-6 text-gray-700 leading-relaxed text-left">
          Your data will be stored anonymously, such that it cannot be traced back to you. It will only be
          used for scientific research purposes. Participation is entirely voluntary. You are free to withdraw
          your participation. If you send an email to <a href="mailto:[removed]" className="text-blue-600 underline">[removed]</a>, we will remove your data.
        </p>
        <p className="mb-6 text-gray-700 leading-relaxed text-left">
          By clicking “I consent”, you consent to the use of your data as specified above, and you confirm
          that you have read and understood the provided information.
        </p>
        <p className="mb-6 text-gray-700 leading-relaxed text-left">
          This study is performed by Caroline Jethan, a student under the supervision of Prof. D.I. Mag. Dr. Markus
          Schedl of the Human-centered AI group of JKU. If you have any more questions, you can send
          a mail to <a href="mailto:[removed]" className="text-blue-600 underline">[removed]</a>.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleConsent}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            I consent
          </button>
        </div>
      </div>
    </div>
  );
}