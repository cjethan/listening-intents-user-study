'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConsentForm() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consentGiven = localStorage.getItem('consentGiven');
      if (consentGiven === 'true') {
        router.push('/prolific-id');
      }
    }
  }, [router]);

  const handleConsent = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      localStorage.setItem('consentGiven', 'true');
    }
    router.push('/prolific-id');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Welcome to the Music Listening Intent Study
        </h1>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          During this study, you will be asked to classify songs for different music listening intents. To participate, your last.fm music listening history will be retrieved.
        </p>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          For the best user experience, please use a desktop PC or laptop with a modern browser (Edge, Chrome, Firefox, Safari).
        </p>
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Privacy Policy and Consent Form
        </h2>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
        Your last.fm account will only be used to retrieve your top songs and recently listened to songs.
        </p>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          Your data will only be used for scientific research purposes. Participation is entirely voluntary. You are free to withdraw your participation. If you send an email to [contact removed for publication], we will remove your data.
        </p>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          By clicking “I consent”, you consent to the use of your data as specified above, and you confirm that you have read and understood the provided information.
        </p>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          This study is performed by Caroline Jethan, a student under the supervision of Markus Schedl of the Human-centered AI group (<a href="https://hcai.at" className="text-blue-600 underline">hcai.at</a>) of Johannes Kepler University Linz (<a href="https://jku.at" className="text-blue-600 underline">jku.at</a>). If you have any more questions, you can send a mail to [contact removed for publication].
        </p>
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Cookie Usage
        </h2>
        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          This project uses cookies. Cookies are used to store your session information and preferences locally on your device. These cookies are essential for the functionality of the application and are not used for tracking or advertising purposes.
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