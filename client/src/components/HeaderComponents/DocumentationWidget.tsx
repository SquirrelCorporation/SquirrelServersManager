import { FullscreenOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Drawer, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
// Assuming InfoLinkWidget.tsx is in client/src/components/Shared/
import {
  INFO_LINK_EVENT_TYPE,
  InfoLinkEventDetail,
} from '../Shared/InfoLinkWidget';

const DEFAULT_DOCS_URL = 'https://squirrelserversmanager.io/docs/user-guides/';

const DocumentationWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLink, setCurrentLink] = useState(DEFAULT_DOCS_URL);

  const openDrawerWithLink = (link: string) => {
    setIsLoading(true);
    setCurrentLink(link);
    setIsOpen(true);
  };

  useEffect(() => {
    const handleOpenDocumentation = (event: Event) => {
      const customEvent = event as CustomEvent<InfoLinkEventDetail>;
      if (customEvent.detail?.link) {
        openDrawerWithLink(customEvent.detail.link);
      }
    };

    window.addEventListener(INFO_LINK_EVENT_TYPE, handleOpenDocumentation);

    return () => {
      window.removeEventListener(INFO_LINK_EVENT_TYPE, handleOpenDocumentation);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // isLoading will be set to false by handleIframeLoad or if it was already false.
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      <Drawer
        open={isOpen}
        width={600}
        title={'Documentation'}
        bodyStyle={{ padding: '0px', position: 'relative' }}
        onClose={handleClose}
        destroyOnClose // Resets iframe state when closed
        extra={
          <a href={currentLink} target="_blank" rel="noopener noreferrer">
            <Button icon={<FullscreenOutlined />}></Button>
          </a>
        }
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <iframe
          src={currentLink}
          style={{
            width: '100%',
            height: '100%',
            borderWidth: 0,
            visibility: isLoading ? 'hidden' : 'visible',
          }}
          onLoad={handleIframeLoad}
        />
      </Drawer>
      <Avatar
        onClick={() => {
          openDrawerWithLink(currentLink || DEFAULT_DOCS_URL);
        }}
        src={
          <QuestionCircleOutlined
            style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.65)' }}
          />
        }
      />
    </>
  );
};

export default DocumentationWidget;
