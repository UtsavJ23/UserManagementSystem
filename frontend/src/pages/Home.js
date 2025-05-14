import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/auth'
import { usePathContext } from '../context/path'
import { useTasksContext } from '../context/task'
import { Row, Col } from 'react-bootstrap'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useHandleUrlToken from '../hooks/useHandleUrlToken'
import WeatherWidget from '../components/WeatherWidget'
import QuoteWidget from '../components/QuoteWidget'
import GoalsWidget from '../components/GoalsWidget'

const Home = () => {
    const { auth } = useAuthContext()
    const { setTitle } = usePathContext()
    const { tasks } = useTasksContext()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [taskStats, setTaskStats] = useState({ pending: 0, inProgress: 0, completed: 0 })
    const axiosPrivate = useAxiosPrivate()
    
    // Use the hook to handle URL tokens
    useHandleUrlToken()

    const formatDate = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        
        const date = new Date()
        const dayName = days[date.getDay()]
        const monthName = months[date.getMonth()]
        const day = date.getDate()
        const year = date.getFullYear()
        
        return `${dayName}, ${monthName} ${day}, ${year}`
    }

    useEffect(() => {
        setTitle("Home")
        // Update authentication state when auth changes
        setIsAuthenticated(!!auth)
        
        if (auth) {
            console.log("User is authenticated:", auth.name)
            
            // Fetch tasks
            const fetchTasks = async () => {
                try {
                    const response = await axiosPrivate.get('/api/tasks')
                    if (response.data && Array.isArray(response.data)) {
                        console.log("Tasks data:", response.data)
                        // Calculate task stats
                        const pending = response.data.filter(task => task.status === 'pending').length
                        const inProgress = response.data.filter(task => task.status === 'in-progress').length
                        const completed = response.data.filter(task => task.status === 'completed').length
                        
                        console.log("Stats calculated:", { pending, inProgress, completed })
                        setTaskStats({ pending, inProgress, completed })
                    }
                } catch (err) {
                    console.error('Error fetching tasks:', err)
                }
            }
            
            fetchTasks()
        } else {
            console.log("User is not authenticated")
        }
    }, [auth, setTitle, axiosPrivate])

    return (
        <div className="container">
            <div className="py-5">
                {auth ? (
                    <>
                        <header className="mb-5">
                            <h1 className="mb-2">Hello, {auth.name}</h1>
                            <p className="text-muted">{formatDate()}</p>
                            <hr className="my-4" />
                        </header>

                        <Row>
                            <Col lg={8}>
                                <section className="mb-5">
                                    <h5 className="mb-4">QUICK ACCESS</h5>
                                    <Row>
                                        <Col md={4} className="mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h4 className="card-title mb-3">Tasks</h4>
                                                    <p className="text-muted mb-4">Manage and track your daily tasks</p>
                                                    <Link to="/task" className="btn">View Tasks</Link>
                                                </div>
                                            </div>
                                        </Col>
                                        
                                        <Col md={4} className="mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h4 className="card-title mb-3">Notes</h4>
                                                    <p className="text-muted mb-4">Store and organize your notes</p>
                                                    <Link to="/note" className="btn">View Notes</Link>
                                                </div>
                                            </div>
                                        </Col>
                                        
                                        <Col md={4} className="mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h4 className="card-title mb-3">Working Hours</h4>
                                                    <p className="text-muted mb-4">Track your working time</p>
                                                    <Link to="/sleep" className="btn">View Hours</Link>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </section>

                                <section className="mb-5">
                                    <h5 className="mb-4">TASK OVERVIEW</h5>
                                    <div className="card">
                                        <div className="card-body">
                                            <Row className="text-center">
                                                <Col md={4} className="mb-4 mb-md-0">
                                                    <p className="text-muted mb-1">Pending</p>
                                                    <h2 className="mb-0">{taskStats.pending}</h2>
                                                </Col>
                                                <Col md={4} className="mb-4 mb-md-0">
                                                    <p className="text-muted mb-1">In Progress</p>
                                                    <h2 className="mb-0">{taskStats.inProgress}</h2>
                                                </Col>
                                                <Col md={4}>
                                                    <p className="text-muted mb-1">Completed</p>
                                                    <h2 className="mb-0">{taskStats.completed}</h2>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </section>
                                
                                <section>
                                    <GoalsWidget />
                                </section>
                            </Col>
                            
                            <Col lg={4}>
                                <WeatherWidget />
                                <QuoteWidget />
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div className="text-center py-5">
                        <h2 className="mb-4">User Management System</h2>
                        <p className="text-muted mb-5">A simple and minimal system to organize your daily activities</p>
                        <div className="d-flex justify-content-center gap-3">
                            <Link to="/login" className="btn">Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home