'use client';

export default function EndPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-white to-blue-50">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Thank you for participating!</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        You have completed all tasks. <br />
        Your responses have been saved. <br />
        Your completion code is: <b>CISKTGJO</b>
      </p>
      <div className="mt-8 text-center text-gray-500">
        <p>
          If you have any questions, please contact us at:<br />
          <span className="font-semibold">[removed]</span>
        </p>
      </div>
    </div>
  );
}