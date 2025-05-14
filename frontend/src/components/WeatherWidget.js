import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Using a simulated weather response for demo purposes
    // In a real app, you would fetch from a weather API
    const simulateWeatherFetch = () => {
      setLoading(true);
      
      setTimeout(() => {
        const weatherOptions = [
          { 
            temp: Math.floor(Math.random() * 15) + 15, 
            condition: 'Clear', 
            location: 'Mumbai',
            humidity: Math.floor(Math.random() * 30) + 60,
            wind: Math.floor(Math.random() * 10) + 5
          },
          { 
            temp: Math.floor(Math.random() * 10) + 20, 
            condition: 'Clouds', 
            location: 'Delhi',
            humidity: Math.floor(Math.random() * 30) + 50,
            wind: Math.floor(Math.random() * 12) + 3
          },
          { 
            temp: Math.floor(Math.random() * 8) + 22, 
            condition: 'Rain', 
            location: 'Bangalore',
            humidity: Math.floor(Math.random() * 20) + 70,
            wind: Math.floor(Math.random() * 8) + 2
          }
        ];
        
        setWeather(weatherOptions[Math.floor(Math.random() * weatherOptions.length)]);
        setLoading(false);
      }, 1000);
    };
    
    simulateWeatherFetch();
  }, []);

  const getWeatherIcon = (condition) => {
    switch(condition) {
      case 'Clear':
        return <WiDaySunny size={64} className="text-warning" />;
      case 'Clouds':
        return <WiCloudy size={64} className="text-secondary" />;
      case 'Rain':
        return <WiRain size={64} className="text-primary" />;
      case 'Snow':
        return <WiSnow size={64} className="text-info" />;
      case 'Thunderstorm':
        return <WiThunderstorm size={64} className="text-dark" />;
      case 'Mist':
      case 'Fog':
        return <WiFog size={64} className="text-muted" />;
      default:
        return <WiDaySunny size={64} className="text-warning" />;
    }
  };

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading weather data...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="text-center p-4">
          <p className="text-danger mb-0">Unable to load weather data</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body className="p-4">
        <h5 className="mb-3">Current Weather</h5>
        {weather && (
          <Row className="align-items-center">
            <Col xs={5} className="text-center">
              {getWeatherIcon(weather.condition)}
              <h2 className="mb-0 mt-2">{weather.temp}°C</h2>
              <p className="text-muted mb-0">{weather.condition}</p>
            </Col>
            <Col xs={7}>
              <h5 className="mb-3">{weather.location}</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Humidity</span>
                <span>{weather.humidity}%</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Wind</span>
                <span>{weather.wind} km/h</span>
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget; 