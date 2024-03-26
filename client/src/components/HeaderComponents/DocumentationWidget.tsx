import { QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';

const DocumentationWidget = () => {
  return (
    <Avatar
      onClick={() => {
        window.open('https://squirrelserversmanager.io/docs/');
      }}
      src={
        <QuestionCircleOutlined
          style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.65)' }}
        />
      }
    />
  );
};

export default DocumentationWidget;
