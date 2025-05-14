import { useLogout } from '../hooks/useLogout'
import { usePathContext } from '../context/path'
import { useAuthContext } from '../context/auth'
import { Nav, Navbar, Container } from "react-bootstrap"
import { Link } from "react-router-dom"

const Navbars = () => {
  const { logout } = useLogout()
  const { auth } = useAuthContext()
  const { title } = usePathContext()

  return (
    <Navbar 
      expand="lg" 
      bg="white" 
      className="py-3 border-bottom"
      fixed="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          {title || "Task Management"}
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="nav-collapse" className="border-0" />
        
        <Navbar.Collapse id="nav-collapse">
          <Nav className="ms-auto">
            {auth ? (
              <>
                <Nav.Link as="span" className="me-3 text-muted">
                  {auth.name}
                </Nav.Link>
                <Nav.Link as="button" onClick={logout} className="border-0 bg-transparent p-0">
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-3">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navbars