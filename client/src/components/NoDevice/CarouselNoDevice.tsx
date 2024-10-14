import React from 'react';
import { Carousel, Image } from 'antd';
import styles from './CarouselWithBlur.less';

const CarouselNoDevice = () => (
  <Carousel arrows infinite autoplay>
    <div>
      <div className={styles.imageContainer}>
        <div className={styles.blurWrapper}>
          <Image
            src={'https://squirrelserversmanager.io/home/devices.png'}
            preview={false}
            className={styles.blurredImage}
          />
        </div>
      </div>
    </div>
    <div>
      <div className={styles.imageContainer}>
        <div className={styles.blurWrapper}>
          <Image
            src={'https://squirrelserversmanager.io/home/dashboard.png'}
            preview={false}
            className={styles.blurredImage}
          />
        </div>
      </div>
    </div>
    <div>
      <div className={styles.imageContainer}>
        <div className={styles.blurWrapper}>
          <Image
            src={'https://squirrelserversmanager.io/home/services.png'}
            preview={false}
            className={styles.blurredImage}
          />
        </div>
      </div>
    </div>
    <div>
      <div className={styles.imageContainer}>
        <div className={styles.blurWrapper}>
          <Image
            src={'https://squirrelserversmanager.io/home/store.png'}
            preview={false}
            className={styles.blurredImage}
          />
        </div>
      </div>
    </div>
  </Carousel>
);

export default CarouselNoDevice;
