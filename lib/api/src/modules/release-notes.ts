import { RELEASE_NOTES_DATA } from 'global';
import semver from '@storybook/semver';
import memoize from 'memoizerific';

import { ModuleFn, State } from '../index';

export interface ReleaseNotes {
  success?: boolean;
  isAutoMessagingEnabled?: boolean;
  currentVersion?: string;
  history?: [string];
}

const getReleaseNotesData = memoize(1)(
  (): ReleaseNotes => {
    try {
      return { ...(JSON.parse(RELEASE_NOTES_DATA) || {}) };
    } catch (e) {
      return {};
    }
  }
);

export interface SubAPI {
  releaseNotesVersion: () => string;
  showReleaseNotesOnLaunch: () => Promise<boolean>;
  didViewReleaseNotes: () => boolean;
  setDidViewReleaseNotes: () => Promise<void>;
}

export const init: ModuleFn = ({ store }) => {
  let initState: Promise<State>;
  const releaseNotesData = getReleaseNotesData();

  const api: SubAPI = {
    releaseNotesVersion: () => releaseNotesData.currentVersion,
    showReleaseNotesOnLaunch: async () => {
      await initState;

      const {
        releaseNotes: { showOnLaunch },
      } = store.getState();

      return showOnLaunch;
    },
    didViewReleaseNotes: () => {
      const {
        releaseNotes: { releaseNotesViewed },
      } = store.getState();

      return (
        releaseNotesData.success && releaseNotesViewed.includes(releaseNotesData.currentVersion)
      );
    },
    setDidViewReleaseNotes: async () => {
      const { releaseNotes } = store.getState();
      const uniqueVersionsViewed = Array.from(
        new Set([
          ...releaseNotes.releaseNotesViewed,
          ...(releaseNotesData.success ? [releaseNotesData.currentVersion] : []),
        ])
      );

      await store.setState(
        { releaseNotesViewed: uniqueVersionsViewed },
        { persistence: 'permanent' }
      );
    },
  };

  const initModule = () => {
    const { releaseNotesViewed: persistedReleaseNotesViewed } = store.getState();
    const releaseNotesViewed = persistedReleaseNotesViewed || [];

    let showOnLaunch = false;

    if (releaseNotesData.success && releaseNotesData.isAutoMessagingEnabled) {
      const sortedReleaseNotesHistory = semver.sort(releaseNotesData.history);
      const highestVersionSeen = sortedReleaseNotesHistory.slice(-1)[0];

      if (highestVersionSeen) {
        const versionDiff = semver.diff(releaseNotesData.currentVersion, highestVersionSeen);
        const isMajorOrMinorUpgrade =
          versionDiff === 'major' || versionDiff === 'premajor' || versionDiff === 'minor';
        showOnLaunch =
          isMajorOrMinorUpgrade && !releaseNotesViewed.includes(releaseNotesData.currentVersion);
      }
    }

    initState = store.setState({ releaseNotes: { showOnLaunch, releaseNotesViewed } });
  };

  return { init: initModule, api };
};
