import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { BiArrowBack } from 'react-icons/bi'
import { usePathContext } from '../../context/path'
import { useWorkingHoursContext } from '../../context/workingHours'
import { useUserContext } from '../../context/user'
import { useAuthContext } from '../../context/auth'
import { FaDownload } from 'react-icons/fa'

const Navbar = () => {
  const { auth } = useAuthContext()
  const navigate = useNavigate()
  const { setLink, setTitle } = usePathContext()
  const { workingHours } = useWorkingHoursContext()
  const { targetUser, setTargetUser } = useUserContext()

  const handleBack = () => {
    setTargetUser(null)
    setTitle("Home")
    navigate("/")
  }

  const downloadCSV = () => {
    if (!workingHours || !workingHours.length) return;
    
    const headers = ["Date", "Duration (minutes)", "Hours"];
    const csvRows = [
      headers.join(","),
      ...workingHours.map(record => {
        const date = new Date(record.date).toLocaleDateString();
        const durationMinutes = record.duration;
        const hours = (durationMinutes / 60).toFixed(2);
        return [date, durationMinutes, hours].join(",");
      })
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "working-hours.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    setLink("/working-hours")
  }, [auth, setLink, navigate])

  return (
    <div className="d-flex gap-2">
      <Button
        variant="light"
        className="d-flex align-items-center shadow-sm text-muted"
        onClick={handleBack}
      >
        <BiArrowBack />
      </Button>
      
      {workingHours && workingHours.length > 0 && (
        <Button 
          variant="outline-primary" 
          className="d-flex align-items-center shadow-sm"
          onClick={downloadCSV}
        >
          <FaDownload className="me-2" /> Export
        </Button>
      )}
    </div>
  )
}

export default Navbar 