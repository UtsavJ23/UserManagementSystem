import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { FaQuoteLeft } from 'react-icons/fa';

const QuoteWidget = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated quotes for demo purposes
    const quotes = [
      {
        text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill"
      },
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
      },
      {
        text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
        author: "Steve Jobs"
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
      },
      {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
      },
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      }
    ];

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading quote...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body className="p-4">
        <h5 className="mb-3">Inspirational Quote</h5>
        {quote && (
          <div className="text-center py-2">
            <div className="mb-3">
              <FaQuoteLeft className="text-primary opacity-50" size={24} />
            </div>
            <p className="lead mb-2">{quote.text}</p>
            <p className="text-muted">— {quote.author}</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QuoteWidget; 