import { useRef, useState } from 'react'
import { ROLES } from '../../config/roles'
import { FaAddressCard, FaSave, FaTimes, FaTags } from 'react-icons/fa'
import { BiArrowBack } from 'react-icons/bi'
import { BsFillPersonFill } from 'react-icons/bs'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Col, Form, Row, Stack, Card, Container } from "react-bootstrap"
import { useAuthContext } from '../../context/auth'
import { useUserContext } from '../../context/user'
import CreatableReactSelect from "react-select/creatable"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

const Add = () => {
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuthContext()
  const { targetUser } =  useUserContext()
  const [ error, setError ] = useState(null)
  const [ tag, setTag ] = useState([])
  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const titleRef = useRef('')
  const textRef = useRef('')

  const statusBar = {
    Root: "bg-danger",
    Admin: "bg-warning",
    User: "bg-primary"
  }

  const color = statusBar[targetUser?.userRoles]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!auth) {
      setError('You must be logged in')
      return
    }
    
    if (!titleRef.current.value.trim()) {
      setError('Title is required')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const tags = tag.map(t => t.value)
      const rightToAdd = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Root)
      const note = {
        title: titleRef.current.value.trim(), 
        text: textRef.current.value.trim(), 
        tag: tags
      }

      if(targetUser?.userId && (auth.email !== targetUser?.userEmail) && (rightToAdd)){
        note.id = targetUser.userId
      }

      await axiosPrivate.post('/api/notes', note)
      setError(null)
      navigate('/note')
    } catch (error) {
      setError(error.response?.data.error || 'Failed to create note')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Container>
      {targetUser?.userName && (
        <Card className={`${color} bg-opacity-25 rounded pt-2 mb-3`}>
          <Card.Body>
            <Stack direction="horizontal" gap={3}>
              <span className="d-inline-flex align-items-center">
                <FaAddressCard className="fs-4 me-2"/>{targetUser?.userName}
              </span>
              <span className="d-inline-flex align-items-center">
                <BsFillPersonFill className="fs-4 me-2"/>{targetUser?.userRoles}
              </span>
            </Stack>
          </Card.Body>
        </Card>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Create New Note</h2>
        <Link to="/note">
          <Button variant="outline-secondary">
            <BiArrowBack className="me-2" /> Back to Notes
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Row>
                <Col md={8}>
                  <Form.Group controlId="title">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      ref={titleRef} 
                      placeholder="Enter note title" 
                      required
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="tag">
                    <Form.Label className="d-flex align-items-center">
                      <FaTags className="me-2" /> Tags
                    </Form.Label>
                    <CreatableReactSelect 
                      isMulti 
                      onChange={setTag}
                      placeholder="Add tags..."
                      noOptionsMessage={() => "Type to create a new tag"}
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '45px'
                        })
                      }}
                    />
                    <Form.Text className="text-muted">
                      Tags help you organize and find notes easily
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group controlId="markdown">
                <Form.Label>Content</Form.Label>
                <Form.Control 
                  as="textarea" 
                  ref={textRef} 
                  rows={15}
                  placeholder="Write your note content here..."
                  style={{ resize: 'vertical' }}
                />
              </Form.Group>
              
              {error && (
                <Alert variant="danger" className="mb-0">
                  {error}
                </Alert>
              )}
              
              <Stack direction="horizontal" gap={2} className="justify-content-end">
                <Link to="/note">
                  <Button variant="outline-secondary" className="d-flex align-items-center">
                    <FaTimes className="me-2" /> Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="d-flex align-items-center"
                  disabled={isSubmitting}
                >
                  <FaSave className="me-2" /> 
                  {isSubmitting ? 'Saving...' : 'Save Note'}
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Add