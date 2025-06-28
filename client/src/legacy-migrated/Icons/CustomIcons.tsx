import Icon from '@ant-design/icons';
import { GetProps } from 'antd';
import React from 'react';

type CustomIconComponentProps = GetProps<typeof Icon>;

const StreamlineComputerConnectionSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.8em"
      viewBox="0 0 14 14"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5L.5 7L3 4.5m8 5L13.5 7L11 4.5" />
        <circle cx="9" cy="7" r=".5" />
        <circle cx="5" cy="7" r=".5" />
      </g>
    </svg>
  ));

export const StreamlineComputerConnection = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={StreamlineComputerConnectionSvg} {...props} />;

const LogosGitlabSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 256 236"
      {...props}
    >
      <path
        fill="#E24329"
        d="m128.075 236.075l47.104-144.97H80.97l47.104 144.97Z"
      />
      <path
        fill="#FC6D26"
        d="M128.075 236.074L80.97 91.104H14.956l113.119 144.97Z"
      />
      <path
        fill="#FCA326"
        d="M14.956 91.104L.642 135.16a9.752 9.752 0 0 0 3.542 10.903l123.891 90.012l-113.12-144.97Z"
      />
      <path
        fill="#E24329"
        d="M14.956 91.105H80.97L52.601 3.79c-1.46-4.493-7.816-4.492-9.275 0l-28.37 87.315Z"
      />
      <path
        fill="#FC6D26"
        d="m128.075 236.074l47.104-144.97h66.015l-113.12 144.97Z"
      />
      <path
        fill="#FCA326"
        d="m241.194 91.104l14.314 44.056a9.752 9.752 0 0 1-3.543 10.903l-123.89 90.012l113.119-144.97Z"
      />
      <path
        fill="#E24329"
        d="M241.194 91.105h-66.015l28.37-87.315c1.46-4.493 7.816-4.492 9.275 0l28.37 87.315Z"
      />
    </svg>
  ),
);

export const LogosGitlab = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LogosGitlabSvg} {...props} />
);

const EosIconsCronjobSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M10.021 1.021h6v2h-6zM20.04 7.41l1.434-1.434l-1.414-1.414l-1.433 1.433A8.989 8.989 0 0 0 7.53 5.881l1.42 1.44a7.038 7.038 0 0 1 4.06-1.3l.01.001v6.98l4.953 4.958A7.001 7.001 0 0 1 6.01 13.021h3l-4-4l-4 4h3A9 9 0 1 0 20.04 7.41Z"
      />
    </svg>
  ),
);

export const EosIconsCronjob = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={EosIconsCronjobSvg} {...props} />
);

const IonServerSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M256 428c-52.35 0-111.39-11.61-157.93-31c-17.07-7.19-31.69-18.82-43.64-28a4 4 0 0 0-6.43 3.18v12.58c0 28.07 23.49 53.22 66.14 70.82C152.29 471.33 202.67 480 256 480s103.7-8.67 141.86-24.42C440.51 438 464 412.83 464 384.76v-12.58a4 4 0 0 0-6.43-3.18c-11.95 9.17-26.57 20.81-43.65 28c-46.54 19.39-105.57 31-157.92 31Zm208-301.49c-.81-27.65-24.18-52.4-66-69.85C359.74 40.76 309.34 32 256 32s-103.74 8.76-141.91 24.66c-41.78 17.41-65.15 42.11-66 69.69L48 144c0 6.41 5.2 16.48 14.63 24.73c11.13 9.73 27.65 19.33 47.78 27.73C153.24 214.36 207.67 225 256 225s102.76-10.68 145.59-28.58c20.13-8.4 36.65-18 47.78-27.73C458.8 160.49 464 150.42 464 144Z"
      />
      <path
        fill="currentColor"
        d="M413.92 226c-46.53 19.43-105.57 31-157.92 31s-111.39-11.57-157.93-31c-17.07-7.15-31.69-18.79-43.64-28a4 4 0 0 0-6.43 3.22V232c0 6.41 5.2 14.48 14.63 22.73c11.13 9.74 27.65 19.33 47.78 27.74C153.24 300.34 207.67 311 256 311s102.76-10.68 145.59-28.57c20.13-8.41 36.65-18 47.78-27.74C458.8 246.47 464 238.41 464 232v-30.78a4 4 0 0 0-6.43-3.18c-11.95 9.17-26.57 20.81-43.65 27.96Z"
      />
      <path
        fill="currentColor"
        d="M413.92 312c-46.54 19.41-105.57 31-157.92 31s-111.39-11.59-157.93-31c-17.07-7.17-31.69-18.81-43.64-28a4 4 0 0 0-6.43 3.2V317c0 6.41 5.2 14.47 14.62 22.71c11.13 9.74 27.66 19.33 47.79 27.74C153.24 385.32 207.66 396 256 396s102.76-10.68 145.59-28.57c20.13-8.41 36.65-18 47.78-27.74C458.8 331.44 464 323.37 464 317v-29.8a4 4 0 0 0-6.43-3.18c-11.95 9.17-26.57 20.81-43.65 27.98Z"
      />
    </svg>
  ),
);

export const IonServer = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={IonServerSvg} {...props} />
);

const LogosQuaySvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 256 236"
      {...props}
    >
      <path
        fill="#40B4E5"
        d="m200.134 0l55.555 117.514l-55.555 117.518h-47.295l55.555-117.518L152.84 0h47.295ZM110.08 99.836l20.056-38.092l-2.29-8.868L102.847 0H55.552l48.647 102.898l5.881-3.062Zm17.766 74.433l-17.333-39.034l-6.314-3.101l-48.647 102.898h47.295l25-52.88v-7.883Z"
      />
      <path
        fill="#003764"
        d="M152.842 235.032L97.287 117.514L152.842 0h47.295l-55.555 117.514l55.555 117.518h-47.295Zm-97.287 0L0 117.514L55.555 0h47.296L47.295 117.514l55.556 117.518H55.555Z"
      />
    </svg>
  ),
);

export const LogosQuay = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LogosQuaySvg} {...props} />
);

const LogosAwsSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 256 153"
      {...props}
    >
      <path
        fill="white"
        d="M72.392 55.438c0 3.137.34 5.68.933 7.545a45.373 45.373 0 0 0 2.712 6.103c.424.678.593 1.356.593 1.95c0 .847-.508 1.695-1.61 2.543l-5.34 3.56c-.763.509-1.526.763-2.205.763c-.847 0-1.695-.424-2.543-1.187a26.224 26.224 0 0 1-3.051-3.984c-.848-1.44-1.696-3.052-2.628-5.001c-6.612 7.798-14.92 11.698-24.922 11.698c-7.12 0-12.8-2.035-16.954-6.103c-4.153-4.07-6.272-9.495-6.272-16.276c0-7.205 2.543-13.054 7.714-17.462c5.17-4.408 12.037-6.612 20.768-6.612c2.882 0 5.849.254 8.985.678c3.137.424 6.358 1.102 9.749 1.865V29.33c0-6.443-1.357-10.935-3.985-13.563c-2.712-2.628-7.29-3.9-13.817-3.9c-2.967 0-6.018.34-9.155 1.103c-3.136.762-6.188 1.695-9.155 2.882c-1.356.593-2.373.932-2.967 1.102c-.593.17-1.017.254-1.356.254c-1.187 0-1.78-.848-1.78-2.628v-4.154c0-1.356.17-2.373.593-2.966c.424-.594 1.187-1.187 2.374-1.78c2.967-1.526 6.527-2.798 10.68-3.815C33.908.763 38.316.255 42.978.255c10.088 0 17.463 2.288 22.21 6.866c4.662 4.577 7.036 11.528 7.036 20.853v27.464h.17ZM37.976 68.323c2.798 0 5.68-.508 8.731-1.526c3.052-1.017 5.765-2.882 8.053-5.425c1.357-1.61 2.374-3.39 2.882-5.425c.509-2.034.848-4.493.848-7.375v-3.56a70.791 70.791 0 0 0-7.799-1.441a63.874 63.874 0 0 0-7.968-.509c-5.68 0-9.833 1.102-12.63 3.391c-2.798 2.289-4.154 5.51-4.154 9.748c0 3.984 1.017 6.951 3.136 8.986c2.035 2.119 5.002 3.136 8.901 3.136Zm68.069 9.155c-1.526 0-2.543-.254-3.221-.848c-.678-.508-1.272-1.695-1.78-3.305L81.124 7.799c-.51-1.696-.764-2.798-.764-3.391c0-1.356.678-2.12 2.035-2.12h8.307c1.61 0 2.713.255 3.306.848c.678.509 1.187 1.696 1.695 3.306l14.241 56.117l13.224-56.117c.424-1.695.933-2.797 1.61-3.306c.679-.508 1.866-.847 3.392-.847h6.781c1.61 0 2.713.254 3.39.847c.679.509 1.272 1.696 1.611 3.306l13.394 56.795L168.01 6.442c.508-1.695 1.102-2.797 1.695-3.306c.678-.508 1.78-.847 3.306-.847h7.883c1.357 0 2.12.678 2.12 2.119c0 .424-.085.848-.17 1.356c-.085.509-.254 1.187-.593 2.12l-20.43 65.525c-.508 1.696-1.101 2.798-1.78 3.306c-.678.509-1.78.848-3.22.848h-7.29c-1.611 0-2.713-.254-3.392-.848c-.678-.593-1.271-1.695-1.61-3.39l-13.14-54.676l-13.054 54.59c-.423 1.696-.932 2.798-1.61 3.391c-.678.594-1.865.848-3.39.848h-7.291Zm108.927 2.289c-4.408 0-8.816-.509-13.054-1.526c-4.239-1.017-7.544-2.12-9.748-3.39c-1.357-.764-2.29-1.611-2.628-2.374a5.983 5.983 0 0 1-.509-2.374V65.78c0-1.78.678-2.628 1.95-2.628a4.8 4.8 0 0 1 1.526.255c.508.17 1.271.508 2.119.847a46.108 46.108 0 0 0 9.324 2.967a50.907 50.907 0 0 0 10.088 1.017c5.34 0 9.494-.932 12.376-2.797c2.882-1.865 4.408-4.577 4.408-8.053c0-2.373-.763-4.323-2.289-5.934c-1.526-1.61-4.408-3.051-8.561-4.408l-12.292-3.814c-6.188-1.95-10.765-4.832-13.563-8.647c-2.797-3.73-4.238-7.883-4.238-12.291c0-3.56.763-6.697 2.289-9.41c1.525-2.712 3.56-5.085 6.103-6.95c2.543-1.95 5.425-3.391 8.816-4.408c3.39-1.017 6.95-1.441 10.68-1.441c1.865 0 3.815.085 5.68.339c1.95.254 3.73.593 5.51.932c1.695.424 3.306.848 4.832 1.357c1.526.508 2.712 1.017 3.56 1.525c1.187.679 2.034 1.357 2.543 2.12c.509.678.763 1.61.763 2.797v3.984c0 1.78-.678 2.713-1.95 2.713c-.678 0-1.78-.34-3.22-1.018c-4.833-2.204-10.258-3.306-16.276-3.306c-4.832 0-8.647.763-11.275 2.374c-2.627 1.61-3.984 4.069-3.984 7.544c0 2.374.848 4.408 2.543 6.019c1.696 1.61 4.832 3.221 9.325 4.662l12.037 3.815c6.103 1.95 10.511 4.662 13.139 8.137c2.628 3.476 3.9 7.46 3.9 11.868c0 3.645-.764 6.951-2.205 9.833c-1.525 2.882-3.56 5.425-6.188 7.46c-2.628 2.119-5.764 3.645-9.409 4.747c-3.815 1.187-7.799 1.78-12.122 1.78Z"
      />
      <path
        fill="#F90"
        d="M230.993 120.964c-27.888 20.599-68.408 31.534-103.247 31.534c-48.827 0-92.821-18.056-126.05-48.064c-2.628-2.373-.255-5.594 2.881-3.73c35.942 20.854 80.276 33.484 126.136 33.484c30.94 0 64.932-6.442 96.212-19.666c4.662-2.12 8.646 3.052 4.068 6.442Zm11.614-13.224c-3.56-4.577-23.566-2.204-32.636-1.102c-2.713.34-3.137-2.034-.678-3.814c15.936-11.19 42.13-7.968 45.181-4.239c3.052 3.815-.848 30.008-15.767 42.554c-2.288 1.95-4.492.933-3.475-1.61c3.39-8.393 10.935-27.296 7.375-31.789Z"
      />
    </svg>
  ),
);

export const LogosAws = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LogosAwsSvg} {...props} />
);

const VscodeIconsFileTypeDocker2Svg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        fill="#0096e6"
        d="M16.54 12.663h2.86v2.924h1.446a6.272 6.272 0 0 0 1.988-.333a5.091 5.091 0 0 0 .966-.436a3.584 3.584 0 0 1-.67-1.849a3.907 3.907 0 0 1 .7-2.753l.3-.348l.358.288a4.558 4.558 0 0 1 1.795 2.892a4.375 4.375 0 0 1 3.319.309l.393.226l-.207.4a4.141 4.141 0 0 1-4.157 1.983c-2.48 6.168-7.871 9.088-14.409 9.088c-3.378 0-6.476-1.263-8.241-4.259l-.029-.049l-.252-.519a8.316 8.316 0 0 1-.659-4.208l.04-.433h2.445v-2.923h2.861V9.8h5.721V6.942h3.432v5.721Z"
      />
      <path
        fill="#fff"
        d="M12.006 24.567a6.022 6.022 0 0 1-3.14-3.089a10.329 10.329 0 0 1-2.264.343q-.5.028-1.045.028q-.632 0-1.331-.037a9.051 9.051 0 0 0 7 2.769q.392 0 .78-.014ZM7.08 13.346h.2v2.067h-.2Zm-.376 0h.2v2.067H6.7v-2.067Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.368 0h.2v2.067h-.2v-2.067ZM5 13.14h2.482v2.479H5Zm2.859-2.861h2.48v2.479H7.863Zm2.077.207h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2v-2.066Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.368 0h.2v2.066h-.2Zm-.207 2.653h2.48v2.48H7.863V13.14Zm2.077.207h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2v-2.067Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.368 0h.2v2.067h-.2Zm2.654-.207H13.2v2.48h-2.48V13.14Zm2.076.207H13v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.368 0h.2v2.067h-.2Zm-.206-3.067H13.2v2.479h-2.48v-2.479Zm2.076.207H13v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.368 0h.2v2.066h-.2Zm2.654 2.653h2.479v2.48h-2.48V13.14Zm2.076.207h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.368 0h.192v2.067h-.2v-2.067Zm-.206-3.067h2.479v2.479h-2.48v-2.479Zm2.076.207h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.368 0h.192v2.066h-.2v-2.066Zm-.206-3.067h2.479V9.9h-2.48V7.419Zm2.076.206h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.376 0h.2v2.066h-.2Zm-.368 0h.192v2.066h-.2V7.625Zm2.654 5.514h2.479v2.48h-2.48V13.14Zm2.076.207h.195v2.067h-.2v-2.067Zm-.376 0h.206v2.067h-.206Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.2Zm-.376 0h.2v2.067h-.205v-2.067Zm-.368 0h.2v2.067h-.194v-2.067Zm-6.442 6.292a.684.684 0 1 1-.684.684a.684.684 0 0 1 .684-.684Zm0 .194a.489.489 0 0 1 .177.033a.2.2 0 1 0 .275.269a.49.49 0 1 1-.453-.3Z"
      />
    </svg>
  ));

export const VscodeIconsFileTypeDocker2 = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={VscodeIconsFileTypeDocker2Svg} {...props} />;

const FluentMdl2RegistryEditorSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.8em"
      viewBox="0 0 2048 2048"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1152 896h512v1152H0V384h1152v512zM640 512v384h384V512H640zm384 896v-384H640v384h384zM128 512v384h384V512H128zm0 512v384h384v-384H128zm384 896v-384H128v384h384zm512 0v-384H640v384h384zm512 0v-384h-384v384h384zm-384-512h384v-384h-384v384zm832-960l-384 384l-384-384l384-384l384 384zm-384-239l-239 239l239 239l239-239l-239-239z"
      />
    </svg>
  ));

export const FluentMdl2RegistryEditor = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={FluentMdl2RegistryEditorSvg} {...props} />;

const DeviconGooglecloudSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 128 128"
      {...props}
    >
      <path
        fill="#ea4535"
        d="M80.6 40.3h.4l-.2-.2l14-14v-.3c-11.8-10.4-28.1-14-43.2-9.5C36.5 20.8 24.9 32.8 20.7 48c.2-.1.5-.2.8-.2c5.2-3.4 11.4-5.4 17.9-5.4c2.2 0 4.3.2 6.4.6c.1-.1.2-.1.3-.1c9-9.9 24.2-11.1 34.6-2.6h-.1z"
      />
      <path
        fill="#557ebf"
        d="M108.1 47.8c-2.3-8.5-7.1-16.2-13.8-22.1L80 39.9c6 4.9 9.5 12.3 9.3 20v2.5c16.9 0 16.9 25.2 0 25.2H63.9v20h-.1l.1.2h25.4c14.6.1 27.5-9.3 31.8-23.1c4.3-13.8-1-28.8-13-36.9z"
      />
      <path
        fill="#36a852"
        d="M39 107.9h26.3V87.7H39c-1.9 0-3.7-.4-5.4-1.1l-15.2 14.6v.2c6 4.3 13.2 6.6 20.7 6.6z"
      />
      <path
        fill="#f9bc15"
        d="M40.2 41.9c-14.9.1-28.1 9.3-32.9 22.8c-4.8 13.6 0 28.5 11.8 37.3l15.6-14.9c-8.6-3.7-10.6-14.5-4-20.8c6.6-6.4 17.8-4.4 21.7 3.8L68 55.2C61.4 46.9 51.1 42 40.2 42.1z"
      />
    </svg>
  ));

export const DeviconGooglecloud = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={DeviconGooglecloudSvg} {...props} />;

const OuiMlCreateAdvancedJobSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16h-2c0-7.732-6.268-14-14-14S2 8.268 2 16s6.268 14 14 14z"
      />
      <path
        fill="currentColor"
        d="M27 20v12h-2V20zm-5 4v8h-2v-8zm10-2v10h-2V22zM17 9v6h6v2h-6v6h-2v-6H9v-2h6V9z"
        className="ouiIcon__fillSecondary"
      />
    </svg>
  ));

export const OuiMlCreateAdvancedJob = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={OuiMlCreateAdvancedJobSvg} {...props} />;

const UilDockerSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M8.8 8.8h1.8c.1 0 .2-.1.2-.2V7.1c0-.1-.1-.2-.2-.2H8.8c-.1 0-.2.1-.2.2v1.6s.1.1.2.1zm2.4 2.3H13c.1 0 .2-.1.2-.2V9.3c0-.1-.1-.2-.2-.2h-1.8c-.1 0-.2.1-.2.2v1.6c0 .1.1.2.2.2zm0-2.3H13c.1 0 .2-.1.2-.2V7.1l-.2-.2h-1.8c-.1 0-.2.1-.2.2v1.6s.1.1.2.1zm2.5 2.3h1.8c.1 0 .2-.1.2-.2V9.3c0-.1-.1-.2-.2-.2h-1.8c-.1 0-.2.1-.2.2v1.6c0 .1.1.2.2.2zm-2.5-4.6H13c.1 0 .2-.1.2-.2V4.8c0-.1-.1-.2-.2-.2h-1.8c-.1 0-.2.1-.2.2v1.6c0 .1.1.1.2.1zm-7.4 4.6h1.8c.1 0 .2-.1.2-.2V9.3c0-.1-.1-.2-.2-.2H3.8c-.1 0-.2.1-.2.2v1.6l.2.2zm18-1c-.5-.3-1.1-.5-1.6-.4c-.3 0-.6 0-.8.1c-.2-.9-.7-1.7-1.4-2.1l-.3-.2l-.2.3c-.3.2-.5.6-.6 1.1c-.2.8-.1 1.6.3 2.2c-.5.2-1 .3-1.5.4H2.6c-.3 0-.6.3-.6.6c0 1.2.2 2.3.6 3.4c.4 1.1 1.1 2 2 2.6c1.4.7 2.9 1 4.4.9c.8 0 1.6-.1 2.4-.2c1.1-.2 2.2-.6 3.2-1.2c.8-.5 1.5-1.1 2.2-1.8c.9-1.1 1.6-2.3 2.1-3.7h.2c.8 0 1.6-.3 2.2-.8c.3-.2.5-.5.6-.9l.1-.2l-.2-.1zm-15.5 1H8c.1 0 .2-.1.2-.2V9.3c0-.1-.1-.2-.2-.2H6.3c-.1 0-.2.1-.2.2v1.6c0 .1.1.2.2.2zm0-2.3H8c.1 0 .2-.1.2-.2V7.1c0-.1-.1-.2-.2-.2H6.3c-.1 0-.2.1-.2.2v1.6s.1.1.2.1zm2.5 2.3h1.8c.1 0 .2-.1.2-.2V9.3c0-.1-.1-.2-.2-.2H8.8c-.1 0-.2.1-.2.2v1.6c0 .1.1.2.2.2z"
      />
    </svg>
  ),
);

export const UilDocker = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={UilDockerSvg} {...props} />
);

const TablerPlugConnectedSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1-5-5L7 12zm10 0l-5-5l1.5-1.5a3.536 3.536 0 1 1 5 5L17 12zM3 21l2.5-2.5m13-13L21 3m-11 8l-2 2m5 1l-2 2"
      />
    </svg>
  ));

export const TablerPlugConnected = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={TablerPlugConnectedSvg} {...props} />;

const StreamlineLockRotationSolidSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 14 14"
      {...props}
    >
      <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
        <path d="M1.5 7a5.5 5.5 0 0 1 9.82-3.405l-.966.965a.5.5 0 0 0 .353.854H13.5a.5.5 0 0 0 .5-.5V2.12a.5.5 0 0 0-.854-.354l-.76.761a7 7 0 1 0 1.427 6.086a.75.75 0 0 0-1.46-.344A5.5 5.5 0 0 1 1.5 7" />
        <path d="M6.125 5.813a.875.875 0 1 1 1.75 0v.5h-1.75zm-1.25.719v-.72a2.125 2.125 0 1 1 4.25 0v.72a.998.998 0 0 1 .375.78v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2c0-.315.146-.597.375-.78" />
      </g>
    </svg>
  ));

export const StreamlineLockRotationSolid = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={StreamlineLockRotationSolidSvg} {...props} />;

const EosIconsAdminSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        id="eosIconsAdmin0"
        fill="currentColor"
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5Zm0 3.9a3 3 0 1 1-3 3a3 3 0 0 1 3-3Zm0 7.9c2 0 6 1.09 6 3.08a7.2 7.2 0 0 1-12 0c0-1.99 4-3.08 6-3.08Z"
      />
    </svg>
  ),
);

export const EosIconsAdmin = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={EosIconsAdminSvg} {...props} />
);

const GrommetIconsHostSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M17 4h1v1h-1V4ZM3 1h18v22H3V1Zm0 12h18H3Zm0 5h18H3ZM3 8h18H3Z"
      />
    </svg>
  ),
);

export const GrommetIconsHost = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={GrommetIconsHostSvg} {...props} />
);

const ElNetworkSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      width="1.5em"
      height="1.5em"
      viewBox="0 0 1200 1200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1.422 630.365C-.4 620.378.049 611.896.049 601.507v-2.748c163.322-14.011 341.241-55.15 473.665-149.787c37.996 17.409 75.363 15.034 111.208-2.748c75.104 75.855 148.807 128.574 247.13 159.405c10.067 25.652 26.086 45.35 48.054 59.091c-26.543 65.961-63.612 124.136-111.209 174.521c-70.346-50.674-163.23-13.979-194.957 59.091c-220.012-2.384-441.761-98.642-572.518-267.967m571.143 354.54c-112.313 58.005-230.856 89.276-351.474 82.451C127.796 989.072 60.567 886.74 26.135 780.151c151.522 130.23 352.912 204.549 546.43 204.754m248.503-16.49c127.807-26.659 245.244-78.05 340.488-156.657c-125.012 325.938-501.479 474.94-810.035 336.676c100.162-14.432 194.251-49.025 274.588-94.817c80.286 46.004 175.832-2.388 194.959-85.202m236.146-335.302c49.196-3.631 97.167-7.251 142.786-15.116c-.089 12.283-1.357 24.374-1.373 35.729c-85.771 109.767-214.696 184.762-343.235 219.87c47.966-58.233 83.545-122.923 108.462-188.264c39.174-5.082 71.173-23.077 93.36-52.219m21.968-87.948c-5.416-40.734-25.791-73.796-57.664-94.819c10.072-93.269 11.733-184.275 4.119-272.089c96.156 99.264 154.383 225.964 170.244 351.792c-34.781 7.329-73.682 12.368-116.699 15.116M410.559 387.133C289.275 463.55 147.263 500.671 6.914 512.185C41.964 293.143 191.16 112.112 391.337 38.09c5.438 71.134 21.91 139.81 48.054 199.257c-41.973 42.622-51.941 97.264-28.832 149.786m236.145-101.69c63.215-78.489 115.77-158.695 145.532-252.851C843.492 50 889.715 72.444 930.903 99.928c14.386 113.183 16.386 225.917 5.491 331.18c-49.729 8.487-88.823 38.744-105.717 82.45c-73.416-26.576-133.514-76.068-186.72-129.174c13.364-34.477 13.869-66.794 2.747-98.941m-127.683-81.077c-25.545-63.148-42.218-124.34-42.562-191.012c76.599-17.623 159.296-17.036 232.027-2.748c-27.786 77.786-71.688 149.88-118.073 208.876c-16.321-6.971-56.075-22.499-71.392-15.116"
      />
    </svg>
  ),
);

export const ElNetwork = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ElNetworkSvg} {...props} />
);

const FluentMdl2HealthSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 2048 2048"
      {...props}
    >
      <path
        fill="currentColor"
        d="M347 1024h-39l716 716l588-588h181l-769 769l-865-864q-35-35-62-75t-47-86h243l283-282l448 447l320-319l155 154h355q32-51 49-108t17-117q0-87-32-162t-89-130t-132-87t-163-32q-84 0-149 26t-120 70t-105 97t-106 111q-54-54-105-109t-106-99t-121-72t-148-28q-86 0-161 32t-132 89t-89 132t-33 162q0 47 11 97H9q-5-24-6-48t-2-48q0-113 42-212t116-173t173-116t212-43q83 0 148 19t120 52t106 81t106 103q55-56 105-103t106-80t121-53t148-19q112 0 211 42t172 116t116 172t43 211q0 97-34 188t-97 167h-470l-101-102l-320 321l-448-449l-229 230z"
      />
    </svg>
  ),
);

export const FluentMdl2Health = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FluentMdl2HealthSvg} {...props} />
);

export const PajamasLogSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.5 2.5v11h9v-11h-9ZM3 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3Zm5 10a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 11Zm-2 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm2-4a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 8ZM6 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm2-4a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 5ZM6 6a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  ));

export const PajamasLog = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PajamasLogSvg} {...props} />
);

const MaterialSymbolsDashboardSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13 9V3h8v6h-8ZM3 13V3h8v10H3Zm10 8V11h8v10h-8ZM3 21v-6h8v6H3Z"
      />
    </svg>
  ));

export const MaterialSymbolsDashboard = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={MaterialSymbolsDashboardSvg} {...props} />;

const MynauiDangerTriangleSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 8.5V14m0 3.247v-.5m-6.02-5.985C8.608 5.587 9.92 3 12 3c2.08 0 3.393 2.587 6.02 7.762l.327.644c2.182 4.3 3.274 6.45 2.287 8.022C19.648 21 17.208 21 12.327 21h-.654c-4.88 0-7.321 0-8.307-1.572c-.987-1.572.105-3.722 2.287-8.022z"
      />
    </svg>
  ));

export const MynauiDangerTriangle = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={MynauiDangerTriangleSvg} {...props} />;

const MynauiApiSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M5.5 13L7 11.5l5.5 5.5l-1.5 1.5c-.75.75-3.5 2-5.5 0s-.75-4.75 0-5.5ZM3 21l2.5-2.5m13-7.5L17 12.5L11.5 7L13 5.5c.75-.75 3.5-2 5.5 0s.75 4.75 0 5.5Zm-6-3l-2 2M21 3l-2.5 2.5m-2.5 6l-2 2"
      />
    </svg>
  ),
);

export const MynauiApi = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MynauiApiSvg} {...props} />
);

const CarbonBatchJobSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M32 26v-2h-2.101a4.968 4.968 0 0 0-.732-1.753l1.49-1.49l-1.414-1.414l-1.49 1.49A4.964 4.964 0 0 0 26 20.101V18h-2v2.101a4.968 4.968 0 0 0-1.753.732l-1.49-1.49l-1.414 1.414l1.49 1.49A4.964 4.964 0 0 0 20.101 24H18v2h2.101c.13.637.384 1.229.732 1.753l-1.49 1.49l1.414 1.414l1.49-1.49a4.964 4.964 0 0 0 1.753.732V32h2v-2.101a4.968 4.968 0 0 0 1.753-.732l1.49 1.49l1.414-1.414l-1.49-1.49A4.964 4.964 0 0 0 29.899 26zm-7 2c-1.654 0-3-1.346-3-3s1.346-3 3-3s3 1.346 3 3s-1.346 3-3 3m-5-11h-8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2m-8-2h8V4h-8z"
      />
      <path fill="currentColor" d="M17 21H8a2 2 0 0 1-2-2V7h2v12h9z" />
      <path fill="currentColor" d="M13 25H4c-1.103 0-2-.897-2-2V11h2v12h9z" />
    </svg>
  ),
);

export const CarbonBatchJob = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CarbonBatchJobSvg} {...props} />
);

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

const GrommetIconsInstallSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      width="0.8em"
      height="0.8em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M19 13.5v4L12 22l-7-4.5v-4m7 8.5v-8.5m6.5-5l-6.5-4L15.5 2L22 6zm-13 0l6.5-4L8.5 2L2 6zm13 .5L12 13l3.5 2.5l6.5-4zm-13 0l6.5 4l-3.5 2.5l-6.5-4z"
      />
    </svg>
  ));

export const GrommetIconsInstall = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={GrommetIconsInstallSvg} {...props} />;

export const GameIconsAcorn: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M422.625 18.28c-24.68.13-51.932 15.455-74.094 36.907c1.868 1.036 3.742 2.07 5.626 3.157a396.997 396.997 0 0 1 22.72 14.125c25.19-9.583 55.47-14.465 103.437-2.97c-12.036-37.07-33.633-51.345-57.688-51.22zM237.78 40.22l28.97 94.25c12.57 6.443 24.827 13.41 36.813 20.843l-36.625-111.97c-8.476-1.68-16.657-2.662-24.563-3c-1.54-.065-3.074-.108-4.594-.124zm-19.218 1.124a136.71 136.71 0 0 0-4.78.687a133.758 133.758 0 0 0-25.595 6.876l15.688 58.625a492.05 492.05 0 0 1 39.906 15.907l-25.218-82.093zm69.875 7.593l40.157 122.876c15.922 11.124 31.32 23.128 46.25 35.906L325.906 64.374c-13.092-6.527-25.568-11.643-37.47-15.438zm-117.5 7.844c-14.657 7.857-28.523 18.348-41.875 31.095a496.901 496.901 0 0 1 53.657 12.813zm179.25 20.907l53.282 155.97c10.798 10.382 21.322 21.187 31.624 32.374c.395-1.174.75-2.332 1.125-3.5L379.843 97.407c-8.84-6.63-18.706-13.185-29.656-19.72zM136.595 108.25c-17.05 11.436-32.43 27.876-45.344 50.22c-42.303 73.19-61.83 198.325-24.53 265.717l-.064-.062c.752 23.392-7.597 45.63-17.812 67.594c27.268-12.192 54.897-17.815 82.687-20.783l-.468-.343c87.895 19.01 212.87-49.42 260.688-132.156c13.547-23.44 20.606-46.14 22.28-67.72c-77.218-81.572-166.868-139.912-277.436-162.468zm271.469 14L444.188 228c2.638-20.573.96-39.855-5.688-58.25c-5.856-16.202-15.717-32.01-30.438-47.5z"
      />
    </svg>
  ));

const DeviconAzureSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.8em"
      viewBox="0 0 128 128"
      {...props}
    >
      <defs>
        <linearGradient
          id="deviconAzure0"
          x1="60.919"
          x2="18.667"
          y1="9.602"
          y2="134.423"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#114A8B" />
          <stop offset="1" stopColor="#0669BC" />
        </linearGradient>
        <linearGradient
          id="deviconAzure1"
          x1="74.117"
          x2="64.344"
          y1="67.772"
          y2="71.076"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity=".3" />
          <stop offset=".071" stopOpacity=".2" />
          <stop offset=".321" stopOpacity=".1" />
          <stop offset=".623" stopOpacity=".05" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="deviconAzure2"
          x1="68.742"
          x2="115.122"
          y1="5.961"
          y2="129.525"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3CCBF4" />
          <stop offset="1" stopColor="#2892DF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#deviconAzure0)"
        d="M46.09.002h40.685L44.541 125.137a6.485 6.485 0 0 1-6.146 4.413H6.733a6.482 6.482 0 0 1-5.262-2.699a6.474 6.474 0 0 1-.876-5.848L39.944 4.414A6.488 6.488 0 0 1 46.09 0z"
        transform="translate(.587 4.468) scale(.91904)"
      />
      <path
        fill="#0078d4"
        d="M97.28 81.607H37.987a2.743 2.743 0 0 0-1.874 4.751l38.1 35.562a5.991 5.991 0 0 0 4.087 1.61h33.574z"
      />
      <path
        fill="url(#deviconAzure1)"
        d="M46.09.002A6.434 6.434 0 0 0 39.93 4.5L.644 120.897a6.469 6.469 0 0 0 6.106 8.653h32.48a6.942 6.942 0 0 0 5.328-4.531l7.834-23.089l27.985 26.101a6.618 6.618 0 0 0 4.165 1.519h36.396l-15.963-45.616l-46.533.011L86.922.002z"
        transform="translate(.587 4.468) scale(.91904)"
      />
      <path
        fill="url(#deviconAzure2)"
        d="M98.055 4.408A6.476 6.476 0 0 0 91.917.002H46.575a6.478 6.478 0 0 1 6.137 4.406l39.35 116.594a6.476 6.476 0 0 1-6.137 8.55h45.344a6.48 6.48 0 0 0 6.136-8.55z"
        transform="translate(.587 4.468) scale(.91904)"
      />
    </svg>
  ),
);

export const DeviconAzure = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DeviconAzureSvg} {...props} />
);

const ZmdiGithubSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.8em"
      viewBox="0 0 432 416"
      {...props}
    >
      <path
        fill="currentColor"
        d="M213.5 0q88.5 0 151 62.5T427 213q0 70-41 125.5T281 416q-14 2-14-11v-58q0-27-15-40q44-5 70.5-27t26.5-77q0-34-22-58q11-26-2-57q-18-5-58 22q-26-7-54-7t-53 7q-18-12-32.5-17.5T107 88h-6q-12 31-2 57q-22 24-22 58q0 55 27 77t70 27q-11 10-13 29q-42 18-62-18q-12-20-33-22q-2 0-4.5.5t-5 3.5t8.5 9q14 7 23 31q1 2 2 4.5t6.5 9.5t13 10.5T130 371t30-2v36q0 13-14 11q-64-22-105-77.5T0 213q0-88 62.5-150.5T213.5 0z"
      />
    </svg>
  ),
);

export const ZmdiGithub = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ZmdiGithubSvg} {...props} />
);

const SimpleIconsForgejoSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.9em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="white"
        d="M16.777 0a2.9 2.9 0 1 1-2.529 4.322H12.91a4.266 4.266 0 0 0-4.265 4.195v2.118a7.076 7.076 0 0 1 4.147-1.42l.118-.002h1.338a2.9 2.9 0 0 1 5.43 1.422a2.9 2.9 0 0 1-5.43 1.422H12.91a4.266 4.266 0 0 0-4.265 4.195v2.319A2.9 2.9 0 0 1 7.222 24A2.9 2.9 0 0 1 5.8 18.57V8.589a7.109 7.109 0 0 1 6.991-7.108l.118-.001h1.338A2.9 2.9 0 0 1 16.778 0ZM7.223 19.905a1.194 1.194 0 1 0 0 2.389a1.194 1.194 0 0 0 0-2.389Zm9.554-10.464a1.194 1.194 0 1 0 0 2.389a1.194 1.194 0 0 0 0-2.39Zm0-7.735a1.194 1.194 0 1 0 0 2.389a1.194 1.194 0 0 0 0-2.389Z"
      />
    </svg>
  ));

export const SimpleIconsForgejo = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={SimpleIconsForgejoSvg} {...props} />;

const SimpleIconsGiteaSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.8em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="white"
        d="M4.209 4.603c-.247 0-.525.02-.84.088c-.333.07-1.28.283-2.054 1.027C-.403 7.25.035 9.685.089 10.052c.065.446.263 1.687 1.21 2.768c1.749 2.141 5.513 2.092 5.513 2.092s.462 1.103 1.168 2.119c.955 1.263 1.936 2.248 2.89 2.367c2.406 0 7.212-.004 7.212-.004s.458.004 1.08-.394c.535-.324 1.013-.893 1.013-.893s.492-.527 1.18-1.73c.21-.37.385-.729.538-1.068c0 0 2.107-4.471 2.107-8.823c-.042-1.318-.367-1.55-.443-1.627c-.156-.156-.366-.153-.366-.153s-4.475.252-6.792.306c-.508.011-1.012.023-1.512.027v4.474l-.634-.301c0-1.39-.004-4.17-.004-4.17c-1.107.016-3.405-.084-3.405-.084s-5.399-.27-5.987-.324c-.187-.011-.401-.032-.648-.032zm.354 1.832h.111s.271 2.269.6 3.597C5.549 11.147 6.22 13 6.22 13s-.996-.119-1.641-.348c-.99-.324-1.409-.714-1.409-.714s-.73-.511-1.096-1.52C1.444 8.73 2.021 7.7 2.021 7.7s.32-.859 1.47-1.145c.395-.106.863-.12 1.072-.12zm8.33 2.554c.26.003.509.127.509.127l.868.422l-.529 1.075a.686.686 0 0 0-.614.359a.685.685 0 0 0 .072.756l-.939 1.924a.69.69 0 0 0-.66.527a.687.687 0 0 0 .347.763a.686.686 0 0 0 .867-.206a.688.688 0 0 0-.069-.882l.916-1.874a.667.667 0 0 0 .237-.02a.657.657 0 0 0 .271-.137a8.826 8.826 0 0 1 1.016.512a.761.761 0 0 1 .286.282c.073.21-.073.569-.073.569c-.087.29-.702 1.55-.702 1.55a.692.692 0 0 0-.676.477a.681.681 0 1 0 1.157-.252c.073-.141.141-.282.214-.431c.19-.397.515-1.16.515-1.16c.035-.066.218-.394.103-.814c-.095-.435-.48-.638-.48-.638c-.467-.301-1.116-.58-1.116-.58s0-.156-.042-.27a.688.688 0 0 0-.148-.241l.516-1.062l2.89 1.401s.48.218.583.619c.073.282-.019.534-.069.657c-.24.587-2.1 4.317-2.1 4.317s-.232.554-.748.588a1.065 1.065 0 0 1-.393-.045l-.202-.08l-4.31-2.1s-.417-.218-.49-.596c-.083-.31.104-.691.104-.691l2.073-4.272s.183-.37.466-.497a.855.855 0 0 1 .35-.077z"
      />
    </svg>
  ),
);

export const SimpleIconsGitea = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SimpleIconsGiteaSvg} {...props} />
);

const VaadinCubesSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.8em"
      height="1.8em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="white"
        d="M12 6V2L8 0L4 2v4L0 8v5l4 2l4-2l4 2l4-2V8zM8.09 1.12L11 2.56l-2.6 1.3l-2.91-1.44zM5 2.78l3 1.5v3.6l-3-1.5v-3.6zm-1 11.1l-3-1.5v-3.6l3 1.5v3.6zm.28-4L1.4 8.42L4 7.12l2.88 1.44zm7.72 4l-3-1.5v-3.6l3 1.5v3.6zm.28-4L9.4 8.42l2.6-1.3l2.88 1.44z"
      />
    </svg>
  ),
);

export const VaadinCubes = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={VaadinCubesSvg} {...props} />
);

const SimpleIconsGitSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="white"
        d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039a1.837 1.837 0 0 1-2.6 0a1.846 1.846 0 0 1-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348a1.848 1.848 0 0 1 0 2.6a1.844 1.844 0 0 1-2.609 0a1.834 1.834 0 0 1 0-2.598c.182-.18.387-.316.605-.406V8.835a1.834 1.834 0 0 1-.996-2.41L7.636 3.7L.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477a1.545 1.545 0 0 0 2.186 0l10.43-10.43a1.544 1.544 0 0 0 0-2.187"
      />
    </svg>
  ),
);

export const SimpleIconsGit = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SimpleIconsGitSvg} {...props} />
);

const StreamlineLocalStorageFolderSolidSvg: React.FC<
  React.SVGProps<SVGSVGElement>
> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="0.8em"
    height="0.8em"
    viewBox="0 0 14 14"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8.796 5h4.77c.24 0 .434-.195.434-.435v-3.26a.435.435 0 0 0-.434-.435h-2.61l-.12-.54A.435.435 0 0 0 10.4 0H8.796a.435.435 0 0 0-.435.435v4.13A.435.435 0 0 0 8.796 5M2 3h4.25a1 1 0 0 0 0-2H1.457C.652 1 0 1.652 0 2.457v7.086C0 10.348.652 11 1.457 11h4.028l-.537 1.5H4A.75.75 0 0 0 4 14h6a.75.75 0 1 0 0-1.5h-.948L8.515 11h4.028C13.348 11 14 10.348 14 9.543V7.25a1 1 0 1 0-2 0V9H2z"
      clipRule="evenodd"
    />
  </svg>
));

export const StreamlineLocalStorageFolderSolid = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={StreamlineLocalStorageFolderSolidSvg} {...props} />;

const GrommetIconsSystemSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M1 19h22V1H1v18Zm4 4h14H5Zm3 0h8v-4H8v4ZM7.757 5.757l2.122 2.122l-2.122-2.122ZM9 10H6h3Zm.879 2.121l-2.122 2.122l2.122-2.122ZM12 13v3v-3Zm2.121-.879l2.122 2.122l-2.122-2.122ZM18 10h-3h3Zm-1.757-4.243l-2.122 2.122l2.122-2.122ZM12 7V4v3Zm0 0a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z"
      />
    </svg>
  ));

export const GrommetIconsSystem = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={GrommetIconsSystemSvg} {...props} />;

const TablerSquareNumber1FilledSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M18.333 2c1.96 0 3.56 1.537 3.662 3.472l.005.195v12.666c0 1.96-1.537 3.56-3.472 3.662l-.195.005H5.667a3.667 3.667 0 0 1-3.662-3.472L2 18.333V5.667c0-1.96 1.537-3.56 3.472-3.662L5.667 2zm-5.339 5.886c-.083-.777-1.008-1.16-1.617-.67l-.084.077l-2 2l-.083.094a1 1 0 0 0 0 1.226l.083.094l.094.083a1 1 0 0 0 1.226 0l.094-.083l.293-.293V16l.007.117a1 1 0 0 0 1.986 0L13 16V8z"
      />
    </svg>
  ));

export const TablerSquareNumber1Filled = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={TablerSquareNumber1FilledSvg} {...props} />;

const TablerSquareNumber2FilledSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M18.333 2c1.96 0 3.56 1.537 3.662 3.472l.005.195v12.666c0 1.96-1.537 3.56-3.472 3.662l-.195.005H5.667a3.667 3.667 0 0 1-3.662-3.472L2 18.333V5.667c0-1.96 1.537-3.56 3.472-3.662L5.667 2zM13 7h-3l-.117.007a1 1 0 0 0 0 1.986L10 9h3v2h-2l-.15.005a2 2 0 0 0-1.844 1.838L9 13v2l.005.15a2 2 0 0 0 1.838 1.844L11 17h3l.117-.007a1 1 0 0 0 0-1.986L14 15h-3v-2h2l.15-.005a2 2 0 0 0 1.844-1.838L15 11V9l-.005-.15a2 2 0 0 0-1.838-1.844z"
      />
    </svg>
  ));

export const TablerSquareNumber2Filled = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={TablerSquareNumber2FilledSvg} {...props} />;

const CarbonIbmEventAutomationSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <circle cx="4" cy="22" r="2" fill="currentColor" />
      <path
        fill="currentColor"
        d="M13.5 30a9.527 9.527 0 0 1-7.73-3.977l1.626-1.164A7.523 7.523 0 0 0 13.5 28c3.969 0 7.258-3.1 7.487-7.058l1.997.116C22.694 26.072 18.527 30 13.5 30Z"
      />
      <circle cx="28" cy="23" r="2" fill="currentColor" />
      <path
        fill="currentColor"
        d="m30.641 19.095l-1.924-.545A7.521 7.521 0 0 0 29 16.5c0-4.136-3.364-7.5-7.5-7.5a7.438 7.438 0 0 0-3.088.663l-.824-1.822A9.424 9.424 0 0 1 21.5 7c5.238 0 9.5 4.262 9.5 9.5c0 .88-.12 1.754-.359 2.595zm-10.227-4.51l-3-3C17.037 11.209 16.534 11 16 11s-1.037.208-1.414.586l-3 3c-.39.39-.586.902-.586 1.414s.196 1.024.586 1.414l3 3c.377.378.88.586 1.414.586s1.037-.208 1.414-.586l3-3c.39-.39.586-.902.586-1.414s-.196-1.024-.586-1.414zM16 19l-3-3l3-3l3 3l-3 3z"
      />
      <circle cx="16" cy="3" r="2" fill="currentColor" />
      <path
        fill="currentColor"
        d="M8.025 19.882A9.49 9.49 0 0 1 3 11.5c0-5.027 3.928-9.193 8.942-9.484l.116 1.997a7.502 7.502 0 0 0-3.089 14.105l-.944 1.764Z"
      />
    </svg>
  ));

export const CarbonIbmEventAutomation = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={CarbonIbmEventAutomationSvg} {...props} />;

const FluentMdl2FileTemplateSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 2048 2048"
      {...props}
    >
      <path
        fill="currentColor"
        d="m1243 0l549 549v219h-128V640h-512V128H256v1792h768v128H128V0h1115zm37 512h293l-293-293v293zm640 1408h128v128h-128v-128zm-256 0h128v128h-128v-128zm-256 0h128v128h-128v-128zm256-1024h128v128h-128V896zm-256 0h128v128h-128V896zm-256 1024h128v128h-128v-128zm768-256h128v128h-128v-128zm-768 0h128v128h-128v-128zm768-256h128v128h-128v-128zm-768 0h128v128h-128v-128zm768-256h128v128h-128v-128zm-768 0h128v128h-128v-128zm896-256v128h-128V896h128zm-896 0h128v128h-128V896z"
      />
    </svg>
  ));

export const FluentMdl2FileTemplate = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={FluentMdl2FileTemplateSvg} {...props} />;

const TdesignNotificationSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M4 8a8 8 0 1 1 16 0v4.697l2 3V20h-5.611a4.502 4.502 0 0 1-8.777 0H2v-4.303l2-3V8Zm5.708 12a2.5 2.5 0 0 0 4.584 0H9.708ZM12 2a6 6 0 0 0-6 6v5.303l-2 3V18h16v-1.697l-2-3V8a6 6 0 0 0-6-6Z"
      />
    </svg>
  ));

export const TdesignNotification = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={TdesignNotificationSvg} {...props} />;

const PajamasErrorSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13ZM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
        clipRule="evenodd"
      />
    </svg>
  ),
);

export const PajamasError = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PajamasErrorSvg} {...props} />
);

const TemplatetoolkitSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="m83.62 46.544l353.47-2.646c110.008 10.36 92.868 178.97-12.368 180.224l-77.172 1.847v163.045c.093 101.333-174.376 107.79-177.199 4.86v-168.88H93.652c-117.969 6.632-128-171.818-10.031-178.45zm210.758 342.47V170.943h129.764c40.668 0 49.123-68.785 10.216-73.904l-349.4 2.667c-46.389 3.805-40.584 73.153 5.921 71.237h128.174v222.633c6.987 30.68 77.326 28.48 75.325-4.562z"
      />
    </svg>
  ),
);

export const Templatetoolkit = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={TemplatetoolkitSvg} {...props} />
);

const PromptTemplateSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        fill="currentColor"
        d="M31.5 23c-.827 0-1.5-.673-1.5-1.5V20c0-1.102-.897-2-2-2h-2v2h2v1.5c0 .98.407 1.864 1.058 2.5A3.485 3.485 0 0 0 28 26.5V28h-2v2h2c1.103 0 2-.897 2-2v-1.5c0-.827.673-1.5 1.5-1.5h.5v-2zM16 20v1.5c0 .827-.673 1.5-1.5 1.5H14v2h.5c.827 0 1.5.673 1.5 1.5V28c0 1.103.897 2 2 2h2v-2h-2v-1.5c0-.98-.407-1.864-1.058-2.5A3.485 3.485 0 0 0 18 21.5V20h2v-2h-2c-1.103 0-2 .898-2 2m12-5h2V5c0-1.103-.897-2-2-2h-3v2h3z"
      />
      <circle cx="23" cy="13" r="2" fill="currentColor" />
      <circle cx="16" cy="13" r="2" fill="currentColor" />
      <circle cx="9" cy="13" r="2" fill="currentColor" />
      <path
        fill="currentColor"
        d="M7 23H4c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3v2H4v16h3z"
      />
    </svg>
  ),
);

export const PromptTemplate = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PromptTemplateSvg} {...props} />
);

const ContainerVolumeSolidSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 36 36"
      {...props}
    >
      <path
        fill="currentColor"
        d="M32 18H18a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V20a2 2 0 0 0-2-2ZM18 32V20h14v12Z"
        className="clr-i-solid clr-i-solid-path-1"
      />
      <path
        fill="currentColor"
        d="M21 21.7a.7.7 0 0 0-.7.7v7.49a.7.7 0 0 0 1.4 0V22.4a.7.7 0 0 0-.7-.7Z"
        className="clr-i-solid clr-i-solid-path-2"
      />
      <path
        fill="currentColor"
        d="M25 21.82a.7.7 0 0 0-.7.7V30a.7.7 0 1 0 1.4 0v-7.48a.7.7 0 0 0-.7-.7Z"
        className="clr-i-solid clr-i-solid-path-3"
      />
      <path
        fill="currentColor"
        d="M29 21.7a.7.7 0 0 0-.7.7v7.49a.7.7 0 1 0 1.4 0V22.4a.7.7 0 0 0-.7-.7Z"
        className="clr-i-solid clr-i-solid-path-4"
      />
      <path
        fill="currentColor"
        d="M18 16h10V8.12c0-1.68-5.38-3-12-3s-12 1.32-12 3V28c0 1.5 4.33 2.75 10 3v-5.78a29.17 29.17 0 0 1-8-1.29v-1.49l.24.1A26.63 26.63 0 0 0 14 23.82V20a4 4 0 0 1 .29-1.47A29.19 29.19 0 0 1 6 17.23v-1.48l.24.09a29 29 0 0 0 9 1.32A4 4 0 0 1 18 16ZM6 10.54V9.05l.24.09A30.12 30.12 0 0 0 16 10.47a28.33 28.33 0 0 0 10-1.42v1.5a32.53 32.53 0 0 1-10 1.32a32.44 32.44 0 0 1-10-1.33Z"
        className="clr-i-solid clr-i-solid-path-5"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  ));

export const ContainerVolumeSolid = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={ContainerVolumeSolidSvg} {...props} />;

export const ContainerImageSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.38 1.103a.75.75 0 0 0-.76 0L.37 5.353a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .76 0l7.25-4.25a.75.75 0 0 0 0-1.294l-7.25-4.25ZM8 9.381L2.233 6L8 2.62L13.767 6L8 9.38Zm-6.87-.028a.75.75 0 0 0-.76 1.294l7.25 4.25a.75.75 0 0 0 .76 0l7.25-4.25a.75.75 0 0 0-.76-1.294L8 13.381L1.13 9.353Z"
        clipRule="evenodd"
      />
    </svg>
  ));

export const ContainerImage = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ContainerImageSvg} {...props} />
);

const PortInputSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        fill="currentColor"
        d="M18 28c-3.593 0-6.967-1.59-9.257-4.363l1.542-1.274A9.975 9.975 0 0 0 18 26c5.514 0 10-4.486 10-10S23.514 6 18 6a9.975 9.975 0 0 0-7.715 3.637L8.743 8.363A11.969 11.969 0 0 1 18 4c6.617 0 12 5.383 12 12s-5.383 12-12 12Z"
      />
      <path
        fill="currentColor"
        d="m23 16l-7-7l-1.414 1.414L19.172 15H2v2h17.172l-4.586 4.586L16 23l7-7z"
      />
    </svg>
  ),
);

export const PortInput = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PortInputSvg} {...props} />
);

export const VolumeBindingSvg: React.FC<React.SVGProps<SVGSVGElement>> =
  React.memo((props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6 19a6 6 0 0 1 6-6h4V3a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16.001A2 2 0 0 0 4 21h2.349A5.976 5.976 0 0 1 6 19Zm8-17a1 1 0 1 1-1 1a1 1 0 0 1 1-1ZM9 3a5 5 0 1 1-2 9.578V10H4.422A4.991 4.991 0 0 1 9 3ZM4 2a1 1 0 1 1-1 1a1 1 0 0 1 1-1Zm0 18a1 1 0 1 1 1-1a1 1 0 0 1-1 1Z"
      />
      <circle cx="9" cy="8" r="2" fill="currentColor" />
      <path fill="currentColor" d="M13 18h4v2h-4z" />
      <path
        fill="currentColor"
        d="M18 15h-2v2h2a2 2 0 0 1 0 4h-2v2h2a4 4 0 0 0 0-8Zm-4 6h-2a2 2 0 0 1 0-4h2v-2h-2a4 4 0 0 0 0 8h2Z"
      />
    </svg>
  ));

export const VolumeBinding = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={VolumeBindingSvg} {...props} />
);

const EnvSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M20 18a1 1 0 0 1-1 1h-4a3 3 0 0 0-3 3a3 3 0 0 0-3-3H5a1 1 0 0 1-1-1H2a3 3 0 0 0 3 3h4a2 2 0 0 1 2 2h2a2 2 0 0 1 2-2h4a3 3 0 0 0 3-3Zm0-12a1 1 0 0 0-1-1h-4a3 3 0 0 1-3-3a3 3 0 0 1-3 3H5a1 1 0 0 0-1 1H2a3 3 0 0 1 3-3h4a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2h4a3 3 0 0 1 3 3Zm-8 6L9 8H7v8h2v-4l3 4h2V8h-2v4zm9-4l-2 5.27L17 8h-2l3 8h2l3-8h-2zM1 8v8h5v-2H3v-1h2v-2H3v-1h3V8H1z"
    />
  </svg>
));

export const Env = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={EnvSvg} {...props} />
);

const LabelSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <g fill="none">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m10 19l5.5-5.5M13 22l2.5-2.5M4.414 16.586l11-11A2 2 0 0 1 16.828 5H25a2 2 0 0 1 2 2v8.172a2 2 0 0 1-.586 1.414l-11 11a2 2 0 0 1-2.828 0l-8.172-8.172a2 2 0 0 1 0-2.828Z"
        />
        <path fill="currentColor" d="M23 10a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z" />
      </g>
    </svg>
  ),
);

export const Label = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LabelSvg} {...props} />
);

const DeploySvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M23 1s-6.528-.458-9 2c-.023.037-4 4-4 4L5 8l-3 2l8 4l4 8l2-3l1-5s3.963-3.977 4-4c2.458-2.472 2-9 2-9Zm-6 7a1 1 0 1 1 0-2a1 1 0 0 1 0 2ZM7 17c-1-1-3-1-4 0s-1 5-1 5s4 0 5-1s1-3 0-4Z"
      />
    </svg>
  ),
);

export const Deploy = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DeploySvg} {...props} />
);

const TargetSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 14 14"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.48 7.516a6.5 6.5 0 1 1-6.93-7" />
        <path d="M9.79 8.09A3 3 0 1 1 5.9 4.21M7 7l2.5-2.5m2 .5l-2-.5l-.5-2l2-2l.5 2l2 .5z" />
      </g>
    </svg>
  ),
);

export const Target = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={TargetSvg} {...props} />
);

const NutSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    {...props}
  >
    <mask id="ipTNut0">
      <g
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      >
        <path d="M37.699 6c-.527.534-2.46 2.672-3.69 3.741c-.175.535 2.109 2.672 2.636 3.207c.527.534 6.85-3.207 6.324-3.741c-.422-.428-3.69-2.316-5.27-3.207Z" />
        <path
          fill="#555"
          d="M11.372 16.722a5.74 5.74 0 0 1-.03-.264a19.59 19.59 0 0 0-4.3 6.142a3.515 3.515 0 1 1-1.506 6.866c-.02 3.546 1.15 6.955 3.58 9.601c3.505 3.815 8.81 5.151 14.03 4.064c3.214-.668 6.395-2.254 9.106-4.745a19.996 19.996 0 0 0 3.39-4.051c-2.225.67-4.675-.412-5.601-2.598a3.683 3.683 0 0 0-2.577-2.155l-1.682-.381a5.972 5.972 0 0 1-4.24-3.65l-.091-.231a5.583 5.583 0 0 0-4.857-3.539a5.583 5.583 0 0 1-5.19-4.826l-.032-.233Z"
        />
        <path d="m13.154 11.658l-.251.27a5.87 5.87 0 0 0-1.53 4.794l.03.233a5.583 5.583 0 0 0 5.191 4.826a5.583 5.583 0 0 1 4.857 3.54l.09.23a5.973 5.973 0 0 0 4.241 3.65l1.683.381a3.684 3.684 0 0 1 2.576 2.155c.996 2.35 3.755 3.425 6.1 2.416c2.368-1.019 4.084-3.199 4.483-5.746l.207-1.33a9.933 9.933 0 0 0 .1-2.166l-.108-1.69a17.275 17.275 0 0 0-3.504-9.38l-.252-.331a15.79 15.79 0 0 0-14.1-6.138l-1.406.138a13.293 13.293 0 0 0-8.407 4.148Z" />
      </g>
    </mask>
    <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTNut0)" />
  </svg>
));

export const Nut = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={NutSvg} {...props} />
);

const BridgeSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M0 3h24v18.001h-6v-7.603a8.417 8.417 0 0 0-1.346-1.053A8.644 8.644 0 0 0 12 11c-2.02 0-3.586.671-4.654 1.345A8.42 8.42 0 0 0 6 13.398V21H0V3Zm6 7.836A10.644 10.644 0 0 1 12 9a10.644 10.644 0 0 1 6 1.836V5.001h-.625L12 5H6v5.836Zm14-5.835v14h2v-14h-2ZM4 5H2v14h2V5Z"
      />
    </svg>
  ),
);

export const Bridge = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BridgeSvg} {...props} />
);

const ContainerSolidSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 36 36"
      {...props}
    >
      <path
        fill="currentColor"
        d="M32 6H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2ZM9.63 24.23a.79.79 0 0 1-.81.77a.79.79 0 0 1-.82-.77V11.77a.79.79 0 0 1 .82-.77a.79.79 0 0 1 .81.77Zm6 0a.79.79 0 0 1-.82.77a.79.79 0 0 1-.81-.77V11.77a.79.79 0 0 1 .81-.77a.79.79 0 0 1 .82.77Zm6.21 0a.79.79 0 0 1-.82.77a.79.79 0 0 1-.81-.77V11.77a.79.79 0 0 1 .81-.77a.79.79 0 0 1 .82.77Zm6.12 0a.79.79 0 0 1-.82.77a.79.79 0 0 1-.81-.77V11.77a.79.79 0 0 1 .81-.77a.79.79 0 0 1 .82.77Z"
        className="clr-i-solid clr-i-solid-path-1"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  ),
);

export const ContainerSolid = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ContainerSolidSvg} {...props} />
);

const MoreSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M2.5 7.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Zm15 0a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Zm-7.274 0a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5Z"
    />
  </svg>
));

export const More = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MoreSvg} {...props} />
);

const Live24FilledSvg: React.FC<React.SVGProps<SVGSVGElement>> = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.343 4.938a1 1 0 0 1 0 1.415a8.003 8.003 0 0 0 0 11.317a1 1 0 1 1-1.414 1.414c-3.907-3.906-3.907-10.24 0-14.146a1 1 0 0 1 1.414 0Zm12.732 0c3.906 3.907 3.906 10.24 0 14.146a1 1 0 0 1-1.415-1.414a8.003 8.003 0 0 0 0-11.317a1 1 0 0 1 1.415-1.415ZM9.31 7.812a1 1 0 0 1 0 1.414a3.92 3.92 0 0 0 0 5.544a1 1 0 1 1-1.415 1.414a5.92 5.92 0 0 1 0-8.372a1 1 0 0 1 1.415 0Zm6.958 0a5.92 5.92 0 0 1 0 8.372a1 1 0 0 1-1.414-1.414a3.92 3.92 0 0 0 0-5.544a1 1 0 0 1 1.414-1.414Zm-4.186 2.77a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z"
      />
    </svg>
  ),
);

export const Live24Filled = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Live24FilledSvg} {...props} />
);

const SafetyCertificateFillSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="none" fillRule="evenodd">
      <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
      <path
        fill="currentColor"
        d="M11.298 2.195a2 2 0 0 1 1.232-.055l.172.055l7 2.625a2 2 0 0 1 1.291 1.708l.007.165v5.363a9 9 0 0 1-4.709 7.911l-.266.139l-3.354 1.677a1.5 1.5 0 0 1-1.198.062l-.144-.062l-3.354-1.677a9 9 0 0 1-4.97-7.75l-.005-.3V6.693a2 2 0 0 1 1.145-1.808l.153-.065l7-2.625Zm4.135 6.434l-4.598 4.598l-1.768-1.768a1 1 0 0 0-1.414 1.415l2.404 2.404a1.1 1.1 0 0 0 1.556 0l5.234-5.235a1 1 0 1 0-1.414-1.414Z"
      />
    </g>
  </svg>
));

export const SafetyCertificateFill = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={SafetyCertificateFillSvg} {...props} />;

const ConfigurationSolidSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 2048 2048"
    {...props}
  >
    <path
      fill="currentColor"
      d="M1755 512h-475V37l475 475zm-795 520q38 0 71 14t59 40t39 59t15 71q0 38-14 71t-40 59t-59 39t-71 15q-38 0-71-14t-59-40t-39-59t-15-71q0-38 14-71t40-59t59-39t71-15zm832-392v1408H128V0h1024v640h640zm-509 632q2-14 3-28t1-28q0-14-1-28t-3-28l185-76l-55-134l-185 77q-33-46-79-79l77-185l-134-55l-76 185q-14-2-28-3t-28-1q-14 0-28 1t-28 3l-76-185l-134 55l77 185q-46 33-79 79l-185-77l-55 134l185 76q-2 14-3 28t-2 28q0 14 1 28t4 28l-185 76l55 134l185-77q33 46 79 79l-77 185l134 55l76-185q14 2 28 3t28 2q14 0 28-1t28-4l76 185l134-55l-77-185q46-33 79-79l185 77l55-134l-185-76z"
    />
  </svg>
));

export const ConfigurationSolid = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={ConfigurationSolidSvg} {...props} />;

const SmartSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M256.3 19.95c-41 0-74.1 32.7-74.1 73.27c0 22.98 8 33.78 16.8 47.78c5.9 9.3 12 20.1 15.5 35.6h83c3.5-15.9 9.6-26.8 15.5-36.2c8.9-14.1 16.8-24.7 16.8-47.18c0-40.57-32.8-73.27-73.5-73.27zm-142.1 7.7L81 35.4l81.2 40.25l-48-48zm283.6 0l-48 48L431 35.4l-33.2-7.75zM210.5 79.2l45.5 22.7l45.5-22.7l-20.8 83l-17.4-4.4l11.2-45l-18.5 9.3l-18.5-9.3l11.2 45l-17.4 4.4l-20.8-83zM64 96.03v32.07l96-16.1l-96-15.97zm384 0L352 112l96 16V96.03zM334.2 144.3l39.9 63.3l24.1-15.3l-64-48zm-156.4.1l-64 48l24.1 15.3l39.9-63.3zM216 191v16h80v-16h-80zm34.4 28.3c-13.7 0-26.9.5-35.7 1c-68.2 10.7-82.9 105.4-66.7 191.6h23.6l-1-105.4l18.6-.2c-1.4 63.7 1.6 126.6 5.5 189.7h51.4V390.3h18.7V496h50.4c4.5-65 5.9-131.5 6.5-189.7l18.7.2l-1.1 105.4h24.6c18.3-88.5-4.8-178.9-67.1-190.6c-9.4-1.4-24.9-2-40.6-2h-5.8z"
    />
  </svg>
));

export const Smart = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SmartSvg} {...props} />
);

const ArrowsDoubleSeNwSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m3 10l11 11m0-4v4h-4m4-18h-4v4m11 7L10 3"
    />
  </svg>
));

export const ArrowsDoubleSeNw = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ArrowsDoubleSeNwSvg} {...props} />
);

const ObservedLightningSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="m15.67 24l-1.736-1l2.287-4h-3.889l3.993-7l1.737 1l-2.284 4h3.89l-3.998 7z"
    />
    <path
      fill="currentColor"
      d="M4 18A12 12 0 1 0 16 6h-4V1L6 7l6 6V8h4A10 10 0 1 1 6 18Z"
    />
  </svg>
));

export const ObservedLightning = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ObservedLightningSvg} {...props} />
);

const InputSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.5 1a.5.5 0 0 0 0 1c.627 0 .957.2 1.156.478C7.878 2.79 8 3.288 8 4v7c0 .712-.122 1.21-.344 1.522c-.199.278-.53.478-1.156.478a.5.5 0 0 0 0 1c.873 0 1.543-.3 1.97-.897l.03-.044l.03.044c.427.597 1.097.897 1.97.897a.5.5 0 0 0 0-1c-.627 0-.957-.2-1.156-.478C9.122 12.21 9 11.712 9 11V4c0-.712.122-1.21.344-1.522C9.543 2.2 9.874 2 10.5 2a.5.5 0 0 0 0-1c-.873 0-1.543.3-1.97.897l-.03.044l-.03-.044C8.042 1.3 7.372 1 6.5 1ZM14 5h-3V4h3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-3v-1h3V5ZM6 4v1H1v5h5v1H1a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5Z"
      clipRule="evenodd"
    />
  </svg>
));

export const InputIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={InputSvg} {...props} />
);

const CheckmarkUnderlineCircle24RegularSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m10.75 11.44l4.47-4.47a.75.75 0 0 1 1.133.976l-.073.084l-5 5a.75.75 0 0 1-.976.073l-.084-.073l-2.5-2.5a.75.75 0 0 1 .976-1.133l.084.073zM8.5 15a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5zM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m10-8.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 0 0 0-17"
    />
  </svg>
));

export const CheckmarkUnderlineCircle24Regular = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={CheckmarkUnderlineCircle24RegularSvg} {...props} />;

const SelectiveToolSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path fill="currentColor" d="M12 13a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z" />
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Z" />
    </g>
  </svg>
));

export const SelectiveTool = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SelectiveToolSvg} {...props} />
);

const TriangleFlagSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 14 14"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.5.5v13m0-13l9 4.5l-9 4.5"
    />
  </svg>
));

export const TriangleFlag = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={TriangleFlagSvg} {...props} />
);

const InterfaceEditPencilChangeEditModifyPencilWriteWritingSvg = React.memo(
  (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 14 14"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12.24L.5 13.5L1.76 9L10 .8a1 1 0 0 1 1.43 0l1.77 1.78a1 1 0 0 1 0 1.42Z"
      />
    </svg>
  ),
);

export const InterfaceEditPencilChangeEditModifyPencilWriteWriting = (
  props: Partial<CustomIconComponentProps>,
) => (
  <Icon
    component={InterfaceEditPencilChangeEditModifyPencilWriteWritingSvg}
    {...props}
  />
);

export const DiffSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3v14m-7-7h14M5 21h14"
    />
  </svg>
));

export const Diff = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DiffSvg} {...props} />
);

const VlanSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="M30 17v-2H17v-4h2a2.002 2.002 0 0 0 2-2V4a2.002 2.002 0 0 0-2-2h-6a2.002 2.002 0 0 0-2 2v5a2.002 2.002 0 0 0 2 2h2v4H2v2h6v4H6a2.002 2.002 0 0 0-2 2v5a2.002 2.002 0 0 0 2 2h6a2.002 2.002 0 0 0 2-2v-5a2.002 2.002 0 0 0-2-2h-2v-4h12v4h-2a2.002 2.002 0 0 0-2 2v5a2.002 2.002 0 0 0 2 2h6a2.002 2.002 0 0 0 2-2v-5a2.002 2.002 0 0 0-2-2h-2v-4ZM13 4h6v5h-6Zm-1 24H6v-5h6Zm14 0h-6v-5h6Z"
    />
  </svg>
));

export const Vlan = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={VlanSvg} {...props} />
);

const NetworkOverlaySvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="M22 23h-8.17l2.58-2.59L15 19l-5 5l5 5l1.41-1.41L13.83 25H22v-2zM11 13h8.17l-2.58-2.59L18 9l5 5l-5 5l-1.41-1.41L19.17 15H11v-2z"
    />
    <path
      fill="currentColor"
      d="M24.5 25H24v-2h.5a5.496 5.496 0 0 0 .377-10.98l-.837-.056l-.09-.834a7.998 7.998 0 0 0-15.9 0l-.09.834l-.837.057A5.496 5.496 0 0 0 7.5 23H8v2h-.5a7.496 7.496 0 0 1-1.322-14.876a10 10 0 0 1 19.644 0A7.496 7.496 0 0 1 24.5 25Z"
    />
  </svg>
));

export const NetworkOverlay = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={NetworkOverlaySvg} {...props} />
);

const LabelsSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.427.512A1.75 1.75 0 0 1 7.664 0H13v3h3v5.335c0 .465-.185.91-.513 1.239L9.573 15.48a1.75 1.75 0 0 1-2.473 0l-2.293-2.293l-1.293-1.293l-3-3a1.75 1.75 0 0 1 0-2.475L6.428.512ZM11.5 1.5V3h-.836a1.75 1.75 0 0 0-1.237.512L3.514 9.419c-.06.06-.115.123-.165.19L1.574 7.833a.25.25 0 0 1 0-.353l5.913-5.907a.25.25 0 0 1 .177-.073H11.5ZM5.866 12.126l-1.292-1.293a.25.25 0 0 1 0-.353l5.913-5.907a.25.25 0 0 1 .177-.073H14.5v3.835a.25.25 0 0 1-.073.177L8.513 14.42a.25.25 0 0 1-.353 0l-2.294-2.293ZM12 8a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  </svg>
));

export const Labels = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LabelsSvg} {...props} />
);

const NametagSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 6a1 1 0 1 1-1 1a1 1 0 0 1 1-1zm-6 8h12v3H6zm14-8h-4V3H8v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM10 5h4v5h-4zm10 14H4v-9h4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2h4z"
    />
  </svg>
));

export const Nametag = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={NametagSvg} {...props} />
);

const VersionSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path fill="currentColor" d="M16 2v2h10v15h2V4a2.002 2.002 0 0 0-2-2Z" />
    <path fill="currentColor" d="M11 7v2h10v15h2V9a2.002 2.002 0 0 0-2-2Z" />
    <path
      fill="currentColor"
      d="M6 12h10a2.002 2.002 0 0 1 2 2v14a2.002 2.002 0 0 1-2 2H6a2.002 2.002 0 0 1-2-2V14a2.002 2.002 0 0 1 2-2Zm10 2l-10-.001V28h10Z"
    />
  </svg>
));

export const Version = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={VersionSvg} {...props} />
);

const ServicesSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M6 9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0-6V0m0 12V9M0 6h3m6 0h3M2 2l2 2m4 4l2 2m0-8L8 4M4 8l-2 2m16 2a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0-6V3m0 12v-3m-6-3h3m6 0h3M14 5l2 2m4 4l2 2m0-8l-2 2m-4 4l-2 2m-5 8a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0-6v-3m0 12v-3m-6-3h3m6 0h3M5 14l2 2m4 4l2 2m0-8l-2 2m-4 4l-2 2"
    />
  </svg>
));

export const Services = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ServicesSvg} {...props} />
);

const AnnotationSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-4 4Z"
    />
  </svg>
));

export const Annotation = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={AnnotationSvg} {...props} />
);

const LinkAltSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
      <path d="m5.251 9.663l-1.587-1.41a1 1 0 1 0-1.328 1.494l1.405 1.25l.068-.062c.503-.446.982-.873 1.442-1.272m2.295 4.642c.363.29.709.55 1.04.777c1.117.763 2.185 1.228 3.414 1.228c1.23 0 2.297-.465 3.413-1.228c1.081-.739 2.306-1.828 3.843-3.194l.052-.046l2.356-2.095a1 1 0 0 0-1.328-1.494l-2.357 2.094c-1.6 1.423-2.731 2.426-3.694 3.084c-.94.642-1.613.88-2.285.88c-.672 0-1.345-.238-2.285-.88c-.203-.14-.414-.294-.636-.465c-.446.378-.949.82-1.533 1.339" />
      <path d="M16.455 9.695c-.364-.29-.71-.55-1.042-.777C14.297 8.155 13.23 7.689 12 7.689c-1.229 0-2.297.466-3.413 1.229c-1.081.738-2.306 1.828-3.843 3.193l-.052.047l-2.356 2.094a1 1 0 1 0 1.328 1.495l2.357-2.094c1.6-1.423 2.731-2.426 3.694-3.084c.94-.642 1.613-.88 2.285-.88c.672 0 1.345.238 2.285.88c.203.14.414.294.636.464c.446-.377.949-.82 1.534-1.338m3.804 3.308l-.068.061c-.503.447-.982.873-1.442 1.273l1.587 1.41a1 1 0 0 0 1.328-1.495z" />
    </g>
  </svg>
));

export const LinkAlt = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LinkAltSvg} {...props} />
);

const BuildSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 2048 2048"
    {...props}
  >
    <path
      fill="currentColor"
      d="M640 1280H384v-256h256v256zm1280-512v1152H128V768h128v640h1536V768h128zM896 1536H640v256h256v-256zm512 0h-256v256h256v-256zm-512-512h256v256H896v-256zm768 256h-256v-256h256v256zM960 922L659 621l90-90l147 146V0h128v677l147-146l90 90l-301 301z"
    />
  </svg>
));

export const Build = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BuildSvg} {...props} />
);

const ConfigSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    {...props}
  >
    <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="4">
      <path d="m24 4l-6 6h-8v8l-6 6l6 6v8h8l6 6l6-6h8v-8l6-6l-6-6v-8h-8l-6-6Z" />
      <path d="M24 30a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z" />
    </g>
  </svg>
));

export const Config = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ConfigSvg} {...props} />
);

const CommandLineSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m6.75 7.5l3 2.25l-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
));

export const CommandLine = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CommandLineSvg} {...props} />
);

const TitleSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="currentColor" d="M10.5 20V7H5V4h14v3h-5.5v13h-3Z" />
  </svg>
));

export const Title = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={TitleSvg} {...props} />
);

const LinkSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M9.26 13a2 2 0 0 1 .01-2.01A3 3 0 0 0 9 5H5a3 3 0 0 0 0 6h.08a6.06 6.06 0 0 0 0 2H5A5 5 0 0 1 5 3h4a5 5 0 0 1 .26 10zm1.48-6a2 2 0 0 1-.01 2.01A3 3 0 0 0 11 15h4a3 3 0 0 0 0-6h-.08a6.06 6.06 0 0 0 0-2H15a5 5 0 0 1 0 10h-4a5 5 0 0 1-.26-10z"
    />
  </svg>
));

export const Link = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LinkSvg} {...props} />
);

const DnsOutlineSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M7.5 6q-.625 0-1.063.438T6 7.5q0 .625.438 1.063T7.5 9q.625 0 1.063-.438T9 7.5q0-.625-.438-1.063T7.5 6Zm0 10q-.625 0-1.063.438T6 17.5q0 .625.438 1.063T7.5 19q.625 0 1.063-.438T9 17.5q0-.625-.438-1.063T7.5 16ZM4 3h16q.425 0 .713.288T21 4v7q0 .425-.288.713T20 12H4q-.425 0-.713-.288T3 11V4q0-.425.288-.713T4 3Zm1 2v5h14V5H5Zm-1 8h16q.425 0 .713.288T21 14v7q0 .425-.288.713T20 22H4q-.425 0-.713-.288T3 21v-7q0-.425.288-.713T4 13Zm1 2v5h14v-5H5ZM5 5v5v-5Zm0 10v5v-5Z"
    />
  </svg>
));

export const DnsOutline = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DnsOutlineSvg} {...props} />
);

const EntranceAlt1Svg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
    {...props}
  >
    <path
      fill="currentColor"
      d="M6.554 9.639a.5.5 0 0 0 .707.707l2.667-2.677a.25.25 0 0 0 0-.354L7.261 4.639a.5.5 0 0 0-.707.707L8.2 7H1.5a.5.5 0 0 0 0 1h6.7ZM12 1H5.5a.5.5 0 0 0 0 1h6a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H5.25a.5.5 0 0 0 0 1H12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
    />
  </svg>
));

export const EntranceAlt1 = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={EntranceAlt1Svg} {...props} />
);

export const ServerEnvironmentSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fill="currentColor"
      d="M6 3h4v1H6V3zm0 6h4v1H6V9zm0 2h4v1H6v-1zm9.14 5H.86l1.25-5H4V2a.95.95 0 0 1 .078-.383c.052-.12.123-.226.211-.32a.922.922 0 0 1 .32-.219A1.01 1.01 0 0 1 5 1h6a.95.95 0 0 1 .383.078c.12.052.226.123.32.211a.922.922 0 0 1 .219.32c.052.125.078.256.078.391v9h1.89l1.25 5zM5 13h6V2H5v11zm8.86 2l-.75-3H12v2H4v-2H2.89l-.75 3h11.72z"
    />
  </svg>
));

export const ServerEnvironment = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ServerEnvironmentSvg} {...props} />
);

const FileSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2">
      <path
        strokeLinecap="round"
        d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2Zm5 9h6m-6 4h3"
      />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </g>
  </svg>
));

export const File = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FileSvg} {...props} />
);

const OpenSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    {...props}
  >
    <g fill="currentColor">
      <path d="M10.707 10.707a1 1 0 0 1-1.414-1.414l6-6a1 1 0 1 1 1.414 1.414l-6 6Z" />
      <path d="M15 15v-3.5a1 1 0 1 1 2 0V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4.5a1 1 0 0 1 0 2H5v10h10Zm2-7a1 1 0 1 1-2 0V4a1 1 0 1 1 2 0v4Z" />
      <path d="M12 5a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2h-4Z" />
    </g>
  </svg>
));

export const Open = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={OpenSvg} {...props} />
);

const ExternalTFVCSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 2048 2048"
    {...props}
  >
    <path
      fill="currentColor"
      d="M256 1792h384v128H128V128h1792v512h-128V256H256v1536zm1600-640q-60 0-109-34t-71-90l-147 49q7 35 7 75q0 66-21 128t-64 113l255 291q42-20 86-20q40 0 75 15t61 41t41 61t15 75q0 40-15 75t-41 61t-61 41t-75 15q-40 0-75-15t-61-41t-41-61t-15-75q0-29 8-57t25-51l-251-288q-50 37-108 56t-122 20h-17q-9 0-17-1l-54 160q41 26 64 69t24 92q0 40-15 75t-41 61t-61 41t-75 15q-40 0-75-15t-61-41t-41-61t-15-75q0-44 16-79t44-61t65-38t80-14l50-150q-57-20-104-56t-80-84t-52-104t-19-118q0-79 30-149t82-122t122-83t150-30q55 0 107 15t97 44t81 69t61 90l168-56q6-35 23-64t42-52t57-34t68-12q40 0 75 15t61 41t41 61t15 75q0 40-15 75t-41 61t-61 41t-75 15zm-704 192q40 0 75-15t61-41t41-61t15-75q0-40-15-75t-41-61t-61-41t-75-15q-40 0-75 15t-61 41t-41 61t-15 75q0 40 15 75t41 61t61 41t75 15z"
    />
  </svg>
));

export const ExternalTFVC = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ExternalTFVCSvg} {...props} />
);

const HealthRecognitionSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2m8-16h2a2 2 0 0 1 2 2v2m-4 12h2a2 2 0 0 0 2-2v-2M8.603 9.61a2.04 2.04 0 0 1 2.912 0L12 10l.5-.396a2.035 2.035 0 0 1 2.897.007a2.104 2.104 0 0 1 0 2.949L12 16l-3.397-3.44a2.104 2.104 0 0 1 0-2.95z"
    />
  </svg>
));

export const HealthRecognition = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={HealthRecognitionSvg} {...props} />
);

const CrownSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1664 1472"
    {...props}
  >
    <path
      fill="currentColor"
      d="M1472 1216H192q-24 0-44 38.5t-20 89.5t20 89.5t44 38.5h1280q24 0 44-38.5t20-89.5t-20-89.5t-44-38.5zM128 128q-53 0-90.5 37.5T0 256t37.5 90.5T128 384l80 703h1248l80-703q53 0 90.5-37.5T1664 256t-37.5-90.5T1536 128t-90.5 37.5T1408 256q0 56 41 94q-153 183-207 236.5t-90 53.5q-34 0-83-66.5T899 301q28-17 44.5-46t16.5-63q0-53-37.5-90.5T832 64t-90.5 37.5T704 192q0 34 16.5 63t44.5 46Q644 507 595 573.5T512 640q-36 0-90-53.5T215 350q41-38 41-94q0-53-37.5-90.5T128 128z"
    />
  </svg>
));

export const Crown = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CrownSvg} {...props} />
);

const RestartSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12 3a9 9 0 1 1-5.657 2" />
      <path d="M3 4.5h4v4" />
    </g>
  </svg>
));

export const Restart = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={RestartSvg} {...props} />
);

const UserSecretSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="M13.063 4c-.876 0-1.645.45-2.188 1.031c-.543.582-.934 1.309-1.281 2.094c-.531 1.21-.91 2.555-1.25 3.813c-1.086.316-2.008.71-2.75 1.187C4.727 12.684 4 13.457 4 14.5c0 .906.555 1.633 1.25 2.156c.594.446 1.324.817 2.188 1.125c.05.23.125.465.218.688c-.843.476-2.18 1.398-3.468 3.156l-.594.844l.844.593l3.28 2.25L6.376 28h19.25l-1.344-2.688l3.282-2.25l.843-.593l-.593-.844c-1.29-1.758-2.625-2.68-3.47-3.156a3.93 3.93 0 0 0 .22-.688c.863-.308 1.593-.68 2.187-1.125c.695-.523 1.25-1.25 1.25-2.156c0-1.043-.727-1.816-1.594-2.375c-.742-.477-1.664-.871-2.75-1.188c-.375-1.304-.789-2.671-1.312-3.874c-.34-.778-.715-1.493-1.25-2.063c-.535-.57-1.297-1-2.157-1c-.582 0-1.023.16-1.5.281c-.476.121-.957.219-1.437.219c-.96 0-1.766-.5-2.938-.5zm0 2c.207 0 1.437.5 2.937.5c.75 0 1.418-.152 1.938-.281c.519-.13.914-.219 1-.219c.23 0 .402.074.687.375c.285.3.621.844.906 1.5c.543 1.242.957 2.938 1.407 4.5c0-.004.054-.047-.094.031c-.25.137-.774.313-1.407.406c-1.269.192-3 .188-4.437.188c-1.43 0-3.164-.02-4.438-.219c-.636-.097-1.152-.27-1.406-.406c-.078-.043-.105-.027-.125-.031v-.031c.004-.008-.004-.024 0-.032l.031-.031a1.01 1.01 0 0 0 .126-.438v-.03c.359-1.329.761-2.735 1.25-3.845c.292-.667.609-1.21.906-1.53c.297-.321.5-.407.719-.407zm-4.876 7.094c.227.469.626.844 1.032 1.062c.61.324 1.308.477 2.062.594c1.508.234 3.274.25 4.719.25c1.438 0 3.207.008 4.719-.219c.758-.113 1.449-.261 2.062-.594c.41-.222.809-.617 1.032-1.093c.617.219 1.136.453 1.5.687c.582.375.687.653.687.719c0 .059-.05.25-.469.563c-.418.312-1.136.675-2.062.968c-1.852.59-4.516.969-7.469.969c-2.953 0-5.617-.379-7.469-.969c-.926-.293-1.644-.656-2.062-.968C6.05 14.75 6 14.559 6 14.5c0-.066.078-.316.656-.688c.364-.234.899-.488 1.532-.718zm2.594 5.469c.328.054.653.144 1 .187c.13.879.813 1.652 1.906 1.719c.844.05 1.793-.348 1.876-1.469h.875c.082 1.121 1.03 1.52 1.875 1.469c1.093-.067 1.777-.84 1.906-1.719c.347-.043.672-.133 1-.188l-.094.625c-.309 1.645-1.043 3.168-1.969 4.22C18.23 24.456 17.145 25.015 16 25c-1.176-.016-2.238-.582-3.156-1.625c-.918-1.043-1.64-2.535-1.969-4.188zM23 20c.371.219 1.348.86 2.469 2.094l-3.032 2.093l-.718.47l.375.78l.281.563h-3.156a7.547 7.547 0 0 0 1.437-1.281c1.102-1.25 1.84-2.887 2.25-4.657c.035-.019.063-.042.094-.062zm-14.031.031c.039.024.086.04.125.063c.43 1.746 1.164 3.363 2.25 4.593c.449.512.972.95 1.531 1.313h-3.25l.281-.563l.375-.78l-.719-.47l-3.03-2.093c1.058-1.168 2.023-1.813 2.437-2.063z"
    />
  </svg>
));

export const UserSecret = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={UserSecretSvg} {...props} />
);

const DragDrop2Svg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2zM4 4v.01M8 4v.01M12 4v.01M16 4v.01M4 8v.01M4 12v.01M4 16v.01"
    />
  </svg>
));

export const DragDrop2 = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DragDrop2Svg} {...props} />
);

const MysqlSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.462 4.04a2.65 2.65 0 0 0-.67.074v.038h.037c.13.267.36.44.521.67l.372.781l.038-.037c.23-.162.336-.422.335-.819c-.093-.097-.107-.219-.187-.335c-.106-.154-.312-.242-.446-.372Zm18.017 19.097c.175.129.293.329.521.41v-.038c-.12-.152-.15-.362-.26-.521a73.62 73.62 0 0 1-.484-.484a7.948 7.948 0 0 0-1.713-1.638c-.508-.365-1.649-.859-1.861-1.451l-.038-.038c.361-.04.784-.171 1.117-.26c.56-.15 1.06-.112 1.638-.26c.261-.076.521-.15.782-.224v-.15c-.292-.3-.5-.696-.819-.967c-.834-.71-1.743-1.42-2.68-2.01c-.52-.329-1.162-.541-1.713-.82c-.185-.093-.51-.142-.632-.297c-.29-.37-.447-.837-.67-1.266c-.467-.9-.927-1.883-1.34-2.83c-.283-.645-.467-1.281-.82-1.86c-1.69-2.78-3.51-4.457-6.328-6.106c-.6-.35-1.322-.489-2.084-.67l-1.229-.074c-.25-.105-.51-.41-.744-.559C3.188.434.792-.849.102.838c-.437 1.065.652 2.104 1.042 2.643c.273.379.623.803.819 1.229c.128.28.15.56.26.856c.271.73.506 1.522.856 2.196c.178.341.373.7.596 1.005c.138.187.372.27.409.559c-.23.321-.242.82-.371 1.228c-.582 1.835-.363 4.115.484 5.473c.259.416.87 1.31 1.711.967c.736-.3.572-1.228.782-2.047c.047-.186.019-.323.112-.447v.037l.67 1.34c.496.799 1.376 1.634 2.122 2.197c.386.292.69.797 1.191.968v-.038h-.037c-.098-.15-.25-.213-.372-.335a8.554 8.554 0 0 1-.857-.968c-.678-.92-1.277-1.928-1.823-2.977c-.261-.502-.488-1.054-.708-1.564c-.085-.197-.084-.494-.26-.596c-.241.374-.596.676-.782 1.117c-.298.705-.337 1.565-.447 2.457c-.065.023-.036.007-.075.037c-.518-.125-.7-.659-.893-1.117c-.487-1.157-.578-3.022-.149-4.355c.111-.345.613-1.431.41-1.75c-.098-.318-.417-.501-.596-.744A5.83 5.83 0 0 1 3.6 7.166c-.398-.902-.585-1.916-1.005-2.829c-.2-.436-.54-.877-.819-1.265c-.308-.43-.654-.746-.893-1.266c-.085-.185-.201-.48-.075-.67c.04-.128.097-.182.224-.223c.216-.167.817.055 1.042.148c.597.248 1.095.484 1.6.82c.243.16.489.472.782.558h.335c.525.12 1.112.037 1.601.186c.865.263 1.64.672 2.345 1.117c2.146 1.355 3.9 3.283 5.1 5.584c.193.37.277.724.447 1.117c.343.792.775 1.607 1.116 2.382c.34.773.673 1.553 1.154 2.196c.253.338 1.231.52 1.676.708c.311.131.821.269 1.116.446c.564.34 1.11.745 1.638 1.117c.264.187 1.077.595 1.117.93c-1.31-.034-2.31.087-3.164.448c-.243.102-.63.105-.67.409c.133.14.154.35.26.521c.204.33.549.773.856 1.005c.337.254.683.525 1.043.745c.64.39 1.356.614 1.972 1.005c.365.231.726.521 1.08.782Z"
    />
  </svg>
));

export const Mysql = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MysqlSvg} {...props} />
);

const RedisSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 28 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M27.994 14.729c-.012.267-.365.566-1.091.945c-1.495.778-9.236 3.967-10.883 4.821a3.649 3.649 0 0 1-2.116.67a3.664 3.664 0 0 1-1.768-.452l.019.01c-1.304-.622-9.539-3.95-11.023-4.659c-.741-.35-1.119-.653-1.132-.933v2.83c0 .282.39.583 1.132.933c1.484.709 9.722 4.037 11.023 4.659a3.63 3.63 0 0 0 1.744.44c.795 0 1.531-.252 2.132-.681l-.011.008c1.647-.859 9.388-4.041 10.883-4.821c.76-.396 1.096-.7 1.096-.982v-2.791z"
    />
    <path
      fill="currentColor"
      d="M27.992 10.115c-.013.267-.365.565-1.09.944c-1.495.778-9.236 3.967-10.883 4.821a3.647 3.647 0 0 1-2.121.672c-.639 0-1.24-.163-1.763-.449l.019.01c-1.304-.627-9.539-3.955-11.023-4.664c-.741-.35-1.119-.653-1.132-.933v2.83c0 .282.39.583 1.132.933c1.484.709 9.721 4.037 11.023 4.659a3.64 3.64 0 0 0 1.749.442c.793 0 1.527-.251 2.128-.677l-.011.008c1.647-.859 9.388-4.043 10.883-4.821c.76-.397 1.096-.7 1.096-.984v-2.791z"
    />
    <path
      fill="currentColor"
      d="M27.992 5.329c.014-.285-.358-.534-1.107-.81C25.434 3.986 17.733.923 16.261.383A4.325 4.325 0 0 0 14.467 0c-.734 0-1.426.18-2.035.498l.024-.012c-1.731.622-9.924 3.835-11.381 4.405c-.729.287-1.086.552-1.073.834v2.83c0 .282.39.583 1.132.933c1.484.709 9.721 4.038 11.023 4.66a3.629 3.629 0 0 0 1.744.439c.795 0 1.531-.252 2.133-.68l-.011.008c1.647-.859 9.388-4.043 10.883-4.821c.76-.397 1.096-.7 1.096-.984V5.319h-.009zM10.025 8.013l6.488-.996l-1.96 2.874zm14.351-2.588l-4.253 1.68l-3.835-1.523l4.246-1.679l3.838 1.517zM13.111 2.64l-.628-1.157l1.958.765l1.846-.604l-.499 1.196l1.881.7l-2.426.252l-.543 1.311l-.879-1.457l-2.8-.252l2.091-.754zM8.284 4.272c1.916 0 3.467.602 3.467 1.344S10.192 6.96 8.284 6.96S4.81 6.357 4.81 5.616s1.553-1.344 3.474-1.344z"
    />
  </svg>
));

export const Redis = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={RedisSvg} {...props} />
);

const PostgresqlSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M23.56 14.723a.527.527 0 0 0-.057-.12c-.139-.262-.477-.341-1.007-.231c-1.654.34-2.294.13-2.526-.02c1.342-2.048 2.445-4.522 3.041-6.83c.272-1.05.798-3.523.122-4.73a1.564 1.564 0 0 0-.15-.236C21.692.91 19.8.025 17.51.001c-1.495-.016-2.77.346-3.116.479a9.449 9.449 0 0 0-.516-.082a8.044 8.044 0 0 0-1.312-.127c-1.182-.019-2.203.264-3.05.84C8.66.79 4.729-.534 2.296 1.19C.935 2.153.309 3.873.43 6.304c.041.818.507 3.334 1.243 5.744c.46 1.506.938 2.702 1.433 3.582c.553.994 1.126 1.593 1.714 1.79c.448.148 1.133.143 1.858-.729a55.982 55.982 0 0 1 1.945-2.206c.435.235.906.362 1.39.377a.057.057 0 0 0 0 .004a11.031 11.031 0 0 0-.247.305c-.339.43-.41.52-1.5.745c-.31.064-1.134.233-1.146.811a.591.591 0 0 0 .091.327c.227.423.922.61 1.015.633c1.335.333 2.505.092 3.372-.679c-.017 2.231.077 4.418.345 5.088c.221.553.762 1.904 2.47 1.904c.25 0 .526-.03.829-.094c1.782-.382 2.556-1.17 2.855-2.906c.15-.87.402-2.875.539-4.101c.017-.07.036-.12.057-.136c0 0 .07-.048.427.03a.367.367 0 0 0 .044.007l.254.022l.015.001c.847.039 1.911-.142 2.531-.43c.644-.3 1.806-1.033 1.595-1.67zM2.37 11.876c-.744-2.435-1.178-4.885-1.212-5.571c-.109-2.172.417-3.683 1.562-4.493c1.837-1.299 4.84-.54 6.108-.13l-.01.01C6.795 3.734 6.843 7.226 6.85 7.44c0 .082.006.199.016.36c.034.586.1 1.68-.074 2.918c-.16 1.15.194 2.276.973 3.089c.08.084.165.163.252.237c-.347.371-1.1 1.193-1.903 2.158c-.568.682-.96.551-1.088.508c-.392-.13-.813-.587-1.239-1.322c-.48-.839-.963-2.032-1.415-3.512zm6.007 5.088a1.626 1.626 0 0 1-.432-.178c.089-.039.237-.09.483-.14c1.284-.265 1.482-.451 1.915-1a7.52 7.52 0 0 1 .367-.443a.355.355 0 0 0 .074-.13c.17-.151.272-.11.436-.042c.156.065.308.26.37.475c.03.102.062.295-.045.445c-.904 1.266-2.222 1.25-3.168 1.013zm2.094-3.988l-.052.14c-.133.357-.257.689-.334 1.004c-.667-.002-1.317-.288-1.81-.803c-.628-.655-.913-1.566-.783-2.5c.183-1.308.116-2.447.08-3.059l-.013-.22c.296-.262 1.666-.996 2.643-.772c.446.102.718.406.83.928c.585 2.704.078 3.83-.33 4.736a8.784 8.784 0 0 0-.23.546zm7.364 4.572c-.017.177-.036.376-.062.596l-.146.438a.355.355 0 0 0-.018.108c-.006.475-.054.649-.115.87a4.798 4.798 0 0 0-.18 1.057c-.11 1.414-.878 2.227-2.417 2.556c-1.515.325-1.784-.496-2.02-1.221a6.582 6.582 0 0 0-.078-.227c-.215-.586-.19-1.412-.157-2.555c.016-.561-.025-1.901-.33-2.646c.004-.293.01-.591.019-.892a.353.353 0 0 0-.016-.113a1.493 1.493 0 0 0-.044-.208c-.122-.428-.42-.786-.78-.935c-.142-.059-.403-.167-.717-.087c.067-.276.183-.587.309-.925l.053-.142c.06-.16.134-.325.213-.5c.426-.948 1.01-2.246.376-5.178c-.237-1.098-1.03-1.634-2.232-1.51c-.72.075-1.38.366-1.709.532a5.672 5.672 0 0 0-.196.104c.092-1.106.439-3.174 1.736-4.482a4.03 4.03 0 0 1 .303-.276a.353.353 0 0 0 .145-.064c.752-.57 1.695-.85 2.802-.833c.41.007.802.034 1.174.081c1.94.355 3.244 1.447 4.036 2.383c.814.962 1.255 1.931 1.431 2.454c-1.323-.134-2.223.127-2.68.78c-.992 1.418.544 4.172 1.282 5.496c.135.242.252.452.289.54c.24.583.551.972.778 1.256c.07.087.138.171.189.245c-.4.116-1.12.383-1.055 1.717a35.18 35.18 0 0 1-.084.815c-.046.208-.07.46-.1.766zm.89-1.621c-.04-.832.27-.919.597-1.01a2.857 2.857 0 0 0 .135-.041a1.202 1.202 0 0 0 .134.103c.57.376 1.583.421 3.007.134c-.202.177-.519.4-.953.601c-.41.19-1.096.333-1.747.364c-.72.034-1.086-.08-1.173-.151zm.57-9.271a7.25 7.25 0 0 1-.105 1.001c-.055.358-.112.728-.127 1.177c-.014.436.04.89.093 1.33c.107.887.216 1.8-.207 2.701a3.527 3.527 0 0 1-.188-.385a7.57 7.57 0 0 0-.325-.617c-.616-1.104-2.057-3.69-1.32-4.744c.38-.543 1.342-.566 2.179-.463zm.228 7.013a12.376 12.376 0 0 0-.085-.107l-.035-.044c.726-1.2.584-2.387.457-3.439c-.052-.432-.1-.84-.088-1.222c.013-.407.066-.755.118-1.092c.064-.415.13-.844.111-1.35a.559.559 0 0 0 .012-.19c-.046-.486-.6-1.938-1.73-3.253a7.803 7.803 0 0 0-2.688-2.04A9.251 9.251 0 0 1 17.62.746c2.052.046 3.675.814 4.824 2.283a.908.908 0 0 1 .067.1c.723 1.356-.276 6.275-2.987 10.54zm-8.816-6.116c-.025.18-.31.423-.621.423a.582.582 0 0 1-.081-.006a.797.797 0 0 1-.506-.315c-.046-.06-.12-.178-.106-.285a.223.223 0 0 1 .093-.149c.118-.089.352-.122.61-.086c.316.044.642.193.61.418zm7.93-.411c.011.08-.049.2-.153.31a.722.722 0 0 1-.408.223a.546.546 0 0 1-.075.005c-.293 0-.541-.234-.56-.371c-.024-.177.264-.31.56-.352c.298-.042.612.009.636.185z"
    />
  </svg>
));

export const Postgresql = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PostgresqlSvg} {...props} />
);

const NginxSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 0L1.605 6v12L12 24l10.395-6V6L12 0zm6 16.59c0 .705-.646 1.29-1.529 1.29c-.631 0-1.351-.255-1.801-.81l-6-7.141v6.66c0 .721-.57 1.29-1.274 1.29H7.32c-.721 0-1.29-.6-1.29-1.29V7.41c0-.705.63-1.29 1.5-1.29c.646 0 1.38.255 1.83.81l5.97 7.141V7.41c0-.721.6-1.29 1.29-1.29h.075c.72 0 1.29.6 1.29 1.29v9.18H18z"
    />
  </svg>
));

export const Nginx = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={NginxSvg} {...props} />
);

const MongodbSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 576 1024"
    {...props}
  >
    <path
      fill="currentColor"
      d="M319 901q1 15 1 27q0 40-9.5 68t-22.5 28t-22.5-28t-9.5-68q0-13 2-27q-16-18-55-53t-69.5-66.5T70 705T18.5 602.5T0 480q0-68 19-131t48-107.5t65-85.5t67-67.5T255.5 38T288 0q7 14 32.5 38T377 88.5t67 67.5t65 85.5T557 349t19 131q0 65-18.5 122.5T506 705t-63.5 76.5T373 848t-54 53z"
    />
  </svg>
));

export const Mongodb = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MongodbSvg} {...props} />
);

const RabbitmqSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M23.035 9.601h-7.677a.956.956 0 0 1-.962-.962V.962a.956.956 0 0 0-.962-.956H10.56a.956.956 0 0 0-.962.956V8.64a.956.956 0 0 1-.962.962H5.762a.956.956 0 0 1-.961-.962V.962A.956.956 0 0 0 3.839 0H.959a.956.956 0 0 0-.956.962v22.076A.956.956 0 0 0 .965 24h22.07a.956.956 0 0 0 .962-.962V10.58a.956.956 0 0 0-.962-.98zm-3.86 8.152a1.437 1.437 0 0 1-1.437 1.443h-1.924a1.437 1.437 0 0 1-1.436-1.443v-1.917a1.437 1.437 0 0 1 1.436-1.443h1.924a1.437 1.437 0 0 1 1.437 1.443z"
    />
  </svg>
));

export const Rabbitmq = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={RabbitmqSvg} {...props} />
);

const ElasticsearchSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M13.394 0C8.683 0 4.609 2.716 2.644 6.667h15.641a4.77 4.77 0 0 0 3.073-1.11c.446-.375.864-.785 1.247-1.243l.001-.002A11.974 11.974 0 0 0 13.394 0zM1.804 8.889a12.009 12.009 0 0 0 0 6.222h14.7a3.111 3.111 0 1 0 0-6.222zm.84 8.444C4.61 21.283 8.684 24 13.395 24c3.701 0 7.011-1.677 9.212-4.312l-.001-.002a9.958 9.958 0 0 0-1.247-1.243a4.77 4.77 0 0 0-3.073-1.11z"
    />
  </svg>
));

export const Elasticsearch = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ElasticsearchSvg} {...props} />
);

const KibanaSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M2.625 0v21.591L21.375 0zm10.864 12.47L3.477 24h17.522a18.755 18.755 0 0 0-7.51-11.53z"
    />
  </svg>
));

export const Kibana = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={KibanaSvg} {...props} />
);

const PrometheusSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.628-5.373-12-12-12zm0 22.46c-1.885 0-3.414-1.26-3.414-2.814h6.828c0 1.553-1.528 2.813-3.414 2.813zm5.64-3.745H6.36v-2.046h11.28v2.046zm-.04-3.098H6.391c-.037-.043-.075-.086-.111-.13c-1.155-1.401-1.427-2.133-1.69-2.879c-.005-.025 1.4.287 2.395.511c0 0 .513.119 1.262.255c-.72-.843-1.147-1.915-1.147-3.01c0-2.406 1.845-4.508 1.18-6.207c.648.053 1.34 1.367 1.387 3.422c.689-.951.977-2.69.977-3.755c0-1.103.727-2.385 1.454-2.429c-.648 1.069.168 1.984.894 4.256c.272.854.237 2.29.447 3.201c.07-1.892.395-4.652 1.595-5.605c-.529 1.2.079 2.702.494 3.424c.671 1.164 1.078 2.047 1.078 3.716a4.642 4.642 0 0 1-1.11 2.996c.792-.149 1.34-.283 1.34-.283l2.573-.502s-.374 1.538-1.81 3.019z"
    />
  </svg>
));

export const Prometheus = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PrometheusSvg} {...props} />
);

const GrafanaSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 128 128"
    {...props}
  >
    <path
      fill="currentColor"
      d="M69.162 0c-9.91 6.4-11.77 14.865-11.77 14.865s.002.206-.101.412c-.62.104-1.033.31-1.549.413c-.722.206-1.445.413-2.168.826l-2.168.93c-1.445.722-2.89 1.341-4.336 2.167c-1.342.826-2.683 1.548-4.025 2.477a1.266 1.266 0 0 1-.309-.205c-13.316-5.161-25.084 1.031-25.084 1.031c-1.032 14.245 5.367 23.02 6.606 24.672c-.31.929-.62 1.754-.93 2.58a52.973 52.973 0 0 0-2.166 9.91c-.103.413-.104 1.033-.207 1.445C8.671 67.613 5.06 80.103 5.06 80.103c10.219 11.768 22.193 12.49 22.193 12.49c1.445 2.685 3.302 5.369 5.264 7.743c.825 1.032 1.756 1.96 2.582 2.992c-3.716 10.632.619 19.613.619 19.613c11.458.413 18.992-4.955 20.54-6.297c1.136.31 2.272.724 3.407 1.034a47.25 47.25 0 0 0 10.633 1.549h4.644C80.31 126.969 89.807 128 89.807 128c6.71-7.123 7.123-14.038 7.123-15.69v-.62c1.342-1.033 2.683-2.064 4.129-3.2c2.684-2.374 4.955-5.264 7.02-8.154c.206-.207.309-.62.618-.826c7.639.413 12.903-4.748 12.903-4.748c-1.24-7.949-5.78-11.768-6.71-12.49l-.103-.104l-.103-.104l-.104-.103c0-.413.104-.93.104-1.445c.103-.93.103-1.755.103-2.58v-3.407c0-.206 0-.413-.103-.722l-.104-.723l-.103-.723c-.104-.929-.31-1.754-.413-2.58c-.825-3.406-2.166-6.71-3.818-9.498c-1.858-2.993-4.026-5.471-6.504-7.742c-2.477-2.168-5.264-4.025-8.154-5.264c-2.994-1.342-5.884-2.167-8.98-2.476c-1.446-.207-3.098-.207-4.544-.207H79.69c-.825.103-1.546.205-2.27.308c-3.096.62-5.883 1.756-8.36 3.201c-2.478 1.446-4.646 3.407-6.504 5.575c-1.858 2.167-3.2 4.438-4.13 6.916a23.313 23.313 0 0 0-1.548 7.431v2.684c0 .31 0 .62.104.93c.103 1.238.31 2.374.722 3.51c.723 2.27 1.756 4.334 3.098 6.09a19.973 19.973 0 0 0 4.54 4.335c1.756 1.136 3.408 1.96 5.266 2.477c1.858.516 3.509.826 5.16.722h2.376c.206 0 .412-.101.619-.101c.206 0 .31-.104.619-.104c.31-.103.825-.207 1.135-.31c.722-.207 1.342-.62 2.064-.826c.723-.31 1.24-.722 1.756-1.032c.103-.103.309-.207.412-.31c.62-.413.723-1.238.207-1.858c-.413-.413-1.136-.62-1.756-.31c-.103.103-.205.104-.412.207c-.413.206-1.032.413-1.445.619c-.62.103-1.135.31-1.754.414c-.31 0-.62.102-.93.102h-2.58c-.103 0-.31.001-.414-.102c-1.239-.206-2.58-.62-3.818-1.137c-1.239-.619-2.478-1.34-3.51-2.373a15.894 15.894 0 0 1-2.89-3.51c-.826-1.341-1.24-2.89-1.446-4.335c-.103-.826-.207-1.55-.103-2.375v-1.239c0-.413.103-.825.207-1.238c.619-3.406 2.27-6.71 4.851-9.187c.723-.723 1.342-1.238 2.168-1.754c.826-.62 1.547-1.032 2.373-1.342c.826-.31 1.756-.723 2.582-.93c.93-.206 1.858-.414 2.684-.414c.413 0 .929-.101 1.342-.101h1.238c1.032.103 2.065.205 2.994.412c1.961.413 3.82 1.135 5.678 2.168c3.613 2.064 6.708 5.16 8.566 8.877c.93 1.858 1.548 3.82 1.961 5.988c.103.62.104 1.03.207 1.547v2.787c0 .62-.103 1.136-.103 1.756c-.104.62-.102 1.134-.205 1.754c-.104.619-.208 1.136-.311 1.755c-.206 1.136-.722 2.168-1.031 3.303c-.826 2.168-1.963 4.232-3.305 5.986c-2.684 3.717-6.502 6.815-10.63 8.776c-2.169.929-4.337 1.755-6.608 2.064a19.003 19.003 0 0 1-3.407.309h-1.755c-.62 0-1.238.002-1.858-.102c-2.477-.206-4.85-.724-7.224-1.343c-2.375-.723-4.647-1.548-6.815-2.684c-4.335-2.27-8.153-5.573-11.25-9.289c-1.445-1.961-2.892-4.027-4.027-6.092c-1.136-2.064-1.961-4.438-2.58-6.709c-.723-2.27-1.032-4.645-1.135-7.02v-3.613c0-1.135.102-2.372.309-3.61c.103-1.24.309-2.376.619-3.614c.206-1.239.62-2.375.93-3.614c.722-2.374 1.444-4.644 2.476-6.812c2.064-4.335 4.645-8.155 7.742-11.252a24.86 24.86 0 0 1 2.479-2.168c.31-.31 1.135-1.033 2.064-1.549s1.858-1.136 2.89-1.549c.414-.206.93-.413 1.446-.722c.206-.103.411-.206.824-.309c.207-.103.414-.207.826-.31c1.033-.413 2.066-.825 3.098-1.135c.207-.103.62-.104.826-.207c.207-.103.618-.102.824-.205c.62-.103 1.033-.208 1.55-.414c.206-.104.619-.104.825-.207c.207 0 .62-.102.827-.102c.206 0 .62-.103.826-.103l.412-.104l.412-.103c.206 0 .62-.104.826-.104c.31 0 .62-.104.93-.104c.206 0 .721-.101.928-.101c.206 0 .311 0 .62-.104h.723c.31 0 .618 0 .928-.103h4.647c2.064.103 4.128.31 5.986.723c3.82.722 7.638 1.961 10.941 3.613c3.304 1.548 6.4 3.611 8.877 5.78c.104.102.311.207.414.413c.104.103.31.206.412.412c.31.207.62.62.93.826c.31.207.62.62.93.827c.206.31.618.618.824.927c1.136 1.136 2.169 2.375 3.098 3.51a41.422 41.422 0 0 1 4.44 7.02c.102.103.1.207.204.414c.103.103.104.205.207.412c.103.206.206.62.412.826c.104.206.208.62.31.826c.104.207.208.62.311.826c.413 1.033.826 2.064 1.135 3.096c.62 1.548.929 2.993 1.239 4.13c.103.412.62.825 1.033.825c.619 0 .927-.414.927-1.033c-.31-1.755-.308-3.198-.412-4.953c-.206-2.168-.619-4.647-1.238-7.434c-.62-2.787-1.86-5.677-3.305-8.877c-1.548-3.096-3.509-6.4-6.09-9.394c-1.032-1.239-2.167-2.373-3.302-3.612c1.858-7.122-2.168-13.42-2.168-13.42c-6.916-.412-11.253 2.168-12.801 3.303c-.206-.103-.618-.205-.824-.308c-1.136-.413-2.375-.93-3.613-1.342c-1.24-.31-2.478-.827-3.717-1.033c-1.239-.31-2.58-.62-4.026-.827c-.206 0-.413-.103-.722-.103C77.833 4.128 69.162 0 69.162 0"
    />
  </svg>
));

export const Grafana = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={GrafanaSvg} {...props} />
);

const InfluxdbSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m23.778 14.482l-2.287-9.959c-.13-.545-.624-1.09-1.169-1.248L9.87.051C9.74 0 9.584 0 9.426 0c-.443 0-.909.18-1.222.443L.716 7.412C.3 7.776.092 8.504.222 9.024l2.445 10.662c.13.545.624 1.092 1.169 1.248l9.775 3.015c.13.051.285.051.443.051c.443 0 .91-.18 1.223-.443l8.007-7.435c.418-.39.624-1.092.494-1.64zM10.962 2.417l7.175 2.21c.285.08.285.21 0 .286l-3.77.858c-.285.08-.674-.05-.883-.26l-2.626-2.834c-.235-.232-.184-.336.104-.26zm4.47 12.872c.079.286-.105.444-.39.365l-7.748-2.392c-.285-.079-.338-.313-.13-.52l5.93-5.514c.209-.209.443-.13.52.156zM2.667 8.267l6.293-5.85c.21-.209.545-.18.754.025L12.86 5.85c.209.21.18.545-.026.754l-6.293 5.85c-.21.21-.545.181-.754-.025L2.64 9.024a.536.536 0 0 1 .026-.757zm1.536 9.284L2.54 10.244c-.08-.285.05-.34.234-.13L5.4 12.949c.209.209.285.624.209.909L4.462 17.55c-.079.285-.208.285-.26 0zm9.202 4.264l-8.217-2.522a.547.547 0 0 1-.364-.675l1.378-4.421a.547.547 0 0 1 .675-.365l8.216 2.522c.285.079.443.39.364.675L14.08 21.45a.553.553 0 0 1-.674.365zm7.279-5.98L15.2 20.93c-.209.209-.31.13-.234-.155l1.144-3.694c.079-.285.39-.573.674-.624l3.77-.858c.288-.076.339.054.13.234zm.598-1.09l-4.523 1.039a.534.534 0 0 1-.65-.39l-1.922-8.372a.534.534 0 0 1 .39-.65L19.1 5.335a.534.534 0 0 1 .649.39l1.923 8.371c.079.31-.102.596-.39.65Z"
    />
  </svg>
));

export const Influxdb = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={InfluxdbSvg} {...props} />
);

const ApacheSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="M21.099 0a1.03 1.03 0 0 0-.536.151c-.5.297-1.333 1.136-2.328 2.355l-.208.255a34.71 34.71 0 0 0-.824 1.057a54.275 54.275 0 0 0-2.687 3.959l-.027.047l-.063.099a54.229 54.229 0 0 0-2.276 4.109a33.815 33.815 0 0 0-1.468 3.407c-.12.333-.229.656-.333.969c-.084.265-.161.531-.235.796c-.177.62-.333 1.245-.459 1.865l-.016.083a19.364 19.364 0 0 0-.312 2.256l-.005.077c-.369-.599-1.369-1.181-1.369-1.177c.719 1.037 1.26 2.068 1.339 3.079c-.38.079-.907-.036-1.516-.26c.636.583 1.109.744 1.292.787c-.579.036-1.183.437-1.792.895c.891-.364 1.609-.509 2.125-.391a173.201 173.201 0 0 0-2.459 7.584a.702.702 0 0 0 .484-.473c.152-.491 1.12-3.715 2.641-7.953l.129-.365l.037-.099c.161-.443.328-.896.5-1.36l.115-.317l.005-.005c.156-.421.317-.853.484-1.287l.073-.181l.067-.183l.057-.136l-.057.141l-.067.177l-.073.181c-.167.433-.328.865-.484 1.287l.14.276l.125-.015l.016-.037c.203-.557.4-1.099.604-1.624l.005-.021a94.042 94.042 0 0 0-.609 1.645l-.016.037l-.089.244c-.156.432-.317.875-.473 1.323l-.005.021l-.068.193c-.109.301-.203.577-.411 1.197c.348.161.629.584.896 1.057a1.935 1.935 0 0 0-.62-1.317c1.729.077 3.219-.36 3.989-1.62c.068-.115.131-.235.188-.36c-.349.443-.787.631-1.605.584c1.204-.537 1.808-1.052 2.339-1.912a7.34 7.34 0 0 0 .376-.667c-1.052 1.079-2.267 1.385-3.553 1.152l-.056-.011c1.151-.141 2.681-1 3.671-2.063a9.235 9.235 0 0 0 1.251-1.74c.287-.505.552-1.063.807-1.677c.224-.541.439-1.124.641-1.755a3.562 3.562 0 0 1-1.079.344c-.063.011-.124.02-.181.031l.004-.005c.057-.005.12-.015.177-.025s.12-.021.177-.037l-.177.037l-.177.025c1.073-.411 1.745-1.208 2.235-2.181a3.805 3.805 0 0 1-1.287.567c-.077.016-.151.032-.228.043l-.057.004h.009l.048-.004c.067-.016.135-.027.208-.043l.015-.005l-.02.005l-.256.047c.371-.156.683-.333.953-.536a3.646 3.646 0 0 0 .85-.932l.084-.141l.104-.203c.181-.369.348-.749.489-1.135l.041-.115c.036-.115.073-.219.093-.308c.037-.131.057-.235.073-.312c-.041.031-.083.063-.125.083c-.328.199-.88.371-1.328.453l-.135.016l-3.021.333l-.016.031l-.104.213l-.312.652c.104-.224.208-.443.312-.652l.104-.213l.016-.031l-.115.011l-.088-.177c-.172.339-.339.677-.505 1.016l-.271.567a95.015 95.015 0 0 0-1.453 3.209c-.5 1.151-.98 2.307-1.443 3.468l.115-.287c.427-1.068.869-2.129 1.328-3.181a89.107 89.107 0 0 1 1.453-3.209l.271-.567c.161-.324.317-.647.479-.964l.027-.052c.255-.505.511-1 .771-1.489c.281-.516.563-1.027.844-1.521c.291-.5.588-1 .896-1.489l.057-.089c.296-.468.599-.927.9-1.359A22.064 22.064 0 0 1 21.183 1.7l-.079.084c-.213.235-.859.984-1.833 2.484c.937-.047 2.38-.239 3.552-.443c.355-1.959-.339-2.853-.339-2.853s-.593-.959-1.38-.969zm-2.192 10.011c.88-.407 1.271-.771 1.656-1.303c.099-.145.203-.296.301-.457c.313-.485.615-1.016.885-1.548c.267-.515.496-1.02.672-1.479a8.42 8.42 0 0 0 .272-.803c.052-.208.099-.405.129-.599c-1.177.204-2.62.396-3.557.437a39.08 39.08 0 0 0-.927 1.5c-.271.459-.563.964-.869 1.516a73.301 73.301 0 0 0-1.589 3.063l3.021-.328zm4.833-7.079v.089h.208v.583h.099v-.583h.208v-.089zm.62 0v.672h.088v-.531l.229.463h.063l.229-.463v.531h.083v-.672h-.115l-.229.469l-.235-.469zM19.016 10l-.136.021l.136-.027zm-.12.016h-.011zm-3.656 1.656l-.141.301l-.177.381c-.421.921-.833 1.848-1.228 2.781a127.196 127.196 0 0 0-1.329 3.26c-.197.505-.4 1.02-.599 1.552l-.011.021c.959-2.579 2.011-5.12 3.167-7.615l.177-.381z"
    />
  </svg>
));

export const Apache = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ApacheSvg} {...props} />
);

const ExternalLinkSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M14 5a1 1 0 1 1 0-2h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V6.414l-9.293 9.293a1 1 0 0 1-1.414-1.414L17.586 5H14zM3 7a2 2 0 0 1 2-2h5a1 1 0 1 1 0 2H5v12h12v-5a1 1 0 1 1 2 0v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
    />
  </svg>
));

export const ExternalLink = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ExternalLinkSvg} {...props} />
);

const AttachSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M11.314 3.121a5 5 0 1 1 7.07 7.071l-7.777 7.778a3 3 0 1 1-4.243-4.242l7.778-7.778l1.414 1.414l-7.778 7.778a1 1 0 1 0 1.414 1.414l7.779-7.778a3 3 0 1 0-4.243-4.243L4.95 12.314a5 5 0 0 0 7.07 7.07l8.486-8.485l1.414 1.415l-8.485 8.485a7 7 0 0 1-9.9-9.9l7.779-7.778Z"
    />
  </svg>
));

export const Attach = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={AttachSvg} {...props} />
);

const InternalSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="currentColor">
      <path d="m20.708 4.412l-10.25 10.287h3.59v2h-7v-7h2v3.58L19.293 3l1.416 1.412Z" />
      <path d="M11 4.706v2H5v12h12v-6h2v8H3v-16h8Z" />
    </g>
  </svg>
));

export const Internal = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={InternalSvg} {...props} />
);

const TestSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M9 1v7L2 20v3h20v-3L15 8V1m0 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm-6 2a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm9-7c-7-3-6 4-12 1M6 1h12"
    />
  </svg>
));

export const Test = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={TestSvg} {...props} />
);

const ValidateSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M20 15c-1 1 1.25 3.75 0 5s-4-1-5 0s-1.5 3-3 3s-2-2-3-3s-3.75 1.25-5 0s1-4 0-5s-3-1.5-3-3s2-2 3-3s-1.25-3.75 0-5s4 1 5 0s1.5-3 3-3s2 2 3 3s3.75-1.25 5 0s-1 4 0 5s3 1.5 3 3s-2 2-3 3ZM7 12l3 3l7-7"
    />
  </svg>
));

export const Validate = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ValidateSvg} {...props} />
);

const DetailsSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1025 1024"
    {...props}
  >
    <path
      fill="currentColor"
      d="M960.488 768h-448q-27 0-45.5-18.5t-18.5-45.5t18.5-45.5t45.5-18.5h448q27 0 45.5 18.5t18.5 45.5t-18.5 45.5t-45.5 18.5zm0-384h-448q-27 0-45.5-19t-18.5-45.5t18.5-45t45.5-18.5h448q27 0 45.5 18.5t18.5 45t-18.5 45.5t-45.5 19zm0-256h-448q-27 0-45.5-19t-18.5-45.5t18.5-45t45.5-18.5h448q27 0 45.5 18.5t18.5 45t-18.5 45.5t-45.5 19zm-640 896h-256q-27 0-45.5-18.5T.488 960V704q0-27 18.5-45.5t45.5-18.5h256q26 0 45 18.5t19 45.5v256q0 27-19 45.5t-45 18.5zm0-640h-256q-27 0-45.5-19t-18.5-45V64q0-27 18.5-45.5T64.488 0h256q26 0 45 18.5t19 45.5v256q0 26-19 45t-45 19zm192 512h448q27 0 45.5 18.5t18.5 45.5t-19 45.5t-45 18.5h-448q-27 0-45.5-18.5t-18.5-45.5t18.5-45.5t45.5-18.5z"
    />
  </svg>
));

export const Details = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DetailsSvg} {...props} />
);

const UpdateLineSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 36 36"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19.5 28.1h-2.9c-.5 0-.9-.3-1-.8l-.5-1.8l-.4-.2l-1.6.9c-.4.2-.9.2-1.2-.2l-2.1-2.1c-.3-.3-.4-.8-.2-1.2l.9-1.6l-.2-.4l-1.8-.5c-.4-.1-.8-.5-.8-1v-2.9c0-.5.3-.9.8-1l1.8-.5l.2-.4l-.9-1.6c-.2-.4-.2-.9.2-1.2l2.1-2.1c.3-.3.8-.4 1.2-.2l1.6.9l.4-.2l.5-1.8c.1-.4.5-.8 1-.8h2.9c.5 0 .9.3 1 .8L21 10l.4.2l1.6-.9c.4-.2.9-.2 1.2.2l2.1 2.1c.3.3.4.8.2 1.2l-.9 1.6l.2.4l1.8.5c.4.1.8.5.8 1v2.9c0 .5-.3.9-.8 1l-1.8.5l-.2.4l.9 1.6c.2.4.2.9-.2 1.2L24.2 26c-.3.3-.8.4-1.2.2l-1.6-.9l-.4.2l-.5 1.8c-.2.5-.6.8-1 .8zm-2.2-2h1.4l.5-2.1l.5-.2c.4-.1.7-.3 1.1-.4l.5-.3l1.9 1.1l1-1l-1.1-1.9l.3-.5c.2-.3.3-.7.4-1.1l.2-.5l2.1-.5v-1.4l-2.1-.5l-.2-.5c-.1-.4-.3-.7-.4-1.1l-.3-.5l1.1-1.9l-1-1l-1.9 1.1l-.5-.3c-.3-.2-.7-.3-1.1-.4l-.5-.2l-.5-2.1h-1.4l-.5 2.1l-.5.2c-.4.1-.7.3-1.1.4l-.5.3l-1.9-1.1l-1 1l1.1 1.9l-.3.5c-.2.3-.3.7-.4 1.1l-.2.5l-2.1.5v1.4l2.1.5l.2.5c.1.4.3.7.4 1.1l.3.5l-1.1 1.9l1 1l1.9-1.1l.5.3c.3.2.7.3 1.1.4l.5.2l.5 2.1zm9.8-6.6z"
    />
    <path
      fill="currentColor"
      d="M18 22.3c-2.4 0-4.3-1.9-4.3-4.3s1.9-4.3 4.3-4.3s4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3zm0-6.6c-1.3 0-2.3 1-2.3 2.3s1 2.3 2.3 2.3c1.3 0 2.3-1 2.3-2.3s-1-2.3-2.3-2.3z"
    />
    <path
      fill="currentColor"
      d="M18 2c-.6 0-1 .4-1 1s.4 1 1 1c7.7 0 14 6.3 14 14s-6.3 14-14 14S4 25.7 4 18c0-2.8.8-5.5 2.4-7.8v1.2c0 .6.4 1 1 1s1-.4 1-1v-5h-5c-.6 0-1 .4-1 1s.4 1 1 1h1.8C3.1 11.1 2 14.5 2 18c0 8.8 7.2 16 16 16s16-7.2 16-16S26.8 2 18 2z"
    />
    <path fill="none" d="M0 0h36v36H0z" />
  </svg>
));

export const UpdateLine = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={UpdateLineSvg} {...props} />
);

const ErrorCircleSettings20RegularSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M18 10a8 8 0 1 0-7.411 7.979a5.462 5.462 0 0 1-.383-.982a7 7 0 1 1 6.79-6.79c.343.096.671.224.983.382c.014-.195.021-.391.021-.589Zm-7.342 2.89a.75.75 0 1 0-.442 1.078c.11-.378.258-.739.442-1.079Zm-.166-6.48a.5.5 0 0 0-.992.09V11l.008.09A.5.5 0 0 0 10.5 11V6.5l-.008-.09Zm1.143 8.51a2 2 0 0 0 1.43-2.478l-.155-.557c.254-.195.529-.362.821-.497l.338.358a2 2 0 0 0 2.91.001l.324-.343c.298.14.578.314.835.518l-.126.422a2 2 0 0 0 1.456 2.519l.349.082a4.697 4.697 0 0 1 .01 1.017l-.46.118a2 2 0 0 0-1.431 2.478l.156.556c-.254.196-.53.363-.822.498l-.337-.358a2 2 0 0 0-2.91-.002l-.325.345a4.32 4.32 0 0 1-.835-.518l.127-.423a2 2 0 0 0-1.456-2.519l-.35-.083a4.715 4.715 0 0 1-.01-1.016l.461-.118Zm4.865.58a1 1 0 1 0-2 0a1 1 0 0 0 2 0Z"
    />
  </svg>
));

export const ErrorCircleSettings20Regular = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={ErrorCircleSettings20RegularSvg} {...props} />;

const BackupSolidSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 36 36"
    {...props}
  >
    <path
      fill="currentColor"
      d="m18 19.84l6.38-6.35A1 1 0 1 0 23 12.08L19 16V4a1 1 0 1 0-2 0v12l-4-3.95a1 1 0 0 0-1.41 1.42Z"
      className="clr-i-solid clr-i-solid-path-1"
    />
    <path
      fill="currentColor"
      d="m19.41 21.26l-.74.74h15.26c-.17-.57-.79-2.31-3.09-8.63A1.94 1.94 0 0 0 28.93 12h-2.38a3 3 0 0 1-.76 2.92Z"
      className="clr-i-solid clr-i-solid-path-2"
    />
    <path
      fill="currentColor"
      d="m16.58 21.26l-6.38-6.35A3 3 0 0 1 9.44 12H7.07a1.92 1.92 0 0 0-1.9 1.32c-2.31 6.36-2.93 8.11-3.1 8.68h15.26Z"
      className="clr-i-solid clr-i-solid-path-3"
    />
    <path
      fill="currentColor"
      d="M2 24v6a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2v-6Zm28 4h-4v-2h4Z"
      className="clr-i-solid clr-i-solid-path-4"
    />
    <path fill="none" d="M0 0h36v36H0z" />
  </svg>
));

export const BackupSolid = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BackupSolidSvg} {...props} />
);

const BrowserLtrSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M2 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm2 1.5A1.5 1.5 0 1 1 2.5 5A1.5 1.5 0 0 1 4 3.5zM18 16H2V8h16z"
    />
  </svg>
));

export const BrowserLtr = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BrowserLtrSvg} {...props} />
);

const FileSystemSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M14 13h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-3l-1-1h-2a1 1 0 0 0-1 1v1H8V7h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H7L6 1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v13h7v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-3l-1-1h-2a1 1 0 0 0-1 1v1H8v-7h5v1a1 1 0 0 0 1 1Z"
    />
  </svg>
));

export const FileSystem = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FileSystemSvg} {...props} />
);

const MedicalSearchDiagnosisSolidSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 14 14"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.25 1.5a4.75 4.75 0 1 0 0 9.5a4.75 4.75 0 0 0 0-9.5M0 6.25a6.25 6.25 0 1 1 11.32 3.656l2.387 2.387a1 1 0 0 1-1.414 1.414L9.906 11.32A6.25 6.25 0 0 1 0 6.25m5.438-3.22a.5.5 0 0 0-.5.5v1.406H3.53a.5.5 0 0 0-.5.5v1.625a.5.5 0 0 0 .5.5h1.406V8.97a.5.5 0 0 0 .5.5h1.625a.5.5 0 0 0 .5-.5V7.562H8.97a.5.5 0 0 0 .5-.5V5.437a.5.5 0 0 0-.5-.5H7.563V3.531a.5.5 0 0 0-.5-.5H5.438Z"
      clipRule="evenodd"
    />
  </svg>
));

export const MedicalSearchDiagnosisSolid = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={MedicalSearchDiagnosisSolidSvg} {...props} />;

const ProxmoxSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4.928 1.825c-1.09.553-1.09.64-.07 1.78c5.655 6.295 7.004 7.782 7.107 7.782c.139.017 7.971-8.542 8.058-8.801c.034-.07-.208-.312-.519-.536c-.415-.312-.864-.433-1.712-.467c-1.59-.104-2.144.242-4.115 2.455c-.899 1.003-1.66 1.833-1.66 1.833c-.017 0-.76-.813-1.642-1.798S8.473 2.1 8.127 1.91c-.796-.45-2.421-.484-3.2-.086zM1.297 4.367C.45 4.695 0 5.007 0 5.248c0 .121 1.331 1.678 2.94 3.459c1.625 1.78 2.939 3.268 2.939 3.302c0 .035-1.331 1.522-2.94 3.303C1.314 17.11.017 18.683.035 18.822c.086.467 1.504 1.055 2.541 1.055c1.678-.018 2.058-.312 5.603-4.202c1.78-1.954 3.233-3.614 3.233-3.666c0-.069-1.435-1.694-3.199-3.63c-2.3-2.508-3.423-3.632-3.96-3.874c-.812-.398-2.126-.467-2.956-.138zm18.467.12c-.502.26-1.764 1.505-3.943 3.891c-1.763 1.937-3.199 3.562-3.199 3.631c0 .07 1.453 1.712 3.234 3.666c3.544 3.89 3.925 4.184 5.602 4.202c1.038 0 2.455-.588 2.542-1.055c.017-.156-1.28-1.712-2.905-3.493c-1.608-1.78-2.94-3.285-2.94-3.32c0-.034 1.332-1.539 2.94-3.32C22.72 6.91 24.017 5.352 24 5.214c-.087-.45-1.366-.968-2.473-1.038c-.795-.034-1.21.035-1.763.312zM7.954 16.973c-2.144 2.369-3.908 4.374-3.943 4.46c-.034.07.208.312.52.537c.414.311.864.432 1.711.467c1.574.103 2.161-.26 4.15-2.508c.864-.968 1.608-1.78 1.625-1.78s.761.812 1.643 1.798c2.023 2.248 2.559 2.576 4.132 2.49c.848-.035 1.297-.156 1.712-.467c.311-.225.553-.467.519-.536c-.087-.26-7.92-8.819-8.058-8.801c-.069 0-1.867 1.954-4.011 4.34z"
    />
  </svg>
));

export const Proxmox = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ProxmoxSvg} {...props} />
);

const LinuxcontainersSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m10.15 8.98l1.647.951l-5.756 3.345l.005-1.911L10.15 8.98zm1.723-1.001l-1.553.902l1.548.893l.005-1.795zM6.028 5.33L6.025 6.4l.543.316l3.602 2.079l1.632-.948l-2.19-1.279l-3.231-1.887l-.351-.203l-.002.852zm.072-.983l.359.209l6.321 3.65l5.258 3.037l5.858-3.405L11.956.943L6.1 4.347zm6.002 12.602l-.005 1.924l5.858-3.404l.005-1.924l-5.858 3.404zm-.077-9.009l-.005 1.922l5.94 3.428l.005-1.92l-5.94-3.43zm-10.13.945l4.075 2.352l4.031-2.342l-4.075-2.353l-4.031 2.343zM24 7.982l-5.858 3.404l-.015 3.982l5.858-3.404L24 7.982zm-12.048 10.04l.003-1.073L7.6 14.436l-1.565-.903v.001l-.939-.542L.015 10.06L.01 11.979l11.94 6.895l.002-.852zm5.935-4.605l-5.922-3.411l-5.853 3.401l5.917 3.414l5.858-3.404zm6.072-1.238l-11.862 6.864l-.01 4.013l11.863-6.894l.009-3.983zM11.944 21.27l.005-2.227L.01 12.148L0 16.162l11.94 6.895l.004-1.787zM.021 9.802L1.6 8.885L.025 7.976L.021 9.802zm5.832-3.39l.024-1.636l.001-.296L.099 7.848l1.647.951l4.107-2.387zm.041 4.951L1.749 8.97l-.46.267l-1.195.695l5.795 3.345l.005-1.914z"
    />
  </svg>
));

export const Linuxcontainers = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LinuxcontainersSvg} {...props} />
);

const AutoFocusSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    {...props}
  >
    <g fill="none">
      <circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="4" />
      <circle r="3" fill="currentColor" transform="matrix(-1 0 0 1 24 24)" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        d="M9 14s7.5-11.5 20.5-7S42 24.5 42 24.5M39 34s-6 11-19.5 7.5S6 24 6 24M42 8v16M6 24v16"
      />
    </g>
  </svg>
));

export const AutoFocus = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={AutoFocusSvg} {...props} />
);
const UpdateSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M1.75 16.002C3.353 20.098 7.338 23 12 23c6.075 0 11-4.925 11-11m-.75-4.002C20.649 3.901 16.663 1 12 1C5.925 1 1 5.925 1 12m8 4H1v8M23 0v8h-8"
    />
  </svg>
));

export const Update = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={UpdateSvg} {...props} />
);

const QemuSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12.003.064C5.376.064 0 5.407 0 12s5.376 11.936 12.003 11.936c2.169 0 4.2-.57 5.955-1.57l.624 1.57h4.841l-1.893-4.679A11.845 11.845 0 0 0 24 12C24 5.407 18.63.064 12.003.064zM8.818 2.03c.398.339.324.198.86.134c.61-.397.893.942 1.147.195c.748.097 1.542.34 2.25.584a3.447 3.447 0 0 1 1.859 1.128l-.014.007l.35.463c.045.08.082.164.12.248c.142 1.205 1.48 1.19 2.377 1.625c.767.272 1.69.686 1.785 1.611c-.193-.042-.941-.921-1.53-1.007a3.919 3.919 0 0 1-1.094-.255L14.86 6.38v-.007a3.035 3.035 0 0 1-.309-.053v.013l-2.927-.362c.048.033.1.077.148.12l3 .585v-.007l.209.053l.839.188c.166.016.334.043.47.067c.856.236 1.868.194 2.571.792c-.184.352-1.21.153-1.719.108c-.062-.012-.131-.023-.194-.034l-.034-.007c-.696-.113-1.411-.12-2.081.088h-.007a3.193 3.193 0 0 0-.671.302c-.968.563-2.164.767-2.967 1.577c-.787.847-.739 2.012-.604 3.095h.033v.275c.013.095.028.19.04.282c.41 2.19 1.5 4.2 1.84 6.412c.065.843.203 1.932.309 2.618c-.306-.091-.475-1.462-.544-1.007a38.196 38.196 0 0 0-3.565-5.25c-.853-1.004-1.697-2.06-2.712-2.894c-.685-.528-.468-1.55-.537-2.302c-.23-.926-.094-1.848.06-2.773c.313-.963.418-1.968.846-2.893c.653-.581.669-1.63 1.303-2.135c.094.058.157.085.2.1l.068.008h.007c.09-.095-.888-1.116.02-.712c.035-.537.854-.128.866-.597zm3.847 2.182c-.323.009-.574.13-.645.335c-.114.33.273.755.866.96c.594.205 1.168.109 1.282-.221c.114-.33-.272-.762-.866-.967a1.842 1.842 0 0 0-.637-.107z"
    />
  </svg>
));

export const Qemu = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={QemuSvg} {...props} />
);

const SetActionSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 2048 2048"
    {...props}
  >
    <path
      fill="currentColor"
      d="M1664 0v128H0V0h1664zm-649 512l-67 128H0V512h1015zM0 1024h747l-67 128H0v-128zm1512 0h568L1004 2048H747l304-640H691l535-1024h612l-326 640zm-559 896l807-768h-456l325-640h-325l-402 768h351l-304 640h4z"
    />
  </svg>
));

const FileTreeSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M3 3h6v4H3V3m12 7h6v4h-6v-4m0 7h6v4h-6v-4m-2-4H7v5h6v2H5V9h2v2h6v2Z"
    />
  </svg>
));

export const SetAction = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SetActionSvg} {...props} />
);

export const FileTree = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FileTreeSvg} {...props} />
);

const PermissionsSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    {...props}
  >
    <mask id="ipSPermissions0">
      <g fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="4">
        <path
          strokeLinejoin="round"
          d="M20 10H6a2 2 0 0 0-2 2v26a2 2 0 0 0 2 2h36a2 2 0 0 0 2-2v-2.5"
        />
        <path d="M10 23h8m-8 8h24" />
        <circle cx="34" cy="16" r="6" fill="#fff" strokeLinejoin="round" />
        <path
          strokeLinejoin="round"
          d="M44 28.419C42.047 24.602 38 22 34 22s-5.993 1.133-8.05 3"
        />
      </g>
    </mask>
    <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSPermissions0)" />
  </svg>
));

export const Permissions = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PermissionsSvg} {...props} />
);

const HardwareCircuitSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M22 0H2a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6 16a1 1 0 1 1 1-1a1.001 1.001 0 0 1-1 1ZM22 6h-2.184a3 3 0 1 0 0 2H22v4h-4v2h4v2h-2v2h2v4h-8v-1.184a3 3 0 1 0-2 0V22H7v-4.184a3 3 0 1 0-2 0V22H2V2h4v6h2V2h2v10h2V2h10Zm-4 1a1 1 0 1 1-1-1a1.001 1.001 0 0 1 1 1Z"
    />
  </svg>
));

export const HardwareCircuit = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={HardwareCircuitSvg} {...props} />
);

const RemoteSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 0C8.96 0 6.21 1.23 4.22 3.22l1.41 1.41A8.952 8.952 0 0 1 12 2c2.5 0 4.74 1 6.36 2.64l1.41-1.41C17.79 1.23 15.04 0 12 0M7.05 6.05l1.41 1.41a5.022 5.022 0 0 1 7.08 0l1.41-1.41A6.976 6.976 0 0 0 12 4c-1.93 0-3.68.78-4.95 2.05M12 15a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3-6H9a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1Z"
    />
  </svg>
));

export const Remote = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={RemoteSvg} {...props} />
);

const GraphicsCardSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 256 256"
    {...props}
  >
    <path
      fill="currentColor"
      d="M232 48H16a8 8 0 0 0-8 8v152a8 8 0 0 0 16 0v-16h16v16a8 8 0 0 0 16 0v-16h16v16a8 8 0 0 0 16 0v-16h16v16a8 8 0 0 0 16 0v-16h112a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 128H24V64h208Zm-56-16a40 40 0 1 0-40-40a40 40 0 0 0 40 40m-24-40a23.74 23.74 0 0 1 2.35-10.34l32 32A23.74 23.74 0 0 1 176 144a24 24 0 0 1-24-24m48 0a23.74 23.74 0 0 1-2.35 10.34l-32-32A23.74 23.74 0 0 1 176 96a24 24 0 0 1 24 24M80 160a40 40 0 1 0-40-40a40 40 0 0 0 40 40m-24-40a23.74 23.74 0 0 1 2.35-10.34l32 32A23.74 23.74 0 0 1 80 144a24 24 0 0 1-24-24m48 0a23.74 23.74 0 0 1-2.35 10.34l-32-32A23.74 23.74 0 0 1 80 96a24 24 0 0 1 24 24"
    />
  </svg>
));
export const GraphicsCard = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={GraphicsCardSvg} {...props} />
);

const KernelsuSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.5 5.5h37v37h-37z"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M26 9h13v13H26zM9 26h13v13H9z"
    />
  </svg>
));

export const Kernelsu = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={KernelsuSvg} {...props} />
);

const FlatPlatformSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M256.5 87.9L39.7 213.5l216.9 125.7l216.6-125.7L256.5 87.9zM31 227.4v71l218 125.7v-71L31 227.4zm450 .2L265 353.1V424l216-125.5v-70.9z"
    />
  </svg>
));

export const FlatPlatform = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FlatPlatformSvg} {...props} />
);

const BinarySvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect width="4" height="6" x="14" y="14" rx="2" />
      <rect width="4" height="6" x="6" y="4" rx="2" />
      <path d="M6 20h4m4-10h4M6 14h2v6m6-16h2v6" />
    </g>
  </svg>
));

export const Binary = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BinarySvg} {...props} />
);

const NumberSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 17V7l7 10V7m4 10h5m-5-7a2.5 3 0 1 0 5 0a2.5 3 0 1 0-5 0"
    />
  </svg>
));

export const Number = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={NumberSvg} {...props} />
);

const BoltCircleOutlineSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
      <path d="M12.357 6.792c.37-.223 1.014-.545 1.632-.159c.632.396.599 1.128.544 1.55c-.061.48-.231 1.114-.431 1.86l-.055.206c-.04.145-.07.26-.094.36a3.12 3.12 0 0 0-.028.127c.111.04.274.087.536.157l.05.014c.493.132.938.251 1.266.39c.326.138.77.39.914.921l.002.008l.002.008l.002.008l.002.008l.002.008l.001.008l.002.009l.002.008c.11.546-.183.969-.425 1.234c-.25.274-.619.572-1.026.896l-2.06 1.64c-.613.489-1.133.902-1.552 1.155c-.37.223-1.014.545-1.632.159c-.632-.396-.599-1.128-.544-1.55c.061-.48.231-1.114.431-1.86l.055-.206a15.07 15.07 0 0 0 .12-.475a4.402 4.402 0 0 0-.534-.17c-.519-.138-.983-.265-1.327-.416c-.328-.144-.765-.402-.907-.927l-.002-.008l-.002-.008l-.002-.008l-.002-.008l-.002-.008l-.002-.008l-.002-.008l-.001-.008c-.112-.554.191-.974.434-1.233c.239-.256.593-.538.979-.845l2.102-1.674c.613-.489 1.133-.903 1.552-1.155Zm-.662 2.364c.597-.476 1.014-.806 1.327-1.011c-.062.358-.194.855-.384 1.566l-.05.187a5.836 5.836 0 0 0-.165.735c-.033.26-.026.577.158.89l.004.006l.004.007c.186.3.457.459.695.56c.225.094.505.17.79.246c.454.122.763.206.981.284c-.158.15-.393.341-.735.614l-2.015 1.604c-.597.476-1.014.806-1.327 1.011c.062-.358.194-.856.384-1.566l.05-.187c.068-.253.137-.511.165-.735c.033-.26.026-.577-.158-.889l-.003.002c-.177-.273-.431-.435-.664-.544a5.146 5.146 0 0 0-.825-.278a12.68 12.68 0 0 1-.983-.29c.16-.148.394-.336.736-.608l2.015-1.604Z" />
      <path d="M12 1.25C6.063 1.25 1.25 6.063 1.25 12S6.063 22.75 12 22.75S22.75 17.937 22.75 12S17.937 1.25 12 1.25ZM2.75 12a9.25 9.25 0 1 1 18.5 0a9.25 9.25 0 0 1-18.5 0Z" />
    </g>
  </svg>
));

export const BoltCircleOutline = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BoltCircleOutlineSvg} {...props} />
);

const RaspberrypiSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 832 1024"
    {...props}
  >
    <path
      fill="currentColor"
      d="M832 608q0 44-17.5 80.5T768 746q3 83-64 149q-60 60-137 64q-16 28-57.5 46.5T416 1024t-93.5-18.5T265 959q-77-4-137-64q-67-66-64-149q-29-21-46.5-57.5T0 608q0-45 19-83t50-58q-11-37 2-80t47-77q30-29 69-44q-48-25-81.5-73.5T64 91q28-42 74.5-66.5T240 0t101.5 24.5T416 91q28-42 74.5-66.5T592 0t101.5 24.5T768 91q-8 53-41.5 101.5T644 266q40 15 70 44q34 34 47 77t2 80q31 20 50 58t19 83zM570 892q49-10 86-45q31-29 41.5-54t4.5-44t-26-38q-15-13-33-23l-1 1l-2 1q-13 7-32 11v3q0 80-57 136q13 31 19 52zm50-378q-23-38-66.5-56.5t-74-2.5t-31.5 64.5t27 72.5q41 36 79.5 45.5T612 628q26-24 28-50t-20-64zM416 960q40 0 68-18.5t28-45.5q0-11-7-23q-43 23-89 23t-89-23q-7 12-7 23q0 27 28 45.5t68 18.5zm0-128q51 0 89.5-31t38.5-65q0-16-6-38q-77-20-122-89q-45 69-122 89q-6 21-6 38q0 34 38.5 65t89.5 31zm-63.5-377q-30.5-16-74 2.5T212 514q-22 38-20 64t28 50q19 19 57.5 9.5T357 592q28-24 27-72.5T352.5 455zM176 847q37 35 86 45q6-21 19-52q-57-56-57-136v-3q-18-4-32-11q-1 0-2-1l-1-1q-18 10-33 23q-20 19-26 38t4.5 44t41.5 54zM64 608q0 41 18 74q7-10 13-16q18-18 49-23q-32-59-2-130q-10-1-14-1q-29 0-46.5 23T64 608zm106-246q-38 38-42 86q24 0 47 12q44-54 107-70q-25-31-26-69q-48 4-86 41zm76-298q-32 0-69 10t-49 22q8 45 48 86.5t89 41.5q19 0 37-4q-8-15-19.5-30.5t-26-30.5t-23.5-24.5t-24-23T192 96q51 7 97 32t77 62q12-10 18-18v-1q0-45-40.5-76T246 64zm170 192q-40 0-68 28t-28 68q0 16 6 32q32 0 58 14q17 8 32 25q15-17 32-25q26-14 58-14q6-17 6-32q0-40-28-68t-68-28zM704 96q-12-12-49-22t-68-10q-58 0-98.5 31T448 171v1q6 8 18 18q31-37 77-62t97-32q-2 2-17 15.5t-24 23t-23.5 24.5t-26 30.5T530 220q18 4 37 4q49 0 89-41.5T704 96zm-42 266q-38-37-86-41q0 38-26 69q63 16 107 70q23-12 47-12q-4-48-42-86zm42 150q-4 0-14 1q30 71-2 130q31 5 49 23q6 5 13 16q18-33 18-74q0-96-64-96z"
    />
  </svg>
));

export const Raspberrypi = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={RaspberrypiSvg} {...props} />
);

const FamilySvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    {...props}
  >
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4">
      <path d="M10 19s-5.143 2-6 9m34-9s5.143 2 6 9m-26-9s4.8 1.167 6 7m6-7s-4.8 1.167-6 7m-4 8s-4.2.75-6 6m14-6s4.2.75 6 6" />
      <circle cx="24" cy="31" r="5" strokeLinejoin="round" />
      <circle cx="34" cy="14" r="6" strokeLinejoin="round" />
      <circle cx="14" cy="14" r="6" strokeLinejoin="round" />
    </g>
  </svg>
));

export const Family = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FamilySvg} {...props} />
);

const SpeedometerSlowSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 16c1.66 0 3-1.34 3-3c0-1.12-.61-2.1-1.5-2.61L3.79 4.77l5.53 9.58c.5.98 1.51 1.65 2.68 1.65m0-13c-1.81 0-3.5.5-4.97 1.32l2.1 1.21C10 5.19 11 5 12 5c4.42 0 8 3.58 8 8c0 2.21-.89 4.21-2.34 5.65h-.01a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.42.01A9.969 9.969 0 0 0 22 13c0-5.5-4.5-10-10-10M2 13c0 2.76 1.12 5.26 2.93 7.07c.39.38 1.02.38 1.41-.01a.996.996 0 0 0 0-1.41A7.95 7.95 0 0 1 4 13c0-1 .19-2 .54-2.9L3.33 8C2.5 9.5 2 11.18 2 13Z"
    />
  </svg>
));

export const SpeedometerSlow = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SpeedometerSlowSvg} {...props} />
);

const SpeedometerSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 16a3 3 0 0 1-3-3c0-1.12.61-2.1 1.5-2.61l9.71-5.62l-5.53 9.58c-.5.98-1.51 1.65-2.68 1.65m0-13c1.81 0 3.5.5 4.97 1.32l-2.1 1.21C14 5.19 13 5 12 5a8 8 0 0 0-8 8c0 2.21.89 4.21 2.34 5.65h.01c.39.39.39 1.02 0 1.41c-.39.39-1.03.39-1.42.01A9.969 9.969 0 0 1 2 13A10 10 0 0 1 12 3m10 10c0 2.76-1.12 5.26-2.93 7.07c-.39.38-1.02.38-1.41-.01a.996.996 0 0 1 0-1.41A7.95 7.95 0 0 0 20 13c0-1-.19-2-.54-2.9L20.67 8C21.5 9.5 22 11.18 22 13Z"
    />
  </svg>
));

export const Speedometer = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SpeedometerSvg} {...props} />
);

const FlagOutlineSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g id="evaFlagOutline0">
      <g id="evaFlagOutline1">
        <path
          id="evaFlagOutline2"
          fill="currentColor"
          d="M19.27 4.68a1.79 1.79 0 0 0-1.6-.25a7.53 7.53 0 0 1-2.17.28a8.54 8.54 0 0 1-3.13-.78A10.15 10.15 0 0 0 8.5 3c-2.89 0-4 1-4.2 1.14a1 1 0 0 0-.3.72V20a1 1 0 0 0 2 0v-4.3a6.28 6.28 0 0 1 2.5-.41a8.54 8.54 0 0 1 3.13.78a10.15 10.15 0 0 0 3.87.93a7.66 7.66 0 0 0 3.5-.7a1.74 1.74 0 0 0 1-1.55V6.11a1.77 1.77 0 0 0-.73-1.43ZM18 14.59a6.32 6.32 0 0 1-2.5.41a8.36 8.36 0 0 1-3.13-.79a10.34 10.34 0 0 0-3.87-.92a9.51 9.51 0 0 0-2.5.29V5.42A6.13 6.13 0 0 1 8.5 5a8.36 8.36 0 0 1 3.13.79a10.34 10.34 0 0 0 3.87.92a9.41 9.41 0 0 0 2.5-.3Z"
        />
      </g>
    </g>
  </svg>
));

export const FlagOutline = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FlagOutlineSvg} {...props} />
);

const VmOutlineSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    {...props}
  >
    <g fill="currentColor">
      <path
        fillRule="evenodd"
        d="M1.5 2h13l.5.5v5.503a5.006 5.006 0 0 0-1-.583V3H2v9h5a5 5 0 0 0 1 3H4v-1h3v-1H1.5l-.5-.5v-10l.5-.5z"
        clipRule="evenodd"
      />
      <path d="M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zm0 7a3 3 0 1 1 0-6.001A3 3 0 0 1 12 15z" />
    </g>
  </svg>
));

export const VmOutline = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={VmOutlineSvg} {...props} />
);

const CachedSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12.05 20q-3.35 0-5.7-2.325T4 12v-.175l-1.6 1.6l-1.4-1.4l4-4l4 4l-1.4 1.4l-1.6-1.6V12q0 2.5 1.763 4.25T12.05 18q.65 0 1.275-.15t1.225-.45l1.5 1.5q-.95.55-1.95.825T12.05 20ZM19 15.975l-4-4l1.4-1.4l1.6 1.6V12q0-2.5-1.763-4.25T11.95 6q-.65 0-1.275.15T9.45 6.6l-1.5-1.5q.95-.55 1.95-.825T11.95 4q3.35 0 5.7 2.325T20 12v.175l1.6-1.6l1.4 1.4l-4 4Z"
    />
  </svg>
));

export const Cached = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CachedSvg} {...props} />
);

const WifiSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1984 1408"
    {...props}
  >
    <path
      fill="currentColor"
      d="M992 1395q-20 0-93-73.5t-73-93.5q0-32 62.5-54t103.5-22t103.5 22t62.5 54q0 20-73 93.5t-93 73.5zm270-271q-2 0-40-25t-101.5-50t-128.5-25t-128.5 25t-101 50t-40.5 25q-18 0-93.5-75T553 956q0-13 10-23q78-77 196-121t233-44t233 44t196 121q10 10 10 23q0 18-75.5 93t-93.5 75zm273-272q-11 0-23-8q-136-105-252-154.5T992 640q-85 0-170.5 22t-149 53T559 777t-79 53t-31 22q-17 0-92-75t-75-93q0-12 10-22q132-132 320-205t380-73t380 73t320 205q10 10 10 22q0 18-75 93t-92 75zm271-271q-11 0-22-9q-179-157-371.5-236.5T992 256t-420.5 79.5T200 572q-11 9-22 9q-17 0-92.5-75T10 413q0-13 10-23q187-186 445-288T992 0t527 102t445 288q10 10 10 23q0 18-75.5 93t-92.5 75z"
    />
  </svg>
));

export const Wifi = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={WifiSvg} {...props} />
);

const UsbSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 256 256"
    {...props}
  >
    <path
      fill="currentColor"
      d="m252.44 121.34l-48-32A8 8 0 0 0 192 96v24H72V72h33a32 32 0 1 0 0-16H72a16 16 0 0 0-16 16v48H8a8 8 0 0 0 0 16h48v48a16 16 0 0 0 16 16h32v8a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v8H72v-48h120v24a8 8 0 0 0 12.44 6.66l48-32a8 8 0 0 0 0-13.32ZM136 48a16 16 0 1 1-16 16a16 16 0 0 1 16-16Zm-16 128h32v32h-32Zm88-30.95V111l25.58 17Z"
    />
  </svg>
));
export const Usb = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={UsbSvg} {...props} />
);

const InterfaceArrowsNetworkSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 14 14"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="13" height="13" x=".5" y=".5" rx="3" />
      <path d="m4 8l4.5-4.5H5M10 6l-4.5 4.5H9" />
    </g>
  </svg>
));

export const InterfaceArrowsNetwork = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={InterfaceArrowsNetworkSvg} {...props} />;

const StateSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M10 6v12h5V6Zm4 7h-3V7h3Zm5-12H6a2 2 0 0 0-2 2v18a2.005 2.005 0 0 0 2 2h13a2 2 0 0 0 2-2V3a2.006 2.006 0 0 0-2-2Zm0 20H6V3h13Z"
    />
  </svg>
));

export const State = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={StateSvg} {...props} />
);

const IpSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19 23h-2V9h6c1.103 0 2 .897 2 2v5c0 1.103-.897 2-2 2h-4zm0-7h4v-5.001h-4zM7 11h3v10H7v2h8v-2h-3V11h3V9H7z"
    />
  </svg>
));

export const Ip = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={IpSvg} {...props} />
);

const SubsetProperOfBoldSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 256 256"
    {...props}
  >
    <path
      fill="currentColor"
      d="M212 208a12 12 0 0 1-12 12h-72a92 92 0 0 1 0-184h72a12 12 0 0 1 0 24h-72a68 68 0 0 0 0 136h72a12 12 0 0 1 12 12"
    />
  </svg>
));

export const SubsetProperOfBold = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={SubsetProperOfBoldSvg} {...props} />;

const VirtualNetwork20RegularSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4.825 6.12a.5.5 0 0 1 .055.705L2.159 10l2.72 3.175a.5.5 0 1 1-.759.65l-3-3.5a.5.5 0 0 1 0-.65l3-3.5a.5.5 0 0 1 .705-.055Zm10.295 7.055a.5.5 0 0 0 .76.65l3-3.5a.5.5 0 0 0 0-.65l-3-3.5a.5.5 0 1 0-.76.65L17.842 10l-2.722 3.175ZM6 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm5-1a1 1 0 1 1-2 0a1 1 0 0 1 2 0Zm3 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z"
    />
  </svg>
));

export const VirtualNetwork20Regular = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={VirtualNetwork20RegularSvg} {...props} />;

const SizeSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 6V4h8v16h-8v-2H8v-2H4V8h4V6h4Zm2 0h4v12h-4V6Zm-2 2h-2v8h2V8Zm-4 2v4H6v-4h2Z"
      clipRule="evenodd"
    />
  </svg>
));

export const Size = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={SizeSvg} {...props} />
);

const PciCardSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    {...props}
  >
    <g fill="currentColor">
      <path d="M0 1.5A.5.5 0 0 1 .5 1h1a.5.5 0 0 1 .5.5V4h13.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H2v2.5a.5.5 0 0 1-1 0V2H.5a.5.5 0 0 1-.5-.5Z" />
      <path d="M3 12.5h3.5v1a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5v-1Zm4 0h4v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1Z" />
    </g>
  </svg>
));

export const PciCard = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PciCardSvg} {...props} />
);

const AiBusinessImpactAssessmentSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      color="currentColor"
    >
      <path d="M5.143 14A7.8 7.8 0 0 1 4 9.919C4 5.545 7.582 2 12 2s8 3.545 8 7.919A7.8 7.8 0 0 1 18.857 14M7.383 17.098c-.092-.276-.138-.415-.133-.527a.6.6 0 0 1 .382-.53c.104-.041.25-.041.54-.041h7.656c.291 0 .436 0 .54.04a.6.6 0 0 1 .382.531c.005.112-.041.25-.133.527c-.17.511-.255.767-.386.974a2 2 0 0 1-1.2.869c-.238.059-.506.059-1.043.059h-3.976c-.537 0-.806 0-1.043-.06a2 2 0 0 1-1.2-.868c-.131-.207-.216-.463-.386-.974M15 19l-.13.647c-.14.707-.211 1.06-.37 1.34a2 2 0 0 1-1.113.912C13.082 22 12.72 22 12 22s-1.082 0-1.387-.1a2 2 0 0 1-1.113-.913c-.159-.28-.23-.633-.37-1.34L9 19"></path>
      <path d="m12.308 12l-1.461-4.521A.72.72 0 0 0 10.154 7a.72.72 0 0 0-.693.479L8 12m7-5v5m-6.462-1.5h3.231"></path>
    </g>
  </svg>
));

export const AiBusinessImpactAssessment = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={AiBusinessImpactAssessmentSvg} {...props} />;

const SkillLevelAdvancedSvg = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill="currentColor"
      d="M30 30h-8V4h8zm-10 0h-8V12h8zm-10 0H2V18h8z"
    ></path>
  </svg>
));

export const SkillLevelAdvanced = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={SkillLevelAdvancedSvg} {...props} />;
