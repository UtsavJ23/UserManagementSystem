import { useState } from 'react'
import { AiOutlineSetting, AiOutlineUsergroupAdd } from "react-icons/ai"
import { BsCalendarWeek, BsCalendarCheck, BsCheckCircle, BsCircle, BsHourglassSplit } from 'react-icons/bs'
import { BiTimer } from 'react-icons/bi'
import { FiMoreHorizontal } from "react-icons/fi"
import { HiOutlineStar } from "react-icons/hi"
import { MdAdminPanelSettings, MdOutlinePriorityHigh } from "react-icons/md"
import { SiStatuspal } from "react-icons/si"
import { Link } from 'react-router-dom'
import { ROLES } from '../../config/roles'
import { useAuthContext } from '../../context/auth'
import { useTasksContext } from '../../context/task'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { Badge, Form, Button, Dropdown } from 'react-bootstrap'
import Delete from './Delete'
import Edit from './Edit'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

const PriorityBadge = ({ priority }) => {
  const badges = {
    low: <Badge bg="success">Low</Badge>,
    medium: <Badge bg="warning">Medium</Badge>,
    high: <Badge bg="danger">High</Badge>
  }
  return badges[priority] || <Badge bg="secondary">Not Set</Badge>
}

const StatusBadge = ({ status }) => {
  const badges = {
    'pending': <Badge bg="secondary">Pending</Badge>,
    'in-progress': <Badge bg="primary">In Progress</Badge>,
    'completed': <Badge bg="success">Completed</Badge>
  }
  return badges[status] || <Badge bg="info">Not Set</Badge>
}

const TaskProgressIcon = ({ status }) => {
  const icons = {
    'pending': <BsCircle className="fs-5 text-secondary" />,
    'in-progress': <BsHourglassSplit className="fs-5 text-primary" />,
    'completed': <BsCheckCircle className="fs-5 text-success" />
  }
  return icons[status] || <BsCircle className="fs-5 text-secondary" />
}

const Index = ({ tasks }) => {
  const { auth } = useAuthContext()
  const { dispatch } = useTasksContext()
  const axiosPrivate = useAxiosPrivate()
  const admin = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Root)
  const [updatingTaskId, setUpdatingTaskId] = useState(null)

  const updateTaskStatus = async (taskId, newStatus) => {
    if (updatingTaskId) return; // Prevent multiple updates at once
    
    setUpdatingTaskId(taskId);
    try {
      const response = await axiosPrivate.patch(`/api/tasks/${taskId}`, {
        status: newStatus
      });
      
      dispatch({
        type: 'UPDATE_TASK',
        payload: response.data
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="alert alert-info">No tasks available.</div>
      ) : (
        tasks.map(task => (
          <div 
            className={`card mb-3 border-start border-5 ${
              task.status === 'completed' ? 'border-success' : 
              task.priority === 'high' ? 'border-danger' :
              task.priority === 'medium' ? 'border-warning' : 'border-info'
            }`} 
            key={task._id}
          >
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <Dropdown>
                    <Dropdown.Toggle variant="light" className="rounded-circle no-caret">
                      <TaskProgressIcon status={task.status} />
                    </Dropdown.Toggle>
                    
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={() => updateTaskStatus(task._id, 'pending')}
                        active={task.status === 'pending'}
                        disabled={updatingTaskId === task._id}
                      >
                        <BsCircle className="me-2" /> Pending
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => updateTaskStatus(task._id, 'in-progress')}
                        active={task.status === 'in-progress'}
                        disabled={updatingTaskId === task._id}
                      >
                        <BsHourglassSplit className="me-2" /> In Progress
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => updateTaskStatus(task._id, 'completed')}
                        active={task.status === 'completed'}
                        disabled={updatingTaskId === task._id}
                      >
                        <BsCheckCircle className="me-2" /> Completed
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="col">
                  <h4 className="card-title mb-1">
                    {task.status === 'completed' ? (
                      <span style={{ textDecoration: 'line-through' }}>{task.title}</span>
                    ) : (
                      task.title
                    )}
                  </h4>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <Badge bg="info">
                        <BsCalendarCheck className="me-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                      </Badge>
                    )}
                  </div>
                  <p className="card-text mb-2">{task.description}</p>
                  <div className="d-flex flex-wrap text-muted small gap-3">
                    <span className="d-inline-flex align-items-center">
                      <MdAdminPanelSettings className="me-1 fs-5" />
                      {task.createdBy?.name || 'Unknown'}
                    </span>
                    <span className="d-inline-flex align-items-center">
                      <BsCalendarWeek className="me-1" />
                      {new Date(task.createdAt).toLocaleDateString('en-GB')}
                    </span>
                    <span className="d-inline-flex align-items-center">
                      <BiTimer className="me-1" />
                      {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex gap-2">
                    {admin && (
                      <>
                        <Link 
                          className="btn btn-sm btn-outline-primary" 
                          to="/assign" 
                          state={{
                            id: task._id, 
                            title: task.title, 
                            createdBy: task.createdBy
                          }}
                        >
                          <AiOutlineUsergroupAdd className="fs-5" />
                        </Link>
                        <Edit task={task} />
                        <Delete task={task} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Index