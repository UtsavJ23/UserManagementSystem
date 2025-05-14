import { useEffect, useMemo, useState } from 'react'
import { Col, Row, Stack, Button, Card, Container, Form, InputGroup } from "react-bootstrap"
import { GoSearch } from "react-icons/go"
import { BiArrowBack } from 'react-icons/bi'
import { FaAddressCard, FaTags, FaPlus, FaStickyNote } from "react-icons/fa"
import { BsFillPersonFill, BsPlusLg } from "react-icons/bs"
import { Link } from "react-router-dom"
import { ROLES } from '../config/roles'
import { useNavigate } from 'react-router-dom'
import { usePathContext } from '../context/path'
import { useUserContext } from '../context/user'
import { useAuthContext } from '../context/auth'
import CreatableReactSelect from "react-select/creatable"
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import Details from '../components/notes/Index'

const Note = () => {
  const navigate = useNavigate()
  const { setTitle } = usePathContext()
  const { auth } = useAuthContext()
  const { targetUser } = useUserContext()
  const [ notes, setNotes ] = useState([])
  const [ tag, setTag ] = useState([])
  const [ titles, setTitles ] = useState("")
  const [ notFound, setNotFound ] = useState(false)
  const [ loading, setLoading ] = useState(true)
  const [ allTags, setAllTags ] = useState([])
  const axiosPrivate = useAxiosPrivate()
  const admin = auth.roles.includes(ROLES.Admin) || auth.roles.includes(ROLES.Root)

  const statusBar = {
    Root: "bg-danger",
    Admin: "bg-warning",
    User: "bg-primary"
  }
  
  const color = statusBar[targetUser?.userRoles]

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()
    setTitle("Note Management")
    setLoading(true)

    const getNoteList = async () => {
      try {
        const endpoint = targetUser?.userId && admin ? '/api/notes/admin-all' : '/api/notes'
        const method = targetUser?.userId && admin ? 'post' : 'get'
        const data = targetUser?.userId && admin ? { id: targetUser.userId } : undefined
  
        const response = await axiosPrivate({
          method,
          url: endpoint,
          data,
          signal: abortController.signal
        })

        if (isMounted) {
          setNotes(response.data)
          
          // Extract all unique tags from notes
          const uniqueTags = [...new Set(response.data.flatMap(note => note.tag))];
          setAllTags(uniqueTags.map(tag => ({ label: tag, value: tag })));
        }
      } catch (err) {
        setNotes([])
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if(auth){
      getNoteList()
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  },[])

  const filteredNote = useMemo(() => notes?.filter(note => {
    const tags = tag?.map(t => t.value)
    return (
      (titles === "" || note.title.toLowerCase().includes(titles.toLowerCase())) &&
      (tag.length === 0 || note.tag.some(noteTag => tags.includes(noteTag)))
    )
  }), [notes, titles, tag])

  const handleBack = () => {
    setTitle("Welcome")
    navigate("/")
  }
  
  return (
    <Container>
      {targetUser?.userName && notes && (
        <Card className={`${color} bg-opacity-25 rounded mb-3 border-0 shadow-sm`}>
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
        <Button variant="outline-secondary" onClick={handleBack}>
          <BiArrowBack className="me-1" /> Back
        </Button>
        <Link to="/note/add">
          <Button variant="primary" className="d-flex align-items-center gap-2">
            <FaPlus /> <span>New Note</span>
          </Button>
        </Link>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light d-flex align-items-center">
          <FaTags className="me-2" />
          <h5 className="mb-0">Note Filters</h5>
        </Card.Header>
        <Card.Body>
          <Stack gap={3}>
            <Row>
              <Col>
                <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder="Search by title..."
                    value={titles}
                    onChange={e => setTitles(e.target.value)}
                  />
                  <Button variant="outline-primary">
                    <GoSearch/>
                  </Button>
                </InputGroup>
              </Col>
              <Col>
                <CreatableReactSelect  
                  isMulti
                  value={tag}
                  onChange={setTag}
                  placeholder="Filter by tags..."
                  options={allTags}
                />
              </Col>
            </Row>
          </Stack>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading notes...</p>
        </div>
      ) : (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0 d-flex align-items-center">
              <FaStickyNote className="me-2" /> Your Notes
            </h4>
            <div className="badge bg-primary fs-6">
              {filteredNote?.length || 0} {filteredNote?.length === 1 ? 'Note' : 'Notes'}
            </div>
          </div>
          
          {filteredNote && filteredNote.length > 0 ? (
            <Row>
              <Details filteredNote={filteredNote}/>
            </Row>
          ) : (
            <Card className="text-center p-5 bg-light">
              <Card.Body>
                <h4>No Notes Found</h4>
                {titles || tag.length !== 0 ? (
                  <p>No notes match your current filters. Try adjusting your search criteria.</p>
                ) : (
                  <>
                    <p>You haven't created any notes yet.</p>
                    <Link to="/note/add">
                      <Button variant="primary">
                        <FaPlus className="me-2" /> Create Your First Note
                      </Button>
                    </Link>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  )
}

export default Note