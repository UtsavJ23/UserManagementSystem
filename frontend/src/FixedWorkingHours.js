import { useEffect, useState } from 'react';
import { ROLES } from './config/roles';
import { usePathContext } from './context/path';
import { useUserContext } from './context/user';
import { useAuthContext } from './context/auth';
import { useWorkingHoursContext } from './context/workingHours';
import { BsFillPersonFill, BsCalendarWeek, BsCalendarMonth, BsCheckCircle, BsHourglass } from "react-icons/bs";
import { FaAddressCard, FaBriefcase, FaChartBar, FaListAlt, FaCalendarAlt } from "react-icons/fa";
import useAxiosPrivate from "./hooks/useAxiosPrivate";
import { Container, Row, Col, Card, Badge, Alert, Tab, Tabs, Table } from 'react-bootstrap';

const WorkingHours = () => {
  console.log("WorkingHours component rendering");
  const { auth } = useAuthContext();
  const { setTitle } = usePathContext();
  const { targetUser } = useUserContext();
  const { workingHours, dispatch } = useWorkingHoursContext();
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ activeTab, setActiveTab ] = useState('list');
  const [ selectedMonth, setSelectedMonth ] = useState(new Date().getMonth());
  const [ selectedYear, setSelectedYear ] = useState(new Date().getFullYear());
  const axiosPrivate = useAxiosPrivate();
  
  // Safely check admin role
  const isAdmin = () => {
    try {
      if (!auth || !auth.roles) return false;
      return auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Root);
    } catch (err) {
      console.error("Error checking admin roles:", err);
      return false;
    }
  };
  
  const admin = isAdmin();

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

  // Get days in month for calendar
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get workingHours data for a specific date  
  const getWorkHoursForDate = (date) => {
    try {
      if (!workingHours || !Array.isArray(workingHours)) return null;
      
      const dateString = date.toISOString().split('T')[0];
      return workingHours.find(record => {
        if (!record || !record.date) return false;
        try {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === dateString;
        } catch (err) {
          console.error("Error parsing record date:", err);
          return false;
        }
      });
    } catch (err) {
      console.error("Error in getWorkHoursForDate:", err);
      return null;
    }
  };

  // Generate calendar data
  const generateCalendarData = () => {
    try {
      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
      const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
      const calendar = [];
      
      // Add empty cells for days before the first day of month
      let week = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
        week.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        try {
          const date = new Date(selectedYear, selectedMonth, day);
          const workHours = getWorkHoursForDate(date);
          
          week.push({
            day,
            date,
            workHours
          });
          
          if (week.length === 7) {
            calendar.push(week);
            week = [];
          }
        } catch (err) {
          console.error(`Error generating calendar data for day ${day}:`, err);
          // Add an empty day in case of error
          week.push({
            day,
            date: null,
            workHours: null
          });
        }
      }
      
      // Add empty cells for days after the last day of month
      if (week.length > 0) {
        while (week.length < 7) {
          week.push(null);
        }
        calendar.push(week);
      }
      
      return calendar;
    } catch (err) {
      console.error("Error generating calendar data:", err);
      // Return empty calendar in case of error
      return [Array(7).fill(null)];
    }
  };

  const calendarData = generateCalendarData();

  useEffect(() => {    
    console.log("WorkingHours useEffect running");
    let isMounted = true;
    const abortController = new AbortController();
    setTitle("Working Hours Tracker");
    setLoading(true);
    
    const getWorkingHours = async () => {
      try {
        console.log("Fetching working hours data");
        let response;
        
        if(targetUser?.userId && auth?.email && (auth.email !== targetUser.userEmail) && admin){
          // Admin view
          console.log("Fetching admin view data");
          response = await axiosPrivate.post('/api/sleeps/admin', {
            id: targetUser.userId,
            signal: abortController.signal
          });
        } else {
          console.log("Fetching regular user data");
          response = await axiosPrivate.get('/api/sleeps', {
            signal: abortController.signal
          });
        }
        
        console.log("Data received:", response.data ? response.data.length : 0, "records");
        if (isMounted) {
          dispatch({type: 'SET_WORKING_HOURS', payload: response.data});
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          dispatch({type: 'SET_WORKING_HOURS', payload: []});
          setError(err.response?.data?.error || "Failed to load working hours data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if(auth){
      getWorkingHours();
    } else {
      console.log("Auth not available, skipping data fetch");
      setLoading(false);
    }
    
    return () => {
      console.log("WorkingHours component unmounting");
      isMounted = false;
      abortController.abort();
    };
  }, [auth, targetUser, admin, axiosPrivate, dispatch, setTitle]);

  // Add working hours function
  const addWorkingHours = async () => {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      const duration = 480; // Default 8 hours (480 minutes)
      
      const response = await axiosPrivate.post('/api/sleeps', {
        date: formattedDate,
        duration
      });
      
      dispatch({ type: 'CREATE_WORKING_HOUR', payload: response.data });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add working hours');
    }
  };
  
  // Navigate between months in calendar
  const changeMonth = (increment) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

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
        <button className="btn btn-primary" onClick={addWorkingHours}>
          Add Today's Hours
        </button>
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
            <Card.Body className="text-center">
              <div className="display-4 text-info mb-2">{formatDuration(stats.total)}</div>
              <div className="text-muted">Total Hours Worked</div>
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
            <Tab eventKey="list" title={<span><FaListAlt className="me-2" />Working Log</span>} />
            <Tab eventKey="calendar" title={<span><FaCalendarAlt className="me-2" />Calendar View</span>} />
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
                    <Row className="gy-4">
                      {workingHours.map(record => (
                        <Col md={6} lg={4} key={record._id}>
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">{new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}</h5>
                                <Badge bg="primary" pill>{formatDuration(record.duration)}</Badge>
                              </div>
                              <div className="d-flex justify-content-between">
                                <button className="btn btn-sm btn-outline-danger" 
                                  onClick={async () => {
                                    try {
                                      await axiosPrivate.delete(`/api/sleeps/${record._id}`);
                                      dispatch({ type: 'DELETE_WORKING_HOUR', payload: { _id: record._id } });
                                    } catch (err) {
                                      setError(err.response?.data?.error || 'Failed to delete record');
                                    }
                                  }}>
                                  Delete
                                </button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      No working hours records found. Start tracking your productivity by adding your working hours.
                    </Alert>
                  )}
                </div>
              )}
              
              {activeTab === 'calendar' && (
                <div className="calendar-view">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => changeMonth(-1)}
                    >
                      Previous Month
                    </button>
                    <h4 className="mb-0">
                      {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => changeMonth(1)}
                    >
                      Next Month
                    </button>
                  </div>
                  
                  <Table bordered responsive className="calendar-table">
                    <thead>
                      <tr>
                        <th className="text-center">Sun</th>
                        <th className="text-center">Mon</th>
                        <th className="text-center">Tue</th>
                        <th className="text-center">Wed</th>
                        <th className="text-center">Thu</th>
                        <th className="text-center">Fri</th>
                        <th className="text-center">Sat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calendarData.map((week, weekIndex) => (
                        <tr key={`week-${weekIndex}`}>
                          {week.map((day, dayIndex) => (
                            <td key={`day-${weekIndex}-${dayIndex}`} className="p-2">
                              {day && (
                                <div>
                                  <div className="text-end">{day.day}</div>
                                  {day.workHours ? (
                                    <div className="mt-2 text-center">
                                      <Badge bg="success" className="w-100">
                                        {formatDuration(day.workHours.duration)}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <div className="text-center mt-2">
                                      <small className="text-muted">No record</small>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
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
                                <h6>Total Hours</h6>
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
          
          {error && (
            <Alert variant="danger" className="mt-3">{error}</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WorkingHours;
