import React, { FunctionComponent } from 'react';

const ReleaseNotes: FunctionComponent<{ version: string }> = ({ version }) => (
  <div>Release notes for version {version}</div>
);

export { ReleaseNotes as default };
