import { Link } from "react-router-dom"
import { Badge, Stack, Card, Col } from "react-bootstrap"
import { FaEye, FaTags, FaClock } from "react-icons/fa"
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const NoteCard = ({ note }) => {
  // Get first 100 characters of text for preview
  const textPreview = note.text?.substring(0, 100) + (note.text?.length > 100 ? '...' : '');
  
  // Random pastel colors for tags
  const getTagColor = (tag) => {
    const colors = ['primary', 'success', 'warning', 'info', 'danger', 'secondary'];
    const index = tag.length % colors.length;
    return colors[index];
  };

  return (
    <Col xs={12} md={6} lg={4} xl={3} className="mb-4">
      <Card className="h-100 shadow-sm border-0 hover-card">
        <Card.Body>
          <Card.Title className="text-truncate mb-2">{note.title}</Card.Title>
          
          {note.tag.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap mb-3">
              <FaTags className="me-1 text-muted" />
              {note.tag.slice(0, 3).map((tag, index) => (
                <Badge bg={getTagColor(tag)} className="text-truncate me-1" key={index}>
                  {tag}
                </Badge>
              ))}
              {note.tag.length > 3 && (
                <Badge bg="secondary">+{note.tag.length - 3}</Badge>
              )}
            </Stack>
          )}
          
          <Card.Text className="text-muted small mb-3">
            {textPreview || "No content"}
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center text-muted small">
            <span className="d-flex align-items-center">
              <FaClock className="me-1" />
              {formatDistanceToNow(new Date(note.createdAt || Date.now()), { addSuffix: true })}
            </span>
            <Link to={`/note/view/${note._id}`} className="btn btn-sm btn-outline-primary">
              <FaEye className="me-1" /> View
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const Index = ({ filteredNote }) => {
  if (!filteredNote || filteredNote.length === 0) {
    return null;
  }

  return filteredNote.map((note) => (
    <NoteCard key={note._id} note={note} />
  ));
};

export default Index;