import { useState } from 'react'
import { BsCalendarWeek, BsClock, BsSunrise, BsSunset, BsHourglassSplit } from 'react-icons/bs'
import { FaEdit, FaTrash, FaMoon, FaSun } from 'react-icons/fa'
import { Col, Card, Badge, Button } from 'react-bootstrap'
import Edit from './Edit'
import Delete from './Delete'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
const moment = require('moment')

const Index = ({ sleep }) => {
  const [showOptions, setShowOptions] = useState(false)
  const sleepTime = sleep.sleep.replace('T', ' ')
  const wakeTime = sleep.wake.replace('T', ' ')
  
  // Format dates for display
  const sleepDate = moment(sleep.sleep).format('DD MMM YYYY')
  const sleepTimeFormatted = moment(sleep.sleep).format('hh:mm A')
  const wakeTimeFormatted = moment(sleep.wake).format('hh:mm A')
  
  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }
  
  // Determine if sleep duration is healthy (7-9 hours is recommended)
  const getHealthStatus = (minutes) => {
    const hours = minutes / 60;
    if (hours < 6) return { color: 'danger', text: 'Insufficient' };
    if (hours < 7) return { color: 'warning', text: 'Below Recommended' };
    if (hours <= 9) return { color: 'success', text: 'Healthy' };
    return { color: 'info', text: 'Extended' };
  }
  
  const healthStatus = getHealthStatus(sleep.duration);

  return (
    <Col md={6} lg={4} className="mb-4">
      <Card 
        className="h-100 shadow-sm border-0 hover-card"
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0">
          <div className="d-flex align-items-center">
            <BsCalendarWeek className="text-primary me-2 fs-5" />
            <span className="fw-bold">{sleepDate}</span>
          </div>
          <Badge bg={healthStatus.color}>{healthStatus.text}</Badge>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <FaMoon className="text-primary me-2" />
                <span className="text-muted">Sleep Time</span>
              </div>
              <span className="fw-bold">{sleepTimeFormatted}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaSun className="text-warning me-2" />
                <span className="text-muted">Wake Time</span>
              </div>
              <span className="fw-bold">{wakeTimeFormatted}</span>
            </div>
          </div>
          
          <div className="bg-light p-3 rounded text-center mb-2">
            <div className="d-flex align-items-center justify-content-center mb-1">
              <BsHourglassSplit className="me-2 text-primary" />
              <span className="text-muted">Sleep Duration</span>
            </div>
            <div className="display-6 fw-bold">{formatDuration(sleep.duration)}</div>
          </div>
          
          <div className="text-muted small text-center">
            Recorded {formatDistanceToNow(new Date(sleep.createdAt), { addSuffix: true })}
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-0 d-flex justify-content-end">
          <Edit sleep={sleep} />
          <Delete sleep={sleep} />
        </Card.Footer>
      </Card>
      
      <style jsx="true">{`
        .hover-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </Col>
  )
}
  
export default Index

