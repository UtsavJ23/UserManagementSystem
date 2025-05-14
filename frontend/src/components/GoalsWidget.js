import { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaTrophy, FaCheck, FaTrash } from 'react-icons/fa';

const GoalsWidget = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('userGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Some example goals
      const defaultGoals = [
        { id: 1, text: 'Complete project documentation', completed: false },
        { id: 2, text: 'Schedule team meeting', completed: true },
        { id: 3, text: 'Prepare quarterly report', completed: false }
      ];
      setGoals(defaultGoals);
      localStorage.setItem('userGoals', JSON.stringify(defaultGoals));
    }
    setLoading(false);
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('userGoals', JSON.stringify(goals));
    }
  }, [goals, loading]);

  const addGoal = (e) => {
    e.preventDefault();
    if (newGoal.trim() === '') return;
    
    const newGoalItem = {
      id: Date.now(),
      text: newGoal,
      completed: false
    };
    
    setGoals([...goals, newGoalItem]);
    setNewGoal('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading goals...</p>
        </Card.Body>
      </Card>
    );
  }

  const completedCount = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">My Goals</h5>
          <Badge bg="success">
            {completedCount}/{totalGoals} Completed
          </Badge>
        </div>
        
        <Form onSubmit={addGoal} className="mb-3">
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Add a new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="me-2"
            />
            <Button variant="primary" type="submit" className="px-3">
              Add
            </Button>
          </div>
        </Form>
        
        {goals.length > 0 ? (
          <ListGroup variant="flush">
            {goals.map(goal => (
              <ListGroup.Item key={goal.id} className="px-0 py-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Button 
                      variant={goal.completed ? 'success' : 'light'}
                      size="sm"
                      className="me-2 rounded-circle"
                      onClick={() => toggleGoal(goal.id)}
                      style={{ width: '30px', height: '30px' }}
                    >
                      {goal.completed && <FaCheck />}
                    </Button>
                    <span 
                      style={{ 
                        textDecoration: goal.completed ? 'line-through' : 'none',
                        color: goal.completed ? '#6c757d' : 'inherit'
                      }}
                    >
                      {goal.text}
                    </span>
                  </div>
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="text-danger"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-3">
            <FaTrophy className="text-warning mb-2" size={24} />
            <p className="mb-0">No goals yet. Add some goals to track your progress!</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default GoalsWidget; 