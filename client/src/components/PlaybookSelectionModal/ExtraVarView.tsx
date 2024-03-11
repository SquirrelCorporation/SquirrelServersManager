import React from 'react';
import { Button, Col, Input, Row } from 'antd';
import { API } from 'ssm-shared-lib';

export type ExtraVarViewProps = {
  extraVar: API.ExtraVar;
  setOverrideExtraVars: any;
  overrideExtraVars: any;
};

const ExtraVarView: React.FC<ExtraVarViewProps> = (props) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    props.setOverrideExtraVars((prevState: any[]) =>
      prevState.map((e) => {
        if (e.overrideVar === props.extraVar.extraVar) {
          return {
            overrideVar: e.overrideVar,
            value: event.target.value,
          };
        } else {
          return e;
        }
      }),
    );
  };
  return (
    <Row
      gutter={[24, 24]}
      style={{ marginTop: 5, width: '100%' }}
      key={props.extraVar.extraVar}
    >
      <Col>
        <Input disabled value={props.extraVar.extraVar} />
      </Col>
      <Col>
        <Input
          disabled={!props.extraVar.canBeOverride}
          onChange={handleChange}
          defaultValue={
            props.extraVar.value ||
            (!props.extraVar.canBeOverride ? '' : 'COMPUTED')
          }
        />
      </Col>
      <Col>
        <Button disabled={!props.extraVar.canBeOverride}>
          Save for future execution
        </Button>
      </Col>
    </Row>
  );
};

export default ExtraVarView;
