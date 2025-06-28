/**
 * Shared UI Icons
 * Complete icon collection for FSD components
 */

import Icon from '@ant-design/icons';
import { GetProps } from 'antd';
import React from 'react';

export type CustomIconComponentProps = GetProps<typeof Icon>;

// CPU Icon
const WhhCpuSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 960 960"
      {...props}
    >
      <path
        fill="currentColor"
        d="M928 640h-96v-64h96q13 0 22.5 9.5T960 608t-9.5 22.5T928 640zm0-128h-96v-64h96q13 0 22.5 9.5T960 480t-9.5 22.5T928 512zm0-128h-96v-64h96q13 0 22.5 9.5T960 352t-9.5 22.5T928 384zm0-128h-96v-64h96q13 0 22.5 9.5T960 224t-9.5 22.5T928 256zM736 960q-13 0-22.5-9.5T704 928v-96h64v96q0 13-9.5 22.5T736 960zm-32-192H256q-26 0-45-19t-19-45V256q0-26 19-45t45-19h448q27 0 45.5 18.5T768 256v448q0 27-18.5 45.5T704 768zm0-736q0-13 9.5-22.5T736 0t22.5 9.5T768 32v96h-64V32zm-128 0q0-13 9.5-22.5T608 0t22.5 9.5T640 32v96h-64V32zm-128 0q0-13 9.5-22.5T480 0t22.5 9.5T512 32v96h-64V32zm-128 0q0-13 9.5-22.5T352 0t22.5 9.5T384 32v96h-64V32zm-128 0q0-13 9.5-22.5T224 0t22.5 9.5T256 32v96h-64V32zM0 736q0-13 9.5-22.5T32 704h96v64H32q-13 0-22.5-9.5T0 736zm0-128q0-13 9.5-22.5T32 576h96v64H32q-13 0-22.5-9.5T0 608zm0-128q0-13 9.5-22.5T32 448h96v64H32q-13 0-22.5-9.5T0 480zm0-128q0-13 9.5-22.5T32 320h96v64H32q-13 0-22.5-9.5T0 352zm0-128q0-13 9.5-22.5T32 192h96v64H32q-13 0-22.5-9.5T0 224zm256 704q0 13-9.5 22.5T224 960t-22.5-9.5T192 928v-96h64v96zm128 0q0 13-9.5 22.5T352 960t-22.5-9.5T320 928v-96h64v96zm128 0q0 13-9.5 22.5T480 960t-22.5-9.5T448 928v-96h64v96zm128 0q0 13-9.5 22.5T608 960t-22.5-9.5T576 928v-96h64v96zm320-192q0 13-9.5 22.5T928 768h-96v-64h96q13 0 22.5 9.5T960 736z"
      />
    </svg>
  ),
);

export const WhhCpu = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={WhhCpuSvg} {...props} />
);

// RAM Icon
const WhhRamSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 960 1024"
      {...props}
    >
      <path
        fill="currentColor"
        d="M832 768H128q-53 0-90.5-37.5T0 640V384q0-53 37.5-90.5T128 256h704q53 0 90.5 37.5T960 384v256q0 53-37.5 90.5T832 768zM256 416q0-13-9.5-22.5T224 384H96q-13 0-22.5 9.5T64 416v192q0 13 9.5 22.5T96 640t22.5-9.5T128 608v-32h64v32q0 13 9.5 22.5T224 640t22.5-9.5T256 608v-32h-32q-13 0-22.5-9.5T192 544t9.5-22.5T224 512h32v-96zm256 0q0-13-9.5-22.5T480 384H352q-13 0-22.5 9.5T320 416v192q0 13 9.5 22.5T352 640t22.5-9.5T384 608v-32h64v32q0 13 9.5 22.5T480 640t22.5-9.5T512 608V416zm384 0q0-13-9.5-22.5T864 384H608q-13 0-22.5 9.5T576 416v192q0 13 9.5 22.5T608 640t22.5-9.5T640 608V448h64v160q0 13 9.5 22.5T736 640t22.5-9.5T768 608V448h64v160q0 13 9.5 22.5T864 640t22.5-9.5T896 608V416zm-512 32h64v64h-64v-64zm-256 0h64v64h-64v-64zM768 32q0-13 9.5-22.5T800 0t22.5 9.5T832 32v160h-64V32zm-128 0q0-13 9.5-22.5T672 0t22.5 9.5T704 32v160h-64V32zm-128 0q0-13 9.5-22.5T544 0t22.5 9.5T576 32v160h-64V32zm-128 0q0-13 9.5-22.5T416 0t22.5 9.5T448 32v160h-64V32zm-128 0q0-13 9.5-22.5T288 0t22.5 9.5T320 32v160h-64V32zm-128 0q0-13 9.5-22.5T160 0t22.5 9.5T192 32v160h-64V32zm64 960q0 13-9.5 22.5T160 1024t-22.5-9.5T128 992V832h64v160zm128 0q0 13-9.5 22.5T288 1024t-22.5-9.5T256 992V832h64v160zm128 0q0 13-9.5 22.5T416 1024t-22.5-9.5T384 992V832h64v160zm128 0q0 13-9.5 22.5T544 1024t-22.5-9.5T512 992V832h64v160zm128 0q0 13-9.5 22.5T672 1024t-22.5-9.5T640 992V832h64v160zm128 0q0 13-9.5 22.5T800 1024t-22.5-9.5T768 992V832h64v160z"
      />
    </svg>
  ),
);

export const WhhRam = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={WhhRamSvg} {...props} />
);

// Category-based icon exports for better organization
export * from './categories/system';
export * from './categories/services';
export * from './categories/containers';
export * from './categories/actions';
export * from './categories/automation';
export * from './categories/ui';

// Fallback: Re-export any remaining icons from legacy
export * from './all-icons';