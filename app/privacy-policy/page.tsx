import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">Your privacy is important to us. TableMesh collects only the information necessary to provide our services and enhance your experience. We do not share your personal data with third parties except as required by law or to fulfill our services.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Account details (name, email, etc.)</li>
        <li>Usage data and preferences</li>
        <li>Communication history</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Access, update, or delete your information</li>
        <li>Contact us for privacy concerns</li>
      </ul>
      <p>For questions, please visit our Contact page.</p>
    </main>
  );
}
