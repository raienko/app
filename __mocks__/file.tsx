import React from 'react';

export default 'SvgrURL';
const SvgrMock = React.forwardRef((props, ref) => (
  <span
    // @ts-ignore
    ref={ref}
    {...props}
  />
));

export const ReactComponent = SvgrMock;
