import React, { useState, useEffect } from 'react';
import { Card, Typography, Calendar, Badge, Modal, Space, Button, Form, Input, Select, DatePicker, TimePicker, message, List, Tag } from 'antd';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  ToolOutlined, 
  DatabaseOutlined,
  SecurityScanOutlined,
  CloudUploadOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'backup' | 'update' | 'security' | 'deployment';
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignee?: string;
  servers: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder?: boolean;
}

interface MaintenanceCalendarProps {
  title?: string;
  cardStyle?: React.CSSProperties;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  title = 'Maintenance Calendar',
  cardStyle,
}) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [form] = Form.useForm();

  const taskTypes = [
    { value: 'maintenance', label: 'System Maintenance', icon: <ToolOutlined />, color: '#1890ff' },
    { value: 'backup', label: 'Backup', icon: <DatabaseOutlined />, color: '#52c41a' },
    { value: 'update', label: 'Updates', icon: <CloudUploadOutlined />, color: '#faad14' },
    { value: 'security', label: 'Security', icon: <SecurityScanOutlined />, color: '#ff4d4f' },
    { value: 'deployment', label: 'Deployment', icon: <CalendarOutlined />, color: '#722ed1' },
  ];

  const priorityColors = {
    low: '#52c41a',
    medium: '#faad14',
    high: '#ff4d4f',
    critical: '#722ed1',
  };

  const statusColors = {
    scheduled: '#1890ff',
    'in-progress': '#faad14',
    completed: '#52c41a',
    cancelled: '#8c8c8c',
  };

  // Mock maintenance tasks
  const mockTasks: MaintenanceTask[] = [
    {
      id: '1',
      title: 'Weekly Database Backup',
      description: 'Automated backup of all production databases',
      type: 'backup',
      date: dayjs().add(1, 'day'),
      startTime: dayjs().hour(2).minute(0),
      endTime: dayjs().hour(4).minute(0),
      status: 'scheduled',
      assignee: 'System',
      servers: ['db-prod-01', 'db-prod-02'],
      priority: 'high',
      recurrence: 'weekly',
      reminder: true,
    },
    {
      id: '2',
      title: 'Security Patches',
      description: 'Apply latest security updates to all web servers',
      type: 'security',
      date: dayjs().add(3, 'day'),
      startTime: dayjs().hour(22).minute(0),
      endTime: dayjs().hour(23).minute(30),
      status: 'scheduled',
      assignee: 'Admin Team',
      servers: ['web-01', 'web-02', 'web-03'],
      priority: 'critical',
      recurrence: 'monthly',
      reminder: true,
    },
    {
      id: '3',
      title: 'Container Registry Cleanup',
      description: 'Remove old and unused container images',
      type: 'maintenance',
      date: dayjs().add(5, 'day'),
      startTime: dayjs().hour(1).minute(0),
      endTime: dayjs().hour(2).minute(0),
      status: 'scheduled',
      servers: ['registry-01'],
      priority: 'low',
      recurrence: 'weekly',
    },
    {
      id: '4',
      title: 'Application Deployment',
      description: 'Deploy version 2.4.1 to production environment',
      type: 'deployment',
      date: dayjs().add(7, 'day'),
      startTime: dayjs().hour(20).minute(0),
      endTime: dayjs().hour(21).minute(0),
      status: 'scheduled',
      assignee: 'Dev Team',
      servers: ['app-prod-01', 'app-prod-02'],
      priority: 'medium',
      recurrence: 'none',
      reminder: true,
    },
    {
      id: '5',
      title: 'System Updates',
      description: 'Update operating system and core packages',
      type: 'update',
      date: dayjs().subtract(2, 'day'),
      startTime: dayjs().hour(3).minute(0),
      endTime: dayjs().hour(5).minute(0),
      status: 'completed',
      assignee: 'Admin Team',
      servers: ['web-01', 'web-02', 'api-01'],
      priority: 'medium',
      recurrence: 'monthly',
    },
  ];

  useEffect(() => {
    // Load tasks from localStorage or use mock data
    const savedTasks = localStorage.getItem('ssm-maintenance-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          date: dayjs(task.date),
          startTime: dayjs(task.startTime),
          endTime: dayjs(task.endTime),
        }));
        setTasks(parsed);
      } catch (error) {
        console.error('Failed to load maintenance tasks:', error);
        setTasks(mockTasks);
      }
    } else {
      setTasks(mockTasks);
    }
  }, []);

  const saveTasks = (updatedTasks: MaintenanceTask[]) => {
    localStorage.setItem('ssm-maintenance-tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const getTasksByDate = (date: Dayjs) => {
    return tasks.filter(task => task.date.isSame(date, 'day'));
  };

  const dateCellRender = (date: Dayjs) => {
    const dayTasks = getTasksByDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div style={{ fontSize: '12px' }}>
        {dayTasks.slice(0, 2).map(task => {
          const taskType = taskTypes.find(t => t.value === task.type);
          return (
            <div
              key={task.id}
              style={{
                backgroundColor: taskType?.color || '#1890ff',
                color: 'white',
                borderRadius: '2px',
                padding: '1px 4px',
                marginBottom: '1px',
                fontSize: '10px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </div>
          );
        })}
        {dayTasks.length > 2 && (
          <div style={{ fontSize: '9px', color: '#8c8c8c' }}>
            +{dayTasks.length - 2} more
          </div>
        )}
      </div>
    );
  };

  const onSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const openModal = (task?: MaintenanceTask) => {
    if (task) {
      setEditingTask(task);
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        type: task.type,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        assignee: task.assignee,
        servers: task.servers,
        priority: task.priority,
        recurrence: task.recurrence,
        reminder: task.reminder,
      });
    } else {
      setEditingTask(null);
      form.setFieldsValue({
        date: selectedDate,
        startTime: dayjs().hour(9).minute(0),
        endTime: dayjs().hour(10).minute(0),
        priority: 'medium',
        recurrence: 'none',
        reminder: false,
      });
    }
    setShowModal(true);
  };

  const saveTask = () => {
    form.validateFields().then(values => {
      const newTask: MaintenanceTask = {
        id: editingTask?.id || Date.now().toString(),
        title: values.title,
        description: values.description,
        type: values.type,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        status: editingTask?.status || 'scheduled',
        assignee: values.assignee,
        servers: values.servers || [],
        priority: values.priority,
        recurrence: values.recurrence,
        reminder: values.reminder,
      };

      if (editingTask) {
        saveTasks(tasks.map(task => task.id === editingTask.id ? newTask : task));
        message.success('Task updated');
      } else {
        saveTasks([...tasks, newTask]);
        message.success('Task created');
      }

      setShowModal(false);
      form.resetFields();
    });
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(task => task.id !== id));
    message.success('Task deleted');
  };

  const updateTaskStatus = (id: string, status: MaintenanceTask['status']) => {
    saveTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    message.success(`Task marked as ${status}`);
  };

  const getUpcomingTasks = () => {
    const today = dayjs();
    const nextWeek = today.add(7, 'day');
    return tasks
      .filter(task => 
        task.status === 'scheduled' && 
        task.date.isAfter(today) && 
        task.date.isBefore(nextWeek)
      )
      .sort((a, b) => a.date.diff(b.date));
  };

  const selectedDateTasks = getTasksByDate(selectedDate);
  const upcomingTasks = getUpcomingTasks();

  return (
    <>
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          color: 'white',
          border: 'none',
          height: '500px',
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
            📅 {title}
          </Typography.Title>
          <Space>
            <Button
              type={viewMode === 'calendar' ? 'primary' : 'text'}
              size="small"
              onClick={() => setViewMode('calendar')}
              style={{ color: viewMode === 'calendar' ? 'white' : '#8c8c8c' }}
            >
              Calendar
            </Button>
            <Button
              type={viewMode === 'list' ? 'primary' : 'text'}
              size="small"
              onClick={() => setViewMode('list')}
              style={{ color: viewMode === 'list' ? 'white' : '#8c8c8c' }}
            >
              List
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => openModal()}
              style={{
                backgroundColor: '#4ecb71',
                borderColor: '#4ecb71',
              }}
            >
              Add Task
            </Button>
          </Space>
        </Space>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {viewMode === 'calendar' ? (
            <div style={{ color: 'black' }}>
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                onSelect={onSelectDate}
                value={selectedDate}
              />
              
              {selectedDateTasks.length > 0 && (
                <div style={{ marginTop: '16px', color: 'white' }}>
                  <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    Tasks for {selectedDate.format('MMMM D, YYYY')}:
                  </Typography.Text>
                  {selectedDateTasks.map(task => {
                    const taskType = taskTypes.find(t => t.value === task.type);
                    return (
                      <div
                        key={task.id}
                        style={{
                          backgroundColor: '#2a2a2a',
                          padding: '8px',
                          borderRadius: '6px',
                          marginBottom: '4px',
                          border: '1px solid #3a3a3a',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            {taskType?.icon}
                            <Typography.Text style={{ color: '#ffffff', fontSize: '12px' }}>
                              {task.title}
                            </Typography.Text>
                            <Tag color={priorityColors[task.priority]} style={{ fontSize: '10px' }}>
                              {task.priority}
                            </Tag>
                          </Space>
                          <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px' }}>
                            {task.startTime.format('HH:mm')} - {task.endTime.format('HH:mm')}
                          </Typography.Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Typography.Text style={{ color: '#d9d9d9', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                Upcoming Tasks ({upcomingTasks.length})
              </Typography.Text>
              <List
                dataSource={upcomingTasks}
                renderItem={(task) => {
                  const taskType = taskTypes.find(t => t.value === task.type);
                  return (
                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #3a3a3a' }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ flex: 1 }}>
                            <Space>
                              {taskType?.icon}
                              <Typography.Text strong style={{ color: '#ffffff', fontSize: '13px' }}>
                                {task.title}
                              </Typography.Text>
                              <Tag color={priorityColors[task.priority]} style={{ fontSize: '10px' }}>
                                {task.priority}
                              </Tag>
                              <Badge count={task.status} style={{ backgroundColor: statusColors[task.status] }} />
                            </Space>
                            <Typography.Text style={{ color: '#8c8c8c', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                              {task.description}
                            </Typography.Text>
                          </div>
                          <Space size="small">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              size="small"
                              onClick={() => openModal(task)}
                              style={{ color: '#8c8c8c' }}
                            />
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => deleteTask(task.id)}
                              style={{ color: '#ff4d4f' }}
                            />
                          </Space>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography.Text style={{ color: '#666', fontSize: '10px' }}>
                            {task.date.format('MMM D')} • {task.startTime.format('HH:mm')} - {task.endTime.format('HH:mm')}
                          </Typography.Text>
                          {task.reminder && (
                            <BellOutlined style={{ color: '#faad14', fontSize: '10px' }} />
                          )}
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          )}
        </div>

        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
          {tasks.length} total tasks • {upcomingTasks.length} upcoming
        </div>
      </Card>

      {/* Add/Edit Task Modal */}
      <Modal
        title={editingTask ? 'Edit Maintenance Task' : 'Add Maintenance Task'}
        open={showModal}
        onOk={saveTask}
        onCancel={() => setShowModal(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Task title" />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Task description" rows={2} />
          </Form.Item>
          
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select placeholder="Select task type">
              {taskTypes.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Space style={{ width: '100%' }}>
            <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" />
            </Form.Item>
            <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Space>
          
          <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
            <Select placeholder="Select priority">
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="critical">Critical</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="assignee" label="Assignee">
            <Input placeholder="Assigned to" />
          </Form.Item>
          
          <Form.Item name="servers" label="Target Servers">
            <Select mode="tags" placeholder="Add servers">
              <Select.Option value="web-01">web-01</Select.Option>
              <Select.Option value="web-02">web-02</Select.Option>
              <Select.Option value="db-prod-01">db-prod-01</Select.Option>
              <Select.Option value="api-01">api-01</Select.Option>
            </Select>
          </Form.Item>
          
          <Space style={{ width: '100%' }}>
            <Form.Item name="recurrence" label="Recurrence">
              <Select placeholder="Select recurrence">
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="reminder" valuePropName="checked">
              <input type="checkbox" style={{ marginRight: '8px' }} />
              <span>Enable reminder</span>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default MaintenanceCalendar;