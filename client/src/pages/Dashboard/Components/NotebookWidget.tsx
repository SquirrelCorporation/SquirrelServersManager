import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Input, message } from 'antd';
import { EditOutlined, SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotebookWidgetProps {
  title?: string;
  cardStyle?: React.CSSProperties;
}

const NotebookWidget: React.FC<NotebookWidgetProps> = ({
  title = 'Notebook',
  cardStyle,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('ssm-notebook-notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('ssm-notebook-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNote = () => {
    if (!editTitle.trim()) {
      message.warning('Please enter a title');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: editTitle.trim(),
      content: editContent.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setEditTitle('');
    setEditContent('');
    setIsCreating(false);
    message.success('Note created');
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) {
      message.warning('Please enter a title');
      return;
    }

    const updatedNotes = notes.map(note =>
      note.id === editingId
        ? {
            ...note,
            title: editTitle.trim(),
            content: editContent.trim(),
            updatedAt: new Date(),
          }
        : note
    );

    saveNotes(updatedNotes);
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    message.success('Note updated');
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    message.success('Note deleted');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setIsCreating(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        height: '400px',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Space direction="horizontal" style={{ justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
        <Typography.Title
          level={4}
          style={{
            color: '#ffffff',
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          📝 {title}
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => setIsCreating(true)}
          style={{
            backgroundColor: '#4ecb71',
            borderColor: '#4ecb71',
          }}
        >
          Add Note
        </Button>
      </Space>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isCreating && (
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '12px',
            border: '1px solid #3a3a3a'
          }}>
            <Input
              placeholder="Note title..."
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ 
                marginBottom: '8px',
                backgroundColor: '#1a1a1a',
                borderColor: '#3a3a3a',
                color: 'white'
              }}
            />
            <TextArea
              placeholder="Write your note here... (Supports markdown)"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              style={{ 
                marginBottom: '8px',
                backgroundColor: '#1a1a1a',
                borderColor: '#3a3a3a',
                color: 'white'
              }}
            />
            <Space>
              <Button size="small" type="primary" onClick={createNote} icon={<SaveOutlined />}>
                Save
              </Button>
              <Button size="small" onClick={cancelEdit}>
                Cancel
              </Button>
            </Space>
          </div>
        )}

        {notes.map((note) => (
          <div key={note.id} style={{ marginBottom: '12px' }}>
            {editingId === note.id ? (
              <div style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '12px', 
                borderRadius: '8px',
                border: '1px solid #3a3a3a'
              }}>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ 
                    marginBottom: '8px',
                    backgroundColor: '#1a1a1a',
                    borderColor: '#3a3a3a',
                    color: 'white'
                  }}
                />
                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  style={{ 
                    marginBottom: '8px',
                    backgroundColor: '#1a1a1a',
                    borderColor: '#3a3a3a',
                    color: 'white'
                  }}
                />
                <Space>
                  <Button size="small" type="primary" onClick={saveEdit} icon={<SaveOutlined />}>
                    Save
                  </Button>
                  <Button size="small" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </Space>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '12px', 
                borderRadius: '8px',
                border: '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Typography.Text strong style={{ color: '#ffffff', fontSize: '14px' }}>
                    {note.title}
                  </Typography.Text>
                  <Space size="small">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => startEdit(note)}
                      style={{ color: '#8c8c8c' }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => deleteNote(note.id)}
                      style={{ color: '#ff4d4f' }}
                    />
                  </Space>
                </div>
                <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                  {note.content || 'No content'}
                </Typography.Text>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#8c8c8c' }}>
                  {formatDate(note.updatedAt)}
                </div>
              </div>
            )}
          </div>
        ))}

        {notes.length === 0 && !isCreating && (
          <div style={{ 
            textAlign: 'center', 
            color: '#8c8c8c', 
            fontSize: '14px',
            marginTop: '60px'
          }}>
            📝 No notes yet. Click "Add Note" to get started!
          </div>
        )}
      </div>
    </Card>
  );
};

export default NotebookWidget;