import { useState } from 'react'
import { Button, Form, Row, Col, Offcanvas } from 'react-bootstrap'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import DatePicker from 'react-datepicker'
import { useWorkingHoursContext } from '../../context/workingHours'
import 'react-datepicker/dist/react-datepicker.css'
import { FaPlus, FaClock } from 'react-icons/fa'

const AddSleep = () => {
  const initialState = {
    date: new Date(),
    hours: 8,
    minutes: 0
  }

  const [formData, setFormData] = useState(initialState)
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)
  const axiosPrivate = useAxiosPrivate()
  const { dispatch } = useWorkingHoursContext()

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const onChangeDate = (date) => {
    setFormData({
      ...formData,
      date
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const duration = (formData.hours * 60) + formData.minutes
      
      // Format date for API
      const formattedDate = formData.date.toISOString().split('T')[0]
      
      const response = await axiosPrivate.post('/api/sleeps', {
        date: formattedDate,
        duration
      })
      
      dispatch({ type: 'CREATE_WORKING_HOUR', payload: response.data })
      setFormData(initialState)
      handleClose()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add working hours')
    }
  }

  return (
    <>
      <Button 
        variant="primary" 
        onClick={handleShow} 
        className="w-100 d-flex align-items-center justify-content-center"
      >
        <FaPlus className="me-2" />
        Add Working Hours
      </Button>

      <Offcanvas show={show} onHide={handleClose} placement="end" className="p-0">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>
            <div className="d-flex align-items-center">
              <FaClock className="me-2" />
              Add Working Hours
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Date</Form.Label>
              <DatePicker
                selected={formData.date}
                onChange={onChangeDate}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
              />
            </Form.Group>

            <Form.Label>Duration</Form.Label>
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label>Hours</Form.Label>
                  <Form.Control
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    min="0"
                    max="24"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Minutes</Form.Label>
                  <Form.Control
                    type="number"
                    name="minutes"
                    value={formData.minutes}
                    onChange={handleChange}
                    min="0"
                    max="59"
                  />
                </Form.Group>
              </Col>
            </Row>

            {error && (
              <div className="alert alert-danger mb-4">
                {error}
              </div>
            )}

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
            >
              Save
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default AddSleep