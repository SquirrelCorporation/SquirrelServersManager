import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { useState } from 'react';

interface InfoLinkWidgetProps {
  tooltipTitle: string;
  documentationLink: string;
  eventName?: string;
}

export const INFO_LINK_EVENT_TYPE = 'openDocumentation';

export interface InfoLinkEventDetail {
  link: string;
}

const InfoLinkWidget: React.FC<InfoLinkWidgetProps> = ({
  tooltipTitle,
  documentationLink,
  eventName = INFO_LINK_EVENT_TYPE,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const event = new CustomEvent<InfoLinkEventDetail>(eventName, {
      detail: { link: documentationLink },
    });
    window.dispatchEvent(event);
  };

  return (
    <Tooltip title={tooltipTitle}>
      <InfoCircleFilled
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          color: isHovered ? '#4169E1' : 'white',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'color 0.3s ease',
        }}
      />
    </Tooltip>
  );
};

export default InfoLinkWidget;
