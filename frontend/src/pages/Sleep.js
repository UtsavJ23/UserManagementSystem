import { useEffect, useState } from 'react'
import { ROLES } from '../config/roles'
import { usePathContext } from '../context/path'
import { useUserContext } from '../context/user'
import { useAuthContext } from '../context/auth'
import { useWorkingHoursContext } from '../context/workingHours'
import { BsFillPersonFill, BsCalendarWeek } from "react-icons/bs"
import { FaAddressCard, FaBriefcase, FaChartBar, FaListAlt } from "react-icons/fa"
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import { Container, Row, Col, Card, Badge, Alert, Tab, Tabs } from 'react-bootstrap'
import Details from '../components/sleeps/Index'
import Navbar from '../components/sleeps/Navbar'
import AddSleep from '../components/sleeps/Add'

const Sleep = () => {
  const { auth } = useAuthContext()
  const { setTitle } = usePathContext()
  const { targetUser } = useUserContext()
  const { workingHours, dispatch } = useWorkingHoursContext()
  const [ error, setError ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ activeTab, setActiveTab ] = useState('list')
  const axiosPrivate = useAxiosPrivate()
  const admin = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Root)

  // Calculate working hours stats
  const calculateStats = () => {
    if (!workingHours || workingHours.length === 0) return { average: 0, total: 0, count: 0 };
    
    const totalMinutes = workingHours.reduce((sum, workingHour) => sum + workingHour.duration, 0);
    const averageMinutes = Math.round(totalMinutes / workingHours.length);
    
    return {
      average: averageMinutes,
      total: totalMinutes,
      count: workingHours.length
    };
  };

  const stats = calculateStats();
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()
    setTitle("Working Hours Tracker")
    setLoading(true)

    const getWorkingHours = async () => {
      try {
        let response
        if(targetUser?.userId && (auth.email !== targetUser.userEmail) && admin){
          // Admin view
          response = await axiosPrivate.post('/api/sleeps/admin', {
            id: targetUser.userId,
            signal: abortController.signal
          })
        }else{
          response = await axiosPrivate.get('/api/sleeps', {
            signal: abortController.signal
          })
        }

        isMounted && dispatch({type: 'SET_WORKING_HOURS', payload: response.data})
        setError(null)
      } catch (err) {
        dispatch({type: 'SET_WORKING_HOURS', payload: []})
        setError(err.response?.data.error)
      } finally {
        setLoading(false)
      }
    }

    if(auth){
      getWorkingHours()
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [])

  return (
    <Container className="py-4">
      {targetUser?.userName && workingHours && (
        <Card className="bg-primary bg-opacity-25 rounded mb-4 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex align-items-center">
              <FaAddressCard className="fs-4 me-2" />
              <span className="me-3">{targetUser?.userName}</span>
              <BsFillPersonFill className="fs-4 me-2" />
              <span>{targetUser?.userRoles}</span>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 d-flex align-items-center">
          <FaBriefcase className="me-2 text-primary" /> Working Hours Tracker
        </h2>
        <Navbar />
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100 border-0">
            <Card.Body className="text-center">
              <div className="display-4 text-primary mb-2">{stats.count}</div>
              <div className="text-muted">Total Records</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 border-0">
            <Card.Body className="text-center">
              <div className="display-4 text-success mb-2">{formatDuration(stats.average)}</div>
              <div className="text-muted">Average Working Time</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 border-0">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <AddSleep />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-0"
          >
            <Tab eventKey="list" title={<span><FaListAlt className="me-2" />Work Log</span>} />
            <Tab eventKey="stats" title={<span><FaChartBar className="me-2" />Productivity Analysis</span>} />
          </Tabs>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Loading working hours records...</p>
            </div>
          ) : (
            <>
              {activeTab === 'list' && (
                <div className="working-hours-list">
                  {workingHours && workingHours.length > 0 ? (
                    <Row>
                      {workingHours.map(workingHour => (
                        <Details sleep={workingHour} key={workingHour._id} />
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      No working hours records found. Start tracking your work by adding your first record.
                    </Alert>
                  )}
                </div>
              )}
              
              {activeTab === 'stats' && (
                <div className="working-hours-stats">
                  {workingHours && workingHours.length > 0 ? (
                    <div className="text-center py-4">
                      <h4>Working Hours Over Time</h4>
                      <div className="p-4 bg-light rounded">
                        <p className="mb-0">Productivity analysis visualization would appear here.</p>
                        <small className="text-muted">This is a placeholder for the productivity analysis chart.</small>
                      </div>
                      
                      <div className="mt-4">
                        <h5 className="mb-3">Productivity Statistics</h5>
                        <Row className="g-3">
                          <Col md={4}>
                            <Card className="bg-light border-0">
                              <Card.Body className="text-center">
                                <h6>Total Work Days</h6>
                                <div className="fs-4">{stats.count}</div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card className="bg-light border-0">
                              <Card.Body className="text-center">
                                <h6>Average Work Time</h6>
                                <div className="fs-4">{formatDuration(stats.average)}</div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card className="bg-light border-0">
                              <Card.Body className="text-center">
                                <h6>Total Hours Worked</h6>
                                <div className="fs-4">{formatDuration(stats.total)}</div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  ) : (
                    <Alert variant="info">
                      Add working hours records to see your productivity statistics and analysis.
                    </Alert>
                  )}
                </div>
              )}
            </>
          )}
          
          {error && !workingHours?.length && (
            <Alert variant="danger">{error}</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Sleep