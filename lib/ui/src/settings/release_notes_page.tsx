import { useStorybookApi } from '@storybook/api';
import React, { FunctionComponent, useEffect } from 'react';

import ReleaseNotesScreen from './release_notes';

interface PureReleaseNotesPageProps {
  currentVersion: string;
}

const PureReleaseNotesPage: FunctionComponent<PureReleaseNotesPageProps> = ({ currentVersion }) => {
  return <ReleaseNotesScreen version={currentVersion} />;
};

export default () => {
  const api = useStorybookApi();

  useEffect(() => {
    api.setDidViewReleaseNotes();
  }, []);

  return <PureReleaseNotesPage currentVersion={api.releaseNotesVersion()} />;
};
