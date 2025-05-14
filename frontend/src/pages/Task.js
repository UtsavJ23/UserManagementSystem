import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BiArrowBack } from 'react-icons/bi'
import { useUserContext } from '../context/user'
import { useAuthContext } from '../context/auth'
import { useTasksContext } from '../context/task'
import { usePathContext } from '../context/path'
import { ROLES } from '../config/roles'
import { FaAddressCard, FaFilter, FaTasks, FaSearch } from "react-icons/fa"
import { BsFillPersonFill } from "react-icons/bs"
import { Form, Row, Col, Stack, Badge, Card, Button } from 'react-bootstrap'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import Details from '../components/tasks/Index'
import Add from '../components/tasks/Add'

const Task = () => {
  const navigate = useNavigate()
  const { auth } = useAuthContext()
  const { targetUser } = useUserContext()
  const { setTitle } = usePathContext()
  const { tasks, dispatch } =  useTasksContext()
  const [ error, setError ] = useState(null)
  const axiosPrivate = useAxiosPrivate()
  const admin = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Root)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const statusBar = {
    Root: "primary",
    Admin: "warning",
    User: "info"
  }
  
  const color = statusBar[targetUser?.userRoles] || "primary"

  const handleBack = () => {
    setTitle("Welcome")
    navigate("/")
  }

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Search filter
      const titleMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = titleMatch || descriptionMatch;
      
      // Status filter
      const statusMatch = statusFilter === 'all' || task.status === statusFilter;
      
      // Priority filter
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    setTitle("Task Management")
    let isMounted = true
    const abortController = new AbortController()

    const getAllTask = async () => {
      try {
        const endpoint = targetUser?.userId && admin ? '/api/tasks/inspect' : '/api/tasks'
        const method = targetUser?.userId && admin ? 'post' : 'get'
        const data = targetUser?.userId && admin ? { id: targetUser.userId } : undefined
  
        const response = await axiosPrivate({
          method,
          url: endpoint,
          data,
          signal: abortController.signal
        })
  
        isMounted && dispatch({ type: 'SET_TASKS', payload: response.data })
        setError(null)
      } catch (err) {
        dispatch({ type: 'SET_TASKS', payload: [] })
        setError(err.response?.data.error)
      }
    }

    if(auth){
      getAllTask()
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  },[])

  return (
    <>
      {auth && (
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button 
                variant="light" 
                className="rounded-circle shadow-sm me-3 d-flex align-items-center justify-content-center" 
                style={{width: "40px", height: "40px"}}
                onClick={handleBack}
              >
                <BiArrowBack />
              </Button>
              <h3 className="mb-0 fw-bold">Task Management</h3>
            </div>
            <Add />
          </div>

          {targetUser?.userName && (
            <Card className="border-0 shadow-sm mb-4 p-3">
              <Card.Body className="p-0">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <h5 className="mb-1">{targetUser?.userName}</h5>
                    <div className="text-muted">
                      <span>{targetUser?.userRoles}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light border-bottom p-3">
              <h5 className="mb-0 fw-medium">Task Filters</h5>
            </Card.Header>
            
            <Card.Body className="p-4">
              <Stack gap={3}>
                <Form.Group>
                  <div className="position-relative">
                    <Form.Control 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="py-2 ps-5"
                    />
                    <FaSearch className="position-absolute text-muted" style={{top: "12px", left: "15px"}} />
                  </div>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Priority</Form.Label>
                      <Form.Select 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="py-2"
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Stack>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0 ps-2 border-start border-primary border-3 fw-bold">Your Tasks</h4>
            <Badge 
              bg="primary" 
              className="px-3 py-2 rounded-pill"
            >
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
          </div>

          {filteredTasks.length > 0 ? (
            <Details tasks={filteredTasks}/>
          ) : (
            <Card className="text-center border-0 shadow-sm p-5">
              <Card.Body>
                <div className="mb-3">
                  <FaTasks className="display-4 text-muted opacity-50" />
                </div>
                <h5 className="text-muted mb-3">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'No tasks match your current filters' 
                    : 'No tasks found. Create a new task to get started!'}
                </h5>
                {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="px-4 py-2 rounded-pill"
                  >
                    Clear Filters
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
          
          {error && (
            <div className="alert alert-danger mt-4">
              <div>{error}</div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Task