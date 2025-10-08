import { useState } from 'react';
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import './Footer.css';

// Footer component
function Footer() {
    const [showPopup, setShowPopup] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 9000); // auto-hide after 9s
    };

    return (
        <footer className="bg-black text-white py-6 border-t border-gray-700 text-center">
            <section className="max-w-4xl mx-auto contact-section">
                <h2 className="text-2xl font-semibold mb-6 text-center">Contact Me</h2>
                <form className="grid gap-4 mb-8" onSubmit={handleSubmit}>
                    <input type="text"
                        name="name"
                        placeholder="Your name" required
                        className="bg-gray-900 text-white p-3 rounded-md border border-gray-600"
                    />
                    <input type="email"
                        name="email"
                        placeholder="Your email" required
                        className="bg-gray-900 text-white p-3 rounded-md border border-gray-600"
                    />
                    <textarea name="message"
                            placeholder="Your message" required
                            className="bg-gray-900 text-white p-3 rounded-md border border-gray-600 h-32 resize-none"
                    />
                    <button type="submit" className="bg-white text-black font-semibold py-2 px-4 rounded-md hover:bg-gray-200 transition">
                        Send Message
                    </button>
                </form>

                {showPopup && (
                    <div className="popup-message">
                        This is a dummy component, email is shared on resume.
                    </div>
                )}

                <div className="flex justify-center gap-6 text-sm contact-links">
                    <a href="https://www.linkedin.com/in/aadishrath"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-gray-300 transition">
                        <FaLinkedin size={15} /> LinkedIn
                    </a>
                    
                    <a href="https://github.com/aadishrath"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-gray-300 transition">
                        <FaGithub size={15} /> GitHub
                    </a>

                    <a href="/AadishRathore.pdf"
                    download="Aadish_Rathore_Resume.pdf"
                    className="flex items-center gap-2 hover:text-gray-300 transition">
                        <FaEnvelope size={15} /> Resume
                    </a>
                </div>
            </section>
        </footer>
    );
}

export default Footer;
