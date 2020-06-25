import { ModuleFn } from '../index';

export interface SubAPI {
  changeSettingsTab: (tab: string) => void;
  closeSettings: () => void;
  navigateToSettingsPage: (path: string) => Promise<void>;
}

export const init: ModuleFn = ({ store, navigate, fullAPI }) => {
  const api: SubAPI = {
    closeSettings: () => {
      const {
        settings: { lastTrackedStoryId },
      } = store.getState();

      if (lastTrackedStoryId) {
        fullAPI.selectStory(lastTrackedStoryId);
      } else {
        navigate('/story/*');
      }
    },
    changeSettingsTab: (tab: string) => {
      navigate(`/settings/${tab}`);
    },
    navigateToSettingsPage: async (path) => {
      const { settings, storyId } = store.getState();

      await store.setState({
        settings: { ...settings, lastTrackedStoryId: storyId },
      });

      navigate(path);
    },
  };

  const initModule = async () => {
    await store.setState({ settings: { lastTrackedStoryId: null } });
  };

  return { init: initModule, api };
};
