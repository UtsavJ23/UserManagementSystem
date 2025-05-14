import { useRef, useState, useEffect } from 'react'
import { Alert, Button, Form, Modal, Row, Col, Spinner } from 'react-bootstrap'
import { useTasksContext } from '../../context/task'
import { useAuthContext } from '../../context/auth'
import { BsPlusLg } from 'react-icons/bs'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'

const Add = () => {
  const axiosPrivate = useAxiosPrivate()
  const { dispatch } = useTasksContext()
  const { auth } = useAuthContext()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [show, setShow] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const titleRef = useRef('')
  const descriptionRef = useRef('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  
  // Check authentication before opening modal
  const handleOpenModal = () => {
    if (!auth) {
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }
    setShow(true)
  }
  
  // Effect to check authentication status when component mounts
  useEffect(() => {
    if (show && !auth) {
      setShow(false)
      setError('Authentication required')
      // Redirect to login
      navigate('/login')
    }
  }, [auth, show, navigate])
  
  const handleAdd = async (e) => {
    e.preventDefault()
    
    if (!auth) {
      setError('You must be logged in')
      setTimeout(() => {
        setShow(false)
        navigate('/login')
      }, 1500)
      return
    }
    
    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }
    
    setValidated(true)
    setIsLoading(true)
    setError(null)
    
    try {
      const taskData = {
        title: titleRef.current.value,
        description: descriptionRef.current.value,
        priority: priority,
        dueDate: dueDate || null,
        status: 'pending'
      }
      
      console.log('Sending task data:', taskData)
      
      const response = await axiosPrivate.post('/api/tasks', taskData)
      
      console.log('Task created successfully:', response.data)
      dispatch({type: 'CREATE_TASK', payload: response.data})
      setSuccess(true)
      
      // Auto close after success
      setTimeout(() => {
        setShow(false)
        setSuccess(false)
        
        // Reset form after closing
        titleRef.current.value = ''
        descriptionRef.current.value = ''
        setPriority('medium')
        setDueDate('')
        setValidated(false)
      }, 1500)
    } catch (error) {
      console.error('Task creation error:', error)
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Authentication failed. Please log in again.')
        setTimeout(() => {
          setShow(false)
          navigate('/login')
        }, 1500)
      } else {
        setError(error.response?.data?.error || 'Failed to create task. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShow(false)
    setError(null)
    setSuccess(false)
    setValidated(false)
    // Reset form
    titleRef.current.value = ''
    descriptionRef.current.value = ''
    setPriority('medium')
    setDueDate('')
  }

  return (
    <>
      <Button 
        variant="primary" 
        className="d-flex align-items-center justify-content-center gap-2" 
        onClick={handleOpenModal}
      >
        <BsPlusLg /> <span>New Task</span>
      </Button>

      <Modal 
        show={show} 
        onHide={handleClose} 
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header> 
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleAdd}>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                ref={titleRef} 
                placeholder="Enter task title"
                required
                minLength={3}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a title (at least 3 characters).
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                ref={descriptionRef} 
                placeholder="Enter task details"
                required
                minLength={5}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a description (at least 5 characters).
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {error && (<Alert variant='danger'>{error}</Alert>)}
            {success && (<Alert variant='success'>Task created successfully!</Alert>)}
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                    <span className="ms-2">Adding...</span>
                  </>
                ) : 'Add Task'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default Add