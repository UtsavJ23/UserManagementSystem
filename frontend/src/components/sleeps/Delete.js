import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { Button, Modal } from 'react-bootstrap'
import { useWorkingHoursContext } from '../../context/workingHours'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

const Delete = ({ sleep }) => {
  const axiosPrivate = useAxiosPrivate()
  const { dispatch } = useWorkingHoursContext()
  const [show, setShow] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await axiosPrivate.delete('/api/sleeps/' + sleep._id)
      dispatch({type: 'DELETE_WORKING_HOUR', payload: response.data})
      setShow(false)
    } catch (error) {
      console.error("Error deleting sleep record:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="outline-danger" 
        size="sm" 
        onClick={() => setShow(true)}
      >
        <FaTrash />
      </Button>

      <Modal 
        show={show} 
        onHide={() => setShow(false)} 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5">Delete Sleep Record</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p>Are you sure you want to delete this sleep record?</p>
          <div className="bg-light p-3 rounded mb-3">
            <div className="small text-muted mb-1">Sleep Time:</div>
            <div className="mb-2">{formatDate(sleep.sleep)}</div>
            <div className="small text-muted mb-1">Wake Time:</div>
            <div>{formatDate(sleep.wake)}</div>
          </div>
          <p className="text-danger mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Record'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Delete