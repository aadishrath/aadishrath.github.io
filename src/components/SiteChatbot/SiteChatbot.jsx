import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { iconsMap } from '../../assets/iconsMap';
import { FaArrowUp, FaGlobeAmericas, FaRegCompass, FaRobot, FaTimes } from 'react-icons/fa';
import { getQuickPrompts, getRouteLabel, resolveChatbotAnswer } from '../../lib/siteChatbotKnowledge';
import './SiteChatbot.css';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "Ask me about my portfolio, the projects on this site, or a basic stable world topic. I'll do my best to answer using the information I have!",
  sources: [],
};

function createMessage(role, text, sources = []) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    sources,
  };
}

function SourcePills({ sources }) {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className="site-chatbot__sources">
      {sources.map((source, index) => {
        const key = `${source.label}-${index}`;
        if (source.href) {
          const isExternal = /^https?:\/\//.test(source.href);
          return (
            <a
              key={key}
              className="site-chatbot__source-pill"
              href={source.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer noopener' : undefined}
            >
              {source.label}
            </a>
          );
        }

        return (
          <span key={key} className="site-chatbot__source-pill">
            {source.label}
          </span>
        );
      })}
    </div>
  );
}

function SiteChatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const quickPrompts = useMemo(() => getQuickPrompts(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  async function submitPrompt(rawPrompt) {
    const prompt = rawPrompt.trim();
    if (!prompt || isLoading) {
      return;
    }

    const userMessage = createMessage('user', prompt);
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const answer = await resolveChatbotAnswer({
        query: prompt,
        pathname: location.pathname,
      });

      setMessages((current) => [
        ...current,
        createMessage('assistant', answer.text, answer.sources),
      ]);
    } catch {
      setError("I hit a snag while answering that. Try again, or ask something about the site's content.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitPrompt(input);
  }

  function handlePromptClick(prompt) {
    submitPrompt(prompt);
  }

  return (
    <div className="site-chatbot" aria-live="polite">
      {isOpen && (
        <section className="site-chatbot__panel" aria-label="Website chatbot">
          <header className="site-chatbot__header">
            <div className="site-chatbot__header-copy">
              <span className="site-chatbot__eyebrow">Site Guide</span>
              <h2>Ask the portfolio chatbot</h2>
              <p>Site answers are grounded in the portfolio. General answers use a public encyclopedia lookup when available.</p>
            </div>
            <button
              type="button"
              className="site-chatbot__icon-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <FaTimes className="site-chatbot__close-icon" />
            </button>
          </header>

          <div ref={bodyRef} className="site-chatbot__body">
            <div className="site-chatbot__context-card">
              <FaRegCompass className="site-chatbot__context-icon" />
              <div>
                <strong>Current page:</strong> {getRouteLabel(location.pathname)}
              </div>
            </div>

            <div className="site-chatbot__quick-prompts">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="site-chatbot__prompt-chip"
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="site-chatbot__messages">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`site-chatbot__message site-chatbot__message--${message.role}`}
                >
                  <div className="site-chatbot__message-label">
                    {message.role === 'assistant' ? (
                      <>
                        <FaRobot />
                        <span>Assistant</span>
                      </>
                    ) : (
                      <>
                        <FaGlobeAmericas />
                        <span>You</span>
                      </>
                    )}
                  </div>
                  <p>{message.text}</p>
                  <SourcePills sources={message.sources} />
                </article>
              ))}

              {isLoading && (
                <article className="site-chatbot__message site-chatbot__message--assistant">
                  <div className="site-chatbot__message-label">
                    <FaRobot />
                    <span>Assistant</span>
                  </div>
                  <p>Thinking through that now...</p>
                </article>
              )}

              {error && (
                <article className="site-chatbot__message site-chatbot__message--assistant">
                  <div className="site-chatbot__message-label">
                    <FaRobot />
                    <span>Assistant</span>
                  </div>
                  <p>{error}</p>
                </article>
              )}
            </div>
          </div>

          <form className="site-chatbot__composer" onSubmit={handleSubmit}>
            <label className="site-chatbot__composer-label" htmlFor="site-chatbot-input">
              Message
            </label>
            <div className="site-chatbot__composer-row">
              <input
                ref={inputRef}
                id="site-chatbot-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about the site or a basic world topic"
                autoComplete="off"
              />
              <button type="submit" className="site-chatbot__send-button" disabled={isLoading}>
                <FaArrowUp className="site-chatbot__send-icon" />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`site-chatbot__launcher ${isOpen ? 'site-chatbot__launcher--hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open website chatbot"
      >
        <img src={iconsMap.chat} alt="Chat" className="site-chatbot__launcher-logo" />
      </button>
    </div>
  );
}

export default SiteChatbot;
