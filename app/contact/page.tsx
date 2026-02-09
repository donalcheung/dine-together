import React from 'react';

export default function Contact() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>
      <p className="mb-4">We'd love to hear from you! For questions, feedback, or support, please reach out:</p>
      <ul className="list-disc pl-6 mb-4">
          <li>Email: <a className="text-blue-600 underline" href="mailto:contact@tablemesh.com">contact@tablemesh.com</a></li>
      </ul>
      <p>We aim to respond within 24 hours.</p>
    </main>
  );
}
