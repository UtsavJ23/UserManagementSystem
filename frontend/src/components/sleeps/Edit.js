import { useRef, useState } from 'react'
import { FaEdit, FaMoon, FaSun } from 'react-icons/fa'
import { BsHourglassSplit } from 'react-icons/bs'
import { Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap'
import { useWorkingHoursContext } from '../../context/workingHours'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
const moment = require('moment')

const Edit = ({ sleep }) => {
  const axiosPrivate = useAxiosPrivate()
  const { dispatch } = useWorkingHoursContext()
  
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const sleepRef = useRef('')
  const wakeRef = useRef('')
  
  // Calculate duration between sleep and wake times
  const calculateDuration = (sleepTime, wakeTime) => {
    const sleepMoment = moment(sleepTime);
    const wakeMoment = moment(wakeTime);
    
    // Check if wake time is before sleep time (user slept past midnight)
    if (wakeMoment.isBefore(sleepMoment)) {
      return 'Please ensure wake time is after sleep time';
    }
    
    const durationMinutes = wakeMoment.diff(sleepMoment, 'minutes');
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours} hours and ${minutes} minutes`;
  };

  const [previewDuration, setPreviewDuration] = useState('');

  const updatePreview = () => {
    if (sleepRef.current.value && wakeRef.current.value) {
      setPreviewDuration(calculateDuration(sleepRef.current.value, wakeRef.current.value));
    }
  };

  const handleUpdate = async () => {
    if (!sleepRef.current.value || !wakeRef.current.value) {
      setError('Both sleep and wake times are required')
      return
    }
    
    const sleepTime = moment(sleepRef.current.value);
    const wakeTime = moment(wakeRef.current.value);
    
    if (wakeTime.isBefore(sleepTime)) {
      setError('Wake time must be after sleep time')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await axiosPrivate.patch('/api/sleeps/' + sleep._id, {
        sleep: sleepRef.current.value,
        wake: wakeRef.current.value
      })
      
      const sleeps = await axiosPrivate.get('/api/sleeps')
      dispatch({type: 'UPDATE_WORKING_HOUR', payload: sleeps.data})
      setError(null)
      setShow(false)
    } catch (error) {
      setError(error.response?.data.error || 'Failed to update sleep record')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    // Format date time string for the input field
    return moment(dateString).format('YYYY-MM-DDTHH:mm')
  }

  const handleShow = () => {
    setShow(true)
    // Reset any previous errors
    setError(null)
    
    // Calculate initial duration preview
    const initialDuration = calculateDuration(
      formatDateTime(sleep.sleep), 
      formatDateTime(sleep.wake)
    );
    setPreviewDuration(initialDuration);
  }

  return (
    <>
      <Button 
        variant="outline-primary" 
        size="sm" 
        className="me-2" 
        onClick={handleShow}
      >
        <FaEdit />
      </Button>

      <Modal 
        show={show} 
        onHide={() => setShow(false)} 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5">Edit Sleep Record</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FaMoon className="text-primary me-2" /> Sleep Time
                  </Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    ref={sleepRef} 
                    defaultValue={formatDateTime(sleep.sleep)}
                    onChange={updatePreview}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FaSun className="text-warning me-2" /> Wake Time
                  </Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    ref={wakeRef} 
                    defaultValue={formatDateTime(sleep.wake)}
                    onChange={updatePreview}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {previewDuration && (
              <div className="mb-3 p-2 bg-light rounded text-center">
                <div className="d-flex align-items-center justify-content-center">
                  <BsHourglassSplit className="me-2" />
                  <strong>Sleep Duration: </strong>&nbsp;
                  {previewDuration}
                </div>
              </div>
            )}
            
            {error && (
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Record'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Edit